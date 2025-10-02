import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  Paper,
  Alert,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn,
  Work,
  Schedule,
  AttachMoney,
  People,
  Event,
  ArrowBack,
  HowToReg,
  BookmarkBorder,
  Share,
  AccessTime,
  TrendingUp,
  Business
} from '@mui/icons-material';
import Jobs from '../hooks/Jobs';
import Applications from '../hooks/Applications';
import Auth from '../hooks/auth';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const jobsService = new Jobs();
  const applicationsService = new Applications();
  const authService = new Auth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyDialog, setApplyDialog] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  const currentUser = authService.getCurrentUser();
  const userRole = localStorage.getItem('role')?.replace(/"/g, '').trim();
  const isStudent = userRole === 'STUDENT';
  const isAlumni = userRole === 'ALUMNI';

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const result = await jobsService.getJobById(id);
      
      if (result.success) {
        setJob(result.data.data);
      } else {
        setError(result.error || 'Job not found');
      }
    } catch (err) {
      setError('Failed to load job details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!isStudent) {
      setError('Only students can apply for jobs');
      return;
    }

    if (job?.has_applied) {
      setError('You have already applied for this job');
      return;
    }

    setApplying(true);
    try {
      const result = await applicationsService.applyForJob(id);
      
      if (result.success) {
        setApplicationStatus('success');
        setJob(prev => ({ ...prev, has_applied: true }));
        setError('');
      } else {
        setApplicationStatus('error');
        setError(result.error || 'Failed to apply for job');
      }
    } catch (err) {
      setApplicationStatus('error');
      setError('Error applying for job');
      console.error('Error:', err);
    } finally {
      setApplying(false);
      setApplyDialog(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'success';
      case 'CLOSED': return 'error';
      case 'ON_HOLD': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white' }}>Loading job details...</Typography>
        </Box>
      </Box>
    );
  }

  if (error && !job) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 3 } }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>{error}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/search')} variant="contained" sx={{ borderRadius: 2 }}>Back to Jobs</Button>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 3 } }}>
        <Alert severity="warning" sx={{ borderRadius: 3 }}>Job not found</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/search')} sx={{ mt: 2, borderRadius: 2 }} variant="contained">Back to Jobs</Button>
      </Box>
    );
  }

  const isJobOwner = isAlumni && job.user_id === currentUser?.id;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)', pb: 6 }}>
      {/* Hero Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', pt: { xs: 3, md: 4 }, pb: { xs: 10, md: 12 }, px: { xs: 2, sm: 3 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', position: 'relative', zIndex: 1 }}>
          {applicationStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', backgroundColor: 'rgba(255,255,255,0.95)' }}>
              Successfully applied for this job! We'll notify you about updates.
            </Alert>
          )}

          {applicationStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', backgroundColor: 'rgba(255,255,255,0.95)' }}>
              {error}
            </Alert>
          )}

          <Button startIcon={<ArrowBack />} onClick={() => navigate('/search')} sx={{ mb: 3, color: 'white', borderColor: 'rgba(255,255,255,0.3)', borderRadius: 2, px: 3, '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } }} variant="outlined">
            Back to Jobs
          </Button>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Chip label={job.status} color={getStatusColor(job.status)} sx={{ fontWeight: 600, height: 32, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
              {job.status === 'OPEN' && (
                <Chip icon={<TrendingUp />} label="Accepting Applications" color="success" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', fontWeight: 500 }} />
              )}
            </Box>
            
            <Typography variant="h3" component="h1" sx={{ color: 'white', fontWeight: 800, mb: 2, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {job.job_title}
            </Typography>
            
            <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 500, mb: 3, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {job.designation}
            </Typography>

            {job.user?.alumni && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 48, height: 48, fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  {job.user.alumni.full_name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>{job.user.alumni.full_name}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{job.user.alumni.passing_batch} Alumni</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 }, mt: -8, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflow: 'visible', mb: 3 }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                {/* Quick Info Grid */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={6} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 3, height: '100%' }}>
                      <LocationOn sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                      <Typography variant="caption" display="block" sx={{ opacity: 0.9, mb: 0.5 }}>Location</Typography>
                      <Typography variant="body2" fontWeight={600}>{job.location}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', borderRadius: 3, height: '100%' }}>
                      <Work sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                      <Typography variant="caption" display="block" sx={{ opacity: 0.9, mb: 0.5 }}>Work Mode</Typography>
                      <Typography variant="body2" fontWeight={600}>{job.mode}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: 3, height: '100%' }}>
                      <Schedule sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                      <Typography variant="caption" display="block" sx={{ opacity: 0.9, mb: 0.5 }}>Experience</Typography>
                      <Typography variant="body2" fontWeight={600}>{job.experience}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', borderRadius: 3, height: '100%' }}>
                      <AttachMoney sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                      <Typography variant="caption" display="block" sx={{ opacity: 0.9, mb: 0.5 }}>Salary</Typography>
                      <Typography variant="body2" fontWeight={600}>{job.salary}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: 3, height: '100%' }}>
                      <People sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                      <Typography variant="caption" display="block" sx={{ opacity: 0.9, mb: 0.5 }}>Vacancies</Typography>
                      <Typography variant="body2" fontWeight={600}>{job.vacancy} Positions</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Job Description */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business sx={{ color: 'primary.main' }} />
                    Job Description
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: 'text.secondary', fontSize: '1rem' }}>
                    {job.job_description}
                  </Typography>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Important Dates */}
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>Important Dates</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '2px solid', borderColor: 'primary.light', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}><Event /></Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Joining Date</Typography>
                          <Typography variant="h6" fontWeight={600}>{formatDate(job.joining_date)}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '2px solid', borderColor: 'error.light', background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.1) 0%, rgba(240, 147, 251, 0.1) 100%)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Avatar sx={{ bgcolor: 'error.main' }}><AccessTime /></Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Application Deadline</Typography>
                          <Typography variant="h6" fontWeight={600}>{formatDate(job.open_till)}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Applications Section for Alumni */}
            {isJobOwner && (
              <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Applications Received</Typography>
                      <Typography variant="body2" color="text.secondary">View and manage candidate applications</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}><People sx={{ fontSize: 32 }} /></Avatar>
                  </Box>
                  <Button variant="contained" onClick={() => navigate(`/jobs/${id}/applications`)} fullWidth size="large" sx={{ mt: 2, borderRadius: 2, py: 1.5, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)' }}>
                    View All Applications
                  </Button>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar - Action Panel */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', position: 'sticky', top: 24 }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>Take Action</Typography>
                
                {/* Student Actions */}
                {isStudent && (
                  <Stack spacing={2}>
                    {job.has_applied ? (
                      <Alert severity="success" sx={{ borderRadius: 2, '& .MuiAlert-icon': { fontSize: 28 } }}>
                        Application submitted successfully!
                      </Alert>
                    ) : job.status === 'OPEN' ? (
                      <>
                        <Button variant="contained" size="large" startIcon={<HowToReg />} onClick={() => setApplyDialog(true)} fullWidth sx={{ py: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)', fontSize: '1.1rem', fontWeight: 600, '&:hover': { boxShadow: '0 8px 28px rgba(102, 126, 234, 0.5)', transform: 'translateY(-2px)', transition: 'all 0.3s ease' } }}>
                          Apply Now
                        </Button>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Save for later">
                            <Button variant="outlined" fullWidth startIcon={<BookmarkBorder />} sx={{ borderRadius: 2, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>Save Job</Button>
                          </Tooltip>
                          <Tooltip title="Share this job">
                            <IconButton sx={{ border: '2px solid', borderColor: 'divider', borderRadius: 2, '&:hover': { borderColor: 'primary.main', backgroundColor: 'primary.light' } }}>
                              <Share />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </>
                    ) : (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>This job is no longer accepting applications</Alert>
                    )}
                  </Stack>
                )}

                {/* Alumni/Owner Actions */}
                {isJobOwner && (
                  <Stack spacing={2}>
                    <Button variant="contained" fullWidth size="large" sx={{ borderRadius: 2, py: 1.5, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Edit Job Posting</Button>
                    <Button variant="outlined" color="error" fullWidth size="large" sx={{ borderRadius: 2, py: 1.5, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>Close Applications</Button>
                  </Stack>
                )}

                {/* Public/Other User Info */}
                {(!currentUser || (isAlumni && !isJobOwner)) && (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    {!currentUser ? 'Login to apply for this job' : 'Only students can apply for jobs'}
                  </Alert>
                )}

                {/* Quick Stats */}
                <Box sx={{ mt: 4, pt: 3, borderTop: 2, borderColor: 'divider', borderStyle: 'dashed' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>Posted on</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>{formatDate(job.createdAt || new Date().toISOString())}</Typography>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>Current Status</Typography>
                  <Chip label={job.status} size="medium" color={getStatusColor(job.status)} sx={{ fontWeight: 600 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Apply Confirmation Dialog */}
      <Dialog open={applyDialog} onClose={() => setApplyDialog(false)} PaperProps={{ sx: { borderRadius: 4, maxWidth: 500 } }}>
        <DialogTitle sx={{ pb: 1, fontSize: '1.5rem', fontWeight: 700 }}>Confirm Your Application</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ mb: 2 }}>You are about to apply for:</Typography>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, border: '2px solid', borderColor: 'primary.main' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>{job.job_title}</Typography>
            <Typography variant="body2" color="text.secondary">{job.location} • {job.designation}</Typography>
          </Paper>
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>Your profile and resume will be shared with the employer. Make sure your information is up to date!</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setApplyDialog(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleApply} variant="contained" disabled={applying} startIcon={applying ? <CircularProgress size={16} /> : <HowToReg />} sx={{ borderRadius: 2, px: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)' }}>
            {applying ? 'Submitting...' : 'Confirm & Apply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobDetails;