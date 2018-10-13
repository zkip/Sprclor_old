# Sprinkle结构

## Renderer
```
type Renderer {
    camera Camera {
        set: (cam) {
            if camera { camera.clearSubject() }
            camera=cam
            camera.subscribe("update",(data){
                data=data
                draw()
            })
        }
    }
    data ItemCollection
    target HTMLElement
    (opt) {
        if opt ?"target" {
            target=opt.target
        }
        if opt ?"camera" {
            camera=opt.camera
        }
    }
    @draw(){ }
}
```

```
type Camera like Observable {
    viewport Viewport
}
```