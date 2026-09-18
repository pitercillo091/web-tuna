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
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const depthSections = document.querySelectorAll('#experiencia, #servicios, #galeria, #testimonios');
    const visibleGalleryItems = new Set();

    let currentLightboxIndex = 0;
    let heroPointerX = 0;
    let heroPointerY = 0;

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
    // CINEMATIC PARALLAX
    // ============================================
    function handleHeroParallax() {
        if (reducedMotionQuery.matches) return;

        const viewportHeight = window.innerHeight || 1;
        const isCompact = window.innerWidth <= 768;

        if (hero) {
            const heroHeight = hero.offsetHeight || viewportHeight;
            const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
            const backgroundTravel = progress * heroHeight * (isCompact ? 0.08 : 0.18);
            const contentTravel = progress * heroHeight * (isCompact ? 0.015 : 0.055);

            hero.style.setProperty('--hero-bg-y', backgroundTravel.toFixed(2) + 'px');
            hero.style.setProperty('--hero-content-y', contentTravel.toFixed(2) + 'px');
            hero.style.setProperty('--hero-pointer-x', (isCompact ? 0 : heroPointerX * 14).toFixed(2) + 'px');
            hero.style.setProperty('--hero-pointer-y', (isCompact ? 0 : heroPointerY * 9).toFixed(2) + 'px');
            hero.style.setProperty('--hero-content-opacity', String(Math.max(0.2, 1 - progress * 0.92)));
            hero.style.setProperty('--hero-scroll-opacity', String(Math.max(0, 1 - progress * 2.4)));
        }

        depthSections.forEach(function (section) {
            const rect = section.getBoundingClientRect();
            if (rect.bottom < -100 || rect.top > viewportHeight + 100) return;

            const sectionCenter = rect.top + rect.height / 2;
            const distance = (viewportHeight / 2 - sectionCenter) / (viewportHeight + rect.height);
            const glowTravel = distance * (isCompact ? 36 : 110);
            const contentTravel = distance * (isCompact ? 2 : 10);

            section.style.setProperty('--depth-glow-y', glowTravel.toFixed(2) + 'px');
            section.style.setProperty('--depth-content-y', contentTravel.toFixed(2) + 'px');
        });

        if (!isCompact) {
            visibleGalleryItems.forEach(function (item) {
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.top + rect.height / 2;
                const distance = (itemCenter - viewportHeight / 2) / (viewportHeight / 2 + rect.height / 2);
                const clampedDistance = Math.max(-1, Math.min(1, distance));
                item.style.setProperty('--gallery-image-y', (clampedDistance * -12).toFixed(2) + 'px');
            });
        }
    }

    function setupCinematicParallax() {
        document.documentElement.classList.add('parallax-ready');

        if (reducedMotionQuery.matches) {
            document.documentElement.classList.add('parallax-reduced');
            return;
        }

        if (hero) {
            const atmosphere = document.createElement('div');
            atmosphere.className = 'hero__atmosphere';
            atmosphere.setAttribute('aria-hidden', 'true');
            atmosphere.innerHTML = '<span></span><span></span><span></span>';
            hero.appendChild(atmosphere);

            const frame = document.createElement('div');
            frame.className = 'hero__cinematic-frame';
            frame.setAttribute('aria-hidden', 'true');
            hero.appendChild(frame);

            if (finePointerQuery.matches) {
                hero.addEventListener('pointermove', function (event) {
                    const rect = hero.getBoundingClientRect();
                    heroPointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
                    heroPointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
                    requestParallaxFrame();
                }, { passive: true });

                hero.addEventListener('pointerleave', function () {
                    heroPointerX = 0;
                    heroPointerY = 0;
                    requestParallaxFrame();
                });
            }
        }

        depthSections.forEach(function (section, index) {
            section.classList.add('depth-section');
            const glow = document.createElement('div');
            glow.className = 'depth-section__glow depth-section__glow--' + (index % 2 === 0 ? 'left' : 'right');
            glow.setAttribute('aria-hidden', 'true');
            section.insertBefore(glow, section.firstChild);
        });

        if ('IntersectionObserver' in window) {
            const galleryDepthObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        visibleGalleryItems.add(entry.target);
                    } else {
                        visibleGalleryItems.delete(entry.target);
                    }
                });
            }, { rootMargin: '160px 0px' });

            galleryItems.forEach(function (item) {
                galleryDepthObserver.observe(item);
            });
        } else {
            galleryItems.forEach(function (item) {
                visibleGalleryItems.add(item);
            });
        }

        if (finePointerQuery.matches) {
            galleryItems.forEach(function (item) {
                item.addEventListener('pointermove', function (event) {
                    const rect = item.getBoundingClientRect();
                    const x = (event.clientX - rect.left) / rect.width - 0.5;
                    const y = (event.clientY - rect.top) / rect.height - 0.5;
                    item.style.setProperty('--gallery-tilt-x', (y * -5).toFixed(2) + 'deg');
                    item.style.setProperty('--gallery-tilt-y', (x * 6).toFixed(2) + 'deg');
                    item.style.setProperty('--gallery-light-x', ((x + 0.5) * 100).toFixed(1) + '%');
                    item.style.setProperty('--gallery-light-y', ((y + 0.5) * 100).toFixed(1) + '%');
                }, { passive: true });

                item.addEventListener('pointerleave', function () {
                    item.style.setProperty('--gallery-tilt-x', '0deg');
                    item.style.setProperty('--gallery-tilt-y', '0deg');
                });
            });
        }

        handleHeroParallax();
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
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading feedback (but don't preventDefault!)
            submitBtn.innerHTML = '⏳ Enviando...';
            submitBtn.style.background = '#f39c12';
            submitBtn.disabled = true;
            
            // Restore after delay (form will submit normally via POST)
            setTimeout(function () {
                submitBtn.innerHTML = '✅ ¡Mensaje enviado!';
                submitBtn.style.background = '#25D366';
            }, 2000);
            
            setTimeout(function () {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 5000);
        });
    }

    // ============================================
    // SCROLL EVENT LISTENER (Throttled)
    // ============================================
    let ticking = false;

    function requestParallaxFrame() {
        if (ticking) return;

        window.requestAnimationFrame(function () {
            handleHeaderScroll();
            updateActiveNav();
            handleHeroParallax();
            ticking = false;
        });
        ticking = true;
    }

    function onScroll() {
        requestParallaxFrame();
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
            requestParallaxFrame();
        });
    }

    // ============================================
    // MAPA INTERACTIVO DE ANDALUCÍA (Leaflet.js)
    // ============================================
    function initMapaAndalucia() {
        const mapContainer = document.getElementById('mapa-andalucia');
        if (!mapContainer || typeof L === 'undefined') return;

        const coverageBounds = [[36.0, -7.55], [40.45, -1.4]];

        // Centro geográfico de la zona de actuación
        const map = L.map('mapa-andalucia', {
            center: [37.5, -4.5],
            zoom: 7,
            minZoom: 6,
            maxZoom: 12,
            maxBounds: [[35.45, -8.25], [41.05, -0.8]],
            maxBoundsViscosity: 0.65,
            zoomControl: true,
            scrollWheelZoom: true,
            dragging: true,
            tap: true,
            touchZoom: true
        });

        // Capa pública, oscurecida visualmente desde los estilos de la web
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abc',
            maxZoom: 19
        }).addTo(map);

        L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);

        // Zonas aproximadas de cobertura
        const coverageRegions = [
            {
                name: 'Andalucía',
                coordinates: [[38.05, -7.52], [38.42, -6.45], [38.22, -5.15], [38.2, -3.05], [37.9, -1.8], [37.2, -1.65], [36.68, -2.05], [36.28, -2.75], [36.0, -3.85], [36.08, -5.5], [36.4, -6.45], [36.0, -6.95], [36.7, -7.5], [37.45, -7.55]],
                color: '#cc0000'
            },
            {
                name: 'Extremadura',
                coordinates: [[40.5, -7.5], [40.5, -5.2], [39.42, -5.0], [38.4, -5.5], [38.2, -7.5]],
                color: '#b30000'
            },
            {
                name: 'Sur de Castilla-La Mancha',
                coordinates: [[39.9, -4.6], [39.9, -1.4], [38.2, -1.3], [38.0, -3.2], [38.2, -4.8]],
                color: '#a40000'
            }
        ];

        const coverageLayer = L.layerGroup().addTo(map);
        coverageRegions.forEach(function (region) {
            const area = L.polygon(region.coordinates, {
                color: region.color,
                weight: 1.5,
                opacity: 0.8,
                fillColor: region.color,
                fillOpacity: 0.16,
                lineJoin: 'round'
            }).addTo(coverageLayer);

            area.bindTooltip(region.name, {
                sticky: true,
                className: 'map-region-tooltip'
            });

            area.on('mouseover', function () {
                area.setStyle({ weight: 2.5, fillOpacity: 0.27 });
            });

            area.on('mouseout', function () {
                area.setStyle({ weight: 1.5, fillOpacity: 0.16 });
            });
        });

        // Marcador rojo personalizado
        const redIcon = L.divIcon({
            className: 'custom-marker',
            html: '<span class="tuna-map-marker"><span class="tuna-map-marker__core">♪</span></span>',
            iconSize: [30, 40],
            iconAnchor: [15, 36],
            popupAnchor: [0, -32]
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
                    '<div class="map-popup"><strong>📍 ' + p.nombre + '</strong>' +
                    '<span class="map-popup__coverage">Actuamos en esta zona</span>' +
                    '<span class="map-popup__label">Contacta con nosotros</span>' +
                    '<a href="tel:+34622358110">Pedro · 622 358 110</a>' +
                    '<a href="tel:+34666444059">Miguel · 666 444 059</a>' +
                    '<a href="tel:+34650318898">Francisco Javier · 650 318 898</a>' +
                    '<a class="map-popup__whatsapp" href="https://wa.me/34622358110" target="_blank" rel="noopener">💬 Escribir por WhatsApp</a>' +
                    '</div>'
                );
        });

        const legend = L.control({ position: 'bottomleft' });
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML = '<strong>Zona de actuación</strong><span><i></i> Provincias con cobertura</span>';
            L.DomEvent.disableClickPropagation(div);
            return div;
        };
        legend.addTo(map);

        const resetView = L.control({ position: 'topright' });
        resetView.onAdd = function () {
            const button = L.DomUtil.create('button', 'map-reset');
            button.type = 'button';
            button.title = 'Ver toda la zona de cobertura';
            button.setAttribute('aria-label', 'Ver toda la zona de cobertura');
            button.innerHTML = '⌂';
            L.DomEvent.disableClickPropagation(button);
            L.DomEvent.on(button, 'click', function () {
                map.fitBounds(coverageBounds, { padding: [18, 18], maxZoom: 7 });
            });
            return button;
        };
        resetView.addTo(map);

        map.fitBounds(coverageBounds, { padding: [18, 18], maxZoom: 7 });

    }

    // ============================================
    // INITIALIZE
    // ============================================
    function init() {
        setupEventListeners();
        setupScrollAnimations();
        setupCinematicParallax();
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
