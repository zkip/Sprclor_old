package main

import (
	"fmt"
	"net/http"
)

var cfg *Config

func main() {
	cfg = NewConfig("config")
	cfg.Recovery()
	fmt.Printf("Server has runing on %s\n", cfg.Server.getAddr())
	fmt.Println(http.ListenAndServe(cfg.Server.getAddr(), initRouters()))
}
