import ReactECharts from "echarts-for-react";

export function OverallChart({ history }) {
  if (!history || Object.keys(history).length === 0) return null;
  
  const overallChartOptions = () => {
    const allData = Object.entries(history).flatMap(([url, data]) => 
      (data || []).map(d => ({ ...d, url: url.replace('https://', '').replace('http://', '').split('/')[0] }))
    );
    if (allData.length === 0) return null;

    const grouped = {};
    allData.forEach(d => {
      if (!grouped[d.time]) grouped[d.time] = [];
      if (d.latency) grouped[d.time].push(d.latency);
    });

    const times = Object.keys(grouped).slice(-40);
    const avgLatencies = times.map(t => {
      const lats = grouped[t];
      return lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : 0;
    });

    return {
      tooltip: { 
        trigger: "axis",
        backgroundColor: '#1a1a24',
        borderColor: '#2a2a3a',
        textStyle: { color: '#f0f0f5' }
      },
      grid: { left: 55, right: 25, top: 20, bottom: 30 },
      xAxis: {
        type: "category",
        data: times,
        axisLine: { lineStyle: { color: '#2a2a3a' } },
        axisLabel: { color: '#606070', fontSize: 10 }
      },
      yAxis: {
        type: "value",
        name: 'ms',
        nameTextStyle: { color: '#606070', fontSize: 10 },
        axisLine: { lineStyle: { color: '#2a2a3a' } },
        axisLabel: { color: '#606070' },
        splitLine: { lineStyle: { color: '#1a1a24' } }
      },
      series: [{
        data: avgLatencies,
        type: "line",
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: '#3b82f6', width: 2.5 },
        itemStyle: { color: '#3b82f6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ]
          }
        }
      }]
    };
  };

  if (Object.keys(history).length === 0) return null;

  return <ReactECharts option={overallChartOptions()} style={{ height: 280 }} />;
}

export function StatusPieChart({ stats }) {
  if (!stats || stats.total === 0) return null;

  return {
    tooltip: { trigger: "item", formatter: '{b}: {c} ({d}%)' },
    legend: { 
      show: true, 
      bottom: 0,
      textStyle: { color: '#a0a0b0', fontSize: 11 }
    },
    series: [{
      type: "pie",
      radius: ["45%", "75%"],
      center: ["50%", "45%"],
      data: [
        { value: stats.up, name: "Online", itemStyle: { color: "#10b981" } },
        { value: stats.down, name: "Offline", itemStyle: { color: "#ef4444" } }
      ],
      label: { show: false },
      emphasis: {
        itemStyle: { shadowBlur: 20, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
      }
    }]
  };
}

export function TimelineChart({ history }) {
  const series = Object.entries(history).slice(0, 8).map(([url, data], i) => {
    const cleanUrl = url.replace('https://', '').replace('http://', '').split('/')[0];
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316'];
    return {
      name: cleanUrl,
      type: "line",
      data: (data || []).slice(-30).map(d => d.status >= 200 && d.status < 400 ? 1 : 0),
      symbol: 'none',
      lineStyle: { width: 2, color: colors[i % colors.length] },
      smooth: 0.3
    };
  });

  if (series.length === 0) return null;

  return {
    tooltip: { trigger: "axis" },
    legend: { 
      show: true, 
      textStyle: { color: '#a0a0b0', fontSize: 10 }, 
      top: 0,
      itemGap: 10
    },
    grid: { left: 50, right: 20, top: 40, bottom: 25 },
    xAxis: {
      type: "category",
      data: (Object.values(history)[0] || []).slice(-30).map(d => d.time),
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#606070', fontSize: 9 }
    },
    yAxis: {
      type: "value",
      max: 1,
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#606070', formatter: v => v === 1 ? 'UP' : 'DOWN' },
      splitLine: { lineStyle: { color: '#1a1a24' } }
    },
    series
  };
}

export function GaugeChart({ value, max = 2000, label = 'ms' }) {
  const color = value < 200 ? '#10b981' : value < 500 ? '#f59e0b' : '#ef4444';
  
  return {
    series: [{
      type: "gauge",
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: max,
      splitNumber: 5,
      itemStyle: { color },
      progress: { show: true, width: 14, roundCap: true },
      pointer: { show: false },
      axisLine: { lineStyle: { width: 14, color: [[1, '#1a1a24']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: {
        valueAnimation: true,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f0f0f5',
        formatter: `{value}${label}`,
        offsetCenter: [0, '25%']
      },
      data: [{ value }]
    }]
  };
}

export function LatencyBarChart({ stats }) {
  if (!stats) return null;
  
  const bars = [
    { label: 'Min', value: stats.min, color: '#10b981' },
    { label: 'Avg', value: stats.avgLatency, color: '#3b82f6' },
    { label: 'P95', value: stats.p95, color: '#8b5cf6' },
    { label: 'P99', value: stats.p99, color: '#f59e0b' },
    { label: 'Max', value: stats.max, color: '#ef4444' }
  ];

  return {
    tooltip: { trigger: "axis" },
    grid: { left: 50, right: 20, top: 15, bottom: 35 },
    xAxis: {
      type: "category",
      data: bars.map(b => b.label),
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#a0a0b0', fontSize: 11 }
    },
    yAxis: {
      type: "value",
      name: 'ms',
      nameTextStyle: { color: '#606070', fontSize: 10 },
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#606070' },
      splitLine: { lineStyle: { color: '#1a1a24' } }
    },
    series: [{
      type: "bar",
      data: bars.map(b => ({
        value: b.value,
        itemStyle: { color: b.color, borderRadius: [4, 4, 0, 0] }
      })),
      barWidth: '50%',
      label: {
        show: true,
        position: 'top',
        color: '#a0a0b0',
        fontSize: 10,
        formatter: '{c}ms'
      }
    }]
  };
}

export function ResponseTimeDistribution({ history }) {
  const allLatencies = Object.values(history).flat().filter(d => d.latency).map(d => d.latency);
  if (allLatencies.length === 0) return null;

  const ranges = [
    { name: '<100ms', min: 0, max: 100 },
    { name: '100-300ms', min: 100, max: 300 },
    { name: '300-500ms', min: 300, max: 500 },
    { name: '500-1000ms', min: 500, max: 1000 },
    { name: '>1000ms', min: 1000, max: Infinity }
  ];

  const data = ranges.map(r => ({
    name: r.name,
    value: allLatencies.filter(l => l >= r.min && l < r.max).length
  }));

  return {
    tooltip: { trigger: "item", formatter: '{b}: {c} ({d}%)' },
    legend: { 
      show: true, 
      bottom: 0,
      textStyle: { color: '#a0a0b0', fontSize: 10 }
    },
    series: [{
      type: "pie",
      radius: ["35%", "65%"],
      center: ["50%", "45%"],
      data: data.map((d, i) => ({
        ...d,
        itemStyle: { color: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][i] }
      })),
      label: { show: false },
      emphasis: {
        itemStyle: { shadowBlur: 15, shadowColor: 'rgba(0, 0, 0, 0.5)' }
      }
    }]
  };
}

export function LatencyRadarChart({ stats, results }) {
  if (!stats || !results || results.length === 0) return null;
  
  const data = [
    { name: 'DNS', value: stats.avgDNS || 0 },
    { name: 'Connect', value: stats.avgConnect || 0 },
    { name: 'TLS', value: stats.avgTLS || 0 },
    { name: 'TTFB', value: stats.avgTTFB || 0 },
    { name: 'Total', value: stats.avgLatency || 0 }
  ];

  const maxVal = Math.max(...data.map(d => d.value), 100);

  return {
    tooltip: { trigger: "item" },
    radar: {
      indicator: data.map(d => ({ name: d.name, max: maxVal * 1.2 })),
      axisName: { color: '#a0a0b0', fontSize: 11 },
      splitArea: { areaStyle: { color: ['#16161f', '#1a1a24'] } },
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      splitLine: { lineStyle: { color: '#2a2a3a' } }
    },
    series: [{
      type: "radar",
      data: [{
        value: data.map(d => d.value),
        name: 'Latency',
        areaStyle: { color: 'rgba(59, 130, 246, 0.3)' },
        lineStyle: { color: '#3b82f6', width: 2 },
        itemStyle: { color: '#3b82f6' }
      }]
    }]
  };
}

export function UptimeHistoryChart({ history }) {
  const services = Object.keys(history).slice(0, 6);
  
  if (services.length === 0) return null;

  const series = services.map((url, i) => {
    const data = (history[url] || []).slice(-30);
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
    
    return {
      name: url.replace('https://', '').replace('http://', '').split('/')[0],
      type: "bar",
      data: data.map(d => d.status >= 200 && d.status < 400 ? 100 : 0),
      itemStyle: { 
        color: colors[i % colors.length],
        borderRadius: [2, 2, 0, 0]
      }
    };
  });

  return {
    tooltip: { 
      trigger: "axis",
      formatter: (params) => {
        return params.map(p => `${p.seriesName}: ${p.value === 100 ? 'UP' : 'DOWN'}`).join('<br/>');
      }
    },
    legend: { 
      show: true, 
      textStyle: { color: '#a0a0b0', fontSize: 10 },
      top: 0
    },
    grid: { left: 50, right: 20, top: 40, bottom: 25 },
    xAxis: {
      type: "category",
      data: ((history[services[0]] || []).slice(-30) || []).map(d => d.time),
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#606070', fontSize: 9 }
    },
    yAxis: {
      type: "value",
      max: 100,
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#606070', formatter: v => v === 100 ? 'UP' : 'DOWN' },
      splitLine: { lineStyle: { color: '#1a1a24' } }
    },
    series
  };
}

export function LatencyHeatmap({ history }) {
  const allData = Object.entries(history).flatMap(([url, data]) => 
    (data || []).map(d => ({ url, ...d }))
  );
  
  if (allData.length < 10) return null;

  const hours = {};
  allData.forEach(d => {
    if (!d.timestamp) return;
    const hour = new Date(d.timestamp).getHours();
    if (!hours[hour]) hours[hour] = [];
    if (d.latency) hours[hour].push(d.latency);
  });
  
  const data = Object.entries(hours).map(([hour, lats]) => ({
    hour: parseInt(hour),
    avg: lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : 0,
    count: lats.length
  }));

  if (data.length === 0) return null;

  return {
    tooltip: { 
      trigger: "item",
      formatter: (params) => `${params.data[0]}:00 - Avg: ${params.data[1]}ms`
    },
    grid: { left: 50, right: 30, top: 20, bottom: 40 },
    xAxis: {
      type: "category",
      data: data.map(d => `${d.hour}:00`),
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#606070', fontSize: 10 }
    },
    yAxis: {
      type: "value",
      name: 'ms',
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#606070' },
      splitLine: { lineStyle: { color: '#1a1a24' } }
    },
    visualMap: {
      min: 0,
      max: Math.max(...data.map(d => d.avg), 100),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: { color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'] },
      textStyle: { color: '#606070' }
    },
    series: [{
      type: "heatmap",
      data: data.map((d, i) => [i, 0, d.avg]),
      label: { show: true, color: '#f0f0f9', fontSize: 10 },
      itemStyle: { borderColor: '#0a0a0f', borderWidth: 2 }
    }]
  };
}

export function ErrorRateChart({ history }) {
  const allData = Object.entries(history).flatMap(([url, data]) => 
    (data || []).map(d => ({ url, ...d }))
  );
  
  if (allData.length < 10) return null;

  const grouped = {};
  allData.forEach(d => {
    if (!grouped[d.time]) grouped[d.time] = { total: 0, errors: 0 };
    grouped[d.time].total++;
    if (d.status < 200 || d.status >= 400) grouped[d.time].errors++;
  });

  const times = Object.keys(grouped).slice(-30);
  const errorRates = times.map(t => ({
    time: t,
    rate: Math.round((grouped[t].errors / grouped[t].total) * 100)
  }));

  return {
    tooltip: { trigger: "axis" },
    grid: { left: 50, right: 20, top: 20, bottom: 25 },
    xAxis: {
      type: "category",
      data: times,
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#606070', fontSize: 10 }
    },
    yAxis: {
      type: "value",
      name: '%',
      max: 100,
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#606070' },
      splitLine: { lineStyle: { color: '#1a1a24' } }
    },
    series: [{
      type: "line",
      data: errorRates.map(d => d.rate),
      smooth: 0.4,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: '#ef4444', width: 2 },
      itemStyle: { color: '#ef4444' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
            { offset: 1, color: 'rgba(239, 68, 68, 0.05)' }
          ]
        }
      }
    }]
  };
}
