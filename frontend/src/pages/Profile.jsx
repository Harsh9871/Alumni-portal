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
  Person
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
      const result = await userDetailsService.getUserProfile();
      
      if (result.success) {
        setProfile(result.data.data);
      } else {
        setError(result.error || 'Failed to fetch profile');
      }
    } catch (err) {
      setError('Error loading profile');
      console.error('Error:', err);
    } finally {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!profile ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Profile Not Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You haven't created your profile yet. Please create your profile to continue.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/profile/create')}
            >
              Create Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'primary.main',
                      fontSize: '2rem'
                    }}
                  >
                    {getInitials(
                      isStudent ? profile.student?.full_name : profile.alumni?.full_name
                    )}
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" gutterBottom>
                      {isStudent ? profile.student?.full_name : profile.alumni?.full_name}
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {cleanRole}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        icon={<Email />}
                        label={isStudent ? profile.student?.email_address : profile.alumni?.email_address}
                        variant="outlined"
                        size="small"
                      />
                      <Chip 
                        icon={<Phone />}
                        label={isStudent ? profile.student?.mobile_number : profile.alumni?.mobile_number}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person /> Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {isStudent ? (
                    <>
                      <InfoItem label="Student ID" value={profile.student?.student_id} />
                      <InfoItem label="Course" value={profile.student?.course} />
                      <InfoItem label="Department" value={profile.student?.department} />
                      <InfoItem label="Current Year" value={profile.student?.current_year} />
                      <InfoItem label="CGPA" value={profile.student?.cgpa} />
                      <InfoItem label="Date of Birth" value={formatDate(profile.student?.date_of_birth)} />
                    </>
                  ) : (
                    <>
                      <InfoItem label="Passing Batch" value={profile.alumni?.passing_batch} />
                      <InfoItem label="Current Company" value={profile.alumni?.current_company} />
                      <InfoItem label="Designation" value={profile.alumni?.designation} />
                      <InfoItem label="Years of Experience" value={profile.alumni?.years_of_experience} />
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Work /> Additional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {isStudent ? (
                    <>
                      <InfoItem label="Address" value={profile.student?.address} />
                      <InfoItem label="Gender" value={profile.student?.gender} />
                      
                      {/* Skills */}
                      {profile.student?.skills && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Skills:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {profile.student.skills.split(',').map((skill, index) => (
                              <Chip key={index} label={skill.trim()} size="small" />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Resume */}
                      {profile.student?.resume_url && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Resume:
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => window.open(profile.student.resume_url, '_blank')}
                          >
                            View Resume
                          </Button>
                        </Box>
                      )}
                    </>
                  ) : (
                    <>
                      <InfoItem label="LinkedIn" value={profile.alumni?.linkedin_url} />
                      <InfoItem label="GitHub" value={profile.alumni?.github_url} />
                      <InfoItem label="Portfolio" value={profile.alumni?.portfolio_url} />
                      
                      {/* Bio */}
                      {profile.alumni?.bio && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Bio:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {profile.alumni.bio}
                          </Typography>
                        </Box>
                      )}

                      {/* Certificate */}
                      {profile.alumni?.degree_certificate_url && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Degree Certificate:
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => window.open(profile.alumni.degree_certificate_url, '_blank')}
                          >
                            View Certificate
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Academic/Professional Details */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <School /> {isStudent ? 'Academic Details' : 'Professional Summary'}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {isStudent ? (
                  <Typography variant="body1" color="text.secondary">
                    {profile.student?.bio || 'No bio provided.'}
                  </Typography>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    {profile.alumni?.bio || 'No professional summary provided.'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

// Helper component for info items
const InfoItem = ({ label, value }) => {
  if (!value) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 120 }}>
        {label}:
      </Typography>
      <Typography variant="body2" sx={{ textAlign: 'right', flex: 1, ml: 2 }}>
        {value}
      </Typography>
    </Box>
  );
};

export default Profile;