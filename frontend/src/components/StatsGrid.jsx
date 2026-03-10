import "./StatsGrid.css";

export function StatsGrid({ stats, overallStats }) {
  return (
    <div className="statsGrid">
      <div className="statBox">
        <div className="statHeader">
          <span className="statTitle">Total</span>
          <div className="statIcon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>
        </div>
        <div className="statValue">{stats.total}</div>
        <div className="statFooter">{stats.up} up / {stats.down} down</div>
      </div>
      
      <div className="statBox">
        <div className="statHeader">
          <span className="statTitle">Uptime</span>
          <div className="statIcon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
        </div>
        <div className="statValue">{overallStats.uptime}%</div>
        <div className="statFooter">{overallStats.totalChecks} checks</div>
      </div>
      
      <div className="statBox">
        <div className="statHeader">
          <span className="statTitle">Avg Latency</span>
          <div className="statIcon cyan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
        </div>
        <div className="statValue">{overallStats.avgLat}ms</div>
        <div className="statFooter">Global average</div>
      </div>
      
      <div className="statBox">
        <div className="statHeader">
          <span className="statTitle">P95</span>
          <div className="statIcon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
        </div>
        <div className="statValue">{stats.p95}ms</div>
        <div className="statFooter">95th percentile</div>
      </div>
      
      <div className="statBox">
        <div className="statHeader">
          <span className="statTitle">DNS</span>
          <div className="statIcon yellow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20"/>
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
          </div>
        </div>
        <div className="statValue">{stats.avgDNS}ms</div>
        <div className="statFooter">Lookup time</div>
      </div>
      
      <div className="statBox">
        <div className="statHeader">
          <span className="statTitle">TTFB</span>
          <div className="statIcon orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
            </svg>
          </div>
        </div>
        <div className="statValue">{stats.avgTTFB}ms</div>
        <div className="statFooter">First byte</div>
      </div>
    </div>
  );
}

export function QuickStats({ stats }) {
  return (
    <div className="quickStats">
      <div className="quickStat">
        <div className="quickStatIcon" style={{background: 'linear-gradient(135deg, #10b981, #059669)'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        </div>
        <div className="quickStatInfo">
          <div className="quickStatValue">{stats.up}</div>
          <div className="quickStatLabel">Services Online</div>
        </div>
      </div>
      
      <div className="quickStat">
        <div className="quickStatIcon" style={{background: 'linear-gradient(135deg, #ef4444, #dc2626)'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div className="quickStatInfo">
          <div className="quickStatValue">{stats.down}</div>
          <div className="quickStatLabel">Services Offline</div>
        </div>
      </div>
      
      <div className="quickStat">
        <div className="quickStatIcon" style={{background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        </div>
        <div className="quickStatInfo">
          <div className="quickStatValue">{stats.min}ms</div>
          <div className="quickStatLabel">Min Latency</div>
        </div>
      </div>
      
      <div className="quickStat">
        <div className="quickStatIcon" style={{background: 'linear-gradient(135deg, #ef4444, #dc2626)'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
            <polyline points="17,6 23,6 23,12"/>
          </svg>
        </div>
        <div className="quickStatInfo">
          <div className="quickStatValue">{stats.max}ms</div>
          <div className="quickStatLabel">Max Latency</div>
        </div>
      </div>
    </div>
  );
}
