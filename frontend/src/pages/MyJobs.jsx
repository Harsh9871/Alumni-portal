import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Pagination,
  Stack,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  People,
  Event,
  LocationOn,
  Work,
  CalendarToday,
  AttachMoney
} from '@mui/icons-material';
import Jobs from '../hooks/Jobs';

const MyJobs = () => {
  const navigate = useNavigate();
  const jobsService = new Jobs();
  // In MyJobs.jsx, update the Edit button handler:

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMyJobs(currentPage);
  }, [currentPage]);

  const fetchMyJobs = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const result = await jobsService.getMyJobs(page);
      
      if (result.success) {
        // Fix: Access jobs array correctly from the response
        setJobs(result.data.data?.jobs || []);
        setPagination(result.data.data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        setError(result.error || 'Failed to fetch your jobs');
      }
    } catch (err) {
      setError('Error fetching jobs');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    setDeleting(true);
    try {
      const result = await jobsService.deleteJob(jobId);
      
      if (result.success) {
        setJobs(prev => prev.filter(job => job.id !== jobId));
        setDeleteDialog(null);
        setError('');
        // Refresh the list
        fetchMyJobs(currentPage);
      } else {
        setError(result.error || 'Failed to delete job');
      }
    } catch (err) {
      setError('Error deleting job');
      console.error('Error:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleViewApplications = (jobId) => {
    navigate(`/jobs/${jobId}/applications`);
  };

  const handleEditJob = (jobId) => {
    navigate(`/jobs/${jobId}/edit`);
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'success';
      case 'CLOSED': return 'error';
      case 'ON_HOLD': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getApplicationsCount = (job) => {
    return job._count?.applications || job.applications?.length || 0;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography ml={2}>Loading your jobs...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            My Job Postings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pagination.totalCount} total {pagination.totalCount === 1 ? 'job' : 'jobs'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/jobs/create')}
          size="large"
        >
          Create New Job
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Work sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Jobs Posted Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Start by creating your first job posting to attract talented students.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/jobs/create')}
              size="large"
            >
              Create Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {jobs.map((job) => (
              <Grid item xs={12} key={job.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': { 
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      {/* Job Info */}
                      <Box flex={1} minWidth={0} pr={2}>
                        <Box display="flex" alignItems="center" gap={2} mb={1} flexWrap="wrap">
                          <Typography variant="h5" fontWeight="600" noWrap sx={{ flex: '1 1 auto', minWidth: 0 }}>
                            {job.job_title}
                          </Typography>
                          <Chip 
                            label={job.status} 
                            color={getStatusColor(job.status)}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom noWrap>
                          <Work sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                          {job.designation}
                        </Typography>
                        
                        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" sx={{ gap: 1 }}>
                          <Chip
                            icon={<LocationOn />}
                            label={job.location} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip
                            icon={<Work />}
                            label={job.mode} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip
                            label={`${job.experience}`} 
                            size="small" 
                            variant="outlined"
                          />
                        </Stack>
                        
                        <Box display="flex" gap={3} flexWrap="wrap">
                          <Typography variant="body2" color="text.secondary" noWrap>
                            <AttachMoney sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                            {job.salary}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            <People sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                            {job.vacancy} {job.vacancy === 1 ? 'vacancy' : 'vacancies'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            <CalendarToday sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                            Deadline: {formatDate(job.open_till)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Actions and Stats */}
                      <Box display="flex" flexDirection="column" alignItems="flex-end" gap={2} flexShrink={0}>
                        {/* Applications Count */}
                        <Box textAlign="center" p={2} bgcolor="primary.light" borderRadius={2} minWidth={100}>
                          <Typography variant="h4" fontWeight="bold" color="primary.main">
                            {getApplicationsCount(job)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Applications
                          </Typography>
                        </Box>

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                          <IconButton
                            onClick={() => handleViewJob(job.id)}
                            color="primary"
                            title="View Job"
                            size="small"
                          >
                            <Visibility />
                          </IconButton>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<People />}
                            onClick={() => handleViewApplications(job.id)}
                            disabled={getApplicationsCount(job) === 0}
                          >
                            Applications
                          </Button>
                          <IconButton
                            onClick={() => handleEditJob(job.id)}
                            color="info"
                            title="Edit Job"
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => setDeleteDialog(job)}
                            color="error"
                            title="Delete Job"
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Job Description Preview */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.5
                      }}
                    >
                      {job.job_description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination 
                count={pagination.totalPages} 
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteDialog)} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Delete Job Posting</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to delete the job posting for{" "}
            <strong>{deleteDialog?.job_title}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. All applications for this job will also be deleted.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button 
            onClick={() => handleDeleteJob(deleteDialog?.id)} 
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <Delete />}
          >
            {deleting ? 'Deleting...' : 'Delete Job'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyJobs;