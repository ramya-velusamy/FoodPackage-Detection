import React from 'react';
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box
} from '@mui/material';
import {
  Info as InfoIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

const modelDetails = {
  damage_can: {
    title: "Can Damage Detection",
    description: "This model detects physical damage to canned food products including dents, scratches, and corrosion.",
    accuracy: "94.2%",
    trainingData: "12,500 images",
    inputSize: "224x224 pixels",
    architecture: "ResNet-50",
    lastUpdated: "2023-10-15"
  },
  damage_delivery: {
    title: "Delivery Damage Detection",
    description: "This model identifies damage that may occur during shipping and handling, including impact damage and package integrity issues.",
    accuracy: "91.8%",
    trainingData: "15,200 images",
    inputSize: "224x224 pixels",
    architecture: "EfficientNet-B3",
    lastUpdated: "2023-11-02"
  },
  freshness: {
    title: "Freshness Assessment",
    description: "This model evaluates the freshness of perishable food items based on visual indicators such as color, texture, and signs of spoilage.",
    accuracy: "89.5%",
    trainingData: "18,750 images",
    inputSize: "224x224 pixels",
    architecture: "MobileNetV2",
    lastUpdated: "2023-09-28"
  }
};

function ModelInfo({ selectedModel }) {
  const model = modelDetails[selectedModel];
  
  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <InfoIcon sx={{ mr: 1 }} />
        {model.title}
      </Typography>
      
      <Typography variant="body1" paragraph sx={{ mb: 3 }}>
        {model.description}
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Model Performance
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Accuracy" 
              secondary={model.accuracy} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <StorageIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Training Data" 
              secondary={model.trainingData} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SpeedIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Input Size" 
              secondary={model.inputSize} 
            />
          </ListItem>
        </List>
      </Box>
      
      <Box>
        <Typography variant="h6" gutterBottom>
          Technical Details
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Architecture" 
              secondary={model.architecture} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Last Updated" 
              secondary={model.lastUpdated} 
            />
          </ListItem>
        </List>
      </Box>
    </Paper>
  );
}

export default ModelInfo;
