import { useState, useEffect, useCallback } from "react";
import "./App.css";
import { CheckMultiple } from "../wailsjs/go/main/App";
import ReactECharts from "echarts-for-react";

const MAX_HISTORY = 60;

function App() {
  const [inputUrl, setInputUrl] = useState("");
  const [apis, setApis] = useState(() => {
    const saved = localStorage.getItem("tracewatch_apis");
    return saved ? JSON.parse(saved) : [];
  });
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState({});
  const [intervalId, setIntervalId] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ total: 0, up: 0, down: 0, avgLatency: 0 });

  useEffect(() => {
    localStorage.setItem("tracewatch_apis", JSON.stringify(apis));
  }, [apis]);

  useEffect(() => {
    const downApis = results.filter(r => r.status !== 200);
    setAlerts(downApis.map(r => ({
      url: r.url,
      error: r.error || `Status ${r.status}`,
      time: r.time
    })));
  }, [results]);

  useEffect(() => {
    const total = results.length;
    const up = results.filter(r => r.status === 200).length;
    const down = total - up;
    const avgLatency = results.filter(r => r.latency).reduce((acc, r) => acc + r.latency, 0) / (results.filter(r => r.latency).length || 1);
    setStats({ total, up, down, avgLatency: Math.round(avgLatency) });
  }, [results]);

  const addAPI = () => {
    if (!inputUrl.trim()) return;
    let url = inputUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    if (apis.includes(url)) return;
    setApis([...apis, url]);
    setInputUrl("");
  };

  const removeAPI = (url) => {
    setApis(apis.filter(a => a !== url));
    setHistory(h => {
      const newH = { ...h };
      delete newH[url];
      return newH;
    });
  };

  const checkAll = useCallback(async () => {
    if (apis.length === 0) return;
    const res = await CheckMultiple(apis);
    setResults(res);
    setLastCheck(new Date());

    const newHistory = { ...history };
    res.forEach(api => {
      if (!newHistory[api.url]) newHistory[api.url] = [];
      newHistory[api.url] = [
        ...newHistory[api.url].slice(-MAX_HISTORY),
        { latency: api.latency, status: api.status, time: api.time }
      ];
    });
    setHistory(newHistory);
  }, [apis, history]);

  const start = () => {
    if (intervalId) return;
    checkAll();
    const id = setInterval(checkAll, 5000);
    setIntervalId(id);
    setIsMonitoring(true);
  };

  const stop = () => {
    clearInterval(intervalId);
    setIntervalId(null);
    setIsMonitoring(false);
  };

  const clearHistory = () => {
    setHistory({});
    setResults([]);
    setAlerts([]);
  };

  const getUptime = (url) => {
    const h = history[url] || [];
    if (h.length === 0) return 0;
    const up = h.filter(d => d.status === 200).length;
    return Math.round((up / h.length) * 100);
  };

  const getAvgLatency = (url) => {
    const h = history[url] || [];
    if (h.length === 0) return 0;
    const latencies = h.filter(d => d.latency);
    if (latencies.length === 0) return 0;
    return Math.round(latencies.reduce((acc, d) => acc + d.latency, 0) / latencies.length);
  };

  const chartOptions = (data, isDown) => {
    const times = data.map(d => d.time);
    const latencies = data.map(d => d.latency || 0);
    const colors = isDown ? '#ef4444' : '#22c55e';
    
    return {
      tooltip: { 
        trigger: "axis",
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      grid: { left: 40, right: 10, top: 20, bottom: 25 },
      xAxis: {
        type: "category",
        data: times,
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      yAxis: {
        type: "value",
        name: "ms",
        nameTextStyle: { color: '#64748b' },
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155' } }
      },
      series: [{
        data: latencies,
        type: "line",
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: colors, width: 2 },
        itemStyle: { color: colors },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: colors + '40' },
              { offset: 1, color: colors + '05' }
            ]
          }
        }
      }]
    };
  };

  const overallChartOptions = () => {
    const allData = Object.entries(history).flatMap(([url, data]) => 
      (data || []).map(d => ({ ...d, url: url.replace('https://', '').replace('http://', '') }))
    );
    if (allData.length === 0) return null;

    const grouped = {};
    allData.forEach(d => {
      if (!grouped[d.time]) grouped[d.time] = [];
      grouped[d.time].push(d.latency || 0);
    });

    const times = Object.keys(grouped).slice(-30);
    const avgLatencies = times.map(t => 
      Math.round(grouped[t].reduce((a, b) => a + b, 0) / grouped[t].length)
    );

    return {
      tooltip: { trigger: "axis" },
      grid: { left: 50, right: 20, top: 30, bottom: 30 },
      xAxis: {
        type: "category",
        data: times,
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      yAxis: {
        type: "value",
        name: "ms",
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155' } }
      },
      series: [{
        data: avgLatencies,
        type: "line",
        smooth: true,
        lineStyle: { color: '#3b82f6', width: 2 },
        itemStyle: { color: '#3b82f6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#3b82f640' },
              { offset: 1, color: '#3b82f605' }
            ]
          }
        }
      }]
    };
  };

  const statusChartOptions = () => {
    return {
      tooltip: { trigger: "item" },
      series: [{
        type: "pie",
        radius: ["50%", "75%"],
        center: ["50%", "50%"],
        data: [
          { value: stats.up, name: "UP", itemStyle: { color: "#22c55e" } },
          { value: stats.down, name: "DOWN", itemStyle: { color: "#ef4444" } }
        ],
        label: { color: '#f1f5f9', fontSize: 11 },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
        }
      }]
    };
  };

  return (
    <div className="app">
      <header className="mainHeader">
        <div className="headerLeft">
          <div className="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div>
            <h1>TraceWatch</h1>
            <p>Real-time API Monitoring</p>
          </div>
        </div>
        <div className="headerRight">
          <div className="statusIndicator">
            <span className={`dot ${isMonitoring ? 'pulse' : ''}`}></span>
            {isMonitoring ? 'Monitoring' : 'Paused'}
          </div>
          {lastCheck && (
            <div className="lastCheck">
              Last check: {lastCheck.toLocaleTimeString()}
            </div>
          )}
        </div>
      </header>

      {alerts.length > 0 && (
        <div className="alertsPanel">
          <div className="alertsHeader">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>{alerts.length} Service{alerts.length > 1 ? 's' : ''} Down!</span>
          </div>
          <div className="alertsList">
            {alerts.map((alert, i) => (
              <div key={i} className="alertItem">
                <span className="alertUrl">{alert.url.replace('https://', '').replace('http://', '')}</span>
                <span className="alertError">{alert.error}</span>
                <span className="alertTime">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="statsRow">
        <div className="statCard">
          <div className="statIcon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>
          <div className="statInfo">
            <span className="statValue">{stats.total}</span>
            <span className="statLabel">Total Services</span>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div className="statInfo">
            <span className="statValue">{stats.up}</span>
            <span className="statLabel">Online</span>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="statInfo">
            <span className="statValue">{stats.down}</span>
            <span className="statLabel">Offline</span>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon cyan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div className="statInfo">
            <span className="statValue">{stats.avgLatency}ms</span>
            <span className="statLabel">Avg Latency</span>
          </div>
        </div>
      </div>

      <div className="chartsRow">
        <div className="chartCard">
          <h3>Response Time Overview</h3>
          {Object.keys(history).length > 0 && (
            <ReactECharts option={overallChartOptions()} style={{ height: 200 }} />
          )}
          {Object.keys(history).length === 0 && (
            <div className="noData">No data yet. Start monitoring to see metrics.</div>
          )}
        </div>
        <div className="chartCard small">
          <h3>Status Distribution</h3>
          {stats.total > 0 ? (
            <ReactECharts option={statusChartOptions()} style={{ height: 200 }} />
          ) : (
            <div className="noData">No data</div>
          )}
        </div>
      </div>

      <div className="controlsBar">
        <div className="inputGroup">
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAPI()}
            placeholder="https://api.example.com/health"
          />
          <button className="btnAdd" onClick={addAPI}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add
          </button>
        </div>
        <div className="controlButtons">
          <button className="btnCheck" onClick={checkAll} disabled={apis.length === 0}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
            Check Now
          </button>
          {isMonitoring ? (
            <button className="btnStop" onClick={stop}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
              </svg>
              Stop
            </button>
          ) : (
            <button className="btnStart" onClick={start} disabled={apis.length === 0}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5,3 19,12 5,21 5,3"/>
              </svg>
              Start
            </button>
          )}
          <button className="btnClear" onClick={clearHistory}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            Clear
          </button>
        </div>
      </div>

      <div className="servicesGrid">
        {apis.length === 0 && (
          <div className="emptyState">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <h3>No services configured</h3>
            <p>Add your first API endpoint above to start monitoring</p>
          </div>
        )}
        {apis.map((api, i) => {
          const result = results.find(r => r.url.includes(api.replace('https://', '').replace('http://', '')));
          const data = history[api] || [];
          const isDown = result?.status !== 200;
          const uptime = getUptime(api);
          const avgLat = getAvgLatency(api);

          return (
            <div key={i} className={`serviceCard ${isDown ? 'down' : ''}`}>
              <div className="serviceHeader">
                <div className="serviceInfo">
                  <div className={`statusDot ${isDown ? 'error' : 'ok'}`}></div>
                  <span className="serviceUrl">{api.replace('https://', '').replace('http://', '')}</span>
                </div>
                <button className="removeBtn" onClick={() => removeAPI(api)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="serviceMetrics">
                <div className="metric">
                  <span className={`metricValue ${isDown ? 'error' : 'ok'}`}>
                    {result?.status || 'ERR'}
                  </span>
                  <span className="metricLabel">Status</span>
                </div>
                <div className="metric">
                  <span className="metricValue">
                    {result?.latency ? `${result.latency}ms` : '-'}
                  </span>
                  <span className="metricLabel">Latency</span>
                </div>
                <div className="metric">
                  <span className="metricValue">{avgLat}ms</span>
                  <span className="metricLabel">Avg</span>
                </div>
                <div className="metric">
                  <span className={`metricValue ${uptime >= 99 ? 'ok' : uptime >= 95 ? 'warn' : 'error'}`}>
                    {uptime}%
                  </span>
                  <span className="metricLabel">Uptime</span>
                </div>
              </div>

              <div className="serviceChart">
                <ReactECharts 
                  option={chartOptions(data, isDown)} 
                  style={{ height: 120 }} 
                />
              </div>

              {isDown && result?.error && (
                <div className="errorBanner">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {result.error}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
