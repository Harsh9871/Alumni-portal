import React from 'react';
import { 
  Toolbar, 
  TextField, 
  IconButton, 
  Button, 
  Stack, 
  Box, 
  Typography,
  Chip
} from '@mui/material';
import { Search, FilterList, Add, Refresh, Analytics } from '@mui/icons-material';

const StudentTableToolbar = ({ 
  selectedCount, 
  searchTerm, 
  onSearchChange, 
  onToggleFilters, 
  onRefresh, 
  onAddStudent 
}) => {
  return (
    <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <Analytics sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="div" fontWeight="600">
          Student Directory
        </Typography>
        {selectedCount > 0 && (
          <Chip
            label={`${selectedCount} selected`}
            color="primary"
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          size="small"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
          }}
          sx={{ minWidth: 250 }}
        />
        <IconButton onClick={onToggleFilters}>
          <FilterList />
        </IconButton>
        <IconButton onClick={onRefresh}>
          <Refresh />
        </IconButton>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddStudent}
          sx={{ 
            px: 3,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Add Student
        </Button>
      </Stack>
    </Toolbar>
  );
};

export default StudentTableToolbar;