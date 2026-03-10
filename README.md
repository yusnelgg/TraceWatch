# TraceWatch

API Monitoring Dashboard - Real-time service health monitoring with Grafana-style interface.

![TraceWatch](https://img.shields.io/badge/Version-2.0.0-blue) ![Go](https://img.shields.io/badge/Go-1.21+-00ADD8) ![React](https://img.shields.io/badge/React-18.2-61DAFB) ![Wails](https://img.shields.io/badge/Wails-2.11-000000)

## Features

### Real-time Monitoring
- **Multi-endpoint monitoring** - Check multiple APIs simultaneously
- **Configurable intervals** - 3s, 5s, 10s, 30s, 1min
- **Parallel checks** - All endpoints checked concurrently

### Advanced Metrics
- **Latency tracking** - Total, DNS, Connect, TLS, TTFB
- **Percentiles** - P95, P99 latency
- **Uptime calculation** - Per-service and global
- **Response size** - Content length tracking

### SSL/TLS Analysis
- SSL certificate detection
- Certificate validity status
- Days until expiration

### Alerting System
- Real-time down detection
- Alert history with timestamps
- Error classification (DNS, Timeout, SSL, etc.)

### Visualization (Grafana-style)
- Response time trends
- Status distribution pie chart
- Availability timeline
- Response time distribution
- Latency gauge
- Service cards with mini-charts

## Tech Stack

- **Backend**: Go with Wails 2.0
- **Frontend**: React 18 + Vite
- **Charts**: ECharts
- **Desktop**: WebView2 (Windows)

## Getting Started

### Prerequisites
- Go 1.21+
- Node.js 18+
- Wails CLI (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

### Development

```bash
# Install dependencies
cd frontend && npm install

# Run in development mode
wails dev
```

### Build

```bash
# Build for Windows
wails build

# Output: build/bin/TraceWatch.exe
```

## Project Structure

```
TraceWatch/
├── app.go                 # Backend - API checks & health monitoring
├── main.go               # Wails application entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatsGrid.jsx
│   │   │   ├── ServiceCard.jsx
│   │   │   ├── AlertsPanel.jsx
│   │   │   └── Charts.jsx
│   │   ├── hooks/        # Custom React hooks
│   │   │   └── useMonitoring.js
│   │   ├── App.jsx       # Main application
│   │   └── App.css       # Global styles
│   └── package.json
├── build/                # Build configuration
└── wails.json           # Wails configuration
```

## API Endpoints (Backend)

### CheckAPI
Check a single API endpoint.

```go
func (a *App) CheckAPI(url string) (*APIResult, error)
```

### CheckMultiple
Check multiple APIs in parallel.

```go
func (a *App) CheckMultiple(urls []string) []APIResult
```

### HealthCheck
Perform a health check on a single endpoint.

```go
func (a *App) HealthCheck(url string) (*HealthCheckResult, error)
```

### CheckHealthMultiple
Batch health check with summary.

```go
func (a *App) CheckHealthMultiple(urls []string) (*BatchHealthCheck, error)
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| URL | string | Original URL |
| Status | int | HTTP status code |
| Latency | int64 | Total response time (ms) |
| LatencyDNS | int64 | DNS lookup time (ms) |
| LatencyConnect | int64 | TCP connect time (ms) |
| LatencyTLS | int64 | TLS handshake time (ms) |
| LatencyTTFB | int64 | Time to first byte (ms) |
| SSLEnabled | bool | SSL/TLS enabled |
| SSLValid | bool | Certificate valid |
| SSLExpiryDays | int | Days until expiry |
| Error | string | Error message if failed |
| Time | string | Check timestamp |

## Usage

1. **Add Services**: Enter API URLs in the input field
2. **Start Monitoring**: Click "Start" to begin automatic checks
3. **View Metrics**: Check Overview, Services, Analytics tabs
4. **Review Alerts**: See Alerts panel for down services
5. **Configure**: Adjust intervals in Settings

## Keyboard Shortcuts

- `Enter` - Add service when focused on input

## Data Storage

- Services and settings stored in localStorage
- Persists between sessions

## License

MIT License
