addEventListener("load", () => {
    let scene = new THREE.Scene();
    let work = document.querySelector(".work");
    let width = work.clientWidth, height = work.clientHeight;
    var camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 0, width/2);


    // var light = new THREE.PerspectiveCamera( 45,width/height,1, 1000 );
    // light.position.set( 0, 0, -1 ).normalize();
    // scene.add(light);

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.classList.add("stage");

    let rFn = () => {
        let width = work.clientWidth, height = work.clientHeight;
        camera.aspect = width / height;
        renderer.setSize(width, height);
        camera.updateProjectionMatrix();
    }
    rFn();
    addEventListener("resize", rFn, false);
    let distance = 1;
    addEventListener("wheel", (e) => {
        let { deltaY, layerX, layerY } = e;
        if (deltaY > 0) {
            distance = -10;
        } else {
            distance = 10;
        }
        camera.position.z += distance;
        let width = work.clientWidth, height = work.clientHeight;

        // let pX = (layerX / width) * 2 - 1;
        // let pY = - (layerY / height) * 2 + 1;
        // let p = new THREE.Vector3(pX, pY, -1).unproject(camera);
        // camera.position.x = p.x;
        // camera.position.y = p.y;

        let aspect = width / height;
        camera.updateProjectionMatrix();
        console.log(camera.getWorldPosition());
    })
    let mx = 0, my = 0;
    work.appendChild(renderer.domElement);
    // work.addEventListener("mousedown", (e) => {
    //     let cx = camera.position.x, cy = camera.position.y;
    //     let { layerX: ix, layerY: iy } = e;
    //     let f1 = (e) => {
    //         let { layerX, layerY } = e;
    //         mx = cx + (ix - layerX);
    //         my = cy - (iy - layerY);
    //         camera.position.x = mx;
    //         camera.position.y = my;
    //     }
    //     let f2 = (e) => {
    //         removeEventListener("mousemove", f1);
    //         removeEventListener("mouseup", f2);
    //     }
    //     addEventListener("mousemove", f1);
    //     addEventListener("mouseup", f2);
    // })
    // work.addEventListener("mousemove", (e) => {
    //     let {layerX,layerY}=e;
    //     let pX = (layerX / width) * 2 - 1;
    //     let pY = - (layerY / height) * 2 + 1;
    //     let p = new THREE.Vector3(pX, pY, -1).unproject(camera);
    //     console.log(p);
    // })

    // var heartShape = new THREE.Shape(); // From http://blog.burlock.org/html5/17-paths

    let s1 = new THREE.Shape();
    s1.moveTo(0, 0);
    s1.lineTo(100, 10)
    s1.lineTo(120, 150);
    // s1.closePath();


    var geometry = new THREE.Geometry();
    geometry.setFromPoints(s1.getPoints());
    // console.log(geometry);
    

    console.log(geometry.vertices);

    var material = new THREE.LineDashedMaterial({ color: 0x00ff00});
    var mesh = new THREE.LineSegments(geometry,material);
    scene.add(mesh);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
})