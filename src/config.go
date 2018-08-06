package main

import (
	"io/ioutil"
	"os"
	"path"
	"strconv"
	"strings"

	"gopkg.in/yaml.v2"
)

type ResType_Cfg struct {
	Images  []string `yaml:"Images"`
	Actions []string `yaml:"Actions"`
	Audios  []string `yaml:"Audios"`
	Videos  []string `yaml:"Videos"`
	Styles  []string `yaml:"Styles"`
	Views   []string `yaml:"Views"`
	Fonts   []string `yaml:"Fonts"`
	ctn     map[string]string
}

func (r *ResType_Cfg) isAction() bool {
	return true
}
func (r *ResType_Cfg) trustPath(urlS string) string {
	/*
		/a/b/c/a.b	resource
		/a/b/a.b/	resource
		/a/b/c/d	behaviour
		/a/b/c/d/	behaviour
	*/
	dir, base := path.Split(urlS)
TrimSpace_Tag:
	dir, base = strings.TrimSpace(dir), strings.TrimSpace(base)
	if base == "" && dir != "" {
		// /a/b/c/d/
		dir, base = path.Split(dir)
		goto TrimSpace_Tag
	}
	fileSuffix := strings.TrimSpace(path.Ext(base))
	w := r.ctn[fileSuffix]
	if fileSuffix == "" {
		// behaviour
		return ""
	} else {
		// resource
		return path.Join(w, path.Join(dir, base))
	}
}
func (r *ResType_Cfg) cache() {
	for _, img := range r.Images {
		r.ctn["."+img] = "images"
	}
	for _, act := range r.Actions {
		r.ctn["."+act] = "actions"
	}
	for _, aud := range r.Audios {
		r.ctn["."+aud] = "audios"
	}
	for _, v := range r.Videos {
		r.ctn["."+v] = "videos"
	}
	for _, sty := range r.Styles {
		r.ctn["."+sty] = "styles"
	}
	for _, view := range r.Views {
		r.ctn["."+view] = "views"
	}
	for _, font := range r.Fonts {
		r.ctn["."+font] = "fonts"
	}
}

type View_Cfg map[string]string

func (v *View_Cfg) get(pattern string) string {
	return (*v)[pattern]
}

type Server_Cfg struct {
	IP   string `yaml:"IP"`
	Port int    `yaml:"Port"`
}

func (me *Server_Cfg) getAddr() string {
	return me.IP + ":" + strconv.Itoa(me.Port)
}

type Config struct {
	Err
	folderName string
	ResType    *ResType_Cfg
	View       *View_Cfg
	Server     *Server_Cfg
}

// 记录到文件
func (c *Config) Record() *Config {
	bs, err := yaml.Marshal(c.ResType)
	if err != nil {
		c.err = err
		return c
	}
	err = ioutil.WriteFile(path.Join(c.folderName, "resType.yaml"), bs, os.ModePerm)
	if err != nil {
		c.err = err
		return c
	}
	bs, err = yaml.Marshal(c.View)
	if err != nil {
		c.err = err
		return c
	}
	err = ioutil.WriteFile(path.Join(c.folderName, "view.yaml"), bs, os.ModePerm)
	if err != nil {
		c.err = err
		return c
	}
	bs, err = yaml.Marshal(c.Server)
	if err != nil {
		c.err = err
		return c
	}
	c.err = ioutil.WriteFile(path.Join(c.folderName, "server.yaml"), bs, os.ModePerm)
	return c
}

// 从文件恢复
func (c *Config) Recovery() *Config {
	bs, err := ioutil.ReadFile(path.Join(c.folderName, "resType.yaml"))
	if err != nil {
		c.err = err
		return c
	}
	err = yaml.Unmarshal(bs, c.ResType)
	if err != nil {
		c.err = err
		return c
	}
	c.ResType.cache()
	bs, err = ioutil.ReadFile(path.Join(c.folderName, "view.yaml"))
	if err != nil {
		c.err = err
		return c
	}
	err = yaml.Unmarshal(bs, c.View)
	if err != nil {
		c.err = err
		return c
	}
	bs, err = ioutil.ReadFile(path.Join(c.folderName, "server.yaml"))
	if err != nil {
		c.err = err
		return c
	}
	c.err = yaml.Unmarshal(bs, c.Server)
	return c
}

func NewConfig(src string) *Config {
	return &Config{
		folderName: src,
		ResType:    &ResType_Cfg{ctn: map[string]string{}},
		View:       &View_Cfg{},
		Server:     &Server_Cfg{},
	}
}
