/**
 * La Tuna — Main JavaScript
 * Vanilla JS, no dependencies
 */

(function () {
    'use strict';

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.header__nav-link');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.querySelector('.lightbox__close');
    const lightboxPrev = document.querySelector('.lightbox__prev');
    const lightboxNext = document.querySelector('.lightbox__next');
    const galleryItems = document.querySelectorAll('.galeria__item');
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    const hero = document.querySelector('.hero');
    const contactForm = document.getElementById('contactForm');

    let currentLightboxIndex = 0;

    // ============================================
    // HEADER SCROLL EFFECT
    // ============================================
    let lastScrollY = 0;

    function handleHeaderScroll() {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = scrollY;
    }

    // ============================================
    // ACTIVE NAV LINK ON SCROLL
    // ============================================
    function updateActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 150;

        sections.forEach(function (section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(function (link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ============================================
    // MOBILE MENU
    // ============================================
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        mainNav.classList.toggle('active');
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        mainNav.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ============================================
    // SMOOTH SCROLL FOR NAV LINKS
    // ============================================
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    closeMobileMenu();

                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ============================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // ============================================
    function setupScrollAnimations() {
        if (!('IntersectionObserver' in window)) {
            // Fallback: show all elements
            animateElements.forEach(function (el) {
                el.classList.add('visible');
            });
            return;
        }

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        animateElements.forEach(function (el) {
            observer.observe(el);
        });
    }

    // ============================================
    // LIGHTBOX
    // ============================================
    const galleryImages = [];
    const galleryAlts = [];

    function initGalleryData() {
        galleryItems.forEach(function (item) {
            const img = item.querySelector('img');
            if (img) {
                galleryImages.push(img.src);
                galleryAlts.push(img.alt || '');
            }
        });
    }

    function openLightbox(index) {
        if (index < 0 || index >= galleryImages.length) return;

        currentLightboxIndex = index;
        lightboxImg.src = galleryImages[currentLightboxIndex];
        lightboxImg.alt = galleryAlts[currentLightboxIndex];
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function prevImage() {
        currentLightboxIndex = (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
        lightboxImg.src = galleryImages[currentLightboxIndex];
        lightboxImg.alt = galleryAlts[currentLightboxIndex];
    }

    function nextImage() {
        currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
        lightboxImg.src = galleryImages[currentLightboxIndex];
        lightboxImg.alt = galleryAlts[currentLightboxIndex];
    }

    function setupLightbox() {
        initGalleryData();

        galleryItems.forEach(function (item, index) {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                var img = item.querySelector('img');
                if (img && img.src) {
                    window.open(img.src, '_blank');
                }
            });
        });

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', function (e) {
                e.stopPropagation();
                prevImage();
            });
        }

        if (lightboxNext) {
            lightboxNext.addEventListener('click', function (e) {
                e.stopPropagation();
                nextImage();
            });
        }

        // Close on background click
        if (lightbox) {
            lightbox.addEventListener('click', function (e) {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            if (!lightbox || !lightbox.classList.contains('active')) return;

            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
            }
        });
    }

    // ============================================
    // HERO PARALLAX-LIKE EFFECT
    // ============================================
    function handleHeroParallax() {
        const scrollY = window.scrollY;
        const heroHeight = hero ? hero.offsetHeight : 0;

        if (scrollY < heroHeight && hero) {
            const bgImg = hero.querySelector('.hero__bg-img');
            if (bgImg) {
                bgImg.style.transform = 'scale(1.1) translateY(' + (scrollY * 0.15) + 'px)';
            }
        }
    }

    // ============================================
    // HERO LOADED ANIMATION
    // ============================================
    function initHeroAnimation() {
        if (hero) {
            setTimeout(function () {
                hero.classList.add('loaded');
            }, 300);
        }
    }

    // ============================================
    // HERO IMAGE CAROUSEL
    // ============================================
    function initHeroCarousel() {
        var slides = document.querySelectorAll('.hero__bg-img');
        if (slides.length <= 1) return;
        var current = 0;
        setInterval(function() {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
        }, 5000);
    }

    // ============================================
    // CONTACT FORM (Visual Feedback)
    // ============================================
    function setupContactForm() {
        if (!contactForm) return;

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Show loading
            submitBtn.innerHTML = '⏳ Enviando...';
            submitBtn.disabled = true;

            // Send data to FormSubmit.co via fetch
            const formData = new FormData(contactForm);

            fetch('https://formsubmit.co/piter.pmap@gmail.com', {
                method: 'POST',
                body: formData
            })
            .then(function(response) {
                if (response.ok) {
                    submitBtn.innerHTML = '✅ ¡Mensaje enviado!';
                    submitBtn.style.background = '#25D366';
                    contactForm.reset();
                } else {
                    throw new Error('Error en el envio');
                }
            })
            .catch(function(error) {
                submitBtn.innerHTML = '❌ Error. Intenta por WhatsApp';
                submitBtn.style.background = '#e74c3c';
                console.error('Form error:', error);
            })
            .finally(function() {
                setTimeout(function () {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 4000);
            });
        });
    }

    // ============================================
    // SCROLL EVENT LISTENER (Throttled)
    // ============================================
    let ticking = false;

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                handleHeaderScroll();
                updateActiveNav();
                handleHeroParallax();
                ticking = false;
            });
            ticking = true;
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    function setupEventListeners() {
        // Scroll
        window.addEventListener('scroll', onScroll, { passive: true });

        // Hamburger menu
        if (hamburger) {
            hamburger.addEventListener('click', toggleMobileMenu);
        }

        // Close mobile menu on nav link click
        navLinks.forEach(function (link) {
            link.addEventListener('click', closeMobileMenu);
        });

        // Smooth scroll
        setupSmoothScroll();

        // Lightbox
        setupLightbox();

        // Contact form
        setupContactForm();

        // Close mobile menu on resize to desktop
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
    }

    // ============================================
    // MAPA INTERACTIVO DE ANDALUCÍA (Leaflet.js)
    // ============================================
    function initMapaAndalucia() {
        const mapContainer = document.getElementById('mapa-andalucia');
        if (!mapContainer || typeof L === 'undefined') return;

        // Centro geográfico de Andalucía
        const map = L.map('mapa-andalucia', {
            center: [37.5, -4.5],
            zoom: 7,
            minZoom: 6,
            maxZoom: 12,
            zoomControl: true,
            scrollWheelZoom: true,
            dragging: true,
            tap: true,
            touchZoom: true
        });

        // Capa oscura (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // Marcador rojo personalizado
        const redIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="width:14px;height:14px;background:#CC0000;border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(204,0,0,0.6);"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
            popupAnchor: [0, -12]
        });

        // Provincias de Andalucía
        const provincias = [
            { nombre: 'Sevilla', lat: 37.3891, lng: -5.9845 },
            { nombre: 'Granada', lat: 37.1773, lng: -3.5986 },
            { nombre: 'Málaga', lat: 36.7213, lng: -4.4214 },
            { nombre: 'Córdoba', lat: 37.8882, lng: -4.7794 },
            { nombre: 'Cádiz', lat: 36.5298, lng: -6.2926 },
            { nombre: 'Jaén', lat: 37.7796, lng: -3.7849 },
            { nombre: 'Huelva', lat: 37.2614, lng: -6.9447 },
            { nombre: 'Almería', lat: 36.8340, lng: -2.4637 },
            // Extremadura
            { nombre: 'Badajoz', lat: 38.8794, lng: -6.9707 },
            { nombre: 'Cáceres', lat: 39.4753, lng: -6.3724 },
            // Castilla-La Mancha (sur)
            { nombre: 'Ciudad Real', lat: 38.9862, lng: -3.9279 },
            { nombre: 'Albacete', lat: 38.9943, lng: -1.8585 }
        ];

        provincias.forEach(function(p) {
            L.marker([p.lat, p.lng], { icon: redIcon })
                .addTo(map)
                .bindPopup(
                    '<strong>📍 ' + p.nombre + '</strong><br>' +
                    '¡Llegamos aquí!<br>' +
                    'Contacta con Pedro: <a href="https://wa.me/34622358110" target="_blank">622 358 110</a>'
                );
        });


    }

    // ============================================
    // INITIALIZE
    // ============================================
    function init() {
        setupEventListeners();
        setupScrollAnimations();
        initHeroAnimation();
        initHeroCarousel();
        handleHeaderScroll();
        updateActiveNav();
        initMapaAndalucia();

        console.log('🎵 La Tuna — Web cargada correctamente');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
