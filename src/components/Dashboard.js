import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  Switch,
  Slider,
  FormControlLabel
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CameraAlt as CameraAltIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  PlayArrow as PlayIcon,
  BarChart as BarChartIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import Webcam from 'react-webcam';
import Chart from 'react-apexcharts';
import ModelInfo from './ModelInfo';
import AnalyticsDashboard from './AnalyticsDashboard';

const modelPaths = {
  damage_can: '/damage_can_model/model.json',
  damage_delivery: '/damage_delivery_model/model.json',
  freshness: '/freshness_model/model.json',
};

// Model-specific configurations
const modelConfigs = {
  damage_can: {
    labels: ['Not Damaged', 'Damaged'],
    title: 'Can Damage Detection',
    description: 'Detects physical damage to canned food products'
  },
  damage_delivery: {
    labels: ['No Damage', 'Damaged'],
    title: 'Delivery Damage Detection',
    description: 'Identifies damage that may occur during shipping and handling'
  },
  freshness: {
    labels: ['Fresh', 'Spoiled'],
    title: 'Freshness Assessment',
    description: 'Evaluates the freshness of perishable food items'
  }
};

function Dashboard() {
  const [model, setModel] = useState(null);
  const [selectedModel, setSelectedModel] = useState('damage_can');
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [chartData, setChartData] = useState(null);
  const [history, setHistory] = useState([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [autoCapture, setAutoCapture] = useState(false);
  const imageRef = useRef();
  const webcamRef = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      setLoading(true);
      try {
        // Dispose of previous model if exists
        if (model) {
          model.dispose();
        }
        
        const loadedModel = await tf.loadLayersModel(modelPaths[selectedModel]);
        setModel(loadedModel);
        setPrediction(null);
        showSnackbar(`Loaded ${modelConfigs[selectedModel].title} model`, 'success');
      } catch (error) {
        console.error("Error loading model:", error);
        showSnackbar("Failed to load model. Please try again.", 'error');
      }
      setLoading(false);
    };
    loadModel();
  }, [selectedModel]);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setPrediction(null);
        setChartData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    imageRef.current.click();
  };

  const captureFromWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      setPrediction(null);
      setChartData(null);
    }
  };

  const predict = async () => {
    if (!model || !image) {
      showSnackbar("Please upload an image first", 'warning');
      return;
    }

    setLoading(true);
    try {
      const imageElement = document.createElement('img');
      imageElement.src = image;
      await new Promise(resolve => imageElement.onload = resolve);

      // Preprocess the image
      const tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224]) // Adjust size based on your model's input
        .toFloat()
        .div(255.0) // Normalize to [0, 1]
        .expandDims();

      // Make prediction
      const result = await model.predict(tensor).data();
      
      // Process result based on model type
      const probabilities = Array.from(result);
      const config = modelConfigs[selectedModel];
      const maxProb = Math.max(...probabilities);
      const maxIndex = probabilities.indexOf(maxProb);
      
      // Apply confidence threshold
      const threshold = confidenceThreshold / 100;
      let finalPrediction = {
        label: maxProb >= threshold ? config.labels[maxIndex] : "Uncertain",
        confidence: maxProb,
        probabilities: probabilities.map((prob, index) => ({
          label: config.labels[index],
          probability: prob
        })),
        timestamp: new Date().toLocaleString(),
        model: selectedModel
      };
      
      setPrediction(finalPrediction);
      
      // Prepare chart data
      const chartSeries = probabilities.map((prob, index) => Math.round(prob * 100));
      setChartData({
        options: {
          chart: {
            id: 'prediction-chart'
          },
          xaxis: {
            categories: config.labels
          },
          colors: ['#008FFB', '#00E396']
        },
        series: [{
          name: 'Confidence %',
          data: chartSeries
        }]
      });
      
      // Add to history
      setHistory(prev => [finalPrediction, ...prev.slice(0, 19)]);
      
      if (maxProb < threshold) {
        showSnackbar("Low confidence prediction. Please try another image.", 'warning');
      }
      
    } catch (error) {
      console.error("Error during prediction:", error);
      showSnackbar("Failed to make a prediction. Please try again.", 'error');
    }
    setLoading(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const clearHistory = () => {
    setHistory([]);
    showSnackbar("Prediction history cleared", 'success');
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `food-quality-predictions-${new Date().toISOString().slice(0,10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showSnackbar("History exported successfully", 'success');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button selected={activeTab === 0} onClick={() => setActiveTab(0)}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button selected={activeTab === 1} onClick={() => setActiveTab(1)}>
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" />
            </ListItem>
            <ListItem button selected={activeTab === 2} onClick={() => setActiveTab(2)}>
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary="History" />
            </ListItem>
            <ListItem button selected={activeTab === 3} onClick={() => setActiveTab(3)}>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="Model Info" />
            </ListItem>
            <ListItem button selected={activeTab === 4} onClick={() => setActiveTab(4)}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button onClick={toggleDarkMode}>
              <ListItemIcon>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </ListItemIcon>
              <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        
        {/* Header */}
        <AppBar position="static" color="default" elevation={1} sx={{ mb: 3 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Food Quality Prediction System
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                displayEmpty
              >
                <MenuItem value="damage_can">Can Damage</MenuItem>
                <MenuItem value="damage_delivery">Delivery Damage</MenuItem>
                <MenuItem value="freshness">Freshness</MenuItem>
              </Select>
            </FormControl>
          </Toolbar>
        </AppBar>

        {/* Model Info Banner */}
        <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: 'rgba(144, 202, 249, 0.1)' }}>
          <Typography variant="h5" gutterBottom>
            {modelConfigs[selectedModel].title}
          </Typography>
          <Typography variant="body1">
            {modelConfigs[selectedModel].description}
          </Typography>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Image Input
                </Typography>
                
                <Tabs value={0} sx={{ mb: 2 }}>
                  <Tab label="Upload" />
                  <Tab label="Camera" />
                </Tabs>
                
                <Box sx={{ textAlign: 'center' }}>
                  <input 
                    type="file" 
                    ref={imageRef} 
                    onChange={handleImageUpload} 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                  />
                  
                  {image ? (
                    <Box sx={{ position: 'relative' }}>
                      <img 
                        src={image} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '300px', 
                          borderRadius: '8px',
                          border: '1px solid #ddd'
                        }} 
                      />
                      <Button 
                        variant="outlined" 
                        onClick={triggerUpload}
                        sx={{ mt: 1 }}
                      >
                        Change Image
                      </Button>
                    </Box>
                  ) : (
                    <Paper 
                      elevation={1} 
                      onClick={triggerUpload}
                      sx={{ 
                        border: '2px dashed #90caf9',
                        borderRadius: '8px',
                        p: 4,
                        cursor: 'pointer',
                        textAlign: 'center',
                        backgroundColor: 'rgba(144, 202, 249, 0.05)'
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: '#90caf9', mb: 1 }} />
                      <Typography>Click to Upload Image</Typography>
                      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                        or use the camera below
                      </Typography>
                    </Paper>
                  )}
                  
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "environment" }}
                    style={{ 
                      width: '100%', 
                      maxHeight: '300px', 
                      marginTop: '16px',
                      borderRadius: '8px',
                      display: image ? 'none' : 'block'
                    }}
                  />
                  
                  <Button
                    variant="contained"
                    startIcon={<CameraAltIcon />}
                    onClick={captureFromWebcam}
                    sx={{ mt: 2, mr: 2 }}
                    disabled={!!image}
                  >
                    Capture Photo
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    startIcon={loading ? <CircularProgress size={20} /> : <PlayIcon />}
                    onClick={predict} 
                    disabled={!image || loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Package'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Prediction Results
                </Typography>
                
                {prediction ? (
                  <Box>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                          {prediction.label}
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                          Confidence: {(prediction.confidence * 100).toFixed(2)}%
                        </Typography>
                        <Chip 
                          label={prediction.confidence > 0.8 ? "High Confidence" : 
                                prediction.confidence > 0.6 ? "Medium Confidence" : "Low Confidence"} 
                          color={prediction.confidence > 0.8 ? "success" : 
                                prediction.confidence > 0.6 ? "warning" : "error"} 
                        />
                      </CardContent>
                    </Card>
                    
                    {chartData && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Confidence Distribution
                        </Typography>
                        <Chart
                          options={chartData.options}
                          series={chartData.series}
                          type="bar"
                          height={250}
                        />
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">
                      Upload an image or capture from camera to see prediction results
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {activeTab === 1 && (
          <AnalyticsDashboard />
        )}
        
        {activeTab === 2 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Prediction History
              </Typography>
              <Box>
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />} 
                  onClick={exportHistory}
                  disabled={history.length === 0}
                  sx={{ mr: 1 }}
                >
                  Export
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<DeleteIcon />} 
                  onClick={clearHistory}
                  disabled={history.length === 0}
                  color="error"
                >
                  Clear
                </Button>
              </Box>
            </Box>
            
            {history.length > 0 ? (
              <List>
                {history.map((item, index) => (
                  <ListItem key={index} divider className="history-item">
                    <ListItemText 
                      primary={`${modelConfigs[item.model].title}: ${item.label}`} 
                      secondary={`Confidence: ${(item.confidence * 100).toFixed(2)}% - ${item.timestamp}`} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ py: 5, textAlign: 'center' }}>
                No prediction history yet. Make predictions to see them here.
              </Typography>
            )}
          </Paper>
        )}
        
        {activeTab === 3 && (
          <ModelInfo selectedModel={selectedModel} />
        )}
        
        {activeTab === 4 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Settings
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Prediction Settings
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography id="confidence-threshold-slider" gutterBottom>
                  Confidence Threshold: {confidenceThreshold}%
                </Typography>
                <Slider
                  value={confidenceThreshold}
                  onChange={(e, newValue) => setConfidenceThreshold(newValue)}
                  aria-labelledby="confidence-threshold-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={50}
                  max={95}
                />
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={autoCapture}
                    onChange={(e) => setAutoCapture(e.target.checked)}
                    name="autoCapture"
                  />
                }
                label="Auto-capture from camera"
              />
            </Box>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Display Settings
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    name="darkMode"
                  />
                }
                label="Dark Mode"
              />
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

export default Dashboard;
