import "./Sidebar.css";

export function Sidebar({ activePanel, setActivePanel, isMonitoring, alertsCount }) {
  return (
    <nav className="sidebar">
      <div className="sidebarHeader">
        <div className="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <span className="logoText">TraceWatch</span>
      </div>
      
      <div className="sidebarNav">
        <button 
          className={`navItem ${activePanel === 'overview' ? 'active' : ''}`} 
          onClick={() => setActivePanel('overview')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Overview
        </button>
        <button 
          className={`navItem ${activePanel === 'services' ? 'active' : ''}`} 
          onClick={() => setActivePanel('services')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          Services
        </button>
        <button 
          className={`navItem ${activePanel === 'alerts' ? 'active' : ''}`} 
          onClick={() => setActivePanel('alerts')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          Alerts
          {alertsCount > 0 && <span className="badge">{alertsCount}</span>}
        </button>
        <button 
          className={`navItem ${activePanel === 'analytics' ? 'active' : ''}`} 
          onClick={() => setActivePanel('analytics')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Analytics
        </button>
        <button 
          className={`navItem ${activePanel === 'settings' ? 'active' : ''}`} 
          onClick={() => setActivePanel('settings')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          Settings
        </button>
      </div>

      <div className="sidebarFooter">
        <div className="monitoringStatus">
          <span className={`monitorDot ${isMonitoring ? 'active' : ''}`}></span>
          {isMonitoring ? 'Monitoring' : 'Stopped'}
        </div>
        <div className="version">v2.0.0</div>
      </div>
    </nav>
  );
}
