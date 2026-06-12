const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3050;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configuration
const THINGSPEAK_CHANNEL_ID = '******************';
const THINGSPEAK_API_KEY = '*****************';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '*******************';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Fetch health data from ThingSpeak
async function fetchHealthData() {
  try {
    const response = await axios.get(
      `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_API_KEY}&results=10`
    );
    
    if (response.data.feeds && response.data.feeds.length > 0) {
      const feeds = response.data.feeds;
      const latestData = feeds[feeds.length - 1];
      
      return {
        heartRate: parseInt(latestData.field1) || 0,
        spO2: parseInt(latestData.field2) || 0,
        temperature: parseFloat(latestData.field3) || 0,
        humidity: parseInt(latestData.field4) || 0,
        alertThreshold: parseInt(latestData.field5) || 0,
        recentData: feeds.slice(-10).map(f => ({
          heartRate: parseInt(f.field1) || 0,
          spO2: parseInt(f.field2) || 0,
          temperature: parseFloat(f.field3) || 0,
          humidity: parseInt(f.field4) || 0,
          timestamp: f.created_at
        }))
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching ThingSpeak data:', error.message);
    return null;
  }
}

// Analyze health data with Google Gemini
async function analyzeHealthData(healthData) {
  try {
    const prompt = `You are a health monitoring AI assistant. Analyze the following health data and provide:
1. Current health status assessment
2. Any concerning trends or anomalies
3. Health recommendations
4. Risk assessment (low/medium/high)

dont include any disclaimers about not being a doctor, just provide the analysis based on the data.
dont include technical recommendations, only health-related advice.

Health Data:
- Heart Rate: ${healthData.heartRate} BPM (Normal range: 60-100)
- Blood Oxygen (SpO2): ${healthData.spO2}% (Normal: 95-100%)
- Temperature: ${healthData.temperature}°C (Normal: 36.0-37.5°C)
- Humidity: ${healthData.humidity}%

Recent 10 readings trends:
${healthData.recentData.map((d, i) => `${i+1}. HR: ${d.heartRate}, SpO2: ${d.spO2}, Temp: ${d.temperature}, Time: ${d.timestamp}`).join('\n')}

Provide a detailed analysis in JSON format with the following fields:
{
  "status": "normal/warning/critical",
  "summary": "brief summary",
  "analysis": "detailed analysis",
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "riskLevel": "low/medium/high",
  "metrics": {
    "heartRateStatus": "normal/abnormal",
    "spO2Status": "normal/abnormal",
    "temperatureStatus": "normal/abnormal"
  }
}`;

    const result = await model.generateContent(prompt);
    const message = await result.response;
    const responseText = message.text();


    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      status: 'normal',
      summary: 'Analysis complete',
      analysis: responseText,
      recommendations: [],
      riskLevel: 'low',
      metrics: {
        heartRateStatus: 'normal',
        spO2Status: 'normal',
        temperatureStatus: 'normal'
      }
    };
  } catch (error) {
    console.error('Error analyzing health data:', error.message);
    return {
      status: 'error',
      summary: 'Analysis failed',
      analysis: error.message,
      recommendations: [],
      riskLevel: 'unknown'
    };
  }
}

// API Endpoint: Get health data with AI analysis
app.get('/api/health-analysis', async (req, res) => {
  try {
    console.log('Fetching health data and AI analysis...');
    
    const healthData = await fetchHealthData();
    
    if (!healthData) {
      return res.status(404).json({
        error: 'No health data available',
        message: 'ThingSpeak has no data yet. Ensure your Arduino is running and uploading data.'
      });
    }

    // Analyze with AI
    const analysis = await analyzeHealthData(healthData);

    res.json({
      success: true,
      currentMetrics: {
        heartRate: healthData.heartRate,
        spO2: healthData.spO2,
        temperature: healthData.temperature,
        humidity: healthData.humidity
      },
      analysis: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in health analysis endpoint:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

// API Endpoint: Get raw health data only
app.get('/api/health-data', async (req, res) => {
  try {
    const healthData = await fetchHealthData();
    
    if (!healthData) {
      return res.status(404).json({
        error: 'No health data available'
      });
    }

    res.json({
      success: true,
      data: healthData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch data',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'Server running',
    timestamp: new Date().toISOString(),
    endpoints: {
      analysis: '/api/health-analysis',
      data: '/api/health-data',
      status: '/api/status'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Health Monitoring AI Server running on http://localhost:${PORT}`);
  console.log(`\n📊 Endpoints:`);
  console.log(`   GET /api/health-analysis  - Get health data with AI analysis`);
  console.log(`   GET /api/health-data      - Get raw health data`);
  console.log(`   GET /api/status           - Server status`);
  console.log(`\n📝 Open http://localhost:${PORT}/dashboard.html in your browser\n`);
});
