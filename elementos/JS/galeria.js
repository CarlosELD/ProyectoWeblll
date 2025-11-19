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
            const carousels = data.next.container.querySelectorAll('.carousel');
            carousels.forEach(carousel => {
                const bsCarousel = bootstrap.Carousel.getInstance(carousel);
                if (bsCarousel) {
                    bsCarousel.pause();
                }
            });
        },
        afterEnter(data) {
            // Reanudar carruseles después de la transición
            const carousels = data.next.container.querySelectorAll('.carousel');
            carousels.forEach(carousel => {
                const bsCarousel = new bootstrap.Carousel(carousel);
                bsCarousel.cycle();
            });

            // Activar miniaturas del carrusel
            activateCarouselThumbnails();
        }
    }]
});

// Función para activar las miniaturas del carrusel
function activateCarouselThumbnails() {
    document.querySelectorAll('.carousel-thumbnails img').forEach(thumb => {
        thumb.addEventListener('click', function () {
            const target = this.getAttribute('data-bs-target');
            const slideTo = this.getAttribute('data-bs-slide-to');

            // Remover clase active de todas las miniaturas del mismo carrusel
            this.parentNode.querySelectorAll('img').forEach(img => {
                img.classList.remove('active');
            });

            // Agregar clase active a la miniatura clickeada
            this.classList.add('active');

            // Cambiar slide del carrusel
            const carousel = bootstrap.Carousel.getInstance(document.querySelector(target));
            if (carousel) {
                carousel.to(parseInt(slideTo));
            }
        });
    });

    // Actualizar miniaturas activas cuando el carrusel se mueve
    document.querySelectorAll('.carousel').forEach(carousel => {
        carousel.addEventListener('slide.bs.carousel', function (e) {
            const carouselId = '#' + this.id;
            const slideIndex = e.to;

            // Actualizar miniatura activa
            const thumbnailsContainer = this.parentNode.querySelector('.carousel-thumbnails');
            if (thumbnailsContainer) {
                thumbnailsContainer.querySelectorAll('img').forEach(thumb => {
                    thumb.classList.remove('active');
                });
                const activeThumb = thumbnailsContainer.querySelector(`img[data-bs-slide-to="${slideIndex}"]`);
                if (activeThumb) {
                    activeThumb.classList.add('active');
                }
            }
        });
    });
}

// Inicializar las miniaturas al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    activateCarouselThumbnails();
});

// Función para alternar alto contraste
function toggleContrast() {
    document.body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
}

// Aplicar preferencia al cargar
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
    }
    
    // Aplicar animaciones a elementos específicos
    const animatedElements = document.querySelectorAll('.car-item, .gallery-item');
    animatedElements.forEach((element, index) => {
        element.classList.add('bounce-in');
        element.style.animationDelay = `${index * 0.1}s`;
    });
});