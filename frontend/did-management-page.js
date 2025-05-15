import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Card, CardContent, CardHeader, Divider, Typography,
  TextField, Grid, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip, Chip, Alert,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  LinearProgress, Tab, Tabs, Stack, Pagination, FormControl, InputLabel,
  Select, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// This would be replaced with real API calls
import { mockDidData, mockUploadDids } from '../../services/mockApi';

// Styled components
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function DidManagementPage() {
  // State for table data
  const [dids, setDids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // State for CSV upload
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // State for manual entry
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDid, setNewDid] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newDestination, setNewDestination] = useState('');
  
  // State for edit mode
  const [editIndex, setEditIndex] = useState(-1);
  const [editDid, setEditDid] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editDestination, setEditDestination] = useState('');
  
  // State for delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(-1);
  
  // State for tab selection
  const [tabValue, setTabValue] = useState(0);
  
  // State for filters
  const [filterInUse, setFilterInUse] = useState('all');
  const [filterCountry, setFilterCountry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ref for file input
  const fileInputRef = useRef(null);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call with filters
        // const response = await api.getDids({
        //   page, 
        //   rowsPerPage,
        //   inUse: filterInUse,
        //   country: filterCountry,
        //   search: searchQuery
        // });
        
        // Using mock data for now
        const response = await mockDidData({
          page, 
          rowsPerPage,
          inUse: filterInUse,
          country: filterCountry,
          search: searchQuery
        });
        
        setDids(response.data);
        setTotalItems(response.total);
      } catch (error) {
        console.error('Error fetching DIDs:', error);
        // Would show an error notification in a real app
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, rowsPerPage, filterInUse, filterCountry, searchQuery]);

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCsvFile(file);
      // Reset any previous upload status
      setUploadSuccess(false);
      setUploadError('');
    }
  };

  // Handle CSV upload
  const handleUploadCSV = async () => {
    if (!csvFile) {
      setUploadError('Please select a file first.');
      return;
    }

    setUploading(true);
    try {
      // In a real app, this would be an API call with FormData
      // const formData = new FormData();
      // formData.append('file', csvFile);
      // await api.uploadDids(formData);
      
      // Using mock function for now
      await mockUploadDids(csvFile);
      
      setUploadSuccess(true);
      setUploadError('');
      setCsvFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh the table data
      // This would be the same as the initial load, but with fresh data
      const response = await mockDidData({
        page, 
        rowsPerPage,
        inUse: filterInUse,
        country: filterCountry,
        search: searchQuery
      });
      setDids(response.data);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setUploadError('Failed to upload file. Please check the format and try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle add new DID
  const handleAddDid = () => {
    // Validate inputs
    if (!newDid) {
      // Would show an error notification in a real app
      return;
    }

    // In a real app, this would be an API call
    // await api.addDid({ did: newDid, country: newCountry, destination: newDestination });
    
    // For now, just update the local state
    setDids([
      ...dids,
      {
        id: Date.now(), // Would be assigned by the backend in a real app
        did: newDid,
        inUse: 0,
        country: newCountry,
        destination: newDestination
      }
    ]);

    // Reset the form
    setNewDid('');
    setNewCountry('');
    setNewDestination('');
    setShowAddForm(false);
  };

  // Handle edit DID
  const handleEditRow = (index) => {
    const didItem = dids[index];
    setEditIndex(index);
    setEditDid(didItem.did);
    setEditCountry(didItem.country);
    setEditDestination(didItem.destination);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    // Validate inputs
    if (!editDid) {
      // Would show an error notification in a real app
      return;
    }

    // In a real app, this would be an API call
    // await api.updateDid(dids[editIndex].id, {
    //   did: editDid, country: editCountry, destination: editDestination
    // });
    
    // For now, just update the local state
    const newDids = [...dids];
    newDids[editIndex] = {
      ...newDids[editIndex],
      did: editDid,
      country: editCountry,
      destination: editDestination
    };
    setDids(newDids);

    // Reset edit state
    setEditIndex(-1);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditIndex(-1);
  };

  // Handle delete confirmation open
  const handleDeleteConfirmOpen = (index) => {
    setDeleteIndex(index);
    setDeleteConfirmOpen(true);
  };

  // Handle delete confirmation close
  const handleDeleteConfirmClose = () => {
    setDeleteConfirmOpen(false);
    setDeleteIndex(-1);
  };

  // Handle delete DID
  const handleDeleteDid = async () => {
    if (deleteIndex === -1) {
      return;
    }

    // In a real app, this would be an API call
    // await api.deleteDid(dids[deleteIndex].id);
    
    // For now, just update the local state
    const newDids = [...dids];
    newDids.splice(deleteIndex, 1);
    setDids(newDids);

    // Close the dialog
    handleDeleteConfirmClose();
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle download sample CSV
  const handleDownloadSampleCSV = () => {
    // Create sample CSV content
    const csvContent = 'DID,Country,Destination\n' +
                      '584148757547,Venezuela,\n' +
                      '584249726299,Venezuela,\n' +
                      '584167000000,Venezuela,\n' +
                      '584267000011,Venezuela,';
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_dids.csv';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1);
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    // In a real app, this would likely be an API call that returns a file
    // For now, we'll just generate a CSV from the current state
    
    // Create CSV content
    let csvContent = 'DID,In Use,Country,Destination\n';
    dids.forEach(did => {
      csvContent += `${did.did},${did.inUse},${did.country || ''},${did.destination || ''}\n`;
    });
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dids_export.csv';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {/* Page Header */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h1" gutterBottom>
              DID Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage DIDs for dynamic call routing
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for different data entry methods */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="did management tabs">
          <Tab label="Current DIDs" />
          <Tab label="Upload DIDs" />
          <Tab label="Manual Entry" />
        </Tabs>
        <Divider sx={{ mt: 2, mb: 3 }} />

        {/* Current DIDs Tab */}
        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="in-use-filter-label">Status</InputLabel>
                  <Select
                    labelId="in-use-filter-label"
                    id="in-use-filter"
                    value={filterInUse}
                    label="Status"
                    onChange={(e) => setFilterInUse(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="1">In Use</MenuItem>
                    <MenuItem value="0">Available</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="country-filter-label">Country</InputLabel>
                  <Select
                    labelId="country-filter-label"
                    id="country-filter"
                    value={filterCountry}
                    label="Country"
                    onChange={(e) => setFilterCountry(e.target.value)}
                  >
                    <MenuItem value="">All Countries</MenuItem>
                    <MenuItem value="Venezuela">Venezuela</MenuItem>
                    <MenuItem value="Colombia">Colombia</MenuItem>
                    <MenuItem value="Mexico">Mexico</MenuItem>
                    <MenuItem value="USA">USA</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  size="small"
                  label="Search"
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    // Refresh the table data
                    setLoading(true);
                    const fetchData = async () => {
                      const response = await mockDidData({
                        page, 
                        rowsPerPage,
                        inUse: filterInUse,
                        country: filterCountry,
                        search: searchQuery
                      });
                      setDids(response.data);
                      setTotalItems(response.total);
                      setLoading(false);
                    };
                    fetchData();
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCSV}
                >
                  Export
                </Button>
              </Box>
            </Box>

            {loading ? (
              <LinearProgress />
            ) : dids.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No DIDs found. Add some using the CSV upload or manual entry tabs.
              </Alert>
            ) : (
              <>
                <TableContainer component={Paper} variant="outlined">
                  <Table sx={{ minWidth: 650 }} aria-label="dids table">
                    <TableHead>
                      <TableRow>
                        <TableCell>DID</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Country</TableCell>
                        <TableCell>Destination</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dids.map((did, index) => (
                        <StyledTableRow key={did.id}>
                          {editIndex === index ? (
                            // Edit mode row
                            <>
                              <TableCell>
                                <TextField
                                  size="small"
                                  value={editDid}
                                  onChange={(e) => setEditDid(e.target.value)}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={did.inUse === 1 ? 'In Use' : 'Available'}
                                  color={did.inUse === 1 ? 'error' : 'success'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  value={editCountry}
                                  onChange={(e) => setEditCountry(e.target.value)}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  value={editDestination}
                                  onChange={(e) => setEditDestination(e.target.value)}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="Save">
                                  <IconButton onClick={handleSaveEdit} color="primary">
                                    <SaveIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                  <IconButton onClick={handleCancelEdit} color="default">
                                    <CancelIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </>
                          ) : (
                            // Normal row (not in edit mode)
                            <>
                              <TableCell>{did.did}</TableCell>
                              <TableCell>
                                <Chip
                                  label={did.inUse === 1 ? 'In Use' : 'Available'}
                                  color={did.inUse === 1 ? 'error' : 'success'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {did.country ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <FlagIcon fontSize="small" sx={{ mr: 1 }} />
                                    {did.country}
                                  </Box>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell>{did.destination || '-'}</TableCell>
                              <TableCell align="right">
                                <Tooltip title="Edit">
                                  <IconButton 
                                    onClick={() => handleEditRow(index)} 
                                    color="primary"
                                    disabled={did.inUse === 1}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton 
                                    onClick={() => handleDeleteConfirmOpen(index)} 
                                    color="error"
                                    disabled={did.inUse === 1}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </>
                          )}
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination 
                    count={Math.ceil(totalItems / rowsPerPage)} 
                    page={page + 1} 
                    onChange={handlePageChange} 
                    color="primary" 
                  />
                </Box>
              </>
            )}
          </Box>
        )}

        {/* Upload DIDs Tab */}
        {tabValue === 1 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Upload DIDs
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Upload a CSV file containing DIDs for call routing. The file should have the following columns: DID, Country (optional), and Destination (optional).
                </Typography>
                
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Select CSV File
                  <VisuallyHiddenInput
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </Button>

                {csvFile && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Selected file: <b>{csvFile.name}</b> ({Math.round(csvFile.size / 1024)} KB)
                  </Typography>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleUploadCSV}
                  disabled={!csvFile || uploading}
                  sx={{ mr: 2 }}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadSampleCSV}
                >
                  Download Sample CSV
                </Button>

                {uploading && (
                  <LinearProgress sx={{ mt: 2 }} />
                )}

                {uploadSuccess && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    File uploaded successfully. The DIDs have been processed and added to the system.
                  </Alert>
                )}

                {uploadError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {uploadError}
                  </Alert>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="CSV Format Guidelines" />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" paragraph>
                      Please ensure your CSV file follows these guidelines:
                    </Typography>
                    <ul>
                      <li>
                        <Typography variant="body2">
                          The first row must be the header with column names.
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          Required column: "DID"
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          Optional columns: "Country" and "Destination"
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          DIDs should be in international format without spaces or special characters.
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          Example: 584148757547 for Venezuela numbers.
                        </Typography>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Manual Entry Tab */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Manual Entry
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add DIDs manually by filling out the form below.
            </Typography>

            {!showAddForm ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAddForm(true)}
              >
                Add New DID
              </Button>
            ) : (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardHeader title="Add New DID" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="DID"
                        value={newDid}
                        onChange={(e) => setNewDid(e.target.value)}
                        placeholder="e.g. 584148757547"
                        helperText="Phone number in international format"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Country"
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        placeholder="e.g. Venezuela"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Destination"
                        value={newDestination}
                        onChange={(e) => setNewDestination(e.target.value)}
                        placeholder="e.g. 50764137984"
                        helperText="Optional: will be set during call routing"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={() => setShowAddForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleAddDid}
                          disabled={!newDid}
                        >
                          Add DID
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteConfirmClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete DID?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this DID? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose}>Cancel</Button>
          <Button onClick={handleDeleteDid} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DidManagementPage;
