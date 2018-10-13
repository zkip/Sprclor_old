package main

import (
	"net/http"
	"path"

	"github.com/go-chi/chi"
)

func initRouters() http.Handler {
	rt := chi.NewRouter()
	rt.Group(func(rt chi.Router) {
		rt.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, "hook.html")
		})
		rt.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
			// Resources
			ret := r.URL.Path
			if ret != "/" {
				ret = cfg.ResType.trustPath(r.URL.Path)
				if ret == "" {
					http.NotFound(w, r)
				} else {
					solveResource(w, r, ret)
				}
			}
		})
	})

	return rt
}

func solveResource(w http.ResponseWriter, r *http.Request, path_ string) {
	ext := path.Ext(path_)
	if ext == ".pkg" {
		// ...
	} else {
		http.ServeFile(w, r, path_)
	}
}
