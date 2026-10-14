/**
 * navigation.js — sticky header state, mobile menu, active-section highlight.
 */
(function () {
  'use strict';
  var DS = (window.DevScale = window.DevScale || {});

  var desktopQuery = window.matchMedia('(min-width: 56.25em)');

  function initHeaderState(header) {
    var sentinel = document.querySelector('[data-scroll-sentinel]');
    if (!sentinel || !('IntersectionObserver' in window)) {
      // Fallback: passive scroll listener
      var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 24); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return;
    }
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  function initMenu(header) {
    var toggle = header.querySelector('[data-menu-toggle]');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    var inertTargets = Array.prototype.slice.call(document.querySelectorAll('main, footer, .to-top'));

    function setOpen(open, returnFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      header.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      inertTargets.forEach(function (el) { el.inert = open; });
      if (!open && returnFocus) toggle.focus();
    }

    // On mobile the closed panel must not be reachable by keyboard.
    function syncForViewport() {
      if (desktopQuery.matches) {
        setOpen(false, false);
        nav.removeAttribute('aria-hidden');
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true', false);
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false, false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
    });

    var onChange = syncForViewport;
    if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', onChange);
    else if (desktopQuery.addListener) desktopQuery.addListener(onChange);
    syncForViewport();
  }

  function initActiveLink() {
    var links = Array.prototype.slice.call(document.querySelectorAll('[data-nav-link]'));
    var sections = Array.prototype.slice.call(document.querySelectorAll('[data-section][data-nav]'));
    if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

    var current = null;
    function setActive(key) {
      if (key === current) return;
      current = key;
      links.forEach(function (a) {
        if (a.getAttribute('data-nav-link') === key) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }

    // A thin band across the middle of the viewport decides which section is "current".
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.getAttribute('data-nav'));
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { io.observe(s); });
    DS._navObserver = io;
  }

  DS.navigation = {
    init: function () {
      var header = document.querySelector('[data-header]');
      if (!header) return;
      initHeaderState(header);
      initMenu(header);
      initActiveLink();
    }
  };
})();
