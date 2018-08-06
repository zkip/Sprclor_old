package main

import "net/http"

var cfg *Config

func main() {
	cfg = NewConfig("config")
	cfg.Recovery()
	http.ListenAndServe(cfg.Server.getAddr(), initRouters())
}
