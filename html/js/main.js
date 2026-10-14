/**
 * main.js — bootstraps every module and handles small site-wide features.
 * Each module is initialised in its own try/catch so one failure never
 * takes the rest of the page down.
 */
(function () {
  'use strict';
  var DS = (window.DevScale = window.DevScale || {});

  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  function initAvailability() {
    var el = document.querySelector('[data-availability]');
    if (!el) return;
    var cfg = (window.DEVSCALE_CONFIG && window.DEVSCALE_CONFIG.availability) || {};
    if (cfg.show === false) { el.hidden = true; return; }
    var text = el.querySelector('[data-availability-text]');
    if (text && typeof cfg.text === 'string' && cfg.text.trim()) text.textContent = cfg.text.trim();
  }

  function initSocial() {
    var list = document.querySelector('[data-social]');
    var items = (window.DEVSCALE_CONFIG && window.DEVSCALE_CONFIG.social) || [];
    if (!list || !items.length) return;
    var added = 0;
    items.forEach(function (item) {
      if (!item || !/^https:\/\//i.test(item.href || '') || !item.label) return;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = item.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = item.label;
      var sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = ' (opens in a new tab)';
      a.appendChild(sr);
      li.appendChild(a);
      list.appendChild(li);
      added++;
    });
    if (added) list.hidden = false;
  }

  function initBackToTop() {
    var btn = document.querySelector('[data-to-top]');
    var hero = document.getElementById('home');
    if (!btn) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' });
      var brand = document.querySelector('.site-header .brand');
      if (brand) brand.focus({ preventScroll: true });
    });

    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        btn.classList.toggle('is-visible', !entries[0].isIntersecting);
      }, { threshold: 0.05 }).observe(hero);
    } else {
      window.addEventListener('scroll', function () { btn.classList.toggle('is-visible', window.scrollY > 700); }, { passive: true });
    }
  }

  function run(name, fn) {
    try { fn(); } catch (err) { if (window.console) console.error('[DevScale] ' + name + ' failed:', err); }
  }

  function start() {
    run('year', initYear);
    run('availability', initAvailability);
    run('social', initSocial);
    run('navigation', function () { DS.navigation && DS.navigation.init(); });
    run('animations', function () { DS.animations && DS.animations.init(); });
    run('portfolio', function () { DS.portfolio && DS.portfolio.init(); });
    run('faq', function () { DS.faq && DS.faq.init(); });
    run('contact', function () { DS.contact && DS.contact.init(); });
    run('backToTop', initBackToTop);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
