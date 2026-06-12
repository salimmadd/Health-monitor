# Health Monitoring System - Dashboard Setup Guide

## 📋 Project Overview

This is a complete health monitoring system that uses:
- **Arduino (ESP32)** with sensors for real-time health data collection
- **ThingSpeak** cloud platform for data storage
- **Web Dashboard** for real-time visualization and alerts

## 🎯 System Components

### Hardware
- **ESP32 DevKit C v4** - Main microcontroller
- **DHT22** - Temperature and Humidity sensor
- **3x Potentiometers** - Simulate Heart Rate, SpO2, and Alert Threshold
- **OLED Display (SSD1306)** - Local display
- **Buzzer & LED** - Alert indicators

### Sensors & Data
| Sensor | Range | Field | Type |
|--------|-------|-------|------|
| Heart Rate (POT1) | 40-180 BPM | Field 1 | Integer |
| SpO2 (POT2) | 85-100 % | Field 2 | Integer |
| Temperature (DHT22) | 0-50 °C | Field 3 | Float |
| Humidity (DHT22) | 0-100 % | Field 4 | Float |
| Alert Threshold (POT3) | 30-45 | Field 5 | Integer |

## 🚀 Quick Start

### 1. Arduino Setup (Already Configured)
The sketch automatically:
- Connects to WiFi (Wokwi-GUEST network)
- Reads all sensors every second
- Uploads data to ThingSpeak every 20 seconds
- Displays data on OLED screen
- Triggers alerts via buzzer & LED


### 2. Open the Dashboard
1. Open `dashboard.html` in your web browser
2. The dashboard will automatically start fetching data from ThingSpeak
3. Data refreshes every 10 seconds (adjustable)

## 📊 Dashboard Features

### Real-Time Metrics
- ❤️ **Heart Rate** - BPM with normal/warning/critical indicators
- 🫁 **Oxygen Saturation** - SpO2 percentage
- 🌡️ **Temperature** - Body temperature in Celsius
- 💧 **Humidity** - Environmental humidity
- ⚙️ **Alert Threshold** - Current configured threshold

### Visual Indicators
- **Status Dot**: Green (Healthy) → Yellow (Warning) → Red (Critical)
- **Animated Heart Rate Icon**: Pulses with system status
- **Color-Coded Status Badges**: Visual feedback for each metric

### Charts & Trends
- **Heart Rate Chart**: 30-minute trend with line graph
- **SpO2 Chart**: Oxygen saturation over time
- **Environmental Chart**: Temperature and humidity correlation

### Alert System
Automatic alerts for:
- **Heart Rate**: Low (<60 BPM) or High (>100 BPM)
- **SpO2**: Warning (<95%) or Critical (<90%)
- **Temperature**: Elevated (>37.5°C) or High Fever (>38.5°C)
- **Hypothermia**: Temperature <35.5°C

## 🎮 Control Panel

### Manual Controls
- **🔄 Refresh Now** - Fetch latest data immediately
- **Clear Alerts** - Remove all historical alerts
- **Auto Refresh: ON/OFF** - Toggle automatic updates
- **Refresh Interval** - Set refresh rate (5-60 seconds)

## ⚙️ Configuration

### Change Refresh Interval
In the dashboard, modify the refresh interval:
```
Refresh Interval (seconds): [10] ← Change this value
```

### Adjust Alert Thresholds
Edit the `checkAlerts()` function in `dashboard.html`:
```javascript
if (hr < 60) { /* Lower bound for heart rate */ }
if (spo2 < 90) { /* Critical SpO2 level */ }
if (temp > 38.5) { /* High fever threshold */ }
```

### Change Colors & Styling
Modify the CSS section in `dashboard.html` to customize:
- Color scheme
- Font sizes
- Card layouts
- Animation speeds

## 📱 Responsive Design
The dashboard is fully responsive and works on:
- Desktop browsers (recommended)
- Tablets
- Mobile phones

## 🔐 Data Storage & Privacy
- Data is stored on ThingSpeak cloud
- Publicly readable (public API)
- Retained for 15 days by default
- Can be exported as CSV from ThingSpeak

## 🛠️ Troubleshooting

### Dashboard Not Updating
1. Check internet connection
2. Verify ThingSpeak Channel ID (2615850)
3. Wait 20 seconds for Arduino to upload first data
4. Click "Refresh Now" button
5. Check browser console for errors (F12)

### No Data Points
- Ensure Arduino is running on Wokwi
- Check serial monitor for "WiFi Connected"
- Verify potentiometers are being read (should see changing values)

### Alerts Not Triggering
- Check alert thresholds in `checkAlerts()` function
- Verify sensor values are within trigger ranges
- Open browser console to see debug info

## 📈 Usage Tips

### Simulating Different Conditions
Adjust the potentiometers on Wokwi to simulate:
- **POT1**: Increase for high heart rate (tachycardia), decrease for bradycardia
- **POT2**: Lower for hypoxia (SpO2 <90%), normal range 95-100%
- **POT3**: Adjust alert sensitivity threshold

### Monitoring Trends
- Watch the charts for patterns over time
- Use zoom/scroll to analyze specific time ranges
- Export data from ThingSpeak for further analysis

### Setting Up Notifications
For production use, integrate:
- **Email alerts** via ThingSpeak Reaction
- **SMS alerts** via ThingSpeak to IFTTT
- **Push notifications** via mobile app

## 📝 Data Fields Reference

| Field | Range | Normal | Warning | Critical |
|-------|-------|--------|---------|----------|
| HR | 40-180 | 60-100 | <60, >100 | <50, >140 |
| SpO2 | 85-100 | ≥95 | 90-94 | <90 |
| Temp | 0-50°C | 36-37.5 | 35.5-38.5 | <35.5, >38.5 |
| Humidity | 0-100 | 30-60 | <30, >70 | N/A |

## 🔗 Resources

- **ThingSpeak Documentation**: https://thingspeak.com/docs
- **ESP32 Docs**: https://docs.espressif.com/
- **Chart.js Docs**: https://www.chartjs.org/docs/latest/
- **DHT22 Sensor**: https://www.adafruit.com/product/385

## 📄 Files

- **sketch.ino** - Arduino/ESP32 firmware
- **diagram.json** - Wokwi circuit diagram
- **dashboard.html** - Web dashboard (this file)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the serial output from Arduino
3. Verify ThingSpeak connection
4. Check browser console for JavaScript errors

---

**Last Updated**: June 11, 2026  
**Status**: Active and Monitoring
