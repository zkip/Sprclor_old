package main

import (
	"errors"
	"fmt"
	"strings"
)

type LinearErr interface {
	Error() error
}

type Err struct {
	err  error
	errs []error
}

func (e Err) Error() error {
	errsLen := len(e.errs)
	if errsLen > 0 {
		errStrs := make([]string, errsLen)
		for i := 0; i < len(e.errs); i++ {
			if e.errs[i] == nil {
				errStrs[i] = ""
			}
			errStrs[i] = e.errs[i].Error()
		}
		return errors.New(fmt.Sprintf("--error: %s\n--errors: %s\n", e.err.Error(), strings.Join(errStrs, ";\n")))
	} else {
		return e.err
	}
}
