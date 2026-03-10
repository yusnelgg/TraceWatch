import ReactECharts from "echarts-for-react";
import "./ServiceCard.css";

export function ServiceCard({ api, result, history, getUptime, getAvgLatency, getP95, removeAPI }) {
  const data = history[api] || [];
  const isDown = result?.status !== 200;
  const uptime = getUptime(api);
  const avgLat = getAvgLatency(api);
  const p95 = getP95(api);

  const chartOptions = () => {
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
      grid: { left: 45, right: 15, top: 15, bottom: 25 },
      xAxis: {
        type: "category",
        data: times,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#64748b', fontSize: 9, interval: Math.floor(times.length / 6) }
      },
      yAxis: {
        type: "value",
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#64748b', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1e293b' } }
      },
      series: [{
        data: latencies,
        type: "line",
        smooth: 0.3,
        symbol: 'none',
        lineStyle: { color: colors, width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: colors + '50' },
              { offset: 1, color: colors + '05' }
            ]
          }
        }
      }]
    };
  };

  return (
    <div className={`serviceCard ${isDown ? 'down' : ''}`}>
      <div className="serviceCardHeader">
        <div className="serviceInfo">
          <span className={`status-dot ${isDown ? 'error' : 'ok'}`}></span>
          <span className="serviceUrl">{api.replace('https://', '').replace('http://', '')}</span>
        </div>
        <button className="removeBtn" onClick={() => removeAPI(api)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="serviceMetrics">
        <div className="metric">
          <span className="metricValue">{result?.status || '-'}</span>
          <span className="metricLabel">Status</span>
        </div>
        <div className="metric">
          <span className="metricValue">{result?.latency || '-'}ms</span>
          <span className="metricLabel">Latency</span>
        </div>
        <div className="metric">
          <span className="metricValue">{avgLat}ms</span>
          <span className="metricLabel">Avg</span>
        </div>
        <div className="metric">
          <span className="metricValue">{p95}ms</span>
          <span className="metricLabel">P95</span>
        </div>
        <div className="metric">
          <span className={`metricValue ${uptime >= 99 ? 'ok' : uptime >= 95 ? 'warn' : 'error'}`}>{uptime}%</span>
          <span className="metricLabel">Uptime</span>
        </div>
      </div>

      <div className="serviceChart">
        <ReactECharts option={chartOptions()} style={{ height: 100 }} />
      </div>

      {isDown && result?.error && (
        <div className="errorBanner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {result.error}
        </div>
      )}
    </div>
  );
}
