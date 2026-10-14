/**
 * portfolio.js — category filter + concept brief dialogs.
 */
(function () {
  'use strict';
  var DS = (window.DevScale = window.DevScale || {});

  var LABELS = { all: 'all', saas: 'SaaS', ecommerce: 'e-commerce', services: 'professional services' };

  function initFilters() {
    var grid = document.querySelector('[data-work-grid]');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var status = document.querySelector('[data-filter-status]');
    if (!grid || !buttons.length) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-category]'));

    function apply(filter) {
      var shown = 0;
      cards.forEach(function (card) {
        var match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.hidden = !match;
        card.classList.remove('is-filter-in');
        if (match) {
          shown++;
          void card.offsetWidth; // restart the animation
          card.classList.add('is-filter-in');
        }
      });

      if (filter === 'all') grid.removeAttribute('data-filtered');
      else grid.setAttribute('data-filtered', filter);

      buttons.forEach(function (b) {
        var on = b.getAttribute('data-filter') === filter;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });

      if (status) {
        status.textContent = 'Showing ' + shown + ' ' + (LABELS[filter] || filter) +
          ' concept project' + (shown === 1 ? '' : 's') + '.';
      }
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); });
    });
  }

  function initDialogs() {
    var openers = document.querySelectorAll('[data-open-concept]');
    if (!openers.length) return;

    function closeDialog(dialog) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      document.body.classList.remove('dialog-open');
    }

    openers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dialog = document.getElementById(btn.getAttribute('data-open-concept'));
        if (!dialog) return;
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
        document.body.classList.add('dialog-open');
      });
    });

    document.querySelectorAll('dialog.concept').forEach(function (dialog) {
      dialog.addEventListener('close', function () { document.body.classList.remove('dialog-open'); });
      dialog.addEventListener('cancel', function () { document.body.classList.remove('dialog-open'); });

      // Click on the backdrop (the dialog element itself) closes it.
      dialog.addEventListener('click', function (e) {
        if (e.target === dialog) closeDialog(dialog);
      });

      dialog.querySelectorAll('[data-close-concept]').forEach(function (el) {
        el.addEventListener('click', function () { closeDialog(dialog); });
      });
    });
  }

  DS.portfolio = {
    init: function () { initFilters(); initDialogs(); }
  };
})();
