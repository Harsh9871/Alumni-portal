import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Typography,
  Button,
  IconButton,
  Toolbar,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  TableSortLabel,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
  Badge,
  Divider,
  Stack,
  alpha,
  useTheme,
  Fade,
  Skeleton
} from '@mui/material'
import {
  Search,
  FilterList,
  Add,
  Edit,
  Delete,
  Visibility,
  Download,
  Refresh,
  MoreVert,
  Close,
  Phone,
  Email,
  GitHub,
  LinkedIn,
  Work,
  School,
  Person,
  TrendingUp,
  Analytics,
  Groups,
  StarBorder,
  LocationOn,
  CalendarToday,
  Business
} from '@mui/icons-material'
import ProtectedRoute from '../components/common/ProtectedRoute'
import Dashboard from '../components/layout/Dashboard'
import Student from '../hooks/student'

const StudentPage = () => {
  const theme = useTheme()
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [genderFilter, setGenderFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [orderBy, setOrderBy] = useState('profile.full_name')
  const [order, setOrder] = useState('asc')
  const [selected, setSelected] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [menuStudent, setMenuStudent] = useState(null)

  const studentService = new Student()

  // Stats calculation
  const stats = {
    total: students.length,
    active: students.filter(s => s.role === 'STUDENT').length,
    alumni: students.filter(s => s.role === 'ALUMNI').length,
    jobPosts: students.reduce((sum, s) => sum + (s.stats?.jobs_posted || 0), 0),
    applications: students.reduce((sum, s) => sum + (s.stats?.applications_made || 0), 0)
  }

  // Fetch students
  const fetchStudents = async (pageNum = 1, limit = rowsPerPage) => {
    setLoading(true)
    setError(null)
    try {
      const result = await studentService.getAllStudents({ page: pageNum, limit, role: 'STUDENT' })
      if (result && result.success) {
        setStudents(result.data.users || [])
        setFilteredStudents(result.data.users || [])
      } else {
        setError('Failed to fetch students')
      }
    } catch (err) {
      setError(err.message || 'Error fetching students')
    } finally {
      setLoading(false)
    }
  }

  // Filter and search students
  useEffect(() => {
    let filtered = students.filter(student => {
      const matchesSearch = 
        student.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.profile?.email_address?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = roleFilter === 'ALL' || student.role === roleFilter
      const matchesGender = genderFilter === 'ALL' || student.profile?.gender === genderFilter
      
      return matchesSearch && matchesRole && matchesGender
    })

    // Apply sorting
    if (orderBy) {
      filtered.sort((a, b) => {
        let aValue = getNestedValue(a, orderBy)
        let bValue = getNestedValue(b, orderBy)
        
        if (aValue < bValue) return order === 'asc' ? -1 : 1
        if (aValue > bValue) return order === 'asc' ? 1 : -1
        return 0
      })
    }

    setFilteredStudents(filtered)
    setPage(0)
  }, [students, searchTerm, roleFilter, genderFilter, orderBy, order])

  // Get nested object value
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || ''
  }

  // Handle sort
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  // Handle select all
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredStudents.map(student => student.id)
      setSelected(newSelected)
      return
    }
    setSelected([])
  }

  // Handle select row
  const handleSelectRow = (id) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }

    setSelected(newSelected)
  }

  // Handle view student
  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setViewDialogOpen(true)
    setAnchorEl(null)
  }

  // Handle menu open
  const handleMenuOpen = (event, student) => {
    setAnchorEl(event.currentTarget)
    setMenuStudent(student)
  }

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuStudent(null)
  }

  // Handle delete student
  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        console.log('Deleting student:', studentId)
        fetchStudents()
      } catch (error) {
        console.error('Error deleting student:', error)
      }
    }
    handleMenuClose()
  }

  // Load students on component mount
  useEffect(() => {
    fetchStudents()
  }, [])

  // Pagination calculations
  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const isSelected = (id) => selected.indexOf(id) !== -1

  // Stats Cards Component
  const StatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {[
        {
          title: 'Total Students',
          value: stats.total,
          icon: <Groups />,
          color: theme.palette.primary.main,
          bgColor: alpha(theme.palette.primary.main, 0.1)
        },
        {
          title: 'Active Students',
          value: stats.active,
          icon: <Person />,
          color: theme.palette.success.main,
          bgColor: alpha(theme.palette.success.main, 0.1)
        },
        {
          title: 'Alumni',
          value: stats.alumni,
          icon: <School />,
          color: theme.palette.info.main,
          bgColor: alpha(theme.palette.info.main, 0.1)
        },
        {
          title: 'Job Posts',
          value: stats.jobPosts,
          icon: <Work />,
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.1)
        },
        {
          title: 'Applications',
          value: stats.applications,
          icon: <TrendingUp />,
          color: theme.palette.secondary.main,
          bgColor: alpha(theme.palette.secondary.main, 0.1)
        }
      ].map((stat, index) => (
        <Grid item xs={12} sm={6} md={2.4} key={index}>
          <Card 
            sx={{ 
              p: 2, 
              height: '100%',
              background: `linear-gradient(135deg, ${stat.bgColor} 0%, ${alpha(stat.color, 0.05)} 100%)`,
              border: `1px solid ${alpha(stat.color, 0.2)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(stat.color, 0.25)}`
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  {stat.title}
                </Typography>
              </Box>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                backgroundColor: alpha(stat.color, 0.1),
                color: stat.color
              }}>
                {stat.icon}
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  )

  // Enhanced Table Row Component
  const EnhancedTableRow = ({ student }) => {
    const isItemSelected = isSelected(student.id)
    
    return (
      <TableRow
        hover
        onClick={(event) => handleSelectRow(student.id)}
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        key={student.id}
        selected={isItemSelected}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04)
          }
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={isItemSelected}
          />
        </TableCell>
        <TableCell>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: student.role === 'STUDENT' ? '#4caf50' : '#ff9800',
                  border: `2px solid ${theme.palette.background.paper}`
                }}
              />
            }
          >
            <Avatar
              src={student.profile?.profile_picture_url}
              alt={student.profile?.full_name}
              sx={{ 
                width: 45, 
                height: 45,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              {student.profile?.full_name?.charAt(0)}
            </Avatar>
          </Badge>
        </TableCell>
        <TableCell>
          <Box>
            <Typography variant="body1" fontWeight="600" color="text.primary">
              {student.profile?.full_name || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {student.profile?.email_address}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontFamily="monospace" color="text.secondary">
            {student.user_id}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={student.role}
            color={student.role === 'STUDENT' ? 'primary' : 'secondary'}
            variant="filled"
            size="small"
            sx={{ 
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {student.profile?.email_address || 'N/A'}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {student.profile?.mobile_number || 'N/A'}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Chip
            label={student.profile?.gender || 'N/A'}
            size="small"
            variant="outlined"
            color="default"
          />
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Jobs Posted">
              <Chip
                icon={<Work sx={{ fontSize: 16 }} />}
                label={student.stats?.jobs_posted || 0}
                size="small"
                variant="outlined"
                color="primary"
              />
            </Tooltip>
            <Tooltip title="Applications Made">
              <Chip
                icon={<TrendingUp sx={{ fontSize: 16 }} />}
                label={student.stats?.applications_made || 0}
                size="small"
                variant="outlined"
                color="secondary"
              />
            </Tooltip>
          </Stack>
        </TableCell>
        <TableCell>
          <IconButton
            onClick={(event) => {
              event.stopPropagation()
              handleMenuOpen(event, student)
            }}
            sx={{
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <MoreVert />
          </IconButton>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <ProtectedRoute>
      <Dashboard>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Students Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and monitor your students and alumni
            </Typography>
          </Box>

          {/* Stats Cards */}
          <StatsCards />

          {/* Main Content */}
          <Paper 
            elevation={0} 
            sx={{ 
              width: '100%', 
              mb: 2,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            {/* Enhanced Toolbar */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Analytics sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="div" fontWeight="600">
                    Student Directory
                  </Typography>
                  {selected.length > 0 && (
                    <Chip
                      label={`${selected.length} selected`}
                      color="primary"
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                    sx={{ 
                      minWidth: 250,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02)
                        }
                      }
                    }}
                  />
                  <Tooltip title="Toggle Filters">
                    <IconButton 
                      onClick={() => setShowFilters(!showFilters)}
                      color={showFilters ? 'primary' : 'default'}
                    >
                      <FilterList />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Refresh">
                    <IconButton onClick={() => fetchStudents()}>
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => console.log('Add new student')}
                    sx={{ 
                      px: 3,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    Add Student
                  </Button>
                </Stack>
              </Toolbar>

              {/* Enhanced Filters */}
              <Fade in={showFilters}>
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Role Filter</InputLabel>
                        <Select
                          value={roleFilter}
                          label="Role Filter"
                          onChange={(e) => setRoleFilter(e.target.value)}
                        >
                          <MenuItem value="ALL">All Roles</MenuItem>
                          <MenuItem value="STUDENT">Students</MenuItem>
                          <MenuItem value="ALUMNI">Alumni</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Gender Filter</InputLabel>
                        <Select
                          value={genderFilter}
                          label="Gender Filter"
                          onChange={(e) => setGenderFilter(e.target.value)}
                        >
                          <MenuItem value="ALL">All Genders</MenuItem>
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setRoleFilter('ALL')
                          setGenderFilter('ALL')
                          setSearchTerm('')
                        }}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none'
                        }}
                      >
                        Clear Filters
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Typography variant="body2" color="text.secondary">
                          {filteredStudents.length} of {students.length} students
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            </Box>

            {/* Error Display */}
            {error && (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            )}

            {/* Loading State */}
            {loading ? (
              <Box sx={{ p: 3 }}>
                {[...Array(5)].map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={45} height={45} sx={{ mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="text" width="60%" />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              /* Enhanced Table */
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          indeterminate={selected.length > 0 && selected.length < filteredStudents.length}
                          checked={filteredStudents.length > 0 && selected.length === filteredStudents.length}
                          onChange={handleSelectAllClick}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Avatar</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'profile.full_name'}
                          direction={orderBy === 'profile.full_name' ? order : 'asc'}
                          onClick={() => handleSort('profile.full_name')}
                          sx={{ fontWeight: 'bold' }}
                        >
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'user_id'}
                          direction={orderBy === 'user_id' ? order : 'asc'}
                          onClick={() => handleSort('user_id')}
                          sx={{ fontWeight: 'bold' }}
                        >
                          User ID
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'role'}
                          direction={orderBy === 'role' ? order : 'asc'}
                          onClick={() => handleSort('role')}
                          sx={{ fontWeight: 'bold' }}
                        >
                          Role
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Gender</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Activity</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedStudents.map((student) => (
                      <EnhancedTableRow key={student.id} student={student} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Enhanced Pagination */}
            <Box sx={{ 
              borderTop: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.background.default, 0.5)
            }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredStudents.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10))
                  setPage(0)
                }}
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    paddingLeft: 2,
                    paddingRight: 2
                  }
                }}
              />
            </Box>
          </Paper>

          {/* Enhanced Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 8,
              sx: {
                minWidth: 160,
                borderRadius: 2,
                mt: 1
              }
            }}
          >
            <MenuItem onClick={() => handleViewStudent(menuStudent)}>
              <ListItemIcon>
                <Visibility fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Edit fontSize="small" color="info" />
              </ListItemIcon>
              <ListItemText>Edit Profile</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleDeleteStudent(menuStudent?.id)}>
              <ListItemIcon>
                <Delete fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>

          {/* Enhanced View Student Dialog */}
          <Dialog
            open={viewDialogOpen}
            onClose={() => setViewDialogOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                minHeight: '60vh'
              }
            }}
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                  Student Profile
                </Typography>
                <IconButton onClick={() => setViewDialogOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              {selectedStudent && (
                <Box>
                  {/* Header Section */}
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                      p: 3,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Avatar
                        src={selectedStudent.profile?.profile_picture_url}
                        alt={selectedStudent.profile?.full_name}
                        sx={{ width: 80, height: 80, border: `3px solid ${theme.palette.background.paper}` }}
                      >
                        {selectedStudent.profile?.full_name?.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          {selectedStudent.profile?.full_name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Chip
                            label={selectedStudent.role}
                            color={selectedStudent.role === 'STUDENT' ? 'primary' : 'secondary'}
                            variant="filled"
                          />
                          <Typography variant="body2" color="text.secondary">
                            ID: {selectedStudent.user_id}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {selectedStudent.profile?.bio || 'No bio available'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Content Section */}
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card sx={{ p: 2, height: '100%' }}>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person color="primary" />
                            Personal Information
                          </Typography>
                          <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Email color="action" />
                              <Typography variant="body2">
                                {selectedStudent.profile?.email_address || 'Not provided'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Phone color="action" />
                              <Typography variant="body2">
                                {selectedStudent.profile?.mobile_number || 'Not provided'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Gender:</strong> {selectedStudent.profile?.gender || 'Not specified'}
                              </Typography>
                            </Box>
                            {selectedStudent.role === 'ALUMNI' && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <School color="action" />
                                <Typography variant="body2">
                                  Batch: {selectedStudent.profile?.passing_batch || 'Not specified'}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Card sx={{ p: 2, height: '100%' }}>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Analytics color="primary" />
                            Activity Stats
                          </Typography>
                          <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Work color="action" />
                                <Typography variant="body2">Jobs Posted</Typography>
                              </Box>
                              <Chip
                                label={selectedStudent.stats?.jobs_posted || 0}
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendingUp color="action" />
                                <Typography variant="body2">Applications Made</Typography>
                              </Box>
                              <Chip
                                label={selectedStudent.stats?.applications_made || 0}
                                color="secondary"
                                variant="outlined"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StarBorder color="action" />
                                <Typography variant="body2">Profile Rating</Typography>
                              </Box>
                              <Chip
                                label="4.5/5"
                                color="success"
                                variant="outlined"
                              />
                            </Box>
                          </Stack>
                        </Card>
                      </Grid>

                      {/* Social Links */}
                      <Grid item xs={12}>
                        <Card sx={{ p: 2 }}>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Business color="primary" />
                            Professional Links
                          </Typography>
                          <Stack direction="row" spacing={2} flexWrap="wrap">
                            {selectedStudent.profile?.github && (
                              <Button
                                variant="outlined"
                                startIcon={<GitHub />}
                                href={selectedStudent.profile.github}
                                target="_blank"
                                sx={{ textTransform: 'none' }}
                              >
                                GitHub
                              </Button>
                            )}
                            {selectedStudent.profile?.linked_in && (
                              <Button
                                variant="outlined"
                                startIcon={<LinkedIn />}
                                href={selectedStudent.profile.linked_in}
                                target="_blank"
                                sx={{ textTransform: 'none' }}
                              >
                                LinkedIn
                              </Button>
                            )}
                            {!selectedStudent.profile?.github && !selectedStudent.profile?.linked_in && (
                              <Typography variant="body2" color="text.secondary">
                                No professional links available
                              </Typography>
                            )}
                          </Stack>
                        </Card>
                      </Grid>

                      {/* Timeline/Activity */}
                      <Grid item xs={12}>
                        <Card sx={{ p: 2 }}>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday color="primary" />
                            Recent Activity
                          </Typography>
                          <Box sx={{ pl: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              • Profile created on {new Date().toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              • Last active: {new Date().toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              • Total login sessions: 45
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => console.log('Edit student')}
                sx={{ textTransform: 'none' }}
              >
                Edit Profile
              </Button>
              <Button
                variant="contained"
                onClick={() => setViewDialogOpen(false)}
                sx={{ textTransform: 'none' }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Dashboard>
    </ProtectedRoute>
  )
}

export default StudentPage