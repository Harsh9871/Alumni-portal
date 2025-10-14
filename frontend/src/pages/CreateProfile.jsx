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
  const [isEditing, setIsEditing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const userRole = localStorage.getItem('role');
  const cleanRole = userRole ? userRole.replace(/"/g, '').trim() : '';
  const isStudent = cleanRole === 'STUDENT';
  const isAlumni = cleanRole === 'ALUMNI';

  // Initialize with empty profile data
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
    portfolio_url: '',
    degree_certificate_url: ''
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      setInitialLoading(true);
      const result = await userDetailsService.getUserProfile();
      console.log('Profile API Response:', result);
      
      // Wait for response and check if profile exists
      if (result.success && result.data) {
        const existingProfile = result.data;
        console.log('Existing Profile Data:', existingProfile);
        
        setIsEditing(true);
        
        // Safely map fields from API response, keep blank if not found
        setProfileData({
          // REQUIRED fields - keep blank if not in response
          full_name: existingProfile.full_name || '',
          email_address: existingProfile.email_address || '',
          mobile_number: existingProfile.mobile_number || '',
          bio: existingProfile.bio || '',
          gender: existingProfile.gender || '',
          dob: existingProfile.dob ? existingProfile.dob.split('T')[0] : '',
          
          // Optional fields - keep blank if not in response
          linked_in: existingProfile.linked_in || '',
          github: existingProfile.github || '',
          about_us: existingProfile.about_us || '',
          profile_picture_url: existingProfile.profile_picture_url || '',
          resume: existingProfile.resume || '',
          
          // Student specific fields - keep blank if not in response
          student_id: existingProfile.student_id || '',
          course: existingProfile.course || '',
          department: existingProfile.department || '',
          current_year: existingProfile.current_year || '',
          cgpa: existingProfile.cgpa || '',
          address: existingProfile.address || '',
          skills: existingProfile.skills || '',
          
          // Alumni specific fields - keep blank if not in response
          passing_batch: existingProfile.passing_batch || '',
          current_company: existingProfile.current_company || '',
          designation: existingProfile.designation || '',
          years_of_experience: existingProfile.years_of_experience || '',
          portfolio_url: existingProfile.portfolio_url || '',
          degree_certificate_url: existingProfile.degree_certificate_url || ''
        });
        
        console.log('Profile loaded for editing');
      } else {
        // No profile found, stay in create mode with blank fields
        console.log('No existing profile found, staying in create mode');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error checking existing profile:', err);
      // On error, default to create mode with blank fields
      setIsEditing(false);
    } finally {
      setInitialLoading(false);
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
    // Clear error when user starts typing
    if (error) setError('');
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
      console.error('File upload error:', err);
      return null;
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (activeStep === 0) {
      const requiredFields = ['full_name', 'email_address', 'mobile_number', 'gender', 'dob', 'bio'];
      const missingFields = requiredFields.filter(field => !profileData[field]);
      
      if (missingFields.length > 0) {
        setError('Please fill all required fields marked with *');
        return;
      }
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      const requiredFields = {
        full_name: 'Full Name',
        email_address: 'Email Address',
        mobile_number: 'Mobile Number',
        bio: 'Bio',
        gender: 'Gender',
        dob: 'Date of Birth'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !profileData[key])
        .map(([, label]) => label);

      if (missingFields.length > 0) {
        setError(`Please fill all required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      // Upload files if provided
      let resumeUrl = profileData.resume;
      let certificateUrl = profileData.degree_certificate_url;
      let profilePictureUrl = profileData.profile_picture_url;

      if (resumeFile) {
        console.log('Uploading resume...');
        resumeUrl = await handleFileUpload(resumeFile, 'resume');
        if (!resumeUrl) {
          setLoading(false);
          return;
        }
      }

      if (certificateFile) {
        console.log('Uploading certificate...');
        certificateUrl = await handleFileUpload(certificateFile, 'certificate');
        if (!certificateUrl) {
          setLoading(false);
          return;
        }
      }

      if (profilePictureFile) {
        console.log('Uploading profile picture...');
        profilePictureUrl = await handleFileUpload(profilePictureFile, 'profile');
      }

      // Prepare final data for backend
      const submitData = {
        // REQUIRED Fields
        full_name: profileData.full_name.trim(),
        email_address: profileData.email_address.trim(),
        mobile_number: profileData.mobile_number.trim(),
        bio: profileData.bio.trim(),
        gender: profileData.gender,
        dob: profileData.dob,
        
        // Optional Fields - only include if not empty
        ...(profileData.linked_in && { linked_in: profileData.linked_in.trim() }),
        ...(profileData.github && { github: profileData.github.trim() }),
        ...(profileData.about_us && { about_us: profileData.about_us.trim() }),
        ...(profilePictureUrl && { profile_picture_url: profilePictureUrl }),
        ...(resumeUrl && { resume: resumeUrl }),
      };

      // Add role-specific fields only if they have values
      if (isStudent) {
        if (profileData.student_id) submitData.student_id = profileData.student_id.trim();
        if (profileData.course) submitData.course = profileData.course.trim();
        if (profileData.department) submitData.department = profileData.department.trim();
        if (profileData.current_year) submitData.current_year = profileData.current_year;
        if (profileData.cgpa) submitData.cgpa = profileData.cgpa;
        if (profileData.address) submitData.address = profileData.address.trim();
        if (profileData.skills) submitData.skills = profileData.skills.trim();
      }

      if (isAlumni) {
        if (profileData.passing_batch) submitData.passing_batch = profileData.passing_batch;
        if (profileData.current_company) submitData.current_company = profileData.current_company.trim();
        if (profileData.designation) submitData.designation = profileData.designation.trim();
        if (profileData.years_of_experience) submitData.years_of_experience = profileData.years_of_experience;
        if (profileData.portfolio_url) submitData.portfolio_url = profileData.portfolio_url.trim();
        if (certificateUrl) submitData.degree_certificate_url = certificateUrl;
      }

      console.log('Submitting profile data:', submitData);
      console.log('Mode:', isEditing ? 'UPDATE' : 'CREATE');

      // Call appropriate hook method based on mode and role
      let result;
      if (isStudent) {
        result = await userDetailsService.createStudentProfile(submitData);
      } else if (isAlumni) {
        result = await userDetailsService.createAlumniProfile(submitData);
      }

      console.log('API Response:', result);

      if (result.success) {
        const message = isEditing ? 'Profile updated successfully!' : 'Profile created successfully!';
        setSuccess(message);
        authService.updateProfileStatus(true);
        
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        setError(result.error || `Failed to ${isEditing ? 'update' : 'create'} profile`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(`Error ${isEditing ? 'updating' : 'creating'} profile. Please try again.`);
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
                error={!profileData.full_name && error !== ''}
                helperText={!profileData.full_name && error !== '' ? "Full name is required" : ""}
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
                error={!profileData.email_address && error !== ''}
                helperText={!profileData.email_address && error !== '' ? "Email is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number *"
                value={profileData.mobile_number}
                onChange={(e) => handleChange('mobile_number', e.target.value)}
                required
                error={!profileData.mobile_number && error !== ''}
                helperText={!profileData.mobile_number && error !== '' ? "Mobile number is required" : ""}
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
                error={!profileData.dob && error !== ''}
                helperText={!profileData.dob && error !== '' ? "Date of birth is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!profileData.gender && error !== ''}>
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
                error={!profileData.bio && error !== ''}
                helperText={!profileData.bio && error !== '' ? "Bio is required" : ""}
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
            {isStudent && (
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
            )}
            {isStudent ? (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ py: 2 }}
                >
                  {resumeFile ? 'Change Resume (PDF)' : profileData.resume ? 'Update Resume (PDF)' : 'Upload Resume (PDF)'}
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
                {profileData.resume && !resumeFile && (
                  <Chip
                    label="Resume already uploaded"
                    color="success"
                    variant="outlined"
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
                  {certificateFile ? 'Change Certificate' : profileData.degree_certificate_url ? 'Update Degree Certificate' : 'Upload Degree Certificate (PDF/Image)'}
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
                {profileData.degree_certificate_url && !certificateFile && (
                  <Chip
                    label="Certificate already uploaded"
                    color="success"
                    variant="outlined"
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

  // Show loading spinner while checking for existing profile
  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={40} />
        <Typography sx={{ ml: 2 }}>Loading profile data...</Typography>
      </Box>
    );
  }

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
          {isEditing 
            ? `Edit ${isStudent ? 'Student' : 'Alumni'} Profile` 
            : `Create ${isStudent ? 'Student' : 'Alumni'} Profile`
          }
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
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
                  {loading ? 'Saving...' : (isEditing ? 'Update Profile' : 'Create Profile')}
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
          {profilePictureFile ? 'Change Profile Picture' : profileData.profile_picture_url ? 'Update Profile Picture' : 'Upload Profile Picture'}
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
        {profileData.profile_picture_url && !profilePictureFile && (
          <Chip
            label="Profile picture already uploaded"
            color="success"
            variant="outlined"
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