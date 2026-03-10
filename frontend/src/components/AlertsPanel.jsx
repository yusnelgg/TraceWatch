import "./AlertsPanel.css";

export function AlertsPanel({ alerts, alertHistory, onClearHistory }) {
  return (
    <div className="alertsPanel">
      {alerts.length > 0 && (
        <div className="alertBanner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>{alerts.length} service{alerts.length > 1 ? 's' : ''} down</span>
          <div className="alertServices">
            {alerts.map((a, i) => (
              <span key={i} className="alertTag">{a.url.replace('https://', '').split('/')[0]}</span>
            ))}
          </div>
        </div>
      )}

      <div className="alertsSection">
        <div className="alertsHeader">
          <h3>Alert History</h3>
          <button className="btnClear" onClick={onClearHistory}>Clear History</button>
        </div>
        <div className="alertsList">
          {alertHistory.length === 0 && <div className="noData">No alerts recorded</div>}
          {alertHistory.map((alert, i) => (
            <div key={i} className="alertItem">
              <div className="alertIcon error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div className="alertContent">
                <span className="alertUrl">{alert.url.replace('https://', '').replace('http://', '')}</span>
                <span className="alertMsg">{alert.error || `HTTP ${alert.status}`}</span>
              </div>
              <span className="alertTime">{new Date(alert.time).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
