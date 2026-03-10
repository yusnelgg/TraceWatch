import { useState, useEffect } from 'react';
import './App.css';
import { CheckAPI } from "../wailsjs/go/main/App";
import ReactECharts from "echarts-for-react";

function App() {

    const [apiUrl, setApiUrl] = useState("");
    const [status, setStatus] = useState(null);
    const [latency, setLatency] = useState(null);
    const [error, setError] = useState(null);
    const [time, setTime] = useState(null);
    const [history, setHistory] = useState([]);

    const check = async () => {
        if (!apiUrl) return;

        try {
            const result = await CheckAPI(apiUrl);

            setStatus(result.status);
            setLatency(result.latency);
            setError(result.error);
            setTime(result.time);

            setHistory(prev => [
                ...prev.slice(-19),
                result.latency
            ]);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            check();
        }, 5000);

        return () => clearInterval(interval);
    }, [apiUrl]);

    const chartOptions = {
        title: {
            text: "API Latency (ms)"
        },
        xAxis: {
            type: "category",
            data: history.map((_, i) => i + 1)
        },
        yAxis: {
            type: "value"
        },
        series: [
            {
                data: history,
                type: "line",
                smooth: true
            }
        ]
    };

    return (
  <div className="app-container">

    <div className="title">TraceWatch</div>

    <div className="input-group">
      <input
        type="text"
        placeholder="Enter API URL"
        value={apiUrl}
        onChange={(e) => setApiUrl(e.target.value)}
      />
      <button onClick={check}>Check API</button>
    </div>

    <div className="card">
      <p><b>URL:</b> {apiUrl}</p>
      <p>
        <b>Status:</b>
        <span className={status === 200 ? "status-ok" : "status-error"}>
          {status || "Not checked"}
        </span>
      </p>

      <p><b>Latency:</b> {latency ? latency + " ms" : "-"}</p>
      <p><b>Error:</b> {error || "None"}</p>
      <p><b>Time:</b> {time}</p>
    </div>

    <div className="chart-container">
      <ReactECharts option={chartOptions} style={{height: 300}} />
    </div>

  </div>
);
}

export default App;