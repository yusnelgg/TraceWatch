import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CheckMultiple } from "../../wailsjs/go/main/App";

const MAX_HISTORY = 120;
const STORAGE_KEY = "tracewatch_v2";

export function useMonitoring() {
  const [apis, setApis] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState({});
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState(() => {
    const saved = localStorage.getItem("tracewatch_alerts");
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("tracewatch_settings");
    return saved ? JSON.parse(saved) : {
      checkInterval: 5000,
      latencyThreshold: 1000,
      timeout: 5000
    };
  });

  const intervalRef = useRef(null);
  const checkAllRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apis));
  }, [apis]);

  useEffect(() => {
    localStorage.setItem("tracewatch_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("tracewatch_alerts", JSON.stringify(alertHistory.slice(0, 100)));
  }, [alertHistory]);

  const addAlert = useCallback((url, error, status) => {
    const alert = {
      id: Date.now(),
      url,
      error,
      status,
      time: new Date().toISOString(),
      timestamp: Date.now()
    };
    setAlertHistory(prev => [alert, ...prev].slice(0, 200));
  }, []);

  useEffect(() => {
    const downApis = results.filter(r => r.status < 200 || r.status >= 400);
    const previousDown = alerts.map(a => a.url);
    
    results.forEach(r => {
      if ((r.status < 200 || r.status >= 400) && !previousDown.includes(r.url)) {
        addAlert(r.url, r.error || `HTTP ${r.status}`, r.status);
      }
    });
    
    setAlerts(downApis.map(r => ({
      id: Date.now() + Math.random(),
      url: r.url,
      error: r.error || `HTTP ${r.status}`,
      status: r.status,
      time: r.time
    })));
  }, [results, addAlert]);

  const stats = useMemo(() => {
    if (!results || results.length === 0) {
      return { total: 0, up: 0, down: 0, avgLatency: 0, p95: 0, p99: 0, min: 0, max: 0, availability: 0, avgDNS: 0, avgConnect: 0, avgTLS: 0, avgTTFB: 0 };
    }
    
    const total = results.length;
    const up = results.filter(r => r.status >= 200 && r.status < 400).length;
    const down = total - up;
    const latencies = results.filter(r => r.latency).map(r => r.latency);
    const avgLatency = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    const sorted = [...latencies].sort((a, b) => a - b);
    const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] || 0 : 0;
    const p99 = sorted.length ? sorted[Math.floor(sorted.length * 0.99)] || 0 : 0;
    const min = latencies.length ? Math.min(...latencies) : 0;
    const max = latencies.length ? Math.max(...latencies) : 0;
    const availability = total ? Math.round((up / total) * 10000) / 100 : 100;
    
    const dnsTimes = results.filter(r => r.latencyDNS).map(r => r.latencyDNS);
    const connectTimes = results.filter(r => r.latencyConnect).map(r => r.latencyConnect);
    const tlsTimes = results.filter(r => r.latencyTLS).map(r => r.latencyTLS);
    const ttfbTimes = results.filter(r => r.latencyTTFB).map(r => r.latencyTTFB);
    
    const avgDNS = dnsTimes.length ? Math.round(dnsTimes.reduce((a, b) => a + b, 0) / dnsTimes.length) : 0;
    const avgConnect = connectTimes.length ? Math.round(connectTimes.reduce((a, b) => a + b, 0) / connectTimes.length) : 0;
    const avgTLS = tlsTimes.length ? Math.round(tlsTimes.reduce((a, b) => a + b, 0) / tlsTimes.length) : 0;
    const avgTTFB = ttfbTimes.length ? Math.round(ttfbTimes.reduce((a, b) => a + b, 0) / ttfbTimes.length) : 0;
    
    return { total, up, down, avgLatency, p95, p99, min, max, availability, avgDNS, avgConnect, avgTLS, avgTTFB };
  }, [results]);

  const overallStats = useMemo(() => {
    if (!history || Object.keys(history).length === 0) {
      return { uptime: 0, avgLat: 0, totalChecks: 0 };
    }
    
    const allData = Object.entries(history).flatMap(([url, data]) => 
      (data || []).map(d => ({ ...d, url }))
    );
    
    if (allData.length === 0) return { uptime: 0, avgLat: 0, totalChecks: 0 };
    
    const upCount = allData.filter(d => d.status >= 200 && d.status < 400).length;
    const latencies = allData.filter(d => d.latency).map(d => d.latency);
    const avgLat = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    
    return {
      uptime: Math.round((upCount / allData.length) * 10000) / 100,
      avgLat,
      totalChecks: allData.length
    };
  }, [history]);

  const addAPI = useCallback((url) => {
    if (!url || !url.trim()) return;
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = "https://" + normalizedUrl;
    }
    setApis(prev => {
      if (prev.includes(normalizedUrl)) return prev;
      return [...prev, normalizedUrl];
    });
  }, []);

  const removeAPI = useCallback((url) => {
    setApis(prev => prev.filter(a => a !== url));
    setHistory(h => {
      const newH = { ...h };
      delete newH[url];
      return newH;
    });
  }, []);

  const checkAll = useCallback(async () => {
    if (apis.length === 0) return;
    
    let currentResults;
    try {
      currentResults = await CheckMultiple(apis);
    } catch (e) {
      console.error("Check error:", e);
      return;
    }
    
    if (!currentResults || !Array.isArray(currentResults)) return;
    
    setResults(currentResults);
    setLastCheck(new Date());

    setHistory(prevHistory => {
      const newHistory = { ...prevHistory };
      currentResults.forEach(api => {
        if (!newHistory[api.url]) newHistory[api.url] = [];
        newHistory[api.url] = [
          ...newHistory[api.url].slice(-MAX_HISTORY),
          { latency: api.latency, status: api.status, error: api.error, time: api.time, timestamp: Date.now() }
        ];
      });
      return newHistory;
    });
  }, [apis]);

  checkAllRef.current = checkAll;

  const start = useCallback(() => {
    if (intervalRef.current) return;
    
    if (checkAllRef.current) {
      checkAllRef.current();
    }
    
    intervalRef.current = setInterval(() => {
      if (checkAllRef.current) {
        checkAllRef.current();
      }
    }, settings.checkInterval);
    
    setIsMonitoring(true);
  }, [settings.checkInterval]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory({});
    setResults([]);
    setAlerts([]);
  }, []);

  const clearAlertHistory = useCallback(() => {
    setAlertHistory([]);
  }, []);

  const getUptime = useCallback((url) => {
    const h = history[url] || [];
    if (h.length === 0) return 0;
    const up = h.filter(d => d.status >= 200 && d.status < 400).length;
    return Math.round((up / h.length) * 100);
  }, [history]);

  const getAvgLatency = useCallback((url) => {
    const h = history[url] || [];
    const latencies = h.filter(d => d.latency);
    if (latencies.length === 0) return 0;
    return Math.round(latencies.reduce((acc, d) => acc + d.latency, 0) / latencies.length);
  }, [history]);

  const getP95 = useCallback((url) => {
    const h = history[url] || [];
    const latencies = h.filter(d => d.latency).map(d => d.latency).sort((a, b) => a - b);
    if (latencies.length === 0) return 0;
    return Math.round(latencies[Math.floor(latencies.length * 0.95)] || 0);
  }, [history]);

  return {
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
  };
}
