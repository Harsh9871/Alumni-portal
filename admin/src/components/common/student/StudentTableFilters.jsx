import React from 'react';
import { 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Typography, 
  Box 
} from '@mui/material';

const StudentTableFilters = ({ 
  roleFilter, 
  genderFilter, 
  onRoleFilterChange, 
  onGenderFilterChange, 
  onClearFilters,
  filteredCount,
  totalCount
}) => {
  return (
    <Grid container spacing={3} alignItems="center">
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel>Role Filter</InputLabel>
          <Select
            value={roleFilter}
            label="Role Filter"
            onChange={(e) => onRoleFilterChange(e.target.value)}
          >
            <MenuItem value="ALL">All Roles</MenuItem>
            <MenuItem value="STUDENT">Students</MenuItem>
            <MenuItem value="ALUMNI">Alumni</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel>Gender Filter</InputLabel>
          <Select
            value={genderFilter}
            label="Gender Filter"
            onChange={(e) => onGenderFilterChange(e.target.value)}
          >
            <MenuItem value="ALL">All Genders</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Button
          variant="outlined"
          onClick={onClearFilters}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Clear Filters
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="body2" color="text.secondary">
            {filteredCount} of {totalCount} students
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default StudentTableFilters;