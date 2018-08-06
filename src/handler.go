package main

import (
	"net/http"
)

var handlers = map[string]http.HandlerFunc{}
