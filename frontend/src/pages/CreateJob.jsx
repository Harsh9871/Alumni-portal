import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Save,
  ArrowBack,
  Work,
  Business,
  LocationOn,
  AttachMoney,
  People
} from '@mui/icons-material';
import Jobs from '../hooks/Jobs';

const CreateJob = () => {
  const navigate = useNavigate();
  const jobsService = new Jobs();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [jobData, setJobData] = useState({
    job_title: '',
    designation: '',
    job_description: '',
    location: '',
    mode: '',
    experience: '',
    salary: '',
    vacancy: '',
    joining_date: '',
    open_till: '',
    status: 'OPEN'
  });

  const handleChange = (field, value) => {
    setJobData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!jobData.job_title || !jobData.designation || !jobData.job_description || 
          !jobData.location || !jobData.salary || !jobData.vacancy) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate dates
      const joiningDate = new Date(jobData.joining_date);
      const openTill = new Date(jobData.open_till);
      const today = new Date();

      if (openTill <= today) {
        setError('Application deadline must be in the future');
        setLoading(false);
        return;
      }

      if (joiningDate <= openTill) {
        setError('Joining date must be after application deadline');
        setLoading(false);
        return;
      }

      const result = await jobsService.createJob(jobData);
      
      if (result.success) {
        setSuccess('Job created successfully!');
        // Reset form
        setJobData({
          job_title: '',
          designation: '',
          job_description: '',
          location: '',
          mode: '',
          experience: '',
          salary: '',
          vacancy: '',
          joining_date: '',
          open_till: '',
          status: 'OPEN'
        });
        
        // Redirect to my jobs after 2 seconds
        setTimeout(() => {
          navigate('/my-jobs');
        }, 2000);
      } else {
        setError(result.error || 'Failed to create job');
      }
    } catch (err) {
      setError('Error creating job');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/my-jobs')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Create New Job
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Job Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Title *"
                  value={jobData.job_title}
                  onChange={(e) => handleChange('job_title', e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                  required
                />
              </Grid>

              {/* Designation */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Designation *"
                  value={jobData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </Grid>

              {/* Job Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Description *"
                  value={jobData.job_description}
                  onChange={(e) => handleChange('job_description', e.target.value)}
                  placeholder="Describe the job responsibilities, requirements, and benefits..."
                  multiline
                  rows={4}
                  required
                />
              </Grid>

              {/* Location and Mode */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location *"
                  value={jobData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g. Bangalore, Remote"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Work Mode</InputLabel>
                  <Select
                    value={jobData.mode}
                    label="Work Mode"
                    onChange={(e) => handleChange('mode', e.target.value)}
                  >
                    <MenuItem value="Remote">Remote</MenuItem>
                    <MenuItem value="Hybrid">Hybrid</MenuItem>
                    <MenuItem value="On-site">On-site</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Experience and Salary */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Experience Level</InputLabel>
                  <Select
                    value={jobData.experience}
                    label="Experience Level"
                    onChange={(e) => handleChange('experience', e.target.value)}
                  >
                    <MenuItem value="0-2 years">0-2 years</MenuItem>
                    <MenuItem value="2-4 years">2-4 years</MenuItem>
                    <MenuItem value="4-6 years">4-6 years</MenuItem>
                    <MenuItem value="6+ years">6+ years</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary *"
                  value={jobData.salary}
                  onChange={(e) => handleChange('salary', e.target.value)}
                  placeholder="e.g. ₹12-18 LPA"
                  required
                />
              </Grid>

              {/* Vacancy and Status */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Number of Vacancies *"
                  type="number"
                  value={jobData.vacancy}
                  onChange={(e) => handleChange('vacancy', e.target.value)}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Job Status</InputLabel>
                  <Select
                    value={jobData.status}
                    label="Job Status"
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <MenuItem value="OPEN">Open</MenuItem>
                    <MenuItem value="CLOSED">Closed</MenuItem>
                    <MenuItem value="ON_HOLD">On Hold</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Dates */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Application Deadline *"
                  type="date"
                  value={jobData.open_till}
                  onChange={(e) => handleChange('open_till', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: getTomorrowDate() }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Joining Date *"
                  type="date"
                  value={jobData.joining_date}
                  onChange={(e) => handleChange('joining_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: getTomorrowDate() }}
                  required
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/my-jobs')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} /> : <Save />}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Job'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Business /> Job Posting Tips
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Be specific about job responsibilities and requirements<br/>
          • Include information about your company culture<br/>
          • Mention any benefits or perks offered<br/>
          • Set realistic application deadlines<br/>
          • Keep the job description clear and concise
        </Typography>
      </Paper>
    </Box>
  );
};

export default CreateJob;