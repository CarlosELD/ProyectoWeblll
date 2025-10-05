// Inicializar Barba.js con transiciones
barba.init({
    transitions: [{
        name: 'opacity-transition',
        leave(data) {
            return gsap.to(data.current.container, {
                opacity: 0,
                y: 50,
                duration: 0.5
            });
        },
        enter(data) {
            return gsap.from(data.next.container, {
                opacity: 0,
                y: 50,
                duration: 0.5
            });
        }
    }],
    views: [{
        namespace: 'galeria',
        beforeEnter(data) {
            // Reiniciar carruseles al cambiar de vista
            $('.carousel').carousel('pause');
        },
        afterEnter(data) {
            // Reanudar carruseles después de la transición
            setTimeout(() => {
                $('.carousel').carousel('cycle');
            }, 600);
        }
    }]
});

// Activar miniaturas del carrusel
document.querySelectorAll('.carousel-thumbnails img').forEach(thumb => {
    thumb.addEventListener('click', function () {
        const target = this.getAttribute('data-target');
        const slideTo = this.getAttribute('data-slide-to');

        // Remover clase active de todas las miniaturas del mismo carrusel
        this.parentNode.querySelectorAll('img').forEach(img => {
            img.classList.remove('active');
        });

        // Agregar clase active a la miniatura clickeada
        this.classList.add('active');

        // Cambiar slide del carrusel
        $(target).carousel(parseInt(slideTo));
    });
});

// Actualizar miniaturas activas cuando el carrusel se mueve
$('.carousel').on('slide.bs.carousel', function (e) {
    const carouselId = '#' + $(this).attr('id');
    const slideIndex = e.to;

    // Actualizar miniatura activa
    $(carouselId).siblings('.carousel-thumbnails').find('img').removeClass('active');
    $(carouselId).siblings('.carousel-thumbnails').find(`img[data-slide-to="${slideIndex}"]`).addClass('active');
});