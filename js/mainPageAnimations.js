const section = document.querySelector('.main-section');
const height = section.offsetHeight;
if(window.innerWidth > 1200) {
    section.style.height = window.innerHeight + 20 + 'px';
}

function anim (height) {
    if(window.innerWidth > 1200) {
        setTimeout(() => {
            const tl1 = gsap.timeline({repeat: 0});
                     
            gsap.to(".main-section", {height: height, delay: 0.5});
            gsap.to(".boy-bg", {height: 670, delay: 0.5});

            gsap.fromTo(".first-part", {x: -200,opacity:0, duration: 2}, {x:0, opacity: 1}, 1);
            gsap.fromTo(".second-part", {x: -150,opacity:0, duration:2}, {x: 0, opacity: 1}, 1);
            gsap.fromTo(".third-part", {x: -125,opacity:0, duration:2}, {x:0, opacity: 1}, 1);
            gsap.fromTo(".range", {x: 200,opacity:0, duration: 2}, {x:0, opacity: 1}, 1);
            gsap.fromTo(".header-desktop", {y: -200,opacity:0, duration: 2}, {y:0, opacity: 1}, 1);
            gsap.fromTo(".main-hgroup-notion", {x: -200,opacity:0, duration: 2}, {x:0, opacity: 1}, 1);
            gsap.fromTo(".scroll-to", {x: -200,opacity:0, duration: 2}, {x:0, opacity: 1}, 1);
        
            tl1.to('#boy1', {opacity: 0, duration: 1 , delay: 1.5})
            .to('#boy2', {opacity:1, duration: 1})
            .to("#boy2", {opacity:0, duration: 1, delay: 1})
            .to("#boy3", {opacity: 1, duration: 1})
            .to("#boy3", {opacity:0, duration: 1, delay: 1})
            .to("#boy1",  {opacity: 1, duration: 1});

        }, 100);

        const tl3 = gsap.timeline({
            scrollTrigger: "#how-to",
            start: "bottom bottom"
        });

        tl3.fromTo("#how-to--item1", {y: 500, opacity: 0}, {y: 0, opacity: 1, duration: 1},)
        .fromTo("#how-to--item2", {y: 500, opacity: 0}, {y: 0, opacity: 1, duration: 1}, +0.1)
        .fromTo("#how-to--item3", {y: 500, opacity: 0}, {y: 0, opacity: 1, duration: 1}, +0.2)
        .fromTo("#how-to--item4", {y: 500, opacity: 0}, {y: 0, opacity: 1, duration: 1}, +0.3);

        const tl4 = gsap.timeline({
            scrollTrigger: "#promo",
            start: "top center"
        });

        tl4.fromTo('#promo', {x: 500, opacity: 0}, {x: 0, opacity: 1, duration: 1}, 0.5)
        

        const tl5 = gsap.timeline({
            scrollTrigger: ".question-text",
            start: "top center"
        });

        tl5.fromTo('.question-list', {x: -500, opacity: 0}, {x: 0, opacity: 1, duration: 1})
            .fromTo('#footer-content--desktop-main', {y: 500, opacity: 0}, {y: 0, opacity: 1, duration: 1}, -0.5)
    }else{
        return;
    }
}

document.addEventListener('DOMContentLoaded', anim(height));

