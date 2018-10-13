package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
)

type Ret struct {
	Err error
	Ctn interface{}
}

func main() {
	http.HandleFunc("/", hook)
	http.ListenAndServe(":7009", nil)
}

func hook(w http.ResponseWriter, r *http.Request) {
	ret := Ret{}
	arg := r.URL.Query().Get("arg")
	arg2 := r.URL.Query().Get("arg2")
	switch r.URL.Path {
	case "/wd":
		dir, err := os.Getwd()
		ret.Err = err
		ret.Ctn = dir
	case "/cd":
		ret.Err = os.Chdir(arg)
	case "/ls":
		fmt.Println("ls")
	case "/rm":
		ret.Err = os.Remove(arg)
	case "/mkdir":
		ret.Err = os.Mkdir(arg, os.ModePerm)
	case "/mv":
		ret.Err = os.Rename(arg, arg2)
	case "/touch":
		fs, err := os.Create(arg)
		ret.Err = err
		ret.Ctn = fs
	case "/write":
		fs, err := os.Create(arg)
		if err != nil {
			ret.Err = err
		} else {
			_, ret.Err = io.Copy(fs, r.Body)
		}
	case "/read":
		f, err := os.Open(arg)
		if err != nil {
			ret.Err = err
		} else {
			bs, err := ioutil.ReadAll(f)
			if err != nil {
				ret.Err = err
			} else {
				w.Write(bs)
				return
			}
		}
		defer f.Close()
	}
	bs, _ := json.Marshal(ret)
	w.Write(bs)
}
