import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Avatar,
  Chip,
  Card,
  Stack,
  Grid,
  Button,
  Divider
} from '@mui/material';
import { GitHub, LinkedIn } from '@mui/icons-material';

import { 
  Close, 
  Person, 
  Email, 
  Phone, 
  School, 
  Work, 
  TrendingUp, 
  StarBorder, 
  Business, 
  CalendarToday,
  Edit
} from '@mui/icons-material';

const StudentViewDialog = ({ 
  open, 
  onClose, 
  student,
  onEdit
}) => {
  if (!student) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, minHeight: '60vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            Student Profile
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box>
          {/* Header Section */}
          <Box sx={{ p: 3, borderBottom: `1px solid ${theme => theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                src={student.profile?.profile_picture_url}
                alt={student.profile?.full_name}
                sx={{ width: 80, height: 80 }}
              >
                {student.profile?.full_name?.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {student.profile?.full_name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Chip
                    label={student.role}
                    color={student.role === 'STUDENT' ? 'primary' : 'secondary'}
                    variant="filled"
                  />
                  <Typography variant="body2" color="text.secondary">
                    ID: {student.user_id}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {student.profile?.bio || 'No bio available'}
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
                        {student.profile?.email_address || 'Not provided'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone color="action" />
                      <Typography variant="body2">
                        {student.profile?.mobile_number || 'Not provided'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Gender:</strong> {student.profile?.gender || 'Not specified'}
                    </Typography>
                    {student.role === 'ALUMNI' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <School color="action" />
                        <Typography variant="body2">
                          Batch: {student.profile?.passing_batch || 'Not specified'}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, height: '75%' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp color="primary" />
                    Activity Stats
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Work color="action" />
                        <Typography variant="body2">Jobs Posted</Typography>
                      </Box>
                      <Chip
                        label={student.stats?.jobs_posted || 0}
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
                        label={student.stats?.applications_made || 0}
                        color="secondary"
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
                    {student.profile?.github && (
                      <Button
                        variant="outlined"
                        startIcon={<GitHub />}
                        href={student.profile.github}
                        target="_blank"
                        sx={{ textTransform: 'none' }}
                      >
                        GitHub
                      </Button>
                    )}
                    {student.profile?.linked_in && (
                      <Button
                        variant="outlined"
                        startIcon={<LinkedIn />}
                        href={student.profile.linked_in}
                        target="_blank"
                        sx={{ textTransform: 'none' }}
                      >
                        LinkedIn
                      </Button>
                    )}
                    {!student.profile?.github && !student.profile?.linked_in && (
                      <Typography variant="body2" color="text.secondary">
                        No professional links available
                      </Typography>
                    )}
                  </Stack>
                </Card>
              </Grid>

            </Grid>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme => theme.palette.divider}` }}>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={onEdit}
          sx={{ textTransform: 'none' }}
        >
          Edit Profile
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ textTransform: 'none' }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentViewDialog;