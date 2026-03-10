package main

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"net/http"
	"net/http/httptrace"
	"strings"
	"time"
)

type App struct {
	ctx    context.Context
	client *http.Client
}

func NewApp() *App {
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: false},
		MaxIdleConns:    10,
		IdleConnTimeout: 30 * time.Second,
	}

	return &App{
		client: &http.Client{
			Transport: tr,
			Timeout:   10 * time.Second,
		},
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

type APIResult struct {
	URL                string `json:"url"`
	Status             int    `json:"status"`
	Latency            int64  `json:"latency"`
	LatencyDNS         int64  `json:"latencyDNS"`
	LatencyConnect     int64  `json:"latencyConnect"`
	LatencyTLS         int64  `json:"latencyTLS"`
	LatencyTTFB        int64  `json:"latencyTTFB"`
	Error              string `json:"error"`
	Time               string `json:"time"`
	ResponseSize       int64  `json:"responseSize"`
	ContentType        string `json:"contentType"`
	Server             string `json:"server"`
	SSLEnabled         bool   `json:"sslEnabled"`
	SSLValid           bool   `json:"sslValid"`
	SSLExpiryDays      int    `json:"sslExpiryDays"`
	HTTPVersion        string `json:"httpVersion"`
	RedirectCount      int    `json:"redirectCount"`
	FinalURL           string `json:"finalURL"`
	UpstreamStatusCode int    `json:"upstreamStatusCode"`
}

func normalizeURL(url string) string {
	url = strings.TrimSpace(url)
	if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
		return "https://" + url
	}
	return url
}

func (a *App) checkOne(rawURL string) APIResult {
	url := normalizeURL(rawURL)

	result := APIResult{
		URL:      rawURL,
		Time:     time.Now().Format("15:04:05"),
		FinalURL: url,
	}

	var dnsStart, connectStart, tlsStart, ttfbStart time.Time
	var dnsTime, connectTime, tlsTime, ttfbTime int64

	trace := &httptrace.ClientTrace{
		DNSStart: func(ds httptrace.DNSStartInfo) {
			dnsStart = time.Now()
		},
		DNSDone: func(di httptrace.DNSDoneInfo) {
			dnsTime = time.Since(dnsStart).Milliseconds()
		},
		ConnectStart: func(network, addr string) {
			connectStart = time.Now()
		},
		ConnectDone: func(network, addr string, err error) {
			connectTime = time.Since(connectStart).Milliseconds()
		},
		TLSHandshakeStart: func() {
			tlsStart = time.Now()
		},
		TLSHandshakeDone: func(tlsState tls.ConnectionState, err error) {
			tlsTime = time.Since(tlsStart).Milliseconds()
			result.SSLEnabled = true
			if err == nil && len(tlsState.PeerCertificates) > 0 {
				result.SSLValid = true
				expiry := tlsState.PeerCertificates[0].NotAfter
				days := int(time.Until(expiry).Hours() / 24)
				result.SSLExpiryDays = days
			}
		},
		GotFirstResponseByte: func() {
			ttfbStart = time.Now()
		},
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		result.Error = fmt.Sprintf("Request error: %v", err)
		return result
	}

	req.Header.Set("User-Agent", "TraceWatch/2.0")
	req.Header.Set("Accept", "*/*")

	ctx := httptrace.WithClientTrace(req.Context(), trace)

	start := time.Now()

	resp, err := a.client.Do(req.WithContext(ctx))

	result.LatencyTTFB = ttfbTime
	result.LatencyDNS = dnsTime
	result.LatencyConnect = connectTime
	result.LatencyTLS = tlsTime

	if err != nil {
		result.Error = classifyError(err, url)
		return result
	}

	defer resp.Body.Close()

	result.LatencyTTFB = time.Since(ttfbStart).Milliseconds()
	result.Latency = time.Since(start).Milliseconds()
	result.Status = resp.StatusCode
	result.ContentType = resp.Header.Get("Content-Type")
	result.Server = resp.Header.Get("Server")
	result.HTTPVersion = resp.Proto
	result.FinalURL = resp.Request.URL.String()
	result.UpstreamStatusCode = resp.StatusCode

	if strings.HasPrefix(resp.Header.Get("Content-Type"), "text/") {
		result.ResponseSize = resp.ContentLength
	}

	location := resp.Header.Get("Location")
	if location != "" {
		result.RedirectCount = 1
	}

	return result
}

func classifyError(err error, url string) string {
	errStr := err.Error()

	if strings.Contains(errStr, "no such host") || strings.Contains(errStr, "server misbehaving") {
		return "DNS_ERROR"
	}
	if strings.Contains(errStr, "timeout") || strings.Contains(errStr, "Timeout") {
		return "TIMEOUT"
	}
	if strings.Contains(errStr, "connection refused") {
		return "CONNECTION_REFUSED"
	}
	if strings.Contains(errStr, "certificate") || strings.Contains(errStr, "x509") {
		return "SSL_ERROR"
	}
	if strings.Contains(errStr, "no route to host") {
		return "NO_ROUTE"
	}
	if strings.Contains(errStr, "too many redirects") {
		return "TOO_MANY_REDIRECTS"
	}

	netErr, ok := err.(net.Error)
	if ok {
		if netErr.Timeout() {
			return "TIMEOUT"
		}
		if netErr.Temporary() {
			return "TEMPORARY_ERROR"
		}
	}

	return fmt.Sprintf("ERROR: %v", err)
}

func (a *App) CheckAPI(url string) (*APIResult, error) {
	result := a.checkOne(url)
	return &result, nil
}

func (a *App) CheckMultiple(urls []string) []APIResult {
	results := make([]APIResult, 0, len(urls))
	ch := make(chan APIResult)

	for _, url := range urls {
		go func(u string) {
			ch <- a.checkOne(u)
		}(url)
	}

	for i := 0; i < len(urls); i++ {
		results = append(results, <-ch)
	}

	return results
}

type HealthCheckResult struct {
	URL            string `json:"url"`
	Healthy        bool   `json:"healthy"`
	StatusCode     int    `json:"statusCode"`
	ResponseTimeMs int64  `json:"responseTimeMs"`
	Error          string `json:"error"`
	Timestamp      string `json:"timestamp"`
}

func (a *App) HealthCheck(url string) (*HealthCheckResult, error) {
	result := a.checkOne(url)

	healthy := result.Status >= 200 && result.Status < 300 && result.Error == ""

	return &HealthCheckResult{
		URL:            result.URL,
		Healthy:        healthy,
		StatusCode:     result.Status,
		ResponseTimeMs: result.Latency,
		Error:          result.Error,
		Timestamp:      result.Time,
	}, nil
}

type BatchHealthCheck struct {
	Results []HealthCheckResult `json:"results"`
	Summary struct {
		Total      int   `json:"total"`
		Healthy    int   `json:"healthy"`
		Unhealthy  int   `json:"unhealthy"`
		AvgLatency int64 `json:"avgLatency"`
	} `json:"summary"`
}

func (a *App) CheckHealthMultiple(urls []string) (*BatchHealthCheck, error) {
	results := a.CheckMultiple(urls)

	batch := BatchHealthCheck{}
	batch.Results = make([]HealthCheckResult, len(results))

	var totalLatency int64

	for i, r := range results {
		healthy := r.Status >= 200 && r.Status < 300 && r.Error == ""
		batch.Results[i] = HealthCheckResult{
			URL:            r.URL,
			Healthy:        healthy,
			StatusCode:     r.Status,
			ResponseTimeMs: r.Latency,
			Error:          r.Error,
			Timestamp:      r.Time,
		}

		if healthy {
			batch.Summary.Healthy++
		} else {
			batch.Summary.Unhealthy++
		}
		totalLatency += r.Latency
	}

	batch.Summary.Total = len(results)
	if len(results) > 0 {
		batch.Summary.AvgLatency = totalLatency / int64(len(results))
	}

	return &batch, nil
}
