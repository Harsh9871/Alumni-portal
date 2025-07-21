// src/components/common/student/StudentEditDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  CircularProgress,
  Typography
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  School,
  Work,
  CalendarToday
} from '@mui/icons-material';

const StudentEditDialog = ({
  open,
  onClose,
  student,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = React.useState({
    full_name: '',
    email_address: '',
    mobile_number: '',
    gender: '',
    role: '',
    passing_batch: '',
    bio: '',
    github: '',
    linked_in: ''
  });

  React.useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.profile?.full_name || '',
        email_address: student.profile?.email_address || '',
        mobile_number: student.profile?.mobile_number || '',
        gender: student.profile?.gender || '',
        role: student.role || 'STUDENT',
        passing_batch: student.profile?.passing_batch || '',
        bio: student.profile?.bio || '',
        github: student.profile?.github || '',
        linked_in: student.profile?.linked_in || ''
      });
    }
  }, [student]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          Edit Student Profile
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.full_name}
                onChange={handleChange('full_name')}
                margin="normal"
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email_address}
                onChange={handleChange('email_address')}
                margin="normal"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.mobile_number}
                onChange={handleChange('mobile_number')}
                margin="normal"
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={handleChange('gender')}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={handleChange('role')}
                  label="Role"
                >
                  <MenuItem value="STUDENT">Student</MenuItem>
                  <MenuItem value="ALUMNI">Alumni</MenuItem>
                </Select>
              </FormControl>
              {formData.role === 'ALUMNI' && (
                <TextField
                  fullWidth
                  label="Passing Batch"
                  value={formData.passing_batch}
                  onChange={handleChange('passing_batch')}
                  margin="normal"
                  InputProps={{
                    startAdornment: <School sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              )}
              <TextField
                fullWidth
                label="GitHub Profile"
                value={formData.github}
                onChange={handleChange('github')}
                margin="normal"
                placeholder="https://github.com/username"
              />
              <TextField
                fullWidth
                label="LinkedIn Profile"
                value={formData.linked_in}
                onChange={handleChange('linked_in')}
                margin="normal"
                placeholder="https://linkedin.com/in/username"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                value={formData.bio}
                onChange={handleChange('bio')}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentEditDialog;