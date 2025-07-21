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
  Collapse
} from '@mui/material';
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
  StudentViewDialog
} from '../components/common/student';
import Student from '../hooks/student';
import ProtectedRoute from '../components/common/ProtectedRoute';

const AlumniPage = () => {
  // Initialize Student API class
  const studentAPI = new Student();

  // State management
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALUMNI');
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
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  // Helper function to get nested object values (moved up before usage)
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  };

  // Fetch students data
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

  // Initial data fetch
  useEffect(() => {
    fetchStudents();
  }, [page, rowsPerPage, roleFilter, genderFilter, searchTerm]);

  // Filter students based on search and filters (now done server-side)
  const filteredStudents = students;

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aValue = getNestedValue(a, orderBy);
    const bValue = getNestedValue(b, orderBy);
    
    if (order === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Calculate stats
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
    setContextMenu({ mouseX: event.clientX - 2, mouseY: event.clientY - 4 });
    setSelectedStudent(student);
  };

  const handleMenuClose = () => {
    setContextMenu(null);
    setSelectedStudent(null);
  };

  const handleViewStudent = () => {
    setViewDialogOpen(true);
    handleMenuClose();
  };

  const handleEditStudent = () => {
    showSnackbar('Edit functionality not implemented yet', 'info');
    handleMenuClose();
  };

  const handleDeleteStudent = async () => {
    try {
      const response = await studentAPI.deleteStudent(selectedStudent.user_id);
      if (response && response.success) {
        showSnackbar('Student deleted successfully', 'success');
        fetchStudents(); // Refresh the data
      } else {
        showSnackbar('Failed to delete student', 'error');
      }
    } catch (error) {
      showSnackbar('Error deleting student: ' + error.message, 'error');
    }
    handleMenuClose();
  };

  const handleAddStudent = () => {
    showSnackbar('Add student functionality not implemented yet', 'info');
  };

  const handleRefresh = () => {
    fetchStudents();
    showSnackbar('Data refreshed successfully', 'success');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALUMNI');
    setGenderFilter('ALL');
    setPage(0); // Reset to first page
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

export default AlumniPage;