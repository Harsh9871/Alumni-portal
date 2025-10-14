import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Divider,
  Avatar,
  Paper
} from '@mui/material';
import {
  Edit,
  Email,
  Phone,
  School,
  Work,
  CalendarToday,
  LocationOn,
  Person,
  Business,
  Code
} from '@mui/icons-material';
import UserDetails from '../hooks/UserDetails';
import Auth from '../hooks/auth';

const Profile = () => {
  const navigate = useNavigate();
  const userDetailsService = new UserDetails();
  const authService = new Auth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileExists, setProfileExists] = useState(false);

  const currentUser = authService.getCurrentUser();
  const userRole = localStorage.getItem('role');
  const cleanRole = userRole ? userRole.replace(/"/g, '').trim() : '';
  const isStudent = cleanRole === 'STUDENT';
  const isAlumni = cleanRole === 'ALUMNI';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('=== Fetching Profile ===');
      console.log('Current User:', currentUser);
      
      // Wait for the API response
      const result = await userDetailsService.getUserProfile();
      
      console.log('=== Profile API Full Response ===');
      console.log('Result:', result);
      console.log('Success:', result.success);
      console.log('Data:', result.data);
      console.log('==============================');
      
      // Check if we got valid data - FIX: Access result.data.data for the actual profile
      if (result.success === true && result.data && result.data.data && typeof result.data.data === 'object') {
        console.log('✓ Setting profile data:', result.data.data);
        setProfile(result.data.data);
        setProfileExists(true);
      } else {
        console.log('✗ No profile data found');
        setProfile(null);
        setProfileExists(false);
        if (result.error && result.error !== 'Profile not found') {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error('!!! Error in fetchProfile:', err);
      setError('Error loading profile. Please try again.');
      setProfile(null);
      setProfileExists(false);
    } finally {
      console.log('=== Setting loading to false ===');
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate('/profile/create');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  console.log('=== Render State ===');
  console.log('Loading:', loading);
  console.log('Profile Exists:', profileExists);
  console.log('Profile Data:', profile);
  console.log('Error:', error);

  // Show loading spinner while fetching profile
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={40} />
        <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  // Show create profile card if no profile exists
  if (!profileExists || !profile) {
    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            My Profile
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                mx: 'auto',
                mb: 3
              }}
            >
              <Person sx={{ fontSize: '2.5rem' }} />
            </Avatar>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Profile Not Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You haven't created your profile yet. Please create your profile to get started.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/profile/create')}
            >
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          My Profile
        </Typography>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={handleEditProfile}
        >
          Edit Profile
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Avatar
                  src={profile.profile_picture_url || ''}
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  {!profile.profile_picture_url && getInitials(profile.full_name)}
                </Avatar>
                
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="h4" gutterBottom>
                    {profile.full_name || 'Name not provided'}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {cleanRole}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {profile.email_address && (
                      <Chip 
                        icon={<Email />}
                        label={profile.email_address}
                        variant="outlined"
                        size="small"
                      />
                    )}
                    {profile.mobile_number && (
                      <Chip 
                        icon={<Phone />}
                        label={profile.mobile_number}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person /> Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <InfoItem label="Full Name" value={profile.full_name} />
                <InfoItem label="Email" value={profile.email_address} />
                <InfoItem label="Mobile Number" value={profile.mobile_number} />
                <InfoItem label="Gender" value={profile.gender} />
                <InfoItem label="Date of Birth" value={formatDate(profile.dob)} />
                {profile.address && <InfoItem label="Address" value={profile.address} />}
                
                {/* Student specific fields */}
                {isStudent && (
                  <>
                    {profile.student_id && <InfoItem label="Student ID" value={profile.student_id} />}
                    {profile.course && <InfoItem label="Course" value={profile.course} />}
                    {profile.department && <InfoItem label="Department" value={profile.department} />}
                    {profile.current_year && <InfoItem label="Current Year" value={profile.current_year} />}
                    {profile.cgpa && <InfoItem label="CGPA" value={profile.cgpa} />}
                  </>
                )}
                
                {/* Alumni specific fields */}
                {isAlumni && (
                  <>
                    {profile.passing_batch && profile.passing_batch !== 0 && (
                      <InfoItem label="Passing Batch" value={profile.passing_batch} />
                    )}
                    {profile.current_company && <InfoItem label="Current Company" value={profile.current_company} />}
                    {profile.designation && <InfoItem label="Designation" value={profile.designation} />}
                    {profile.years_of_experience && profile.years_of_experience !== 0 && (
                      <InfoItem label="Years of Experience" value={`${profile.years_of_experience} years`} />
                    )}
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Work /> Additional Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {profile.linked_in && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      LinkedIn:
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      href={profile.linked_in}
                      target="_blank"
                      sx={{ textTransform: 'none', p: 0, justifyContent: 'flex-start' }}
                    >
                      {profile.linked_in}
                    </Button>
                  </Box>
                )}
                
                {profile.github && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      GitHub:
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      href={profile.github}
                      target="_blank"
                      sx={{ textTransform: 'none', p: 0, justifyContent: 'flex-start' }}
                    >
                      {profile.github}
                    </Button>
                  </Box>
                )}

                {profile.portfolio_url && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Portfolio:
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      href={profile.portfolio_url}
                      target="_blank"
                      sx={{ textTransform: 'none', p: 0, justifyContent: 'flex-start' }}
                    >
                      {profile.portfolio_url}
                    </Button>
                  </Box>
                )}
                
                {/* Skills */}
                {profile.skills && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Skills:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {typeof profile.skills === 'string' 
                        ? profile.skills.split(',').map((skill, index) => (
                            <Chip key={index} label={skill.trim()} size="small" color="primary" variant="outlined" />
                          ))
                        : Array.isArray(profile.skills) && profile.skills.map((skill, index) => (
                            <Chip key={index} label={skill} size="small" color="primary" variant="outlined" />
                          ))
                      }
                    </Box>
                  </Box>
                )}

                {/* Resume */}
                {profile.resume && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Resume:
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => window.open(profile.resume, '_blank')}
                    >
                      View Resume
                    </Button>
                  </Box>
                )}

                {/* Certificate */}
                {(profile.degree_certificate_url || profile.degree_certificate) && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Degree Certificate:
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => window.open(profile.degree_certificate_url || profile.degree_certificate, '_blank')}
                    >
                      View Certificate
                    </Button>
                  </Box>
                )}

                {/* About Us */}
                {profile.about_us && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      How they found us:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profile.about_us}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bio/Summary */}
        {profile.bio && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <School /> {isStudent ? 'Bio' : 'Professional Summary'}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {profile.bio}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

// Helper component for info items
const InfoItem = ({ label, value }) => {
  // Don't render if value is empty, null, undefined, or 0
  if (!value || value === 0) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 120, flexShrink: 0 }}>
        {label}:
      </Typography>
      <Typography variant="body2" sx={{ textAlign: 'right', flex: 1, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
};

export default Profile;