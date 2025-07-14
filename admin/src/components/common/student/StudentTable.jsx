import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Box,
  useTheme,
  Skeleton,
  Alert
} from '@mui/material';
import StudentTableRow from './StudentTableRow';

const StudentTable = ({
  students,
  loading,
  error,
  orderBy,
  order,
  onSort,
  selected,
  onSelectAll,
  onSelect,
  onMenuOpen,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {[...Array(5)].map((_, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={45} height={45} sx={{ mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="60%" />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < students.length}
                  checked={students.length > 0 && selected.length === students.length}
                  onChange={onSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Avatar</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'profile.full_name'}
                  direction={orderBy === 'profile.full_name' ? order : 'asc'}
                  onClick={() => onSort('profile.full_name')}
                  sx={{ fontWeight: 'bold' }}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'user_id'}
                  direction={orderBy === 'user_id' ? order : 'asc'}
                  onClick={() => onSort('user_id')}
                  sx={{ fontWeight: 'bold' }}
                >
                  User ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'role'}
                  direction={orderBy === 'role' ? order : 'asc'}
                  onClick={() => onSort('role')}
                  sx={{ fontWeight: 'bold' }}
                >
                  Role
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Gender</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Activity</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <StudentTableRow
                key={student.id}
                student={student}
                isSelected={selected.includes(student.id)}
                onSelect={onSelect}
                onMenuOpen={onMenuOpen}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ 
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.default
      }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        />
      </Box>
    </>
  );
};

export default StudentTable;