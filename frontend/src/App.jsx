import { useState } from "react";
import "./App.css";
import { useMonitoring } from "./hooks/useMonitoring";
import { Sidebar } from "./components/Sidebar";
import { StatsGrid, QuickStats } from "./components/StatsGrid";
import { ServiceCard } from "./components/ServiceCard";
import { AlertsPanel } from "./components/AlertsPanel";
import { OverallChart, StatusPieChart, TimelineChart, GaugeChart, LatencyBarChart, ResponseTimeDistribution, LatencyRadarChart, UptimeHistoryChart, LatencyHeatmap, ErrorRateChart } from "./components/Charts";
import ReactECharts from "echarts-for-react";

function App() {
  const [activePanel, setActivePanel] = useState("overview");
  const [timeRange, setTimeRange] = useState("5m");
  const [analyticsTab, setAnalyticsTab] = useState("trends");
  
  const {
    apis,
    results,
    history,
    isMonitoring,
    lastCheck,
    alerts,
    alertHistory,
    settings,
    stats,
    overallStats,
    addAPI,
    removeAPI,
    checkAll,
    start,
    stop,
    clearHistory,
    clearAlertHistory,
    setSettings,
    getUptime,
    getAvgLatency,
    getP95
  } = useMonitoring();

  const [inputUrl, setInputUrl] = useState("");

  const handleAddAPI = () => {
    addAPI(inputUrl);
    setInputUrl("");
  };

  return (
    <div className="app">
      <Sidebar 
        activePanel={activePanel} 
        setActivePanel={setActivePanel} 
        isMonitoring={isMonitoring}
        alertsCount={alerts.length}
      />

      <main className="mainContent">
        <header className="topBar">
          <div className="topBarLeft">
            <h1>{activePanel.charAt(0).toUpperCase() + activePanel.slice(1)}</h1>
            <div className="timeRange">
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="1m">Last 1 min</option>
                <option value="5m">Last 5 min</option>
                <option value="15m">Last 15 min</option>
                <option value="1h">Last 1 hour</option>
                <option value="24h">Last 24 hours</option>
              </select>
            </div>
          </div>
          <div className="topBarRight">
            {lastCheck && <span className="lastUpdate">Last: {lastCheck.toLocaleTimeString()}</span>}
            <button className="btnRefresh" onClick={checkAll} disabled={apis.length === 0}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23,4 23,10 17,10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
            </button>
            <button className={isMonitoring ? 'btnStop' : 'btnStart'} onClick={isMonitoring ? stop : start} disabled={apis.length === 0}>
              {isMonitoring ? 'Stop' : 'Start'}
            </button>
          </div>
        </header>

        <div className="panelContent">
          {activePanel === 'overview' && (
            <>
              {alerts.length > 0 && (
                <div className="alertBanner">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>{alerts.length} service{alerts.length > 1 ? 's' : ''} down</span>
                  <div className="alertServices">
                    {alerts.slice(0, 5).map((a, i) => (
                      <span key={i} className="alertTag">{a.url.replace('https://', '').split('/')[0]}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <StatsGrid stats={stats} overallStats={overallStats} />
              
              <QuickStats stats={stats} />

              <div className="chartsGrid">
                <div className="chartPanel">
                  <div className="chartHeader">
                    <h3>Response Time Trend</h3>
                  </div>
                  <div className="chartBody">
                    {Object.keys(history).length > 0 ? (
                      <OverallChart history={history} />
                    ) : (
                      <div className="noData">No data. Start monitoring to see metrics.</div>
                    )}
                  </div>
                </div>
                <div className="chartPanel">
                  <div className="chartHeader">
                    <h3>Status Distribution</h3>
                  </div>
                  <div className="chartBody">
                    {stats.total > 0 ? (
                      <ReactECharts option={StatusPieChart(stats)} style={{ height: 250 }} />
                    ) : (
                      <div className="noData">No data</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="servicesQuickView">
                <div className="sectionHeader">
                  <h3>Services Status</h3>
                </div>
                <div className="servicesList">
                  {apis.length === 0 && <div className="noData">Add services to start monitoring</div>}
                  {apis.map((api, i) => {
                    const result = results.find(r => r.url.includes(api.replace('https://', '').replace('http://', '')));
                    const isDown = result?.status < 200 || result?.status >= 400;
                    return (
                      <div key={i} className={`serviceRow ${isDown ? 'down' : ''}`}>
                        <div className="serviceStatus">
                          <span className={`status-dot ${isDown ? 'error' : 'ok'}`}></span>
                          <span className="serviceName">{api.replace('https://', '').replace('http://', '')}</span>
                        </div>
                        <div className="serviceStats">
                          <span className={`status ${isDown ? 'error' : 'ok'}`}>{result?.status || 'N/A'}</span>
                          <span className="latency">{result?.latency ? `${result.latency}ms` : '-'}</span>
                          <span className="uptime">{getUptime(api)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activePanel === 'services' && (
            <>
              <div className="addServiceBar">
                <input
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAPI()}
                  placeholder="https://api.example.com/health"
                />
                <button className="btnAdd" onClick={handleAddAPI}>Add Service</button>
                <button className="btnClear" onClick={clearHistory}>Clear Data</button>
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
                  return (
                    <ServiceCard 
                      key={i}
                      api={api}
                      result={result}
                      history={history}
                      getUptime={getUptime}
                      getAvgLatency={getAvgLatency}
                      getP95={getP95}
                      removeAPI={removeAPI}
                    />
                  );
                })}
              </div>
            </>
          )}

          {activePanel === 'alerts' && (
            <AlertsPanel 
              alerts={alerts} 
              alertHistory={alertHistory} 
              onClearHistory={clearAlertHistory} 
            />
          )}

          {activePanel === 'analytics' && (
            <>
              <div className="tabs">
                <button className={`tab ${analyticsTab === 'trends' ? 'active' : ''}`} onClick={() => setAnalyticsTab('trends')}>
                  Trends
                </button>
                <button className={`tab ${analyticsTab === 'latency' ? 'active' : ''}`} onClick={() => setAnalyticsTab('latency')}>
                  Latency
                </button>
                <button className={`tab ${analyticsTab === 'uptime' ? 'active' : ''}`} onClick={() => setAnalyticsTab('uptime')}>
                  Uptime
                </button>
                <button className={`tab ${analyticsTab === 'errors' ? 'active' : ''}`} onClick={() => setAnalyticsTab('errors')}>
                  Errors
                </button>
              </div>

              {analyticsTab === 'trends' && (
                <div className="chartsGrid">
                  <div className="chartPanel chartPanelFull">
                    <div className="chartHeader">
                      <h3>Availability Timeline</h3>
                    </div>
                    <div className="chartBody">
                      {Object.keys(history).length > 0 ? (
                        <ReactECharts option={TimelineChart(history)} style={{ height: 300 }} />
                      ) : (
                        <div className="noData">No data available</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {analyticsTab === 'latency' && (
                <>
                  <div className="chartsGrid">
                    <div className="chartPanel">
                      <div className="chartHeader">
                        <h3>Latency Distribution</h3>
                      </div>
                      <div className="chartBody">
                        {Object.keys(history).length > 0 ? (
                          <ReactECharts option={LatencyBarChart(stats)} style={{ height: 280 }} />
                        ) : (
                          <div className="noData">No data available</div>
                        )}
                      </div>
                    </div>
                    <div className="chartPanel">
                      <div className="chartHeader">
                        <h3>Latency Components</h3>
                      </div>
                      <div className="chartBody">
                        {Object.keys(history).length > 0 ? (
                          <ReactECharts option={LatencyRadarChart(stats, results)} style={{ height: 280 }} />
                        ) : (
                          <div className="noData">No data available</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="latencyStats">
                    <div className="latencyCard">
                      <h4>Current Latency</h4>
                      <ReactECharts option={GaugeChart(stats.avgLatency)} style={{ height: 180 }} />
                    </div>
                    <div className="latencyCard">
                      <h4>Response Distribution</h4>
                      {Object.keys(history).length > 0 ? (
                        <ReactECharts option={ResponseTimeDistribution(history)} style={{ height: 200 }} />
                      ) : (
                        <div className="noData">No data</div>
                      )}
                    </div>
                    <div className="latencyCard">
                      <h4>Hourly Heatmap</h4>
                      {Object.keys(history).length > 0 ? (
                        <ReactECharts option={LatencyHeatmap(history)} style={{ height: 200 }} />
                      ) : (
                        <div className="noData">No data</div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {analyticsTab === 'uptime' && (
                <div className="chartPanel">
                  <div className="chartHeader">
                    <h3>Uptime History by Service</h3>
                  </div>
                  <div className="chartBody">
                    {Object.keys(history).length > 0 ? (
                      <ReactECharts option={UptimeHistoryChart(history)} style={{ height: 350 }} />
                    ) : (
                      <div className="noData">No data available</div>
                    )}
                  </div>
                </div>
              )}

              {analyticsTab === 'errors' && (
                <div className="chartPanel">
                  <div className="chartHeader">
                    <h3>Error Rate Over Time</h3>
                  </div>
                  <div className="chartBody">
                    {Object.keys(history).length > 0 ? (
                      <ReactECharts option={ErrorRateChart(history)} style={{ height: 350 }} />
                    ) : (
                      <div className="noData">No data available</div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activePanel === 'settings' && (
            <div className="settingsPanel">
              <div className="settingsSection">
                <h3>Monitoring Settings</h3>
                <div className="settingItem">
                  <label>Check Interval</label>
                  <select value={settings.checkInterval} onChange={(e) => setSettings({...settings, checkInterval: parseInt(e.target.value)})}>
                    <option value="3000">3 seconds</option>
                    <option value="5000">5 seconds</option>
                    <option value="10000">10 seconds</option>
                    <option value="30000">30 seconds</option>
                    <option value="60000">1 minute</option>
                  </select>
                </div>
                <div className="settingItem">
                  <label>Latency Threshold (ms)</label>
                  <input type="number" value={settings.latencyThreshold} onChange={(e) => setSettings({...settings, latencyThreshold: parseInt(e.target.value)})} />
                </div>
                <div className="settingItem">
                  <label>Request Timeout (ms)</label>
                  <input type="number" value={settings.timeout} onChange={(e) => setSettings({...settings, timeout: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="settingsSection">
                <h3>Data Management</h3>
                <div className="settingItem">
                  <button className="btnDanger" onClick={() => {clearHistory(); clearAlertHistory(); localStorage.clear(); window.location.reload();}}>Clear All Data</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
