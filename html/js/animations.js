/**
 * animations.js — scroll reveals, headline word split, process timeline.
 *
 * - Only IntersectionObserver + one rAF-throttled scroll listener (timeline).
 * - Hidden states are only applied after .js-ready is set on <html>,
 *   so content stays visible if this script never runs.
 * - Skipped entirely when the user prefers reduced motion.
 */
(function () {
  'use strict';
  var DS = (window.DevScale = window.DevScale || {});

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- Headline word split: keeps real text in the DOM ---- */
  function splitWords(el) {
    if (el.getAttribute('data-split-done')) return;
    var index = 0;

    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var outer = document.createElement('span');
            outer.className = 'sw';
            var inner = document.createElement('span');
            inner.style.setProperty('--i', index++);
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    }
    walk(el);
    el.setAttribute('data-split-done', 'true');
  }

  /* ---- Stagger indexes for children of [data-stagger] ---- */
  function applyStagger() {
    document.querySelectorAll('[data-stagger]').forEach(function (group) {
      var items = group.querySelectorAll(':scope > [data-reveal]');
      items.forEach(function (item, i) { item.style.setProperty('--i', i); });
    });
  }

  /* ---- Reveal observer ---- */
  function initReveals() {
    var targets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal], [data-split]'));
    if (!targets.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-in');
        io.unobserve(el);

        // After the entrance finishes, drop the reveal hook so the element's own
        // hover transitions (cards, buttons) are not slowed by the reveal timing.
        if (el.hasAttribute('data-reveal')) {
          var delay = 1200 + (parseInt(getComputedStyle(el).getPropertyValue('--i'), 10) || 0) * 90;
          window.setTimeout(function () { el.removeAttribute('data-reveal'); }, delay);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    targets.forEach(function (el) { io.observe(el); });
    DS._revealObserver = io;
  }

  /* ---- Process timeline: progress line + step activation ---- */
  function initTimeline() {
    var timeline = document.querySelector('[data-timeline]');
    if (!timeline) return;
    var steps = Array.prototype.slice.call(timeline.querySelectorAll('[data-step]'));
    var ticking = false;
    var listening = false;

    function update() {
      ticking = false;
      var rect = timeline.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // Progress runs from "timeline top reaches 75% of viewport" to "timeline bottom reaches 55%".
      var start = vh * 0.75;
      var end = vh * 0.55;
      var total = rect.height + (start - end);
      var p = Math.min(1, Math.max(0, (start - rect.top) / total));
      timeline.style.setProperty('--p', p.toFixed(3));

      steps.forEach(function (step) {
        var r = step.getBoundingClientRect();
        step.classList.toggle('is-active', r.top < vh * 0.7);
      });
    }

    function requestTick() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }

    // Only listen for scroll while the timeline is near the viewport.
    new IntersectionObserver(function (entries) {
      var near = entries[0].isIntersecting;
      if (near && !listening) {
        window.addEventListener('scroll', requestTick, { passive: true });
        window.addEventListener('resize', requestTick);
        listening = true;
        requestTick();
      } else if (!near && listening) {
        window.removeEventListener('scroll', requestTick);
        window.removeEventListener('resize', requestTick);
        listening = false;
        requestTick();
      }
    }, { rootMargin: '100px 0px 100px 0px' }).observe(timeline);

    update();
  }

  function showTimelineComplete() {
    var timeline = document.querySelector('[data-timeline]');
    if (!timeline) return;
    timeline.style.setProperty('--p', 1);
    timeline.querySelectorAll('[data-step]').forEach(function (s) { s.classList.add('is-active'); });
  }

  DS.animations = {
    init: function () {
      if (reduceMotion.matches || !('IntersectionObserver' in window)) {
        showTimelineComplete();
        return;
      }

      // Split headings first so their words exist before the reveal state is applied.
      document.querySelectorAll('[data-split]').forEach(function (h) {
        splitWords(h);
        // The heading animates its words; the wrapper only needs to fade.
        var wrapper = h.closest('[data-reveal]');
        if (wrapper) wrapper.setAttribute('data-reveal', 'fade');
      });

      applyStagger();
      document.documentElement.classList.add('js-ready');
      initReveals();
      initTimeline();
    }
  };
})();
