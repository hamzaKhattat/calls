import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Toolbar, Typography, Avatar, Menu, MenuItem, Tooltip, Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Phone as PhoneIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
  MonitorHeart as MonitorIcon,
  PhoneForwarded as RoutingIcon,
  ListAlt as CdrIcon,
  CloudUpload as UploadIcon,
  Assignment as StatisticsIcon,
  AutoAwesome as AutopilotIcon,
  History as HistoryIcon,
  Assessment as ReportsIcon,
  Storage as DidsIcon,
  AccountCircle as ProfileIcon,
  Notifications as NotificationsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';

// Import constants and hooks
import { useAuth } from '../contexts/AuthContext';

// Drawer width
const drawerWidth = 240;

// Navigation items configuration
const mainNavItems = [
  { name: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
];

const callGeneratorNavItems = [
  { name: 'Call Generator', icon: <PhoneIcon />, path: '/call-generator' },
  { name: 'Source Data', icon: <UploadIcon />, path: '/source-data' },
  { name: 'Statistical Params', icon: <StatisticsIcon />, path: '/statistical-params' },
  { name: 'Autopilot', icon: <AutopilotIcon />, path: '/autopilot' },
];

const monitoringNavItems = [
  { name: 'Live Monitoring', icon: <MonitorIcon />, path: '/monitoring' },
  { name: 'Call History', icon: <HistoryIcon />, path: '/call-history' },
  { name: 'Reports', icon: <ReportsIcon />, path: '/reports' },
];

const routingNavItems = [
  { name: 'DID Management', icon: <DidsIcon />, path: '/did-management' },
  { name: 'Routing Config', icon: <RoutingIcon />, path: '/routing-config' },
  { name: 'CDR View', icon: <CdrIcon />, path: '/cdr-view' },
];

const settingsNavItems = [
  { name: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { name: 'Profile', icon: <ProfileIcon />, path: '/profile' },
];

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  
  // Handler for drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handler for profile menu
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  // Handler for notifications menu
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigate to a route
  const navigateTo = (path) => {
    navigate(path);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  // Check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Drawer content
  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 1 
      }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Call Generator
        </Typography>
      </Toolbar>
      <Divider />

      {/* Main Navigation */}
      <List>
        {mainNavItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              onClick={() => navigateTo(item.path)}
              selected={isActive(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />

      {/* Call Generator Navigation Group */}
      <List>
        <ListItem>
          <Typography variant="subtitle2" color="text.secondary">
            CALL GENERATOR
          </Typography>
        </ListItem>
        {callGeneratorNavItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              onClick={() => navigateTo(item.path)}
              selected={isActive(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />

      {/* Monitoring Navigation Group */}
      <List>
        <ListItem>
          <Typography variant="subtitle2" color="text.secondary">
            MONITORING
          </Typography>
        </ListItem>
        {monitoringNavItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              onClick={() => navigateTo(item.path)}
              selected={isActive(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />

      {/* Routing Navigation Group */}
      <List>
        <ListItem>
          <Typography variant="subtitle2" color="text.secondary">
            CALL ROUTING
          </Typography>
        </ListItem>
        {routingNavItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              onClick={() => navigateTo(item.path)}
              selected={isActive(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />

      {/* Settings Navigation Group */}
      <List>
        <ListItem>
          <Typography variant="subtitle2" color="text.secondary">
            SYSTEM
          </Typography>
        </ListItem>
        {settingsNavItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              onClick={() => navigateTo(item.path)}
              selected={isActive(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Page Title - Can be dynamic based on current route */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {mainNavItems.find(item => isActive(item.path))?.name ||
             callGeneratorNavItems.find(item => isActive(item.path))?.name ||
             monitoringNavItems.find(item => isActive(item.path))?.name ||
             routingNavItems.find(item => isActive(item.path))?.name ||
             settingsNavItems.find(item => isActive(item.path))?.name ||
             'Dashboard'}
          </Typography>
          
          {/* Notification Icon */}
          <Box sx={{ display: 'flex' }}>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleNotificationsOpen}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu
              anchorEl={notificationsAnchorEl}
              open={Boolean(notificationsAnchorEl)}
              onClose={handleNotificationsClose}
              PaperProps={{
                sx: { width: 320, maxHeight: 500 }
              }}
            >
              <MenuItem onClick={handleNotificationsClose}>
                <Typography variant="subtitle2">Call generator status: Active</Typography>
              </MenuItem>
              <MenuItem onClick={handleNotificationsClose}>
                <Typography variant="subtitle2">Warning: High call volume detected</Typography>
              </MenuItem>
              <MenuItem onClick={handleNotificationsClose}>
                <Typography variant="subtitle2">System update available</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleNotificationsClose}>
                <Typography align="center" color="primary">View all notifications</Typography>
              </MenuItem>
            </Menu>
            
            {/* User Profile */}
            <Tooltip title="Account settings">
              <IconButton
                size="large"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={() => {
                handleProfileMenuClose();
                navigateTo('/profile');
              }}>
                <ListItemIcon>
                  <ProfileIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={() => {
                handleProfileMenuClose();
                navigateTo('/settings');
              }}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* The drawer - Responsive for mobile and desktop */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer - temporary */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer - permanent */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default'
        }}
      >
        <Toolbar /> {/* This is needed for spacing below the AppBar */}
        <Outlet /> {/* This is where the routed components will be rendered */}
      </Box>
    </Box>
  );
}

export default MainLayout;
