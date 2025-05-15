import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent, CardHeader,
  Divider, Button, TextField, FormControl, InputLabel, Select,
  MenuItem, Chip, IconButton, Tooltip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  LinearProgress, Badge, Alert, Tabs, Tab, Autocomplete
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  PhoneInTalk as PhoneInTalkIcon,
  PhoneForwarded as PhoneForwardedIcon,
  PhoneDisabled as PhoneDisabledIcon,
  PhoneMissed as PhoneMissedIcon,
  AccessTime as AccessTimeIcon,
  DownloadForOffline as DownloadIcon,
  MoreVert as MoreVertIcon,
  Flag as FlagIcon,
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// Mock API service
import { mockMonitoringData } from '../../services/mockApi';

// Styled components
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

// Status chip component
const StatusChip = ({ status }) => {
  let color;
  let icon;
  let label;

  switch (status) {
    case 'ringing':
      color = 'warning';
      icon = <PhoneForwardedIcon />;
      label = 'Ringing';
      break;
    case 'answered':
      color = 'success';
      icon = <PhoneInTalkIcon />;
      label = 'Answered';
      break;
    case 'failed':
      color = 'error';
      icon = <PhoneDisabledIcon />;
      label = 'Failed';
      break;
    case 'missed':
      color = 'default';
      icon = <PhoneMissedIcon />;
      label = 'Missed';
      break;
    default:
      color = 'primary';
      icon = <PhoneForwardedIcon />;
      label = 'Originated';
  }

  return (
    <Chip 
      icon={icon} 
      label={label} 
      color={color} 
      size="small" 
      variant="outlined"
    />
  );
};

// Format duration in seconds to mm:ss
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Tab Panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`monitoring-tabpanel-${index}`}
      aria-labelledby={`monitoring-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function MonitoringPage() {
  // State for tab selection
  const [tabValue, setTabValue] = useState(0);
  
  // State for loading and data
  const [loading, setLoading] = useState(true);
  const [activeCalls, setActiveCalls] = useState([]);
  const [callStats, setCallStats] = useState({
    total: 0,
    active: 0,
    ringing: 0,
    answered: 0,
    failed: 0
  });
  const [callHistory, setCallHistory] = useState([]);
  const [serverStatus, setServerStatus] = useState({
    serverA: 'online',
    serverB: 'online'
  });
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  
  // State for refresh rate
  const [refreshRate, setRefreshRate] = useState(5000); // 5 seconds
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Ref for auto-refresh interval
  const refreshInterval = useRef(null);
  
  // State for chart data
  const [chartData, setChartData] = useState({
    labels: [],
    active: [],
    answered: [],
    failed: []
  });

  // Load initial data
  useEffect(() => {
    fetchData();
    
    // Set up auto refresh
    if (autoRefresh) {
      refreshInterval.current = setInterval(fetchData, refreshRate);
    }
    
    return () => {
      // Clear interval on unmount
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh, refreshRate, filterStatus, filterOrigin, filterDestination, filterCountry]);

  // Fetch data from API (or mock)
  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await api.getMonitoringData({
      //   status: filterStatus,
      //   origin: filterOrigin,
      //   destination: filterDestination,
      //   country: filterCountry
      // });
      
      // Using mock data for now
      const response = await mockMonitoringData({
        status: filterStatus,
        origin: filterOrigin,
        destination: filterDestination,
        country: filterCountry
      });
      
      setActiveCalls(response.activeCalls);
      setCallStats(response.callStats);
      setCallHistory(response.callHistory);
      setServerStatus(response.serverStatus);
      setChartData(response.chartData);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      // Would show an error notification in a real app
    } finally {
      setLoading(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle filter change
  const handleFilterChange = (filter, value) => {
    switch (filter) {
      case 'status':
        setFilterStatus(value);
        break;
      case 'origin':
        setFilterOrigin(value);
        break;
      case 'destination':
        setFilterDestination(value);
        break;
      case 'country':
        setFilterCountry(value);
        break;
      default:
        break;
    }
    
    // Reset pagination
    setPage(0);
  };

  // Handle auto refresh toggle
  const handleAutoRefreshToggle = () => {
    if (autoRefresh) {
      // Turn off auto refresh
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
      }
    } else {
      // Turn on auto refresh
      refreshInterval.current = setInterval(fetchData, refreshRate);
    }
    
    setAutoRefresh(!autoRefresh);
  };

  // Handle refresh rate change
  const handleRefreshRateChange = (event) => {
    const newRate = parseInt(event.target.value);
    setRefreshRate(newRate);
    
    // Reset interval with new rate if auto refresh is on
    if (autoRefresh && refreshInterval.current) {
      clearInterval(refreshInterval.current);
      refreshInterval.current = setInterval(fetchData, newRate);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Prepare chart data for visualization
  const callVolumeChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Active Calls',
        data: chartData.active,
        borderColor: 'rgba(53, 162, 235, 1)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Answered Calls',
        data: chartData.answered,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Failed Calls',
        data: chartData.failed,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  // Chart options
  const callVolumeChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Call Volume Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Calls'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    },
  };

  return (
    <Box>
      {/* Page Header */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h1" gutterBottom>
              Call Monitoring
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor and analyze active calls and call history
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<PlayIcon />}
              >
                Start Generator
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
              >
                Stop Generator
              </Button>
              <Tooltip title="Refresh Data">
                <IconButton onClick={handleRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={autoRefresh ? "Auto-Refresh On" : "Auto-Refresh Off"}>
                <IconButton 
                  onClick={handleAutoRefreshToggle}
                  color={autoRefresh ? "primary" : "default"}
                >
                  <Badge
                    variant="dot"
                    color="success"
                    invisible={!autoRefresh}
                  >
                    <AccessTimeIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ height: '100%', bgcolor: 'primary.light' }}>
            <CardContent sx={{ p: 2, paddingBottom: '16px !important' }}>
              <Typography variant="subtitle2" color="primary.contrastText">
                Total Calls
              </Typography>
              <Typography variant="h4" component="div" color="primary.contrastText">
                {callStats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ height: '100%', bgcolor: 'info.light' }}>
            <CardContent sx={{ p: 2, paddingBottom: '16px !important' }}>
              <Typography variant="subtitle2" color="info.contrastText">
                Active
              </Typography>
              <Typography variant="h4" component="div" color="info.contrastText">
                {callStats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ height: '100%', bgcolor: 'warning.light' }}>
            <CardContent sx={{ p: 2, paddingBottom: '16px !important' }}>
              <Typography variant="subtitle2" color="warning.contrastText">
                Ringing
              </Typography>
              <Typography variant="h4" component="div" color="warning.contrastText">
                {callStats.ringing}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ height: '100%', bgcolor: 'success.light' }}>
            <CardContent sx={{ p: 2, paddingBottom: '16px !important' }}>
              <Typography variant="subtitle2" color="success.contrastText">
                Answered
              </Typography>
              <Typography variant="h4" component="div" color="success.contrastText">
                {callStats.answered}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ height: '100%', bgcolor: 'error.light' }}>
            <CardContent sx={{ p: 2, paddingBottom: '16px !important' }}>
              <Typography variant="subtitle2" color="error.contrastText">
                Failed
              </Typography>
              <Typography variant="h4" component="div" color="error.contrastText">
                {callStats.failed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, paddingBottom: '16px !important' }}>
              <Typography variant="subtitle2">
                Server Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip 
                  label={`A: ${serverStatus.serverA}`}
                  color={serverStatus.serverA === 'online' ? 'success' : 'error'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={`B: ${serverStatus.serverB}`}
                  color={serverStatus.serverB === 'online' ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Auto-refresh settings and filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="refresh-rate-label">Auto-Refresh Rate</InputLabel>
              <Select
                labelId="refresh-rate-label"
                id="refresh-rate"
                value={refreshRate}
                label="Auto-Refresh Rate"
                onChange={handleRefreshRateChange}
                disabled={!autoRefresh}
              >
                <MenuItem value={1000}>1 second</MenuItem>
                <MenuItem value={2000}>2 seconds</MenuItem>
                <MenuItem value={5000}>5 seconds</MenuItem>
                <MenuItem value={10000}>10 seconds</MenuItem>
                <MenuItem value={30000}>30 seconds</MenuItem>
                <MenuItem value={60000}>1 minute</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={filterStatus}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="originated">Originated</MenuItem>
                <MenuItem value="ringing">Ringing</MenuItem>
                <MenuItem value="answered">Answered</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="missed">Missed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="country-filter-label">Country</InputLabel>
              <Select
                labelId="country-filter-label"
                id="country-filter"
                value={filterCountry}
                label="Country"
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                <MenuItem value="">All Countries</MenuItem>
                <MenuItem value="USA">USA</MenuItem>
                <MenuItem value="Canada">Canada</MenuItem>
                <MenuItem value="Mexico">Mexico</MenuItem>
                <MenuItem value="Chile">Chile</MenuItem>
                <MenuItem value="Colombia">Colombia</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search Number"
              variant="outlined"
              placeholder="Origin or Destination"
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              onChange={(e) => {
                // Simple implementation: search in both origin and destination
                // In a real app, this would be more sophisticated
                handleFilterChange('origin', e.target.value);
                handleFilterChange('destination', e.target.value);
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Main content with tabs */}
      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="monitoring tabs">
            <Tab label="Active Calls" />
            <Tab label="Call History" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>
        
        {/* Active Calls Tab */}
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <LinearProgress />
          ) : activeCalls.length === 0 ? (
            <Alert severity="info">
              No active calls found. The call generator may be inactive or all calls have completed.
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Start Time</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>ANI (Origin)</TableCell>
                      <TableCell>DNIS (Destination)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Country</TableCell>
                      <TableCell>Carrier</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeCalls
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((call) => (
                        <StyledTableRow key={call.id}>
                          <TableCell>{call.startTime}</TableCell>
                          <TableCell>{formatDuration(call.duration)}</TableCell>
                          <TableCell>{call.ani}</TableCell>
                          <TableCell>{call.dnis}</TableCell>
                          <TableCell>
                            <StatusChip status={call.status} />
                          </TableCell>
                          <TableCell>
                            {call.country ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FlagIcon fontSize="small" sx={{ mr: 1 }} />
                                {call.country}
                              </Box>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{call.carrier || '-'}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="More Options">
                              <IconButton size="small">
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </StyledTableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={activeCalls.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </TabPanel>
        
        {/* Call History Tab */}
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <LinearProgress />
          ) : callHistory.length === 0 ? (
            <Alert severity="info">
              No call history found. The call generator may not have generated any calls yet.
            </Alert>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                >
                  Export to CSV
                </Button>
              </Box>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>ANI (Origin)</TableCell>
                      <TableCell>DNIS (Destination)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Country</TableCell>
                      <TableCell>Carrier</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {callHistory
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((call) => (
                        <StyledTableRow key={call.id}>
                          <TableCell>{call.startTime}</TableCell>
                          <TableCell>{call.endTime}</TableCell>
                          <TableCell>{formatDuration(call.duration)}</TableCell>
                          <TableCell>{call.ani}</TableCell>
                          <TableCell>{call.dnis}</TableCell>
                          <TableCell>
                            <StatusChip status={call.status} />
                          </TableCell>
                          <TableCell>
                            {call.country ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FlagIcon fontSize="small" sx={{ mr: 1 }} />
                                {call.country}
                              </Box>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{call.carrier || '-'}</TableCell>
                        </StyledTableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={callHistory.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </TabPanel>
        
        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Call Volume Trends" />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 400 }}>
                    <Line data={callVolumeChartData} options={callVolumeChartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Additional analytics could be added here */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Call Status Distribution" />
                <Divider />
                <CardContent>
                  {/* Could add a pie chart here */}
                  <Typography>
                    Status distribution visualization would be here
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Call Duration Statistics" />
                <Divider />
                <CardContent>
                  {/* Could add a histogram or other visualization here */}
                  <Typography>
                    Call duration statistics would be here
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default MonitoringPage;
