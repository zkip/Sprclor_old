addEventListener("load", e => {
    document.querySelectorAll(".Card").forEach(card => {
        addEventListener("mousemove", e => {
            let angle = e.clientX / innerWidth * 180;
            // card.style.transform = `rotateY(${angle}deg) rotateZ(${angle}deg)`;
        })
        addEventListener("mousedown", e => {
            if(card.classList.contains("flip")){
                card.classList.remove("flip");
            }else{
                card.classList.add("flip");
            }
        })
    });
});