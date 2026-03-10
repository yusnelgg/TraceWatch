package main

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

type APIResult struct {
	URL     string `json:"url"`
	Status  int    `json:"status"`
	Latency int64  `json:"latency"`
	Error   string `json:"error"`
	Time    int64  `json:"time"`
}

func (a *App) CheckAPI(url string) (*APIResult, error) {
	start := time.Now()

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	latency := time.Since(start).Milliseconds()

	return &APIResult{
		URL:     url,
		Status:  resp.StatusCode,
		Latency: latency,
		Error:   "",
		Time:    time.Now().Unix(),
	}, nil
}
