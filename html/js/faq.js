/**
 * faq.js — accessible accordion (button + region pattern).
 * Without JavaScript every answer stays visible.
 */
(function () {
  'use strict';
  var DS = (window.DevScale = window.DevScale || {});

  DS.faq = {
    init: function () {
      var root = document.querySelector('[data-faq]');
      if (!root) return;
      var items = Array.prototype.slice.call(root.querySelectorAll('.faq__item'));
      var buttons = items.map(function (item) { return item.querySelector('button[aria-controls]'); });

      function setOpen(item, button, open) {
        button.setAttribute('aria-expanded', String(open));
        item.classList.toggle('is-open', open);
      }

      items.forEach(function (item, i) {
        var button = buttons[i];
        setOpen(item, button, false);
        button.addEventListener('click', function () {
          setOpen(item, button, button.getAttribute('aria-expanded') !== 'true');
        });
      });

      // Arrow / Home / End move focus between question buttons.
      root.addEventListener('keydown', function (e) {
        var idx = buttons.indexOf(document.activeElement);
        if (idx === -1) return;
        var next = null;
        if (e.key === 'ArrowDown') next = (idx + 1) % buttons.length;
        else if (e.key === 'ArrowUp') next = (idx - 1 + buttons.length) % buttons.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = buttons.length - 1;
        if (next !== null) { e.preventDefault(); buttons[next].focus(); }
      });
    }
  };
})();
