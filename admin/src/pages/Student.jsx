import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  VisibilityOff
} from '@mui/icons-material';
import {
  Edit,
  Delete,
  Visibility,
  PersonAdd
} from '@mui/icons-material';
import {
  StudentStatsCards,
  StudentTable,
  StudentTableToolbar,
  StudentTableFilters,
  StudentViewDialog,
  StudentEditDialog
} from '../components/common/student';
import Student from '../hooks/student';
import ProtectedRoute from '../components/common/ProtectedRoute';

const StudentPage = () => {
  const studentAPI = new Student();

  // State management
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('STUDENT');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [orderBy, setOrderBy] = useState('profile.full_name');
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Dialog and menu states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addStudentData, setAddStudentData] = useState({
    user_id: '',
    password: '',
    role: 'STUDENT'
  });
  const [addDialogLoading, setAddDialogLoading] = useState(false);
  const [editDialogLoading, setEditDialogLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams = {
        page: page + 1,
        limit: rowsPerPage,
        role: roleFilter,
        gender: genderFilter,
        search: searchTerm
      };

      const response = await studentAPI.getAllStudents(filterParams);
      
      if (response && response.success) {
        setStudents(response.data.users);
        setTotalCount(response.data.pagination.total);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      setError('Error fetching students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, rowsPerPage, roleFilter, genderFilter, searchTerm]);

  const filteredStudents = students;

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aValue = getNestedValue(a, orderBy);
    const bValue = getNestedValue(b, orderBy);
    
    if (order === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const stats = {
    total: totalCount,
    active: students.filter(s => s.role === 'STUDENT').length,
    alumni: students.filter(s => s.role === 'ALUMNI').length,
    jobPosts: students.reduce((sum, s) => sum + (s.stats?.jobs_posted || 0), 0),
    applications: students.reduce((sum, s) => sum + (s.stats?.applications_made || 0), 0)
  };

  // Event handlers
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = sortedStudents.map(student => student.id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleMenuOpen = (event, student) => {
    event.stopPropagation(); // Prevent event bubbling
    console.log('Selected student in menu:', student); // Debug log
    setContextMenu({ 
      mouseX: event.clientX - 2, 
      mouseY: event.clientY - 4 
    });
    setSelectedStudent(student); // Make sure student is not null
  };

  const handleMenuClose = () => {
    setContextMenu(null);
    // setSelectedStudent(null);
  };

  const handleViewStudent = () => {
    setViewDialogOpen(true);
    handleMenuClose();
  };

  const handleEditStudent = () => {
    // Use the student from context menu if available, otherwise fall back to selectedStudent
    const studentToEdit = contextMenu?.student || selectedStudent;
    
    if (!studentToEdit) {
      console.error('No student available for editing');
      showSnackbar('No student selected for editing', 'error');
      return;
    }
  
    console.log('Editing student with ID:', studentToEdit.user_id);
    setSelectedStudent(studentToEdit); // Explicitly set it again
    setEditDialogOpen(true);
    handleMenuClose();
  };
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      setSelectedStudent(null);
    };
  }, []);
  const handleDeleteStudent = async () => {
    try {
      const response = await studentAPI.deleteStudent(selectedStudent.user_id);
      if (response && response.success) {
        showSnackbar('Student deleted successfully', 'success');
        fetchStudents();
      } else {
        showSnackbar('Failed to delete student', 'error');
      }
    } catch (error) {
      showSnackbar('Error deleting student: ' + error.message, 'error');
    }
    handleMenuClose();
  };

  const handleUpdateStudent = async (updateData) => {
    const studentToUpdate = selectedStudent;
    console.log('Attempting to update student:', studentToUpdate);
    
    if (!studentToUpdate?.user_id) {
      console.error('Update attempted without valid student ID');
      showSnackbar('No valid student selected for update', 'error');
      return;
    }
  
    try {
      setEditDialogLoading(true);
      console.log('Update payload:', {
        userId: studentToUpdate.user_id,
        data: updateData
      });
      
      const response = await studentAPI.updateStudent(studentToUpdate.user_id, {
        profile: {
          full_name: updateData.full_name,
          email_address: updateData.email_address,
          mobile_number: updateData.mobile_number,
          gender: updateData.gender,
          bio: updateData.bio,
          passing_batch: updateData.passing_batch,
          github: updateData.github,
          linked_in: updateData.linked_in
        },
        role: updateData.role
      });
      
      if (response?.success) {
        showSnackbar('Student updated successfully', 'success');
        setEditDialogOpen(false);
        fetchStudents();
      } else {
        showSnackbar(response?.message || 'Update failed', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      showSnackbar(`Update failed: ${error.message}`, 'error');
    } finally {
      setEditDialogLoading(false);
    }
  };
  
  

  const handleAddStudent = () => {
    setAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setAddStudentData({
      user_id: '',
      password: '',
      role: 'STUDENT'
    });
    setShowPassword(false);
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    
    if (!addStudentData.user_id || !addStudentData.password) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      setAddDialogLoading(true);
      
      const response = await studentAPI.signup(
        addStudentData.user_id,
        addStudentData.password,
        addStudentData.role
      );

      if (response && response.success) {
        showSnackbar('Student added successfully', 'success');
        handleAddDialogClose();
        fetchStudents();
      } else {
        showSnackbar(response?.message || 'Failed to add student', 'error');
      }
    } catch (error) {
      showSnackbar('Error adding student: ' + error.message, 'error');
    } finally {
      setAddDialogLoading(false);
    }
  };

  const handleAddStudentInputChange = (field, value) => {
    setAddStudentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    fetchStudents();
    showSnackbar('Data refreshed successfully', 'success');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('STUDENT');
    setGenderFilter('ALL');
    setPage(0);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <ProtectedRoute>
      <Box sx={{ p: 3 }}>
        {/* Stats Cards */}
        <StudentStatsCards stats={stats} />

        {/* Main Content */}
        <Paper sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
          {/* Toolbar */}
          <StudentTableToolbar
            selectedCount={selected.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onRefresh={handleRefresh}
            onAddStudent={handleAddStudent}
          />

          {/* Filters */}
          <Collapse in={showFilters}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <StudentTableFilters
                roleFilter={roleFilter}
                genderFilter={genderFilter}
                onRoleFilterChange={setRoleFilter}
                onGenderFilterChange={setGenderFilter}
                onClearFilters={handleClearFilters}
                filteredCount={totalCount}
                totalCount={totalCount}
              />
            </Box>
          </Collapse>

          {/* Table */}
          <StudentTable
            students={sortedStudents}
            loading={loading}
            error={error}
            orderBy={orderBy}
            order={order}
            onSort={handleSort}
            selected={selected}
            onSelectAll={handleSelectAll}
            onSelect={handleSelect}
            onMenuOpen={handleMenuOpen}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </Paper>

        {/* Context Menu */}
        <Menu
          open={contextMenu !== null}
          onClose={handleMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={handleViewStudent}>
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleEditStudent}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Student</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteStudent}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete Student</ListItemText>
          </MenuItem>
        </Menu>

        {/* View Dialog */}
        <StudentViewDialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          student={selectedStudent}
          onEdit={handleEditStudent}
        />

        {/* Edit Dialog */}
        <StudentEditDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          student={selectedStudent}
          onSubmit={handleUpdateStudent}
          loading={editDialogLoading}
        />

        {/* Add Student Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={handleAddDialogClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            component: 'form',
            onSubmit: handleAddStudentSubmit
          }}
        >
          <DialogTitle>Add New Student</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="User ID"
                value={addStudentData.user_id}
                onChange={(e) => handleAddStudentInputChange('user_id', e.target.value)}
                fullWidth
                required
                disabled={addDialogLoading}
                helperText="Enter a unique user ID for the student"
              />
              
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={addStudentData.password}
                onChange={(e) => handleAddStudentInputChange('password', e.target.value)}
                fullWidth
                required
                disabled={addDialogLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={addStudentData.role}
                  onChange={(e) => handleAddStudentInputChange('role', e.target.value)}
                  label="Role"
                  disabled={addDialogLoading}
                >
                  <SelectMenuItem value="STUDENT">Student</SelectMenuItem>
                  <SelectMenuItem value="ALUMNI">Alumni</SelectMenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleAddDialogClose}
              disabled={addDialogLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={addDialogLoading}
              startIcon={addDialogLoading ? <CircularProgress size={20} /> : null}
            >
              {addDialogLoading ? 'Adding...' : 'Add Student'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ProtectedRoute>
  );
};

export default StudentPage;