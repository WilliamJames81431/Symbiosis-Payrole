/**
 * ============================================================
 *  Good Samaritans – Landing Page Script
 *  Pure vanilla ES6+ • No external dependencies
 * ============================================================
 *
 *  Features
 *  --------
 *  1.  Loading screen with fade-out
 *  2.  Scroll-triggered animations (Intersection Observer)
 *  3.  Parallax backgrounds
 *  4.  Sticky navigation + mobile menu
 *  5.  Animated counters
 *  6.  Cursor trail effect (desktop)
 *  7.  Floating hero particles
 *  8.  Typing / typewriter effect
 *  9.  Image lazy loading
 * 10.  Gallery staggered reveal
 * 11.  Back-to-top button
 * 12.  Donate-button pulse
 * 13.  Scroll progress bar
 * 14.  Performance helpers (rAF, throttle, passive, reduced-motion)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ===========================================================
   *  0 · UTILITIES & PERFORMANCE HELPERS
   * =========================================================== */

  /**
   * Returns true when the user has requested reduced motion
   * via their OS / browser accessibility settings.
   */
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Simple throttle – fires at most once per `limit` ms. */
  const throttle = (fn, limit = 16) => {
    let waiting = false;
    return (...args) => {
      if (waiting) return;
      waiting = true;
      fn(...args);
      setTimeout(() => { waiting = false; }, limit);
    };
  };

  /** Debounce – waits until calls stop for `delay` ms, then fires. */
  const debounce = (fn, delay = 100) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  /** Schedule work on the next animation frame (single-queued). */
  const onNextFrame = (() => {
    let queued = false;
    let callback = null;
    return (fn) => {
      callback = fn;
      if (!queued) {
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          if (callback) callback();
        });
      }
    };
  })();

  /** Format a number with comma separators: 12000 → "12,000" */
  const formatNumber = (n) => Math.round(n).toLocaleString('en-US');

  /** True on touch-primary devices (phones / tablets). */
  const isTouchDevice = () =>
    'ontouchstart' in window || navigator.maxTouchPoints > 0;


  /* ===========================================================
   *  1 · LOADING SCREEN
   * =========================================================== */

  const initLoadingScreen = () => {
    const loader = document.querySelector('.loading-screen, .loader-overlay, #loader');
    if (!loader) return;

    // If reduced-motion: hide immediately
    if (prefersReducedMotion()) {
      loader.style.display = 'none';
      document.body.classList.add('loaded');
      return;
    }

    // Hold the loader for 2 s, then fade it out
    setTimeout(() => {
      loader.classList.add('fade-out');
      loader.addEventListener('transitionend', () => {
        loader.style.display = 'none';
        document.body.classList.add('loaded');
      }, { once: true });

      // Fallback if transitionend never fires
      setTimeout(() => {
        loader.style.display = 'none';
        document.body.classList.add('loaded');
      }, 800);
    }, 2000);
  };


  /* ===========================================================
   *  2 · SCROLL-TRIGGERED ANIMATIONS (Intersection Observer)
   * =========================================================== */

  const initScrollAnimations = () => {
    if (prefersReducedMotion()) {
      // Make everything visible right away when motion is reduced
      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        el.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const delay = parseInt(el.dataset.delay, 10) || 0;

          setTimeout(() => {
            el.classList.add('visible');
          }, delay);

          // Stop observing once revealed
          observer.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      // Ensure the correct animation data attribute is applied
      if (el.dataset.animation) {
        el.classList.add(el.dataset.animation);
      }
      observer.observe(el);
    });
  };


  /* ===========================================================
   *  3 · PARALLAX EFFECTS
   * =========================================================== */

  const initParallax = () => {
    if (prefersReducedMotion()) return;

    const parallaxEls = document.querySelectorAll('.parallax-bg');
    const hero = document.querySelector('.hero, .hero-section, #hero');

    if (!parallaxEls.length && !hero) return;

    const handleParallax = () => {
      const scrollY = window.scrollY;

      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 0.4;
        const yOffset = -(scrollY * speed);
        el.style.transform = `translate3d(0, ${yOffset}px, 0)`;
      });

      // Subtle hero parallax
      if (hero) {
        const heroSpeed = 0.25;
        hero.style.backgroundPositionY = `${scrollY * heroSpeed}px`;
      }
    };

    window.addEventListener(
      'scroll',
      throttle(() => onNextFrame(handleParallax), 16),
      { passive: true }
    );
  };


  /* ===========================================================
   *  4 · NAVIGATION
   * =========================================================== */

  const initNavigation = () => {
    const nav = document.querySelector('nav, .navbar, header');
    const navLinks = document.querySelectorAll('nav a[href^="#"], .navbar a[href^="#"], .nav-links a[href^="#"]');
    const hamburger = document.querySelector('.hamburger, .menu-toggle, .mobile-toggle, .nav-toggle');
    const mobileMenu = document.querySelector('.nav-links, .mobile-menu, .nav-menu');
    const sections = document.querySelectorAll('section[id]');

    /* --- Sticky / scrolled class --- */
    if (nav) {
      const onScroll = throttle(() => {
        nav.classList.toggle('scrolled', window.scrollY > 100);
      }, 100);

      window.addEventListener('scroll', onScroll, { passive: true });
      // Initial check
      nav.classList.toggle('scrolled', window.scrollY > 100);
    }

    /* --- Smooth scroll for anchor links --- */
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        // Close mobile menu if open
        if (mobileMenu) mobileMenu.classList.remove('active', 'open', 'show');
        if (hamburger) hamburger.classList.remove('active', 'open');
        document.body.classList.remove('menu-open');

        const navHeight = nav ? nav.offsetHeight : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetTop,
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
      });
    });

    /* --- Active link highlighting --- */
    if (sections.length && navLinks.length) {
      const highlightActive = throttle(() => {
        const scrollPos = window.scrollY + (nav ? nav.offsetHeight : 0) + 80;

        let currentId = '';
        sections.forEach((section) => {
          if (section.offsetTop <= scrollPos) {
            currentId = section.id;
          }
        });

        navLinks.forEach((link) => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${currentId}`
          );
        });
      }, 150);

      window.addEventListener('scroll', highlightActive, { passive: true });
    }

    /* --- Hamburger toggle --- */
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('active');
        mobileMenu.classList.toggle('open', isOpen);
        hamburger.classList.toggle('active');
        hamburger.classList.toggle('open');
        document.body.classList.toggle('menu-open', isOpen);

        // Toggle ARIA
        hamburger.setAttribute('aria-expanded', String(isOpen));
      });
    }
  };


  /* ===========================================================
   *  5 · COUNTER ANIMATION
   * =========================================================== */

  const initCounters = () => {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const animateCounter = (el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const duration = 2000; // ms
      const startTime = performance.now();

      // Ease-out cubic: decelerates towards the end
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = target * easeOut(progress);

        el.textContent = formatNumber(value);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = formatNumber(target);
        }
      };

      requestAnimationFrame(tick);
    };

    // Skip animation if reduced-motion
    if (prefersReducedMotion()) {
      counters.forEach((el) => {
        el.textContent = formatNumber(parseInt(el.dataset.target, 10) || 0);
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach((el) => observer.observe(el));
  };


  /* ===========================================================
   *  6 · CURSOR TRAIL EFFECT (desktop only)
   * =========================================================== */

  const initCursorTrail = () => {
    if (isTouchDevice() || prefersReducedMotion()) return;

    const DOT_COUNT = 7;
    const BRAND_BLUE = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary')
      .trim() || '#2563eb';

    const dots = [];

    for (let i = 0; i < DOT_COUNT; i++) {
      const dot = document.createElement('div');
      const size = Math.max(4, 12 - i * 1.5);
      const opacity = Math.max(0.15, 0.8 - i * 0.1);

      Object.assign(dot.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: BRAND_BLUE,
        opacity: String(opacity),
        pointerEvents: 'none',
        zIndex: '9999',
        transition: `transform ${60 + i * 40}ms ease-out`,
        boxShadow: `0 0 ${6 + i}px ${BRAND_BLUE}`,
        willChange: 'transform',
      });

      document.body.appendChild(dot);
      dots.push({ el: dot, x: -100, y: -100 });
    }

    let mouseX = -100;
    let mouseY = -100;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    const updateDots = () => {
      // Lead dot follows mouse directly
      dots[0].x = mouseX;
      dots[0].y = mouseY;
      dots[0].el.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

      // Trailing dots ease toward the dot ahead of them
      for (let i = 1; i < dots.length; i++) {
        const prev = dots[i - 1];
        const curr = dots[i];
        curr.x += (prev.x - curr.x) * 0.35;
        curr.y += (prev.y - curr.y) * 0.35;
        curr.el.style.transform = `translate(${curr.x}px, ${curr.y}px)`;
      }

      requestAnimationFrame(updateDots);
    };

    requestAnimationFrame(updateDots);
  };


  /* ===========================================================
   *  7 · FLOATING PARTICLES IN HERO
   * =========================================================== */

  const initHeroParticles = () => {
    const hero = document.querySelector('.hero, .hero-section, #hero');
    if (!hero || prefersReducedMotion()) return;

    const PARTICLE_COUNT = 18; // 15-20 range
    const container = document.createElement('div');
    container.classList.add('particles-container');
    Object.assign(container.style, {
      position: 'absolute',
      inset: '0',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: '1',
    });

    // Ensure hero can contain absolute children
    if (getComputedStyle(hero).position === 'static') {
      hero.style.position = 'relative';
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = document.createElement('span');
      const size = 3 + Math.random() * 5; // 3-8 px
      const left = Math.random() * 100;
      const animDuration = 6 + Math.random() * 10; // 6-16 s
      const animDelay = Math.random() * 8;
      const startTop = Math.random() * 100;

      Object.assign(particle.style, {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.35)',
        left: `${left}%`,
        top: `${startTop}%`,
        opacity: String(0.2 + Math.random() * 0.5),
        animation: `floatParticle ${animDuration}s ${animDelay}s ease-in-out infinite`,
        pointerEvents: 'none',
      });

      container.appendChild(particle);
    }

    hero.appendChild(container);

    // Inject keyframes if not already present
    if (!document.querySelector('#particle-keyframes')) {
      const style = document.createElement('style');
      style.id = 'particle-keyframes';
      style.textContent = `
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25%      { transform: translateY(-30px) translateX(15px); opacity: 0.6; }
          50%      { transform: translateY(-15px) translateX(-10px); opacity: 0.4; }
          75%      { transform: translateY(-40px) translateX(20px); opacity: 0.55; }
        }
      `;
      document.head.appendChild(style);
    }
  };


  /* ===========================================================
   *  8 · TYPING / TYPEWRITER EFFECT
   * =========================================================== */

  const initTypingEffect = () => {
    const el = document.querySelector('.typing-text, .typewriter, [data-typing]');
    if (!el) return;

    const phrases = [
      "Serving God's Workers",
      'Caring for the Poor',
      "Sharing Christ's Love",
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const TYPE_SPEED   = 80;   // ms per character (typing)
    const DELETE_SPEED  = 40;   // ms per character (erasing)
    const PAUSE_AFTER   = 1800; // ms to hold the complete phrase
    const PAUSE_BETWEEN = 400;  // ms gap after erasing

    // Reduced-motion: just show the first phrase, no animation
    if (prefersReducedMotion()) {
      el.textContent = phrases[0];
      return;
    }

    // Add blinking cursor via CSS if not styled already
    if (!el.classList.contains('has-cursor')) {
      el.classList.add('has-cursor');
      if (!document.querySelector('#typing-cursor-style')) {
        const style = document.createElement('style');
        style.id = 'typing-cursor-style';
        style.textContent = `
          .has-cursor::after {
            content: '|';
            display: inline-block;
            margin-left: 2px;
            animation: cursorBlink 0.7s steps(1) infinite;
            color: inherit;
          }
          @keyframes cursorBlink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
    }

    const tick = () => {
      const currentPhrase = phrases[phraseIndex];

      if (!isDeleting) {
        // Typing forward
        el.textContent = currentPhrase.slice(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentPhrase.length) {
          // Finished typing → pause, then start deleting
          isDeleting = true;
          setTimeout(tick, PAUSE_AFTER);
          return;
        }
        setTimeout(tick, TYPE_SPEED);
      } else {
        // Erasing
        el.textContent = currentPhrase.slice(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(tick, PAUSE_BETWEEN);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      }
    };

    // Small initial delay so the page settles before typing starts
    setTimeout(tick, 600);
  };


  /* ===========================================================
   *  9 · IMAGE LAZY LOADING
   * =========================================================== */

  const initLazyLoad = () => {
    const lazyImages = document.querySelectorAll('img[data-src], img.lazy');
    if (!lazyImages.length) return;

    const loadImage = (img) => {
      const src = img.dataset.src || img.getAttribute('data-src');
      if (!src) return;

      img.src = src;
      img.addEventListener('load', () => {
        img.classList.add('loaded', 'visible');
        img.removeAttribute('data-src');
      }, { once: true });

      img.addEventListener('error', () => {
        img.classList.add('error');
      }, { once: true });
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            loadImage(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: '200px 0px' } // start loading a bit early
      );

      lazyImages.forEach((img) => observer.observe(img));
    } else {
      // Fallback: load everything immediately
      lazyImages.forEach(loadImage);
    }
  };


  /* ===========================================================
   * 10 · GALLERY STAGGERED REVEAL
   * =========================================================== */

  const initGalleryReveal = () => {
    const galleryItems = document.querySelectorAll(
      '.gallery-item, .gallery .item, .gallery-grid > *'
    );
    if (!galleryItems.length) return;

    if (prefersReducedMotion()) {
      galleryItems.forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          // Calculate stagger index among siblings
          const parent = entry.target.parentElement;
          const siblings = parent ? [...parent.children] : [];
          const idx = siblings.indexOf(entry.target);
          const stagger = idx * 120; // 120 ms per item

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, stagger);

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1 }
    );

    galleryItems.forEach((el) => observer.observe(el));
  };


  /* ===========================================================
   * 11 · BACK TO TOP BUTTON
   * =========================================================== */

  const initBackToTop = () => {
    const btn =
      document.querySelector('.back-to-top, #back-to-top, .scroll-top');
    if (!btn) return;

    const toggleVisibility = throttle(() => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, 200);

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    });

    // Initial check
    toggleVisibility();
  };


  /* ===========================================================
   * 12 · DONATE BUTTON PULSE
   * =========================================================== */

  const initDonatePulse = () => {
    if (prefersReducedMotion()) return;

    const donateButtons = document.querySelectorAll(
      '.btn-donate, .donate-btn, a[href*="donate"], .cta-donate'
    );
    if (!donateButtons.length) return;

    // Inject pulse keyframes once
    if (!document.querySelector('#donate-pulse-style')) {
      const style = document.createElement('style');
      style.id = 'donate-pulse-style';
      style.textContent = `
        @keyframes donatePulse {
          0%   { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.55); }
          70%  { box-shadow: 0 0 0 14px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .pulse-donate {
          animation: donatePulse 2s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }

    // Add periodic pulse — 2 s on, 3 s off — to keep it subtle
    const cyclePulse = () => {
      donateButtons.forEach((btn) => btn.classList.add('pulse-donate'));

      setTimeout(() => {
        donateButtons.forEach((btn) => btn.classList.remove('pulse-donate'));
        setTimeout(cyclePulse, 3000);
      }, 2000);
    };

    cyclePulse();
  };


  /* ===========================================================
   * 13 · SCROLL PROGRESS BAR
   * =========================================================== */

  const initScrollProgress = () => {
    let bar = document.querySelector('.scroll-progress, #scroll-progress');

    // Create the bar dynamically if it doesn't exist
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'scroll-progress';
      Object.assign(bar.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        height: '3px',
        width: '0%',
        background:
          getComputedStyle(document.documentElement)
            .getPropertyValue('--primary')
            .trim() || '#2563eb',
        zIndex: '10000',
        transition: 'width 0.15s ease-out',
        pointerEvents: 'none',
      });
      document.body.prepend(bar);
    }

    const updateProgress = throttle(() => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${progress}%`;
    }, 16);

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // initial
  };


  /* ===========================================================
   * 14 · BOOT EVERYTHING UP
   * =========================================================== */

  // Fire modules in logical order
  initLoadingScreen();
  initScrollProgress();
  initNavigation();
  initScrollAnimations();
  initParallax();
  initCounters();
  initCursorTrail();
  initHeroParticles();
  initTypingEffect();
  initLazyLoad();
  initGalleryReveal();
  initBackToTop();
  initDonatePulse();

  // Log for dev convenience
  console.log(
    '%c✝ Good Samaritans %c– page scripts initialised',
    'color:#2563eb;font-weight:bold;font-size:14px',
    'color:#64748b;font-size:12px'
  );
});
