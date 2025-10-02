import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  CircularProgress
} from '@mui/material';
import { Search, FilterList, Clear } from '@mui/icons-material';
import Jobs from '../hooks/Jobs';

const SearchJobs = () => {
  const jobsService = new Jobs();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const observerTarget = useRef(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    job_title: '',
    location: '',
    mode: '',
    experience: '',
    salary: '',
    designation: '',
    status: 'OPEN'
  });

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs(1, true);
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreJobs();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, loadingMore, page]);

  const fetchJobs = async (pageNum = 1, reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    
    try {
      const searchFilters = {
        ...filters,
        page: pageNum,
        limit: 10 // Items per page
      };
      
      const result = await jobsService.getJobs(searchFilters);
      
      if (result.success) {
        const newJobs = result.data.data?.jobs || [];
        
        if (reset) {
          setJobs(newJobs);
        } else {
          setJobs(prev => [...prev, ...newJobs]);
        }
        
        // Check if there are more jobs to load
        const totalJobs = result.data.data?.total || 0;
        const currentCount = reset ? newJobs.length : jobs.length + newJobs.length;
        setHasMore(currentCount < totalJobs);
        
        if (reset) {
          setPage(1);
        }
      } else {
        setError(result.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Error fetching jobs');
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreJobs = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage, false);
  }, [page]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setJobs([]);
    setPage(1);
    setHasMore(true);
    fetchJobs(1, true);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      job_title: '',
      location: '',
      mode: '',
      experience: '',
      salary: '',
      designation: '',
      status: 'OPEN'
    };
    setFilters(clearedFilters);
    setJobs([]);
    setPage(1);
    setHasMore(true);
    fetchJobs(1, true);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'OPEN');

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold', 
          mb: { xs: 3, md: 4 },
          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
        }}
      >
        Search Jobs
      </Typography>

      {/* Search and Filter Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSearch}>
            <Grid container spacing={3}>
              {/* Job Title Search */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  value={filters.job_title}
                  onChange={(e) => handleFilterChange('job_title', e.target.value)}
                  placeholder="e.g. Frontend Developer"
                />
              </Grid>

              {/* Location */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="e.g. Bangalore, Remote"
                />
              </Grid>

              {/* Work Mode */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Work Mode</InputLabel>
                  <Select
                    value={filters.mode}
                    label="Work Mode"
                    onChange={(e) => handleFilterChange('mode', e.target.value)}
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="Remote">Remote</MenuItem>
                    <MenuItem value="Hybrid">Hybrid</MenuItem>
                    <MenuItem value="On-site">On-site</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Experience */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Experience</InputLabel>
                  <Select
                    value={filters.experience}
                    label="Experience"
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="0-2 years">0-2 years</MenuItem>
                    <MenuItem value="2-4 years">2-4 years</MenuItem>
                    <MenuItem value="4-6 years">4-6 years</MenuItem>
                    <MenuItem value="6+ years">6+ years</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Job Status */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Job Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Job Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="OPEN">Open</MenuItem>
                    <MenuItem value="CLOSED">Closed</MenuItem>
                    <MenuItem value="ON_HOLD">On Hold</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Designation */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={filters.designation}
                  onChange={(e) => handleFilterChange('designation', e.target.value)}
                  placeholder="e.g. Senior Developer"
                />
              </Grid>

              {/* Salary */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary"
                  value={filters.salary}
                  onChange={(e) => handleFilterChange('salary', e.target.value)}
                  placeholder="e.g. 10 LPA, ₹8-12 LPA"
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Search />}
                    disabled={loading}
                    fullWidth={false}
                    sx={{ flex: { xs: '1', sm: '0 1 auto' } }}
                  >
                    {loading ? 'Searching...' : 'Search Jobs'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                    fullWidth={false}
                    sx={{ flex: { xs: '1', sm: '0 1 auto' } }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active filters:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(filters).map(([key, value]) => {
                  if (value && value !== 'OPEN') {
                    return (
                      <Chip
                        key={key}
                        label={`${key.replace('_', ' ')}: ${value}`}
                        size="small"
                        onDelete={() => handleFilterChange(key, '')}
                      />
                    );
                  }
                  return null;
                })}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <Box>
        <Typography variant="h6" gutterBottom>
          {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
        </Typography>

        {error && (
          <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', mb: 2 }}>
            {error}
          </Paper>
        )}

        {loading && jobs.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : jobs.length === 0 && !loading ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <FilterList sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No jobs found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search filters
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {jobs.map((job) => (
                <Grid item xs={12} key={job.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                        {job.job_title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        <Chip 
                          label={job.designation} 
                          size="small" 
                          variant="outlined" 
                        />
                        <Chip 
                          label={job.location} 
                          size="small" 
                          variant="outlined" 
                        />
                        <Chip 
                          label={job.mode} 
                          size="small" 
                          variant="outlined" 
                        />
                        <Chip 
                          label={job.experience} 
                          size="small" 
                          variant="outlined" 
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" paragraph>
                        {job.job_description?.substring(0, 200)}...
                      </Typography>

                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 0 },
                        alignItems: { xs: 'flex-start', sm: 'center' }
                      }}>
                        <Typography variant="body1" fontWeight="bold">
                          {job.salary}
                        </Typography>
                        <Chip 
                          label={job.status} 
                          size="small"
                          color={job.status === 'OPEN' ? 'success' : 'default'}
                        />
                      </Box>

                      <Box sx={{ 
                        mt: 2, 
                        display: 'flex', 
                        gap: 1,
                        flexDirection: { xs: 'column', sm: 'row' }
                      }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => window.location.href = `/jobs/${job.id}`}
                          fullWidth={{ xs: true, sm: false }}
                        >
                          View Details
                        </Button>
                        {localStorage.getItem('role') === 'STUDENT' && job.status === 'OPEN' && (
                          <Button 
                            variant="contained" 
                            size="small"
                            fullWidth={{ xs: true, sm: false }}
                            onClick={() => window.location.href = `/jobs/${job.id}`}
                          >
                            Apply Now
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Loading indicator for more items */}
            {loadingMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            )}

            {/* Intersection Observer Target */}
            <div ref={observerTarget} style={{ height: '20px' }} />

            {/* End of results message */}
            {!hasMore && jobs.length > 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No more jobs to load
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default SearchJobs;