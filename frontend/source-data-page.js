import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Card, CardContent, CardHeader, Divider, Typography,
  TextField, Grid, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip, Chip, Alert,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  LinearProgress, Tab, Tabs, Stack, Pagination
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
  Cancel as CancelIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// This would be replaced with real API calls
import { mockSourceData, mockUploadCSV } from '../../services/mockApi';

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

function SourceDataPage() {
  // State for table data
  const [phoneNumberPairs, setPhoneNumberPairs] = useState([]);
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
  const [newAni, setNewAni] = useState('');
  const [newDnis, setNewDnis] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newCarrier, setNewCarrier] = useState('');
  
  // State for edit mode
  const [editIndex, setEditIndex] = useState(-1);
  const [editAni, setEditAni] = useState('');
  const [editDnis, setEditDnis] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editCarrier, setEditCarrier] = useState('');
  
  // State for delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(-1);
  
  // State for tab selection
  const [tabValue, setTabValue] = useState(0);
  
  // Ref for file input
  const fileInputRef = useRef(null);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // const response = await api.getPhoneNumberPairs(page, rowsPerPage);
        
        // Using mock data for now
        const response = await mockSourceData();
        setPhoneNumberPairs(response.data);
        setTotalItems(response.total);
      } catch (error) {
        console.error('Error fetching phone number pairs:', error);
        // Would show an error notification in a real app
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, rowsPerPage]);

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
      // await api.uploadSourceData(formData);
      
      // Using mock function for now
      await mockUploadCSV(csvFile);
      
      setUploadSuccess(true);
      setUploadError('');
      setCsvFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh the table data
      // This would be the same as the initial load, but with fresh data
      const response = await mockSourceData();
      setPhoneNumberPairs(response.data);
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setUploadError('Failed to upload file. Please check the format and try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle add new phone number pair
  const handleAddPhoneNumberPair = () => {
    // Validate inputs
    if (!newAni || !newDnis) {
      // Would show an error notification in a real app
      return;
    }

    // In a real app, this would be an API call
    // await api.addPhoneNumberPair({ ani: newAni, dnis: newDnis, country: newCountry, carrier: newCarrier });
    
    // For now, just update the local state
    setPhoneNumberPairs([
      ...phoneNumberPairs,
      {
        id: Date.now(), // Would be assigned by the backend in a real app
        ani: newAni,
        dnis: newDnis,
        country: newCountry,
        carrier: newCarrier,
        status: 'active'
      }
    ]);

    // Reset the form
    setNewAni('');
    setNewDnis('');
    setNewCountry('');
    setNewCarrier('');
    setShowAddForm(false);
  };

  // Handle edit phone number pair
  const handleEditRow = (index) => {
    const pair = phoneNumberPairs[index];
    setEditIndex(index);
    setEditAni(pair.ani);
    setEditDnis(pair.dnis);
    setEditCountry(pair.country);
    setEditCarrier(pair.carrier);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    // Validate inputs
    if (!editAni || !editDnis) {
      // Would show an error notification in a real app
      return;
    }

    // In a real app, this would be an API call
    // await api.updatePhoneNumberPair(phoneNumberPairs[editIndex].id, {
    //   ani: editAni, dnis: editDnis, country: editCountry, carrier: editCarrier
    // });
    
    // For now, just update the local state
    const newPairs = [...phoneNumberPairs];
    newPairs[editIndex] = {
      ...newPairs[editIndex],
      ani: editAni,
      dnis: editDnis,
      country: editCountry,
      carrier: editCarrier
    };
    setPhoneNumberPairs(newPairs);

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

  // Handle delete phone number pair
  const handleDeletePhoneNumberPair = async () => {
    if (deleteIndex === -1) {
      return;
    }

    // In a real app, this would be an API call
    // await api.deletePhoneNumberPair(phoneNumberPairs[deleteIndex].id);
    
    // For now, just update the local state
    const newPairs = [...phoneNumberPairs];
    newPairs.splice(deleteIndex, 1);
    setPhoneNumberPairs(newPairs);

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
    const csvContent = 'ANI (Origin),DNIS (Destination),Country,Carrier\n' +
                      '19543004835,50764137984,USA,Verizon\n' +
                      '19543004836,50764137985,USA,AT&T\n' +
                      '19543004837,50764137986,USA,T-Mobile';
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_phone_numbers.csv';
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

  return (
    <Box>
      {/* Page Header */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h1" gutterBottom>
              Source Data Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage phone number pairs for call generation
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for different data entry methods */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="data entry tabs">
          <Tab label="Upload CSV" />
          <Tab label="Manual Entry" />
          <Tab label="Current Data" />
        </Tabs>
        <Divider sx={{ mt: 2, mb: 3 }} />

        {/* CSV Upload Tab */}
        {tabValue === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Upload Phone Number Pairs
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Upload a CSV file containing phone number pairs for call generation. The file should have the following columns: ANI (Origin), DNIS (Destination), Country (optional), and Carrier (optional).
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
                    File uploaded successfully. The data has been processed and added to the system.
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
                          Required columns: "ANI (Origin)" and "DNIS (Destination)".
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          Optional columns: "Country" and "Carrier".
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          Phone numbers should be in international format without spaces or special characters.
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          Example: 19543004835 for US numbers.
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
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Manual Entry
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add phone number pairs manually by filling out the form below.
            </Typography>

            {!showAddForm ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAddForm(true)}
              >
                Add New Phone Number Pair
              </Button>
            ) : (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardHeader title="Add New Phone Number Pair" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="ANI (Origin)"
                        value={newAni}
                        onChange={(e) => setNewAni(e.target.value)}
                        placeholder="e.g. 19543004835"
                        helperText="Phone number in international format"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="DNIS (Destination)"
                        value={newDnis}
                        onChange={(e) => setNewDnis(e.target.value)}
                        placeholder="e.g. 50764137984"
                        helperText="Phone number in international format"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Country"
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        placeholder="e.g. USA"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Carrier"
                        value={newCarrier}
                        onChange={(e) => setNewCarrier(e.target.value)}
                        placeholder="e.g. Verizon"
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
                          onClick={handleAddPhoneNumberPair}
                          disabled={!newAni || !newDnis}
                        >
                          Add Phone Number Pair
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Current Data Tab */}
        {tabValue === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Current Phone Number Pairs
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<SearchIcon />}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                >
                  Filter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                >
                  Export
                </Button>
              </Box>
            </Box>

            {loading ? (
              <LinearProgress />
            ) : phoneNumberPairs.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No phone number pairs found. Add some using the CSV upload or manual entry tabs.
              </Alert>
            ) : (
              <>
                <TableContainer component={Paper} variant="outlined">
                  <Table sx={{ minWidth: 650 }} aria-label="phone number pairs table">
                    <TableHead>
                      <TableRow>
                        <TableCell>ANI (Origin)</TableCell>
                        <TableCell>DNIS (Destination)</TableCell>
                        <TableCell>Country</TableCell>
                        <TableCell>Carrier</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {phoneNumberPairs.map((pair, index) => (
                        <StyledTableRow key={pair.id}>
                          {editIndex === index ? (
                            // Edit mode row
                            <>
                              <TableCell>
                                <TextField
                                  size="small"
                                  value={editAni}
                                  onChange={(e) => setEditAni(e.target.value)}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  value={editDnis}
                                  onChange={(e) => setEditDnis(e.target.value)}
                                  fullWidth
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
                                  value={editCarrier}
                                  onChange={(e) => setEditCarrier(e.target.value)}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={pair.status}
                                  color={pair.status === 'active' ? 'success' : 'default'}
                                  size="small"
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
                              <TableCell>{pair.ani}</TableCell>
                              <TableCell>{pair.dnis}</TableCell>
                              <TableCell>{pair.country || '-'}</TableCell>
                              <TableCell>{pair.carrier || '-'}</TableCell>
                              <TableCell>
                                <Chip
                                  label={pair.status}
                                  color={pair.status === 'active' ? 'success' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="Edit">
                                  <IconButton onClick={() => handleEditRow(index)} color="primary">
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton onClick={() => handleDeleteConfirmOpen(index)} color="error">
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
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteConfirmClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Phone Number Pair?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this phone number pair? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose}>Cancel</Button>
          <Button onClick={handleDeletePhoneNumberPair} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SourceDataPage;
