package main

import (
	"net/http"
	"path"
	"path/filepath"

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
					http.ServeFile(w, r, ret)
				}
			}
		})
		rt.HandleFunc("/view/*", func(w http.ResponseWriter, r *http.Request) {
			dir, base := path.Split(r.URL.Path)
			dir, _ = filepath.Rel("/view", dir)
			vSrc := cfg.View.get(path.Join(dir, base))
			http.ServeFile(w, r, path.Join("views", vSrc+".html"))
		})
	})

	return rt
}
