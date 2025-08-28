import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress
} from '@mui/material';
import Chart from 'react-apexcharts';

function AnalyticsDashboard() {
  // Mock data for analytics
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setAnalyticsData({
        totalPredictions: 1248,
        accuracyTrend: {
          options: {
            chart: {
              id: 'accuracy-trend'
            },
            xaxis: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
            },
            title: {
              text: 'Accuracy Trend (Last 10 Months)',
              align: 'center'
            }
          },
          series: [
            {
              name: 'Can Damage',
              data: [85, 87, 89, 90, 91, 92, 93, 93, 94, 94]
            },
            {
              name: 'Delivery Damage',
              data: [82, 84, 85, 86, 87, 88, 89, 90, 91, 92]
            },
            {
              name: 'Freshness',
              data: [78, 80, 82, 83, 84, 85, 86, 87, 88, 89]
            }
          ]
        },
        predictionDistribution: {
          options: {
            chart: {
              type: 'donut',
            },
            labels: ['Can Damage', 'Delivery Damage', 'Freshness'],
            title: {
              text: 'Prediction Distribution',
              align: 'center'
            }
          },
          series: [45, 35, 20]
        },
        confidenceLevels: {
          options: {
            chart: {
              id: 'confidence-levels'
            },
            xaxis: {
              categories: ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%']
            },
            title: {
              text: 'Confidence Level Distribution',
              align: 'center'
            }
          },
          series: [
            {
              name: 'Predictions',
              data: [12, 45, 89, 234, 868]
            }
          ]
        }
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Predictions
              </Typography>
              <Typography variant="h3" color="primary">
                {analyticsData.totalPredictions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Predictions made since deployment
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Confidence
              </Typography>
              <Typography variant="h3" color="success.main">
                87.3%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all predictions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Uptime
              </Typography>
              <Typography variant="h3" color="secondary">
                99.8%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Chart
              options={analyticsData.accuracyTrend.options}
              series={analyticsData.accuracyTrend.series}
              type="line"
              height={350}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Chart
              options={analyticsData.predictionDistribution.options}
              series={analyticsData.predictionDistribution.series}
              type="donut"
              height={350}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Chart
              options={analyticsData.confidenceLevels.options}
              series={analyticsData.confidenceLevels.series}
              type="bar"
              height={350}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AnalyticsDashboard;
