import React, { useState, useEffect } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip
} from '@mui/material';
import {
  Save,
  ArrowBack,
  Person,
  School,
  Work,
  ContactMail
} from '@mui/icons-material';
import UserDetails from '../hooks/UserDetails';
import Upload from '../hooks/Upload';
import Auth from '../hooks/auth';

const CreateProfile = () => {
  const navigate = useNavigate();
  const userDetailsService = new UserDetails();
  const uploadService = new Upload();
  const authService = new Auth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const userRole = localStorage.getItem('role');
  const cleanRole = userRole ? userRole.replace(/"/g, '').trim() : '';
  const isStudent = cleanRole === 'STUDENT';
  const isAlumni = cleanRole === 'ALUMNI';

  // Updated profile data with required backend fields
  const [profileData, setProfileData] = useState({
    // REQUIRED Backend Fields
    full_name: '',
    email_address: '',
    mobile_number: '',
    bio: '',
    gender: '',
    dob: '',
    
    // Optional Backend Fields
    linked_in: '',
    github: '',
    about_us: '',
    profile_picture_url: '',
    resume: '',
    
    // Student specific fields
    student_id: '',
    course: '',
    department: '',
    current_year: '',
    cgpa: '',
    address: '',
    skills: '',
    
    // Alumni specific fields  
    passing_batch: '',
    current_company: '',
    designation: '',
    years_of_experience: '',
    portfolio_url: ''
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const result = await userDetailsService.getUserProfile();
      if (result.success && result.data.data) {
        const existingProfile = result.data.data;
        if (isStudent && existingProfile.student) {
          setProfileData(prev => ({
            ...prev,
            ...existingProfile.student,
            // Map backend fields
            dob: existingProfile.student.date_of_birth || '',
            linked_in: existingProfile.student.linkedin_url || '',
            github: existingProfile.student.github_url || ''
          }));
        } else if (isAlumni && existingProfile.alumni) {
          setProfileData(prev => ({
            ...prev,
            ...existingProfile.alumni,
            // Map backend fields
            dob: existingProfile.alumni.date_of_birth || '',
            linked_in: existingProfile.alumni.linkedin_url || '',
            github: existingProfile.alumni.github_url || ''
          }));
        }
      }
    } catch (err) {
      // No existing profile
    }
  };

  const steps = isStudent 
    ? ['Personal Information', 'Academic Details', 'Skills & Resume']
    : ['Personal Information', 'Professional Details', 'Verification'];

  const handleChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (file, type) => {
    try {
      const validation = uploadService.validateFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return null;
      }

      const result = await uploadService.uploadFile(file, type);
      if (result.success) {
        return result.data.fileUrl;
      } else {
        setError(result.error || 'File upload failed');
        return null;
      }
    } catch (err) {
      setError('Error uploading file');
      return null;
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (activeStep === 0) {
      if (!profileData.full_name || !profileData.email_address || !profileData.mobile_number || !profileData.gender || !profileData.dob) {
        setError('Please fill all required fields');
        return;
      }
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!profileData.full_name || !profileData.email_address || !profileData.mobile_number || 
          !profileData.bio || !profileData.gender || !profileData.dob) {
        setError('Please fill all required fields (marked with *)');
        setLoading(false);
        return;
      }

      // Upload files if provided
      let resumeUrl = null;
      let certificateUrl = null;
      let profilePictureUrl = null;

      if (resumeFile) {
        resumeUrl = await handleFileUpload(resumeFile, 'resume');
        if (!resumeUrl) {
          setLoading(false);
          return;
        }
      }

      if (certificateFile) {
        certificateUrl = await handleFileUpload(certificateFile, 'certificate');
        if (!certificateUrl) {
          setLoading(false);
          return;
        }
      }

      if (profilePictureFile) {
        profilePictureUrl = await handleFileUpload(profilePictureFile, 'profile');
      }

      // Prepare final data for backend
      const submitData = {
        // REQUIRED Fields
        full_name: profileData.full_name,
        email_address: profileData.email_address,
        mobile_number: profileData.mobile_number,
        bio: profileData.bio,
        gender: profileData.gender,
        dob: profileData.dob,
        
        // Optional Fields
        linked_in: profileData.linked_in || '',
        github: profileData.github || '',
        about_us: profileData.about_us || '',
        profile_picture_url: profilePictureUrl || '',
        resume: resumeUrl || '',
        
        // Additional fields based on role
        ...(isStudent && {
          student_id: profileData.student_id || '',
          course: profileData.course || '',
          department: profileData.department || '',
          current_year: profileData.current_year || '',
          cgpa: profileData.cgpa || '',
          address: profileData.address || '',
          skills: profileData.skills || ''
        }),
        ...(isAlumni && {
          passing_batch: profileData.passing_batch || '',
          current_company: profileData.current_company || '',
          designation: profileData.designation || '',
          years_of_experience: profileData.years_of_experience || '',
          portfolio_url: profileData.portfolio_url || '',
          degree_certificate_url: certificateUrl || ''
        })
      };

      // Remove empty strings and null values
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] == null) {
          delete submitData[key];
        }
      });

      let result;
      if (isStudent) {
        result = await userDetailsService.createStudentProfile(submitData);
      } else if (isAlumni) {
        result = await userDetailsService.createAlumniProfile(submitData);
      }

      if (result.success) {
        setSuccess('Profile saved successfully!');
        authService.updateProfileStatus(true);
        
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        setError(result.error || 'Failed to save profile');
      }
    } catch (err) {
      setError('Error saving profile');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name *"
                value={profileData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                required
                error={!profileData.full_name}
                helperText={!profileData.full_name ? "Full name is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={profileData.email_address}
                onChange={(e) => handleChange('email_address', e.target.value)}
                required
                error={!profileData.email_address}
                helperText={!profileData.email_address ? "Email is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number *"
                value={profileData.mobile_number}
                onChange={(e) => handleChange('mobile_number', e.target.value)}
                required
                error={!profileData.mobile_number}
                helperText={!profileData.mobile_number ? "Mobile number is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth *"
                type="date"
                value={profileData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                error={!profileData.dob}
                helperText={!profileData.dob ? "Date of birth is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!profileData.gender}>
                <InputLabel>Gender *</InputLabel>
                <Select
                  value={profileData.gender}
                  label="Gender *"
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="LinkedIn URL"
                value={profileData.linked_in}
                onChange={(e) => handleChange('linked_in', e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GitHub URL"
                value={profileData.github}
                onChange={(e) => handleChange('github', e.target.value)}
                placeholder="https://github.com/username"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio *"
                multiline
                rows={3}
                value={profileData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                required
                error={!profileData.bio}
                helperText={!profileData.bio ? "Bio is required" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="About Us"
                multiline
                rows={2}
                value={profileData.about_us}
                onChange={(e) => handleChange('about_us', e.target.value)}
                placeholder="How did you hear about us?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={profileData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 1:
        if (isStudent) {
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Student ID"
                  value={profileData.student_id}
                  onChange={(e) => handleChange('student_id', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Course"
                  value={profileData.course}
                  onChange={(e) => handleChange('course', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={profileData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Year"
                  type="number"
                  value={profileData.current_year}
                  onChange={(e) => handleChange('current_year', e.target.value)}
                  inputProps={{ min: 1, max: 4 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CGPA"
                  type="number"
                  step="0.01"
                  value={profileData.cgpa}
                  onChange={(e) => handleChange('cgpa', e.target.value)}
                  inputProps={{ min: 0, max: 10, step: "0.01" }}
                />
              </Grid>
            </Grid>
          );
        } else {
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Passing Batch"
                  type="number"
                  value={profileData.passing_batch}
                  onChange={(e) => handleChange('passing_batch', e.target.value)}
                  inputProps={{ min: 1950, max: 2030 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  type="number"
                  value={profileData.years_of_experience}
                  onChange={(e) => handleChange('years_of_experience', e.target.value)}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Company"
                  value={profileData.current_company}
                  onChange={(e) => handleChange('current_company', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={profileData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Portfolio URL"
                  value={profileData.portfolio_url}
                  onChange={(e) => handleChange('portfolio_url', e.target.value)}
                />
              </Grid>
            </Grid>
          );
        }

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Skills"
                value={profileData.skills}
                onChange={(e) => handleChange('skills', e.target.value)}
                placeholder="e.g. JavaScript, React, Node.js, Python (comma separated)"
                helperText="Separate skills with commas"
              />
            </Grid>
            {isStudent ? (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ py: 2 }}
                >
                  Upload Resume (PDF)
                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />
                </Button>
                {resumeFile && (
                  <Chip
                    label={resumeFile.name}
                    onDelete={() => setResumeFile(null)}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>
            ) : (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ py: 2 }}
                >
                  Upload Degree Certificate (PDF/Image)
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setCertificateFile(e.target.files[0])}
                  />
                </Button>
                {certificateFile && (
                  <Chip
                    label={certificateFile.name}
                    onDelete={() => setCertificateFile(null)}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>
            )}
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/profile')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          {isStudent ? 'Create Student Profile' : 'Create Alumni Profile'}
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

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : <Save />}
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Profile Picture Upload */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Profile Picture (Optional)
        </Typography>
        <Button
          variant="outlined"
          component="label"
          sx={{ mb: 1 }}
        >
          Upload Profile Picture
          <input
            type="file"
            hidden
            accept=".jpg,.jpeg,.png"
            onChange={(e) => setProfilePictureFile(e.target.files[0])}
          />
        </Button>
        {profilePictureFile && (
          <Chip
            label={profilePictureFile.name}
            onDelete={() => setProfilePictureFile(null)}
            sx={{ ml: 1 }}
          />
        )}
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
          Supported formats: JPG, PNG (Max 5MB)
        </Typography>
      </Paper>
    </Box>
  );
};

export default CreateProfile;