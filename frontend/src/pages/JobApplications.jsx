import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Avatar,
  Divider,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  Email,
  Phone,
  CalendarToday,
  School,
  Download
} from '@mui/icons-material';
import Applications from '../hooks/Applications';
import Jobs from '../hooks/Jobs';
import Auth from '../hooks/auth';

const JobApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const applicationsService = new Applications();
  const jobsService = new Jobs();
  const authService = new Auth();
  
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = authService.getCurrentUser();
  const userRole = localStorage.getItem('role');
  const cleanRole = userRole ? userRole.replace(/"/g, '').trim() : '';
  const isAlumni = cleanRole === 'ALUMNI';

  useEffect(() => {
    if (!isAlumni) {
      setError('Access denied. Only alumni can view job applications.');
      setLoading(false);
      return;
    }
    fetchJobAndApplications();
  }, [id, isAlumni]);

  const fetchJobAndApplications = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch job details first
      const jobResult = await jobsService.getJobById(id);
      if (!jobResult.success) {
        setError('Job not found');
        setLoading(false);
        return;
      }

      const jobData = jobResult.data.data;
      setJob(jobData);

      // Check if current user is the job owner
      if (jobData.user_id !== currentUser?.id) {
        setError('You can only view applications for your own job postings');
        setLoading(false);
        return;
      }

      // Fetch applications for this job
      const applicationsResult = await applicationsService.getJobApplications(id);
      if (applicationsResult.success) {
        setApplications(applicationsResult.data.data || []);
      } else {
        setError(applicationsResult.error || 'Failed to fetch applications');
      }
    } catch (err) {
      setError('Error loading applications');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDownloadResume = (application) => {
    // Placeholder for resume download functionality
    if (application.user?.student?.resume_url) {
      window.open(application.user.student.resume_url, '_blank');
    } else {
      alert('Resume not available for this applicant');
    }
  };

  const handleContactApplicant = (email, phone) => {
    // Placeholder for contact functionality
    if (email) {
      window.location.href = `mailto:${email}`;
    } else if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert('Contact information not available');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading applications...</Typography>
      </Box>
    );
  }

  if (!isAlumni) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Alert severity="error">
          Access denied. Only alumni can view job applications.
        </Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/login')}
        >
          Login as Alumni
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/my-jobs')}
          sx={{ mr: 2 }}
        >
          Back to My Jobs
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Job Applications
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Job Info Card */}
      {job && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {job.job_title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {job.designation} • {job.location} • {job.mode}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              <Chip 
                label={`${applications.length} Applications`}
                color="primary"
                variant="outlined"
              />
              <Chip 
                label={job.status}
                color={job.status === 'OPEN' ? 'success' : 'default'}
              />
              <Chip 
                label={`Vacancies: ${job.vacancy}`}
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Applications Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No students have applied for this job yet. Check back later or share the job posting.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            {applications.length} {applications.length === 1 ? 'application' : 'applications'} received
          </Typography>

          <Grid container spacing={3}>
            {applications.map((application, index) => (
              <Grid item xs={12} key={application.id || index}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={3}>
                      {/* Applicant Info */}
                      <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Avatar
                            sx={{ 
                              width: 64, 
                              height: 64,
                              bgcolor: 'primary.main',
                              fontSize: '1.25rem'
                            }}
                          >
                            {getInitials(application.user?.student?.full_name || 'Applicant')}
                          </Avatar>
                          
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                              {application.user?.student?.full_name || 'Applicant'}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                              {application.user?.student?.email_address && (
                                <Chip
                                  icon={<Email />}
                                  label={application.user.student.email_address}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {application.user?.student?.mobile_number && (
                                <Chip
                                  icon={<Phone />}
                                  label={application.user.student.mobile_number}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {application.user?.student?.course && (
                                <Chip
                                  icon={<School />}
                                  label={application.user.student.course}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>

                            {/* Student Details */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                              {application.user?.student?.current_year && (
                                <Typography variant="body2" color="text.secondary">
                                  Year: {application.user.student.current_year}
                                </Typography>
                              )}
                              {application.user?.student?.department && (
                                <Typography variant="body2" color="text.secondary">
                                  Department: {application.user.student.department}
                                </Typography>
                              )}
                              {application.user?.student?.cgpa && (
                                <Typography variant="body2" color="text.secondary">
                                  CGPA: {application.user.student.cgpa}
                                </Typography>
                              )}
                            </Box>

                            {/* Bio */}
                            {application.user?.student?.bio && (
                              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                                {application.user.student.bio}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Grid>

                      {/* Application Details & Actions */}
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {/* Application Date */}
                          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Applied on
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              <CalendarToday sx={{ fontSize: 16, mr: 1, verticalAlign: 'bottom' }} />
                              {formatDate(application.applied_at)}
                            </Typography>
                          </Paper>

                          {/* Action Buttons */}
                          <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'row', md: 'column' } }}>
                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={<Email />}
                              onClick={() => handleContactApplicant(
                                application.user?.student?.email_address,
                                application.user?.student?.mobile_number
                              )}
                            >
                              Contact
                            </Button>
                            
                            <Button
                              variant="outlined"
                              fullWidth
                              startIcon={<Download />}
                              onClick={() => handleDownloadResume(application)}
                            >
                              Resume
                            </Button>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Skills */}
                    {application.user?.student?.skills && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Skills:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {application.user.student.skills.split(',').map((skill, idx) => (
                            <Chip
                              key={idx}
                              label={skill.trim()}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default JobApplications;