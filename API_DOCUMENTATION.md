# 📡 SuperSID Pro Analytics - API Documentation

**Complete REST API reference and usage guide**

**Last Updated**: 2025-11-03 21:26:23 UTC
**Version**: 1.0.0

---

## 📋 Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Common Headers](#common-headers)
- [Status Codes](#status-codes)
- [Observatories](#observatories)
- [Stations](#stations)
- [Signals](#signals)
- [Analysis](#analysis)
- [Solar Center](#solar-center)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

---

## 🌟 Overview

SuperSID Pro Analytics provides a RESTful API for:

- Managing observatories and stations
- Storing and retrieving VLF signal data
- Space weather analysis
- Solar-VLF correlation studies
- Stanford Solar Center file uploads

### API Characteristics

| Feature | Details |
|---------|---------|
| **Format** | JSON |
| **Protocol** | HTTP/HTTPS |
| **Authentication** | Token-based (future) |
| **Rate Limit** | Unlimited (dev), 1000/hour (prod) |
| **Timeout** | 30 seconds |
| **CORS** | Enabled for configured origins |

---

## 🌐 Base URL

### Development
```
http://localhost:3001/api
```

### Production
```
https://api.supersid-pro.com/api
```

---

## 🔐 Authentication

Currently **no authentication required** for development.

### Future: API Key Authentication

```bash
# Header
X-API-Key: your-api-key-here
```

### Future: Bearer Token

```bash
# Header
Authorization: Bearer your-jwt-token-here
```

---

## 📨 Common Headers

### Request Headers

```
Content-Type: application/json
Accept: application/json
X-API-Key: optional-api-key
User-Agent: YourApp/1.0
```

### Response Headers

```
Content-Type: application/json
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699000000
```

---

## ✅ Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created |
| 204 | No Content | Success, no response body |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |
| 503 | Service Unavailable | Server down |

---

## 🏢 Observatories

### Get All Observatories

```http
GET /api/observatories
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Stanford Observatory",
      "latitude": 37.4275,
      "longitude": -122.1697,
      "altitude": 29,
      "created_at": "2025-11-03T18:00:00Z"
    },
    {
      "id": 2,
      "name": "MIT Observatory",
      "latitude": 42.3601,
      "longitude": -71.0589,
      "altitude": 50,
      "created_at": "2025-11-03T18:05:00Z"
    }
  ]
}
```

---

### Get Observatory by ID

```http
GET /api/observatories/:id
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | integer | yes | Observatory ID |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Stanford Observatory",
    "latitude": 37.4275,
    "longitude": -122.1697,
    "altitude": 29,
    "created_at": "2025-11-03T18:00:00Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": "Observatory not found",
  "status": 404
}
```

---

### Create Observatory

```http
POST /api/observatories
Content-Type: application/json

{
  "name": "New Observatory",
  "latitude": 40.1234,
  "longitude": -105.5678,
  "altitude": 1500
}
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Observatory name (unique) |
| latitude | number | yes | Latitude (-90 to 90) |
| longitude | number | yes | Longitude (-180 to 180) |
| altitude | number | no | Altitude in meters |

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "New Observatory",
    "latitude": 40.1234,
    "longitude": -105.5678,
    "altitude": 1500,
    "created_at": "2025-11-03T21:26:23Z"
  }
}
```

---

### Update Observatory

```http
PUT /api/observatories/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "latitude": 40.1234,
  "longitude": -105.5678,
  "altitude": 1500
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Name",
    "latitude": 40.1234,
    "longitude": -105.5678,
    "altitude": 1500,
    "created_at": "2025-11-03T18:00:00Z"
  }
}
```

---

### Delete Observatory

```http
DELETE /api/observatories/:id
```

**Response** (204 No Content):
```
[Empty body]
```

---

## 🏪 Stations

### Get All Stations

```http
GET /api/stations
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "observatory_id": 1,
      "name": "VLF Receiver A",
      "frequency": 24000,
      "antenna_type": "Long Wire",
      "created_at": "2025-11-03T18:00:00Z"
    }
  ]
}
```

---

### Get Station by ID

```http
GET /api/stations/:id
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "observatory_id": 1,
    "name": "VLF Receiver A",
    "frequency": 24000,
    "antenna_type": "Long Wire",
    "created_at": "2025-11-03T18:00:00Z"
  }
}
```

---

### Get Stations by Observatory

```http
GET /api/observatories/:observatory_id/stations
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "observatory_id": 1,
      "name": "VLF Receiver A",
      "frequency": 24000,
      "antenna_type": "Long Wire",
      "created_at": "2025-11-03T18:00:00Z"
    }
  ]
}
```

---

### Create Station

```http
POST /api/stations
Content-Type: application/json

{
  "observatory_id": 1,
  "name": "VLF Receiver B",
  "frequency": 24000,
  "antenna_type": "Long Wire"
}
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| observatory_id | integer | yes | Observatory ID (must exist) |
| name | string | yes | Station name |
| frequency | number | no | Frequency in Hz (default: 24000) |
| antenna_type | string | no | Type of antenna |

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "observatory_id": 1,
    "name": "VLF Receiver B",
    "frequency": 24000,
    "antenna_type": "Long Wire",
    "created_at": "2025-11-03T21:26:23Z"
  }
}
```

---

### Update Station

```http
PUT /api/stations/:id
Content-Type: application/json

{
  "name": "Updated Receiver",
  "antenna_type": "Ferrite Loop"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "observatory_id": 1,
    "name": "Updated Receiver",
    "frequency": 24000,
    "antenna_type": "Ferrite Loop",
    "created_at": "2025-11-03T18:00:00Z"
  }
}
```

---

### Delete Station

```http
DELETE /api/stations/:id
```

**Response** (204 No Content):
```
[Empty body]
```

---

## 📊 Signals

### Get Recent Signals

```http
GET /api/signals?station_id=1&limit=1000&hours=24
```

**Query Parameters**:
| Name | Type | Default | Description |
|------|------|---------|-------------|
| station_id | integer | - | Filter by station ID |
| limit | integer | 1000 | Maximum results |
| hours | integer | 24 | Last N hours |
| start_date | string | - | Start date (ISO 8601) |
| end_date | string | - | End date (ISO 8601) |

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "station_id": 1,
      "timestamp": "2025-11-03T12:00:00Z",
      "amplitude": 45.5,
      "frequency": 24000.5,
      "quality": 85.0,
      "created_at": "2025-11-03T12:00:05Z"
    },
    {
      "id": 12346,
      "station_id": 1,
      "timestamp": "2025-11-03T12:01:00Z",
      "amplitude": 46.2,
      "frequency": 24000.3,
      "quality": 87.0,
      "created_at": "2025-11-03T12:01:05Z"
    }
  ],
  "meta": {
    "total": 1440,
    "limit": 1000,
    "returned": 1000
  }
}
```

---

### Get Signals by Station

```http
GET /api/stations/:station_id/signals
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "station_id": 1,
      "timestamp": "2025-11-03T12:00:00Z",
      "amplitude": 45.5,
      "frequency": 24000.5,
      "quality": 85.0,
      "created_at": "2025-11-03T12:00:05Z"
    }
  ],
  "statistics": {
    "count": 1440,
    "avg_amplitude": 47.3,
    "max_amplitude": 65.2,
    "min_amplitude": 35.1,
    "avg_quality": 82.5
  }
}
```

---

### Create Signal

```http
POST /api/signals
Content-Type: application/json

{
  "station_id": 1,
  "timestamp": "2025-11-03T12:00:00Z",
  "amplitude": 45.5,
  "frequency": 24000.5,
  "quality": 85.0
}
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| station_id | integer | yes | Station ID |
| timestamp | string | yes | ISO 8601 format |
| amplitude | number | yes | Signal amplitude (dBm) |
| frequency | number | no | Measured frequency (Hz) |
| quality | number | no | Quality score (0-100) |

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 12347,
    "station_id": 1,
    "timestamp": "2025-11-03T12:00:00Z",
    "amplitude": 45.5,
    "frequency": 24000.5,
    "quality": 85.0,
    "created_at": "2025-11-03T21:26:23Z"
  }
}
```

---

### Bulk Insert Signals

```http
POST /api/signals/bulk
Content-Type: application/json

{
  "station_id": 1,
  "signals": [
    {
      "timestamp": "2025-11-03T12:00:00Z",
      "amplitude": 45.5,
      "frequency": 24000.5,
      "quality": 85.0
    },
    {
      "timestamp": "2025-11-03T12:01:00Z",
      "amplitude": 46.2,
      "frequency": 24000.3,
      "quality": 87.0
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "inserted": 2,
    "duplicates": 0,
    "errors": 0
  }
}
```

---

## 📈 Analysis

### Get Space Weather

```http
GET /api/analysis/space-weather
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-11-03T21:26:23Z",
    "kIndex": 3,
    "solarFlux": 150,
    "activeRegions": 5,
    "sunspots": 20,
    "xrayClass": "A",
    "magneticStorm": "none",
    "forecast": {
      "kIndex_24h": 4,
      "kIndex_48h": 3,
      "probability_storm": 15
    }
  }
}
```

---

### Get Solar Forecast

```http
GET /api/analysis/space-weather/forecast
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-11-04T00:00:00Z",
      "kIndex": 4,
      "solarFlux": 160,
      "activeRegions": 5,
      "xrayClass": "B",
      "probability_flare": 20
    },
    {
      "timestamp": "2025-11-05T00:00:00Z",
      "kIndex": 3,
      "solarFlux": 155,
      "activeRegions": 4,
      "xrayClass": "A",
      "probability_flare": 10
    }
  ]
}
```

---

### Get VLF Analysis

```http
GET /api/analysis/vlf/:station_id?hours=24
```

**Query Parameters**:
| Name | Type | Default | Description |
|------|------|---------|-------------|
| hours | integer | 24 | Analysis window |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "station_id": 1,
    "period": "24 hours",
    "timestamp": "2025-11-03T21:26:23Z",
    "statistics": {
      "total_samples": 1440,
      "avg_amplitude": 47.3,
      "peak_amplitude": 65.2,
      "min_amplitude": 35.1,
      "std_deviation": 5.8,
      "avg_quality": 82.5
    },
    "anomalies": [
      {
        "timestamp": "2025-11-03T14:35:00Z",
        "amplitude": 65.2,
        "deviation_std": 3.2,
        "severity": "high"
      }
    ]
  }
}
```

---

### Get Correlation

```http
GET /api/analysis/correlation/:station_id?days=30
```

**Query Parameters**:
| Name | Type | Default | Description |
|------|------|---------|-------------|
| days | integer | 30 | Analysis period |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "station_id": 1,
    "period": "30 days",
    "analysis_timestamp": "2025-11-03T21:26:23Z",
    "correlation": {
      "coefficient": 0.45,
      "p_value": 0.001,
      "relationship": "moderate-positive",
      "confidence": 75
    },
    "summary": "Moderate positive correlation detected between solar activity and VLF disturbances",
    "events": [
      {
        "solar_event_date": "2025-10-28T06:00:00Z",
        "vlf_disturbance_date": "2025-10-28T12:30:00Z",
        "lag_hours": 6.5,
        "correlation_strength": "strong"
      }
    ]
  }
}
```

---

## ☀️ Solar Center

### Get Upload History

```http
GET /api/solar-center/uploads?station_id=1&limit=50
```

**Query Parameters**:
| Name | Type | Default | Description |
|------|------|---------|-------------|
| station_id | integer | - | Filter by station |
| status | string | - | Filter by status |
| limit | integer | 50 | Maximum results |

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "station_id": 1,
      "date": "2025-11-03",
      "status": "success",
      "details": "File uploaded successfully",
      "created_at": "2025-11-03T21:26:23Z"
    }
  ]
}
```

---

### Send Daily Data

```http
POST /api/solar-center/send-daily
Content-Type: application/json

{
  "station_id": 1,
  "date": "2025-11-03",
  "monitor_id": "M001"
}
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| station_id | integer | yes | Station ID |
| date | string | yes | Date (YYYY-MM-DD) |
| monitor_id | string | yes | Monitor ID for Stanford |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "station_id": 1,
    "date": "2025-11-03",
    "status": "success",
    "message": "File uploaded: Station_M001_2025-11-03.csv",
    "file_size": 125432,
    "records": 1440
  }
}
```

---

## ❌ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "status": 400,
  "details": {
    "field": "Additional details if applicable"
  }
}
```

### Common Errors

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request parameters",
  "status": 400,
  "details": {
    "latitude": "Must be between -90 and 90",
    "longitude": "Must be between -180 and 180"
  }
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Observatory not found",
  "status": 404
}
```

#### 409 Conflict
```json
{
  "success": false,
  "error": "Observatory with this name already exists",
  "status": 409
}
```

#### 422 Unprocessable
```json
{
  "success": false,
  "error": "Validation failed",
  "status": 422,
  "details": {
    "name": "Name is required",
    "latitude": "Latitude must be a number"
  }
}
```

#### 500 Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "status": 500,
  "details": {
    "message": "Database connection failed"
  }
}
```

---

## 🚦 Rate Limiting

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699000000
```

### Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Read endpoints | 1000 | 1 hour |
| Write endpoints | 100 | 1 hour |
| Bulk operations | 10 | 1 hour |

### Exceeded Limit Response

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "status": 429,
  "retry_after": 3600
}
```

---

## 📝 Examples

### cURL Examples

#### Get All Observatories
```bash
curl -X GET http://localhost:3001/api/observatories \
  -H "Content-Type: application/json"
```

#### Create Observatory
```bash
curl -X POST http://localhost:3001/api/observatories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Observatory",
    "latitude": 40.1234,
    "longitude": -105.5678,
    "altitude": 1500
  }'
```

#### Get Signals by Station
```bash
curl -X GET "http://localhost:3001/api/stations/1/signals?limit=100" \
  -H "Content-Type: application/json"
```

#### Get Space Weather
```bash
curl -X GET http://localhost:3001/api/analysis/space-weather \
  -H "Content-Type: application/json"
```

### JavaScript/Fetch Examples

```javascript
// Get all observatories
fetch('http://localhost:3001/api/observatories')
  .then(response => response.json())
  .then(data => console.log(data));

// Create observatory
fetch('http://localhost:3001/api/observatories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'New Observatory',
    latitude: 40.1234,
    longitude: -105.5678,
    altitude: 1500
  })
})
  .then(response => response.json())
  .then(data => console.log(data));

// Get analysis
fetch('http://localhost:3001/api/analysis/correlation/1?days=30')
  .then(response => response.json())
  .then(data => console.log(data));
```

---

## 📞 Support

For deployment information, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).

**Last Updated**: 2025-11-03 21:26:23 UTC
**Maintained by**: @alearecuest