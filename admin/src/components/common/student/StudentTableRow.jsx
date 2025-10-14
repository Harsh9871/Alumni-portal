import React from 'react';
import {
  TableRow,
  TableCell,
  Checkbox,
  Badge,
  Avatar,
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import { Email, Phone, Work, TrendingUp, MoreVert } from '@mui/icons-material';

const StudentTableRow = ({
  student,
  isSelected,
  onSelect,
  onMenuOpen
}) => {
  const theme = useTheme();

  return (
    <TableRow
      hover
      onClick={(event) => {
        event.stopPropagation();
        onSelect(student.id);
      }}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={-1}
      key={student.id}
      selected={isSelected}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.04)
        }
      }}
    >
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={isSelected}
        />
      </TableCell>
      <TableCell>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: student.role === 'STUDENT' ? '#4caf50' : '#ff9800',
                border: `2px solid ${theme.palette.background.paper}`
              }}
            />
          }
        >
          <Avatar
            src={student.profile?.profile_picture_url}
            alt={student.profile?.full_name}
            sx={{
              width: 45,
              height: 45,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            {student.profile?.full_name?.charAt(0)}
          </Avatar>
        </Badge>
      </TableCell>
      <TableCell>
        <Box>
          <Typography variant="body1" fontWeight="600" color="text.primary">
            {student.profile?.full_name || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {student.profile?.email_address}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontFamily="monospace" color="text.secondary">
          {student.user_id}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={student.role}
          color={student.role === 'STUDENT' ? 'primary' : 'secondary'}
          variant="filled"
          size="small"
          sx={{
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        />
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {student.profile?.email_address || 'N/A'}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {student.profile?.mobile_number || 'N/A'}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={student.profile?.gender || 'N/A'}
          size="small"
          variant="outlined"
          color="default"
        />
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Jobs Posted">
            <Chip
              icon={<Work sx={{ fontSize: 16 }} />}
              label={student.stats?.jobs_posted || 0}
              size="small"
              variant="outlined"
              color="primary"
            />
          </Tooltip>
          <Tooltip title="Applications Made">
            <Chip
              icon={<TrendingUp sx={{ fontSize: 16 }} />}
              label={student.stats?.applications_made || 0}
              size="small"
              variant="outlined"
              color="secondary"
            />
          </Tooltip>
        </Stack>
      </TableCell>
      <TableCell>
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            console.log('Opening menu for student:', student); // Debug log
            onMenuOpen(event, student);
          }}
        >
          <MoreVert />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default StudentTableRow;