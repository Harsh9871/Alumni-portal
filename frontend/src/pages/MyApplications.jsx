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
  DialogActions
} from '@mui/material';
import {
  Delete,
  Visibility,
  Event,
  LocationOn
} from '@mui/icons-material';
import Applications from '../hooks/Applications';
import Jobs from '../hooks/Jobs';
import Auth from '../hooks/auth';

const MyApplications = () => {
  const navigate = useNavigate();
  const applicationsService = new Applications();
  const jobsService = new Jobs();
  const authService = new Auth();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const currentUser = authService.getCurrentUser();
  const userRole = localStorage.getItem('role');

  // Fix role check - remove quotes and trim
  const cleanRole = userRole ? userRole.replace(/"/g, '').trim() : '';
  const isStudent = cleanRole === 'STUDENT';

  useEffect(() => {
    console.log('Raw role:', userRole);
    console.log('Clean role:', cleanRole);
    console.log('Is student:', isStudent);
    
    if (!isStudent) {
      setError(`Access denied. Only students can view applications. Current role: ${userRole}`);
      setLoading(false);
      return;
    }
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Method 1: Try to use direct applications approach first
      try {
        const result = await applicationsService.getMyApplications();
        if (result.success) {
          setApplications(result.data.data || []);
          if (result.data.data?.length === 0) {
            setError('No applications found. Start applying to jobs!');
          }
          return;
        }
      } catch (err) {
        console.log('Direct applications method failed, trying alternative...');
      }

      // Method 2: Alternative approach - get all jobs and check applications
      const jobsResult = await jobsService.getJobs();
      
      if (jobsResult.success) {
        const allJobs = jobsResult.data.data?.jobs || [];
        const userApplications = [];
        
        // Check a few recent jobs for applications (to avoid too many API calls)
        const jobsToCheck = allJobs.slice(0, 10); // Check first 10 jobs
        
        for (const job of jobsToCheck) {
          try {
            const appResult = await applicationsService.getJobApplications(job.id);
            if (appResult.success) {
              const jobApplications = appResult.data.data || [];
              const userApp = jobApplications.find(app => {
                const appUserId = app.user?.id || app.user_id;
                const currentUserId = currentUser?.id;
                return appUserId === currentUserId;
              });
              
              if (userApp) {
                userApplications.push({
                  ...userApp,
                  job: job
                });
              }
            }
          } catch (err) {
            // Skip jobs that can't be checked
            continue;
          }
        }
        
        setApplications(userApplications);
        
        if (userApplications.length === 0) {
          setError('No applications found. Apply to some jobs first!');
        }
      } else {
        setError('Failed to load jobs');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (jobId) => {
    setDeleting(true);
    try {
      const result = await applicationsService.deleteApplication(jobId);
      
      if (result.success) {
        setApplications(prev => prev.filter(app => app.job_id !== jobId));
        setDeleteDialog(null);
        setError('');
      } else {
        setError(result.error || 'Failed to delete application');
      }
    } catch (err) {
      setError('Error deleting application');
      console.error('Error:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const getApplicationStatus = (application) => {
    if (application.job?.status === 'CLOSED') return 'Job Closed';
    if (application.job?.status === 'ON_HOLD') return 'On Hold';
    
    const appliedDate = new Date(application.applied_at);
    const daysSinceApplied = Math.floor((new Date() - appliedDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceApplied < 2) return 'Applied';
    if (daysSinceApplied < 7) return 'Under Review';
    if (daysSinceApplied < 14) return 'In Process';
    return 'Under Consideration';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'primary';
      case 'Under Review': return 'warning';
      case 'In Process': return 'info';
      case 'Job Closed': return 'error';
      case 'On Hold': return 'default';
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, flexDirection: 'column' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your applications...</Typography>
      </Box>
    );
  }

  if (!isStudent) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Alert severity="error">
          Access denied. Only students can view applications. 
          Current role: "{userRole}"
        </Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/login')}
        >
          Login as Student
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        My Job Applications
      </Typography>

      {error && (
        <Alert severity={applications.length === 0 ? "info" : "error"} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Applications List */}
      {applications.length === 0 && !loading ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Applications Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {error || 'You haven\'t applied to any jobs yet. Start browsing available positions!'}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/search')}
            >
              Browse Jobs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Found {applications.length} application{applications.length !== 1 ? 's' : ''}
          </Typography>
          
          <Grid container spacing={3}>
            {applications.map((application, index) => (
              <Grid item xs={12} key={application.id || `app-${index}`}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      {/* Job Info */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          {application.job?.job_title || 'Job Title Not Available'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                          {application.job?.designation && (
                            <Chip 
                              label={application.job.designation} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                          {application.job?.location && (
                            <Chip 
                              icon={<LocationOn />}
                              label={application.job.location} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                          {application.job?.mode && (
                            <Chip 
                              label={application.job.mode} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                          <Event sx={{ fontSize: 16, mr: 1, verticalAlign: 'bottom' }} />
                          Applied on {formatDate(application.applied_at)}
                        </Typography>
                      </Grid>

                      {/* Status and Actions */}
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: { md: 'flex-end' } }}>
                          <Chip 
                            label={getApplicationStatus(application)}
                            color={getStatusColor(getApplicationStatus(application))}
                            size="small"
                          />
                          
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewJob(application.job_id)}
                            >
                              View Job
                            </Button>
                            
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Delete />}
                              onClick={() => setDeleteDialog(application)}
                            >
                              Withdraw
                            </Button>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Application Details */}
                    {application.job?.salary && (
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Salary: {application.job.salary}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Withdraw Application</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to withdraw your application for{" "}
            <strong>{deleteDialog?.job?.job_title}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button 
            onClick={() => handleDeleteApplication(deleteDialog?.job_id)} 
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
          >
            {deleting ? 'Withdrawing...' : 'Withdraw Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyApplications;