/**
 * Hoang Yen BEAUTY & SPA — Main JavaScript
 * Production-ready vanilla JS (no frameworks)
 * Features:
 *  - Header scroll blur & shadow
 *  - Hamburger mobile menu toggle & outside-click close
 *  - Smooth scroll navigation with header offset
 *  - IntersectionObserver active nav link highlighting
 *  - Fade-up scroll animation trigger
 *  - Ceník (Pricing) tab switching
 *  - Video player with interactive thumbnail switching
 *  - Gallery Lightbox with Prev / Next / Keyboard / Touch Swipe
 *  - Mobile bottom floating navigation bar
 *  - Back-to-top smooth scroll
 */

(function () {
    'use strict';

    // Utility selectors
    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return Array.from((parent || document).querySelectorAll(selector));
    }

    var reducedMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

    function prefersReducedMotion() {
        return !!(reducedMotionQuery && reducedMotionQuery.matches);
    }

    /* -------------------------------------------------------------------------
       1. HEADER SCROLL EFFECT
       ------------------------------------------------------------------------- */
    function initHeaderScroll() {
        var header = qs('#header') || qs('.header');
        if (!header) return;

        var threshold = 50;

        function checkScroll() {
            if (window.scrollY > threshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', checkScroll, { passive: true });
        checkScroll();
    }

    /* -------------------------------------------------------------------------
       2. MOBILE MENU TOGGLE
       ------------------------------------------------------------------------- */
    function initMobileMenu() {
        var hamburger = qs('#hamburger');
        var mobileMenu = qs('#mobileMenu');
        if (!hamburger || !mobileMenu) return;

        function toggleMenu() {
            var isOpen = mobileMenu.classList.contains('active');
            if (isOpen) {
                closeMenu(true);
            } else {
                openMenu();
            }
        }

        function openMenu() {
            hamburger.classList.add('active');
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
            hamburger.setAttribute('aria-expanded', 'true');
            mobileMenu.setAttribute('aria-hidden', 'false');

            var firstLink = qs('a', mobileMenu);
            if (firstLink) {
                window.requestAnimationFrame(function () {
                    firstLink.focus();
                });
            }
        }

        function closeMenu(restoreFocus) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
            if (restoreFocus) hamburger.focus();
        }

        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMenu();
        });

        // Close on link click
        var navLinks = qsa('a', mobileMenu);
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () { closeMenu(false); });
        });

        // Close when clicking outside
        document.addEventListener('click', function (e) {
            if (mobileMenu.classList.contains('active') &&
                !mobileMenu.contains(e.target) &&
                !hamburger.contains(e.target)) {
                closeMenu(true);
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMenu(true);
            }
        });
    }

    /* -------------------------------------------------------------------------
       3. SMOOTH SCROLL NAVIGATION WITH HEADER OFFSET
       ------------------------------------------------------------------------- */
    function initSmoothScroll() {
        var links = qsa('a[href^="#"]');

        links.forEach(function (link) {
            link.addEventListener('click', function (e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#' || targetId === '') return;

                var targetEl = qs(targetId);
                if (targetEl) {
                    e.preventDefault();
                    var headerHeight = 75;
                    var targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
                    });

                    // Update URL hash without jumping
                    if (history.pushState) {
                        history.pushState(null, null, targetId);
                    }
                }
            });
        });
    }

    /* -------------------------------------------------------------------------
       4. ACTIVE NAV LINK HIGHLIGHTING
       ------------------------------------------------------------------------- */
    function initActiveNavHighlight() {
        var sections = qsa('section[id]');
        var navLinks = qsa('.nav-menu a[href^="#"]');
        if (!sections.length || !navLinks.length) return;

        function updateActiveLink() {
            var scrollPos = window.scrollY + 120;

            sections.forEach(function (section) {
                var top = section.offsetTop;
                var height = section.offsetHeight;
                var id = section.getAttribute('id');

                if (scrollPos >= top && scrollPos < top + height) {
                    navLinks.forEach(function (link) {
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', updateActiveLink, { passive: true });
        updateActiveLink();
    }

    /* -------------------------------------------------------------------------
       5. SCROLL ANIMATION (FADE-UP)
       ------------------------------------------------------------------------- */
    function initScrollAnimations() {
        var elements = qsa('.fade-up');
        if (!elements.length) return;

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -40px 0px'
            });

            elements.forEach(function (el) {
                observer.observe(el);
            });
        } else {
            // Fallback for older browsers
            elements.forEach(function (el) {
                el.classList.add('visible');
            });
        }
    }

    /* -------------------------------------------------------------------------
       6. CENÍK (PRICING) TABS
       ------------------------------------------------------------------------- */
    function initPricingTabs() {
        var tabBtns = qsa('.cenik-tab');
        var panels = qsa('.cenik-panel');
        if (!tabBtns.length || !panels.length) return;

        function activateTab(btn) {
            var targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(function (tab) {
                var isActive = tab === btn;
                tab.classList.toggle('active', isActive);
                tab.setAttribute('aria-selected', String(isActive));
                tab.setAttribute('tabindex', isActive ? '0' : '-1');
            });

            panels.forEach(function (panel) {
                var isActive = panel.id === targetTab;
                panel.classList.toggle('active', isActive);
                panel.setAttribute('aria-hidden', String(!isActive));
            });
        }

        tabBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                activateTab(this);
            });

            btn.addEventListener('keydown', function (event) {
                var currentIndex = tabBtns.indexOf(this);
                var nextIndex = currentIndex;

                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                    nextIndex = (currentIndex + 1) % tabBtns.length;
                } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                    nextIndex = (currentIndex - 1 + tabBtns.length) % tabBtns.length;
                } else if (event.key === 'Home') {
                    nextIndex = 0;
                } else if (event.key === 'End') {
                    nextIndex = tabBtns.length - 1;
                } else {
                    return;
                }

                event.preventDefault();
                tabBtns[nextIndex].focus();
                activateTab(tabBtns[nextIndex]);
            });
        });
    }

    /* -------------------------------------------------------------------------
       7. VIDEO SECTION (Interactive Thumbnails)
       ------------------------------------------------------------------------- */
    function initVideoSection() {
        var mainVideo = qs('#mainVideo');
        var thumbs = qsa('.video-thumb');
        if (!mainVideo || !thumbs.length) return;

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                var videoSrc = this.getAttribute('data-video');
                if (!videoSrc) return;

                thumbs.forEach(function (t) {
                    t.classList.remove('active');
                });
                this.classList.add('active');

                var source = qs('source', mainVideo);
                if (source) {
                    source.src = videoSrc;
                } else {
                    mainVideo.src = videoSrc;
                }
                mainVideo.load();
                mainVideo.play().catch(function () {
                    // Browser may prevent autoplay with sound; controls are available
                });
            });
        });
    }

    /* -------------------------------------------------------------------------
       8. GALLERY LIGHTBOX
       ------------------------------------------------------------------------- */
    function initGalleryLightbox() {
        var galleryItems = qsa('.gallery-item');
        var lightbox = qs('#lightbox');
        if (!galleryItems.length || !lightbox) return;

        var lightboxImg = qs('#lightboxImg', lightbox) || qs('.lightbox-image', lightbox);
        var closeBtn = qs('.lightbox-close', lightbox);
        var prevBtn = qs('.lightbox-prev', lightbox);
        var nextBtn = qs('.lightbox-next', lightbox);
        var counter = qs('#lightboxCounter', lightbox) || qs('.lightbox-counter', lightbox);
        var overlay = qs('.lightbox-overlay', lightbox);

        var currentIndex = 0;
        var images = [];
        var lastFocusedElement = null;

        // Collect all image sources
        galleryItems.forEach(function (item, idx) {
            var img = qs('img', item);
            var src = item.getAttribute('data-full') || (img ? img.getAttribute('src') : '');
            var alt = img ? img.getAttribute('alt') : 'Hoang Yen Beauty & Spa';
            images.push({ src: src, alt: alt });

            item.addEventListener('click', function () {
                openLightbox(idx);
            });

            item.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openLightbox(idx);
                }
            });
        });

        function openLightbox(index) {
            lastFocusedElement = document.activeElement;
            currentIndex = index;
            updateLightbox();
            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            if (closeBtn) {
                window.requestAnimationFrame(function () { closeBtn.focus(); });
            }
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }

        function updateLightbox() {
            if (!lightboxImg || !images[currentIndex]) return;
            lightboxImg.src = images[currentIndex].src;
            lightboxImg.alt = images[currentIndex].alt;
            if (counter) {
                counter.textContent = (currentIndex + 1) + ' / ' + images.length;
            }
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateLightbox();
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % images.length;
            updateLightbox();
        }

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (overlay) overlay.addEventListener('click', closeLightbox);
        if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); showPrev(); });
        if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); showNext(); });

        // Click outside image to close
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'Tab') {
                var focusable = qsa('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])', lightbox);
                if (!focusable.length) return;
                var first = focusable[0];
                var last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        // Touch swipe support for mobile
        var touchStartX = 0;
        var touchEndX = 0;

        lightbox.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            var diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 45) {
                if (diff > 0) {
                    showNext();
                } else {
                    showPrev();
                }
            }
        }, { passive: true });
    }

    /* -------------------------------------------------------------------------
       9. MOBILE BOTTOM BAR (Smart Scroll Behavior)
       ------------------------------------------------------------------------- */
    function initMobileBottomBar() {
        var bar = qs('#mobileBottomBar') || qs('.mobile-bottom-bar');
        if (!bar) return;

        var lastScrollY = window.scrollY;

        window.addEventListener('scroll', function () {
            var currentScrollY = window.scrollY;

            // At the very top (within 80px), keep it visible
            if (currentScrollY <= 80) {
                bar.classList.remove('hide');
            } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
                // Scrolling down fast -> hide
                bar.classList.add('hide');
            } else {
                // Scrolling up -> show
                bar.classList.remove('hide');
            }

            lastScrollY = currentScrollY;
        }, { passive: true });
    }

    /* -------------------------------------------------------------------------
       10. BACK TO TOP BUTTON
       ------------------------------------------------------------------------- */
    function initBackToTop() {
        var btn = qs('#backToTop') || qs('.back-to-top');
        if (!btn) return;

        window.addEventListener('scroll', function () {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, { passive: true });

        btn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion() ? 'auto' : 'smooth'
            });
        });
    }

    /* -------------------------------------------------------------------------
       11. WHATSAPP BOOKING FORM
       ------------------------------------------------------------------------- */
    function initWhatsAppBooking() {
        var form = qs('#whatsappBookingForm');
        if (!form) return;

        var dateInput = qs('#bookingDate', form);
        var serviceInput = qs('#bookingService', form);
        var status = qs('#bookingStatus', form);

        function validateOpeningDay() {
            if (!dateInput) return;
            if (!dateInput.value) {
                dateInput.setCustomValidity('');
                return;
            }

            var selectedParts = dateInput.value.split('-');
            var selectedDate = new Date(
                Number(selectedParts[0]),
                Number(selectedParts[1]) - 1,
                Number(selectedParts[2])
            );
            var isSunday = selectedDate.getDay() === 0;

            dateInput.setCustomValidity(isSunday ? 'V neděli máme zavřeno. Vyberte prosím termín od pondělí do soboty.' : '');
        }

        if (dateInput) {
            var today = new Date();
            var localToday = [
                today.getFullYear(),
                String(today.getMonth() + 1).padStart(2, '0'),
                String(today.getDate()).padStart(2, '0')
            ].join('-');
            dateInput.min = localToday;
            dateInput.addEventListener('change', validateOpeningDay);
            dateInput.addEventListener('input', validateOpeningDay);
        }

        qsa('[data-booking-service]').forEach(function (link) {
            link.addEventListener('click', function () {
                var requestedService = this.getAttribute('data-booking-service');
                if (!serviceInput || !requestedService) return;

                var matchingOption = qsa('option', serviceInput).some(function (option) {
                    return option.value === requestedService;
                });

                if (matchingOption) serviceInput.value = requestedService;
            });
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            validateOpeningDay();
            form.classList.add('was-validated');

            if (!form.checkValidity()) {
                form.reportValidity();
                if (status) status.textContent = 'Prosím vyplňte všechna povinná pole.';
                return;
            }

            form.classList.remove('was-validated');

            var formData = new FormData(form);
            var rawDate = String(formData.get('date') || '');
            var dateParts = rawDate.split('-');
            var formattedDate = rawDate;

            if (dateParts.length === 3) {
                formattedDate = dateParts[2] + '. ' + dateParts[1] + '. ' + dateParts[0];
            }

            var note = String(formData.get('note') || '').trim();
            var messageLines = [
                'Dobrý den, ráda/rád bych si rezervoval/a termín v Hoang Yen Beauty & Spa.',
                '',
                'Jméno: ' + String(formData.get('name') || '').trim(),
                'Telefon: ' + String(formData.get('phone') || '').trim(),
                'Služba: ' + String(formData.get('service') || '').trim(),
                'Preferovaný termín: ' + formattedDate,
                'Preferovaný čas: ' + String(formData.get('time') || '').trim()
            ];

            if (note) messageLines.push('Poznámka: ' + note);

            messageLines.push('', 'Prosím o potvrzení dostupnosti. Děkuji.');

            var whatsappUrl = 'https://wa.me/420722688168?text=' + encodeURIComponent(messageLines.join('\n'));
            if (status) status.textContent = 'Otevírám WhatsApp…';
            window.location.href = whatsappUrl;
        });
    }

    /* -------------------------------------------------------------------------
       0. PAGE LOAD INTRO (PRELOADER)
       ------------------------------------------------------------------------- */
    function initPageIntro() {
        var intro = qs('#pageIntro');
        if (!intro) return;

        var hasVisited = false;
        try {
            hasVisited = sessionStorage.getItem('hoangyen_intro_viewed') === 'true';
        } catch (_) {}

        var duration = prefersReducedMotion() ? 0 : (hasVisited ? 200 : 1050);

        setTimeout(function () {
            intro.classList.add('intro-fadeout');
            try {
                sessionStorage.setItem('hoangyen_intro_viewed', 'true');
            } catch (_) {}

            setTimeout(function () {
                if (intro && intro.parentNode) {
                    intro.parentNode.removeChild(intro);
                }
                window.dispatchEvent(new CustomEvent('hoangyen:intro-complete'));
            }, 850);
        }, duration);
    }

    /* -------------------------------------------------------------------------
       WELCOME PROMOTION POPUP
       ------------------------------------------------------------------------- */
    function initPromotionPopup() {
        var popup = qs('#promoPopup');
        if (!popup) return;

        var dialog = qs('.promo-popup-dialog', popup);
        var closeButton = qs('.promo-popup-close', popup);
        var actionLinks = qsa('[data-promo-action]', popup);
        var closeControls = qsa('[data-promo-close]', popup);
        var lastFocusedElement = null;
        var closeTimer = null;

        function openPopup() {
            if (!popup.hidden || popup.classList.contains('active')) return;

            lastFocusedElement = document.activeElement;
            popup.hidden = false;
            popup.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            window.requestAnimationFrame(function () {
                popup.classList.add('active');
                if (closeButton) closeButton.focus();
            });
        }

        function closePopup() {
            if (popup.hidden) return;

            popup.classList.remove('active');
            popup.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            window.clearTimeout(closeTimer);
            closeTimer = window.setTimeout(function () {
                popup.hidden = true;
            }, prefersReducedMotion() ? 0 : 320);

            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }

        closeControls.forEach(function (control) {
            control.addEventListener('click', closePopup);
        });

        actionLinks.forEach(function (link) {
            link.addEventListener('click', closePopup);
        });

        popup.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                closePopup();
                return;
            }

            if (event.key === 'Tab') {
                var focusable = qsa('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])', dialog || popup);
                if (!focusable.length) return;
                var first = focusable[0];
                var last = focusable[focusable.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });

        if (qs('#pageIntro')) {
            window.addEventListener('hoangyen:intro-complete', openPopup, { once: true });
        } else {
            window.setTimeout(openPopup, 250);
        }
    }

    /* -------------------------------------------------------------------------
       HERO SCROLL INDICATOR
       ------------------------------------------------------------------------- */
    function initHeroScroll() {
        var indicator = qs('.hero-scroll-indicator');
        if (!indicator) return;

        indicator.addEventListener('click', function (e) {
            e.preventDefault();
            var target = qs('#vouchers');
            if (target) {
                var headerHeight = 75;
                var targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({
                    top: targetPos,
                    behavior: prefersReducedMotion() ? 'auto' : 'smooth'
                });
            }
        });
    }

    /* -------------------------------------------------------------------------
       DESKTOP SUBTLE PARALLAX & MOTION
       ------------------------------------------------------------------------- */
    function initSubtleMotion() {
        var heroMedia = qs('.hero-media');
        if (!heroMedia || window.innerWidth < 992 || prefersReducedMotion()) return;

        var ticking = false;

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    var scrolled = window.scrollY;
                    if (scrolled < window.innerHeight) {
                        heroMedia.style.transform = 'translate3d(0, ' + (scrolled * 0.08) + 'px, 0) scale(1.035)';
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /* Pause decorative loops once the hero is no longer visible. */
    function initHeroVisibility() {
        var hero = qs('.hero');
        if (!hero || !('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                hero.classList.toggle('is-offscreen', !entry.isIntersecting);
            });
        }, { threshold: 0.01 });

        observer.observe(hero);
    }

    /* -------------------------------------------------------------------------
       INIT ON DOM READY
       ------------------------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', function () {
        initPageIntro();
        initPromotionPopup();
        initHeroScroll();
        initSubtleMotion();
        initHeroVisibility();
        initHeaderScroll();
        initMobileMenu();
        initSmoothScroll();
        initActiveNavHighlight();
        initScrollAnimations();
        initPricingTabs();
        initVideoSection();
        initGalleryLightbox();
        initMobileBottomBar();
        initBackToTop();
        initWhatsAppBooking();
    });
})();
