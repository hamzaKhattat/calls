import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, Card, CardContent, 
  CardHeader, Divider, Button, IconButton, Tooltip,
  LinearProgress, Chip, Select, MenuItem, FormControl,
  InputLabel
} from '@mui/material';
import { 
  Phone as PhoneIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  PhoneDisabled as PhoneDisabledIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// Mock API service - would be replaced with actual API calls
import { mockDashboardData } from '../../services/mockApi';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

const StatCard = styled(Card)(({ theme, statuscolor }) => ({
  height: '100%',
  backgroundColor: statuscolor === 'success' 
    ? theme.palette.success.light 
    : statuscolor === 'warning' 
      ? theme.palette.warning.light 
      : statuscolor === 'error' 
        ? theme.palette.error.light 
        : theme.palette.primary.light,
  color: theme.palette.getContrastText(
    statuscolor === 'success' 
      ? theme.palette.success.light 
      : statuscolor === 'warning' 
        ? theme.palette.warning.light 
        : statuscolor === 'error' 
          ? theme.palette.error.light 
          : theme.palette.primary.light
  ),
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [serverFilter, setServerFilter] = useState('all');
  
  // Fetch dashboard data on component mount and when filters change
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call with timeframe and serverFilter params
        // const response = await api.getDashboardData(timeframe, serverFilter);
        
        // Using mock data for now
        const response = await mockDashboardData(timeframe, serverFilter);
        setDashboardData(response);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Would show an error notification in a real app
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeframe, serverFilter]);

  // Handle start call generation
  const handleStartCallGeneration = () => {
    // This would call an API to start the call generation process
    console.log('Starting call generation');
  };

  // Handle stop call generation
  const handleStopCallGeneration = () => {
    // This would call an API to stop the call generation process
    console.log('Stopping call generation');
  };

  // Handle refresh dashboard data
  const handleRefresh = () => {
    // Refetch the dashboard data
    console.log('Refreshing dashboard data');
  };

  if (loading || !dashboardData) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  // Chart data for call traffic
  const callTrafficData = {
    labels: dashboardData.callTraffic.labels,
    datasets: [
      {
        label: 'Active Calls',
        data: dashboardData.callTraffic.active,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Call Attempts',
        data: dashboardData.callTraffic.attempts,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  // Chart options for call traffic
  const callTrafficOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Call Traffic Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Chart data for call distribution by country
  const callDistributionData = {
    labels: dashboardData.callDistribution.labels,
    datasets: [
      {
        label: 'Calls by Country',
        data: dashboardData.callDistribution.values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options for call distribution
  const callDistributionOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Call Distribution by Country',
      },
    },
  };

  return (
    <Box>
      {/* Header with control panel */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h1" gutterBottom>
              Call Generator Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor and control call generation activities
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Tooltip title="Start Call Generation">
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayIcon />}
                  onClick={handleStartCallGeneration}
                  disabled={dashboardData.systemStatus === 'active'}
                >
                  Start
                </Button>
              </Tooltip>
              <Tooltip title="Stop Call Generation">
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={handleStopCallGeneration}
                  disabled={dashboardData.systemStatus !== 'active'}
                >
                  Stop
                </Button>
              </Tooltip>
              <Tooltip title="Refresh Data">
                <IconButton onClick={handleRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="System Settings">
                <IconButton onClick={() => {}}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filter controls */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="timeframe-select-label">Timeframe</InputLabel>
              <Select
                labelId="timeframe-select-label"
                id="timeframe-select"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                label="Timeframe"
              >
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="6h">Last 6 Hours</MenuItem>
                <MenuItem value="12h">Last 12 Hours</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="server-select-label">Server</InputLabel>
              <Select
                labelId="server-select-label"
                id="server-select"
                value={serverFilter}
                onChange={(e) => setServerFilter(e.target.value)}
                label="Server"
              >
                <MenuItem value="all">All Servers</MenuItem>
                <MenuItem value="server-a">Server A</MenuItem>
                <MenuItem value="server-b">Server B</MenuItem>
                <MenuItem value="server-c">Server C</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Key Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Active Calls Card */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard statuscolor={dashboardData.activeCalls.status}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Active Calls
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {dashboardData.activeCalls.value}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="body2">
                  {dashboardData.activeCalls.trend > 0 ? '+' : ''}
                  {dashboardData.activeCalls.trend}% from last period
                </Typography>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        {/* ASR Card */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard statuscolor={dashboardData.asr.status}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  ASR
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {dashboardData.asr.value}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="body2">
                  {dashboardData.asr.trend > 0 ? '+' : ''}
                  {dashboardData.asr.trend}% from last period
                </Typography>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        {/* ACD Card */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard statuscolor={dashboardData.acd.status}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  ACD
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {dashboardData.acd.value}s
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="body2">
                  {dashboardData.acd.trend > 0 ? '+' : ''}
                  {dashboardData.acd.trend}% from last period
                </Typography>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        {/* Failed Calls Card */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard statuscolor={dashboardData.failedCalls.status}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneDisabledIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Failed Calls
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {dashboardData.failedCalls.value}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="body2">
                  {dashboardData.failedCalls.trend > 0 ? '+' : ''}
                  {dashboardData.failedCalls.trend}% from last period
                </Typography>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      {/* System Status */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          System Status
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                Call Generator:
              </Typography>
              <Chip 
                label={dashboardData.systemStatus === 'active' ? 'Active' : 'Inactive'} 
                color={dashboardData.systemStatus === 'active' ? 'success' : 'default'}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                Server A Status:
              </Typography>
              <Chip 
                label={dashboardData.serverStatus.serverA === 'online' ? 'Online' : 'Offline'} 
                color={dashboardData.serverStatus.serverA === 'online' ? 'success' : 'error'}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                Server B Status:
              </Typography>
              <Chip 
                label={dashboardData.serverStatus.serverB === 'online' ? 'Online' : 'Offline'} 
                color={dashboardData.serverStatus.serverB === 'online' ? 'success' : 'error'}
                size="small"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                Autopilot Mode:
              </Typography>
              <Chip 
                label={dashboardData.autopilotMode === 'on' ? 'On' : 'Off'} 
                color={dashboardData.autopilotMode === 'on' ? 'primary' : 'default'}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                Database Connection:
              </Typography>
              <Chip 
                label={dashboardData.databaseStatus === 'connected' ? 'Connected' : 'Disconnected'} 
                color={dashboardData.databaseStatus === 'connected' ? 'success' : 'error'}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                Last System Update:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.lastSystemUpdate}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Call Traffic Chart */}
        <Grid item xs={12} lg={8}>
          <StyledCard>
            <CardHeader title="Call Traffic" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300, position: 'relative' }}>
                <Line data={callTrafficData} options={callTrafficOptions} />
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Call Distribution by Country */}
        <Grid item xs={12} lg={4}>
          <StyledCard>
            <CardHeader title="Call Distribution by Country" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300, position: 'relative' }}>
                <Bar data={callDistributionData} options={callDistributionOptions} />
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Recent Activity/Logs */}
        <Grid item xs={12}>
          <StyledCard>
            <CardHeader 
              title="Recent Activity" 
              action={
                <Button size="small" variant="outlined">
                  View All Logs
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {dashboardData.recentActivity.map((activity, index) => (
                  <Box key={index} sx={{ mb: 1.5, pb: 1.5, borderBottom: index < dashboardData.recentActivity.length - 1 ? '1px solid #eee' : 'none' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {activity.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.timestamp}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {activity.details}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;
