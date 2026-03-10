package main

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// App struct
type App struct {
	ctx    context.Context
	client *http.Client
}

// NewApp creates a new App application struct
func NewApp() *App {

	return &App{
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}

}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Example function
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// Result struct sent to frontend
type APIResult struct {
	URL     string `json:"url"`
	Status  int    `json:"status"`
	Latency int64  `json:"latency"`
	Error   string `json:"error"`
	Time    string `json:"time"`
}

// normalize URL
func normalizeURL(url string) string {

	if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
		return "https://" + url
	}

	return url
}

// check one API
func (a *App) checkOne(url string) APIResult {

	url = normalizeURL(url)

	start := time.Now()

	resp, err := a.client.Get(url)

	if err != nil {

		return APIResult{
			URL:   url,
			Error: err.Error(),
			Time:  time.Now().Format("15:04:05"),
		}

	}

	defer resp.Body.Close()

	latency := time.Since(start).Milliseconds()

	return APIResult{
		URL:     url,
		Status:  resp.StatusCode,
		Latency: latency,
		Error:   "",
		Time:    time.Now().Format("15:04:05"),
	}

}

// check a single API
func (a *App) CheckAPI(url string) (*APIResult, error) {

	result := a.checkOne(url)

	return &result, nil

}

// check multiple APIs in parallel
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
