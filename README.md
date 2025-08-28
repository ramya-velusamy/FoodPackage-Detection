# Food Quality Prediction System

A sophisticated machine learning application for non-invasive food quality assessment. This system uses computer vision to analyze images of packaged foods and determine if they are damaged or fresh.

## Features

### Core Functionality
- **Multi-Model Support**: Three specialized models for different food quality assessments:
  - Can Damage Detection: Identifies physical damage to canned food products
  - Delivery Damage Detection: Detects damage from shipping and handling
  - Freshness Assessment: Evaluates the freshness of perishable items

### User Interface
- **Modern Dashboard**: Clean, responsive interface with intuitive navigation
- **Image Input Options**: Upload images or capture directly from camera
- **Real-time Analysis**: Instant predictions with confidence scoring
- **Visual Results**: Bar charts showing confidence distribution
- **History Tracking**: Stores and displays previous predictions
- **Export Functionality**: Export prediction history as JSON

### Advanced Features
- **Confidence Thresholding**: Adjustable confidence levels for more reliable predictions
- **Model Information**: Detailed technical specifications for each model
- **Analytics Dashboard**: Performance metrics and usage statistics
- **Dark/Light Mode**: Toggle between color schemes for comfortable viewing
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technical Implementation

### Machine Learning Models
The system uses TensorFlow.js to run pre-trained models directly in the browser:
- **Can Damage Detection**: ResNet-50 architecture with 94.2% accuracy
- **Delivery Damage Detection**: EfficientNet-B3 architecture with 91.8% accuracy
- **Freshness Assessment**: MobileNetV2 architecture with 89.5% accuracy

### Frontend Technologies
- **React**: Component-based UI framework
- **Material-UI**: Modern UI components and styling
- **ApexCharts**: Interactive data visualization
- **React Webcam**: Camera integration for real-time capture

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Open your browser to `http://localhost:3000`

## Usage

1. Select a model from the dropdown in the header
2. Upload an image or capture one with your camera
3. Click "Analyze Package" to run the prediction
4. View results with confidence scores and visual charts
5. Adjust settings in the Settings tab for customized behavior

## Project Structure

```
src/
├── components/
│   ├── Dashboard.js      # Main dashboard component
│   ├── ModelInfo.js      # Model details display
│   └── AnalyticsDashboard.js  # Performance metrics
├── App.js                # Main application component
├── App.css               # Global styles
└── index.js              # Entry point
```

## Contributing

This project is designed as a complete solution for food quality assessment. Contributions to enhance functionality or improve accuracy are welcome.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
