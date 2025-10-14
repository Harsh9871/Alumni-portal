import React from 'react';
import { Grid, Card, Typography, Box, alpha, useTheme } from '@mui/material';
import { Groups, Person, School, Work, TrendingUp } from '@mui/icons-material';

const StudentStatsCards = ({ stats }) => {
  const theme = useTheme();

  const statItems = [
    { title: 'Total Users', value: stats.total, icon: <Groups />, color: theme.palette.primary.main },
    { title: 'Active Users', value: stats.active, icon: <Person />, color: theme.palette.success.main },
    { title: 'Alumni', value: stats.alumni, icon: <School />, color: theme.palette.info.main },
    { title: 'Job Posts', value: stats.jobPosts, icon: <Work />, color: theme.palette.warning.main },
    { title: 'Applications', value: stats.applications, icon: <TrendingUp />, color: theme.palette.secondary.main }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {statItems.map((stat, index) => (
        <Grid item xs={12} sm={6} md={2.4} key={index}>
          <Card sx={{ 
            p: 2, 
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
            border: `1px solid ${alpha(stat.color, 0.2)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(stat.color, 0.25)}`
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  {stat.title}
                </Typography>
              </Box>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                backgroundColor: alpha(stat.color, 0.1),
                color: stat.color
              }}>
                {stat.icon}
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StudentStatsCards;