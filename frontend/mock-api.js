// This file provides mock API services for development purposes
// In production, these would be replaced with actual API calls

// Helper function to simulate API latency
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate random phone numbers
const generateRandomPhoneNumber = (countryCode = '1') => {
  const randomDigits = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return `${countryCode}${randomDigits}`;
};

// Generate random call duration (in seconds)
const generateRandomDuration = (min = 30, max = 600) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Format date as string
const formatDate = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Mock source data (phone number pairs)
export const mockSourceData = async () => {
  await delay(500); // Simulate network latency
  
  const countries = ['USA', 'Canada', 'Mexico', 'Chile', 'Colombia'];
  const carriers = ['Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'Movistar', 'Claro'];
  
  // Generate 100 random phone number pairs
  const data = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    ani: generateRandomPhoneNumber('1'),
    dnis: generateRandomPhoneNumber('507'),
    country: countries[Math.floor(Math.random() * countries.length)],
    carrier: Math.random() > 0.3 ? carriers[Math.floor(Math.random() * carriers.length)] : null,
    status: Math.random() > 0.2 ? 'active' : 'inactive'
  }));
  
  return {
    data,
    total: data.length
  };
};

// Mock upload CSV function
export const mockUploadCSV = async (file) => {
  await delay(1000); // Simulate upload time
  
  // In a real implementation, we would process the file here
  console.log('Uploading file:', file.name);
  
  // Simulate success or failure
  if (Math.random() > 0.1) {
    return { success: true, message: 'File uploaded successfully' };
  } else {
    throw new Error('Upload failed. Please check the file format and try again.');
  }
};

// Mock statistical parameters data
export const mockStatParams = async () => {
  await delay(500); // Simulate network latency
  
  return {
    acdMin: 180, // 3 minutes in seconds
    acdMax: 480, // 8 minutes in seconds
    asr: 50, // 50%
    weekdayStart: new Date(0, 0, 0, 8, 0), // 8:00 AM
    weekdayEnd: new Date(0, 0, 0, 18, 0), // 6:00 PM
    weekendStart: new Date(0, 0, 0, 9, 0), // 9:00 AM
    weekendEnd: new Date(0, 0, 0, 14, 0), // 2:00 PM
    selectedDays: [1, 2, 3, 4, 5], // Monday-Friday
    increaseRate: 5, // 5 channels per minute
    decreaseRate: 3, // 3 channels per minute
    minCalls: 0,
    maxCalls: 500,
    dailyPattern: [
      { hour: 0, factor: 0.1 },
      { hour: 1, factor: 0.05 },
      { hour: 2, factor: 0.05 },
      { hour: 3, factor: 0.05 },
      { hour: 4, factor: 0.1 },
      { hour: 5, factor: 0.2 },
      { hour: 6, factor: 0.3 },
      { hour: 7, factor: 0.4 },
      { hour: 8, factor: 0.5 },
      { hour: 9, factor: 0.7 },
      { hour: 10, factor: 0.8 },
      { hour: 11, factor: 0.9 },
      { hour: 12, factor: 1.0 },
      { hour: 13, factor: 0.9 },
      { hour: 14, factor: 0.85 },
      { hour: 15, factor: 0.8 },
      { hour: 16, factor: 0.85 },
      { hour: 17, factor: 0.9 },
      { hour: 18, factor: 0.8 },
      { hour: 19, factor: 0.7 },
      { hour: 20, factor: 0.5 },
      { hour: 21, factor: 0.4 },
      { hour: 22, factor: 0.3 },
      { hour: 23, factor: 0.2 },
    ]
  };
};

// Mock save statistical parameters
export const mockSaveStatParams = async (params) => {
  await delay(800); // Simulate network latency
  
  console.log('Saving statistical parameters:', params);
  
  // Simulate success
  return { success: true };
};

// Mock monitoring data
export const mockMonitoringData = async (filters = {}) => {
  await delay(700); // Simulate network latency
  
  const countries = ['USA', 'Canada', 'Mexico', 'Chile', 'Colombia'];
  const carriers = ['Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'Movistar', 'Claro'];
  const statuses = ['originated', 'ringing', 'answered', 'failed', 'missed'];
  
  // Generate active calls
  const generateCalls = (count, statusFilter = null) => {
    return Array.from({ length: count }, (_, index) => {
      const status = statusFilter || statuses[Math.floor(Math.random() * statuses.length)];
      const startTime = new Date(Date.now() - (Math.random() * 3600 * 1000)); // Last hour
      const duration = generateRandomDuration();
      
      return {
        id: index + 1,
        ani: generateRandomPhoneNumber('1'),
        dnis: generateRandomPhoneNumber('507'),
        status,
        startTime: formatDate(startTime),
        duration: status === 'answered' ? duration : 0,
        endTime: status === 'answered' || status === 'failed' || status === 'missed' 
          ? formatDate(new Date(startTime.getTime() + (duration * 1000)))
          : null,
        country: countries[Math.floor(Math.random() * countries.length)],
        carrier: Math.random() > 0.3 ? carriers[Math.floor(Math.random() * carriers.length)] : null
      };
    });
  };
  
  // Apply filters (simplified implementation)
  let activeCalls = generateCalls(25);
  if (filters.status && filters.status !== 'all') {
    activeCalls = activeCalls.filter(call => call.status === filters.status);
  }
  if (filters.country) {
    activeCalls = activeCalls.filter(call => call.country === filters.country);
  }
  
  // Generate call history (completed calls)
  const callHistory = generateCalls(100, Math.random() > 0.5 ? 'answered' : 'failed');
  
  // Generate chart data
  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    active: Array.from({ length: 24 }, () => Math.floor(Math.random() * 300) + 50),
    answered: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100) + 20),
    failed: Array.from({ length: 24 }, () => Math.floor(Math.random() * 50) + 10)
  };
  
  return {
    activeCalls,
    callHistory,
    serverStatus: {
      serverA: Math.random() > 0.1 ? 'online' : 'offline',
      serverB: Math.random() > 0.1 ? 'online' : 'offline'
    },
    callStats: {
      total: 2500,
      active: 123,
      ringing: 42,
      answered: 67,
      failed: 14
    },
    chartData
  };
};

// Mock dashboard data
export const mockDashboardData = async (timeframe = '24h', serverFilter = 'all') => {
  await delay(600); // Simulate network latency
  
  // Generate chart data
  const generateChartData = () => {
    const dataPoints = timeframe === '24h' ? 24 : 
                      timeframe === '7d' ? 7 : 
                      timeframe === '30d' ? 30 : 12;
    
    const labels = Array.from({ length: dataPoints }, (_, i) => {
      if (timeframe === '24h') return `${i}:00`;
      if (timeframe === '7d') return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i % 7];
      if (timeframe === '30d') return `Day ${i + 1}`;
      return `Hour ${i + 1}`;
    });
    
    return {
      labels,
      active: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 300) + 50),
      attempts: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 150) + 30)
    };
  };
  
  // Generate call distribution data
  const generateCallDistribution = () => {
    const countries = ['USA', 'Canada', 'Mexico', 'Chile', 'Colombia', 'Other'];
    return {
      labels: countries,
      values: countries.map(() => Math.floor(Math.random() * 1000) + 100)
    };
  };
  
  // Generate recent activity
  const generateRecentActivity = () => {
    const activities = [
      {
        message: 'Call generation started',
        details: 'Started with parameters: 500 max calls, 50% ASR',
        timestamp: '2 minutes ago'
      },
      {
        message: 'System detected high failure rate',
        details: 'Failure rate above threshold (15%)',
        timestamp: '15 minutes ago'
      },
      {
        message: 'Server B reconnected',
        details: 'Connection reestablished after 2 minutes of downtime',
        timestamp: '32 minutes ago'
      },
      {
        message: 'Call parameters changed',
        details: 'ACD range updated to 3-8 minutes',
        timestamp: '1 hour ago'
      },
      {
        message: 'New DIDs uploaded',
        details: '200 DIDs added to the system',
        timestamp: '2 hours ago'
      },
      {
        message: 'System backup completed',
        details: 'Backup saved to cloud storage',
        timestamp: '4 hours ago'
      }
    ];
    
    return activities;
  };
  
  return {
    systemStatus: Math.random() > 0.5 ? 'active' : 'inactive',
    serverStatus: {
      serverA: Math.random() > 0.1 ? 'online' : 'offline',
      serverB: Math.random() > 0.1 ? 'online' : 'offline'
    },
    activeCalls: {
      value: Math.floor(Math.random() * 500) + 50,
      trend: Math.floor(Math.random() * 40) - 20,
      status: 'success'
    },
    asr: {
      value: Math.floor(Math.random() * 30) + 40,
      trend: Math.floor(Math.random() * 20) - 10,
      status: 'warning'
    },
    acd: {
      value: Math.floor(Math.random() * 120) + 60,
      trend: Math.floor(Math.random() * 30) - 15,
      status: 'success'
    },
    failedCalls: {
      value: Math.floor(Math.random() * 50) + 10,
      trend: Math.floor(Math.random() * 30) + 5,
      status: 'error'
    },
    callTraffic: generateChartData(),
    callDistribution: generateCallDistribution(),
    recentActivity: generateRecentActivity(),
    databaseStatus: 'connected',
    autopilotMode: Math.random() > 0.5 ? 'on' : 'off',
    lastSystemUpdate: '2023-05-14 15:30:22'
  };
};

// Mock DID data
export const mockDidData = async (params = {}) => {
  await delay(500); // Simulate network latency
  
  const { page = 0, rowsPerPage = 10, inUse = 'all', country = '', search = '' } = params;
  
  // Generate DIDs
  const countries = ['Venezuela', 'Colombia', 'Mexico', 'USA'];
  const generateDids = (count) => {
    return Array.from({ length: count }, (_, index) => {
      const countryName = countries[Math.floor(Math.random() * countries.length)];
      let countryCode;
      
      switch (countryName) {
        case 'Venezuela':
          countryCode = '58';
          break;
        case 'Colombia':
          countryCode = '57';
          break;
        case 'Mexico':
          countryCode = '52';
          break;
        case 'USA':
          countryCode = '1';
          break;
        default:
          countryCode = '58';
      }
      
      const did = `${countryCode}${Math.floor(Math.random() * 9000000000) + 1000000000}`;
      
      return {
        id: index + 1,
        did,
        inUse: Math.random() > 0.7 ? 1 : 0,
        country: countryName,
        destination: Math.random() > 0.7 ? generateRandomPhoneNumber('507') : ''
      };
    });
  };
  
  // Generate 100 DIDs
  let data = generateDids(100);
  
  // Apply filters
  if (inUse !== 'all') {
    data = data.filter(did => did.inUse === parseInt(inUse));
  }
  
  if (country) {
    data = data.filter(did => did.country === country);
  }
  
  if (search) {
    data = data.filter(did => did.did.includes(search));
  }
  
  // Paginate
  const paginatedData = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  
  return {
    data: paginatedData,
    total: data.length
  };
};

// Mock upload DIDs
export const mockUploadDids = async (file) => {
  await delay(1000); // Simulate upload time
  
  console.log('Uploading DIDs file:', file.name);
  
  // Simulate success or failure
  if (Math.random() > 0.1) {
    return { success: true, message: 'DIDs uploaded successfully' };
  } else {
    throw new Error('Upload failed. Please check the file format and try again.');
  }
};

// Mock routing configuration
export const mockRoutingConfig = async () => {
  await delay(600); // Simulate network latency
  
  return {
    servers: [
      { id: 1, name: 'Server A', ip: '192.168.1.100', port: 5060, status: 'online' },
      { id: 2, name: 'Server B', ip: '192.168.1.101', port: 5060, status: 'online' },
      { id: 3, name: 'Server C', ip: '192.168.1.102', port: 5060, status: 'offline' }
    ],
    trunks: [
      { id: 1, name: 'TRUNK_1', server: 'Server A', type: 'incoming', status: 'active' },
      { id: 2, name: 'TRUNK_2', server: 'Server B', type: 'outgoing', status: 'active' },
      { id: 3, name: 'TRUNK_3', server: 'Server C', type: 'both', status: 'inactive' },
      { id: 4, name: 'TRUNK_4', server: 'Server A', type: 'outgoing', status: 'active' }
    ],
    routes: [
      { 
        id: 1, 
        name: 'Default Route', 
        sourceServer: 'Server A', 
        destinationServer: 'Server B',
        sourceTrunk: 'TRUNK_1',
        destinationTrunk: 'TRUNK_2',
        priority: 1,
        enabled: true
      },
      { 
        id: 2, 
        name: 'Backup Route', 
        sourceServer: 'Server A', 
        destinationServer: 'Server C',
        sourceTrunk: 'TRUNK_1',
        destinationTrunk: 'TRUNK_3',
        priority: 2,
        enabled: false
      }
    ],
    countryRoutes: [
      { id: 1, country: 'Venezuela', trunk: 'TRUNK_2', priority: 1, enabled: true },
      { id: 2, country: 'Colombia', trunk: 'TRUNK_2', priority: 1, enabled: true },
      { id: 3, country: 'Mexico', trunk: 'TRUNK_3', priority: 1, enabled: false },
      { id: 4, country: 'USA', trunk: 'TRUNK_4', priority: 1, enabled: true }
    ]
  };
};

// Mock CDR data
export const mockCdrData = async (params = {}) => {
  await delay(700); // Simulate network latency
  
  const { 
    startDate, 
    endDate, 
    page = 0, 
    rowsPerPage = 10, 
    trunk = '',
    ani = '',
    dnis = '',
    did = ''
  } = params;
  
  // Generate CDRs
  const trunks = ['TRUNK_1', 'TRUNK_2', 'TRUNK_3', 'TRUNK_4'];
  const statuses = ['answered', 'failed', 'missed'];
  const generateCdrs = (count) => {
    return Array.from({ length: count }, (_, index) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const startTime = new Date(Date.now() - (Math.random() * 7 * 24 * 3600 * 1000)); // Last week
      const duration = status === 'answered' ? generateRandomDuration() : 0;
      const ani = generateRandomPhoneNumber('1');
      const dnis = generateRandomPhoneNumber('507');
      const did = `58${Math.floor(Math.random() * 9000000000) + 1000000000}`;
      
      return {
        id: index + 1,
        timestamp: startTime.toISOString(),
        ani,
        dnis,
        did,
        status,
        duration,
        sourceTrunk: trunks[Math.floor(Math.random() * trunks.length)],
        destinationTrunk: trunks[Math.floor(Math.random() * trunks.length)],
        callId: `call-${Math.random().toString(36).substring(2, 15)}`,
        billableDuration: status === 'answered' ? Math.ceil(duration / 60) : 0
      };
    });
  };
  
  // Generate 500 CDRs
  let data = generateCdrs(500);
  
  // Apply filters
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    data = data.filter(cdr => {
      const date = new Date(cdr.timestamp);
      return date >= start && date <= end;
    });
  }
  
  if (trunk) {
    data = data.filter(cdr => 
      cdr.sourceTrunk === trunk || cdr.destinationTrunk === trunk
    );
  }
  
  if (ani) {
    data = data.filter(cdr => cdr.ani.includes(ani));
  }
  
  if (dnis) {
    data = data.filter(cdr => cdr.dnis.includes(dnis));
  }
  
  if (did) {
    data = data.filter(cdr => cdr.did.includes(did));
  }
  
  // Paginate
  const paginatedData = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  
  // Calculate summary
  const totalCalls = data.length;
  const answeredCalls = data.filter(cdr => cdr.status === 'answered').length;
  const failedCalls = data.filter(cdr => cdr.status === 'failed').length;
  const missedCalls = data.filter(cdr => cdr.status === 'missed').length;
  const totalDuration = data.reduce((sum, cdr) => sum + cdr.duration, 0);
  const avgDuration = answeredCalls > 0 ? Math.round(totalDuration / answeredCalls) : 0;
  const asr = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0;
  
  return {
    data: paginatedData,
    total: data.length,
    summary: {
      totalCalls,
      answeredCalls,
      failedCalls,
      missedCalls,
      totalDuration,
      avgDuration,
      asr
    }
  };
};
