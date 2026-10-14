/**
 * contact.js — form validation, honest submit handling, direct-contact CTA.
 *
 * IMPORTANT: Without contact.formEndpoint in js/config.js the form runs in
 * DEMO MODE. It validates input but sends nothing, and says so clearly.
 */
(function () {
  'use strict';
  var DS = (window.DevScale = window.DevScale || {});

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var SERVICE_LABELS = {
    'website-design': 'Website Design',
    'website-development': 'Website Development',
    'ui-ux-design': 'UI/UX Design',
    'ecommerce': 'E-commerce Website',
    'optimization': 'Website Optimization',
    'maintenance': 'Website Maintenance',
    'not-sure': 'Not sure yet'
  };

  function config() {
    var c = (window.DEVSCALE_CONFIG && window.DEVSCALE_CONFIG.contact) || {};
    return {
      endpoint: typeof c.formEndpoint === 'string' ? c.formEndpoint.trim() : '',
      email: typeof c.email === 'string' ? c.email.trim() : '',
      directCta: c.directCta || {},
      minSeconds: typeof c.minSubmitSeconds === 'number' ? c.minSubmitSeconds : 3
    };
  }

  /* ---------- Validation rules ---------- */
  var RULES = {
    name: function (v) {
      if (!v.trim()) return 'Enter your name.';
      if (v.trim().length < 2) return 'Your name should be at least 2 characters.';
      return '';
    },
    email: function (v) {
      if (!v.trim()) return 'Enter your email address.';
      if (!EMAIL_RE.test(v.trim())) return 'Enter a valid email address, like name@example.com.';
      return '';
    },
    service: function (v) {
      return v ? '' : 'Choose the service you need, or "Not sure yet".';
    },
    details: function (v) {
      var t = v.trim();
      if (!t) return 'Tell us a little about your project.';
      if (t.length < 20) return 'Add a bit more detail (at least 20 characters) so we can understand the project.';
      if (t.length > 3000) return 'Keep the details under 3,000 characters.';
      return '';
    }
  };

  function fieldParts(form, name) {
    var input = form.elements[name];
    var err = document.getElementById(input.id + '-err');
    return { input: input, err: err };
  }

  function setError(form, name, message) {
    var p = fieldParts(form, name);
    if (!p.err) return;
    p.err.textContent = message;
    if (message) p.input.setAttribute('aria-invalid', 'true');
    else p.input.removeAttribute('aria-invalid');
  }

  function validateField(form, name) {
    var msg = RULES[name](form.elements[name].value);
    setError(form, name, msg);
    return !msg;
  }

  function validateAll(form) {
    var firstInvalid = null;
    Object.keys(RULES).forEach(function (name) {
      if (!validateField(form, name) && !firstInvalid) firstInvalid = form.elements[name];
    });
    return firstInvalid;
  }

  /* ---------- Status area (built with textContent: user input is never injected as HTML) ---------- */
  function showStatus(el, kind, title, body, actions) {
    el.hidden = false;
    el.className = 'form__status form__status--' + kind;
    el.textContent = '';
    var strong = document.createElement('strong');
    strong.textContent = title;
    el.appendChild(strong);
    if (body) {
      var p = document.createElement('p');
      p.textContent = body;
      el.appendChild(p);
    }
    if (actions && actions.length) {
      var wrap = document.createElement('div');
      wrap.className = 'form__status-actions';
      actions.forEach(function (a) { wrap.appendChild(a); });
      el.appendChild(wrap);
    }
    el.focus({ preventScroll: false });
  }

  function hideStatus(el) { el.hidden = true; el.textContent = ''; el.className = 'form__status'; }

  /* ---------- Helpers ---------- */
  function collect(form) {
    var v = function (n) { return (form.elements[n].value || '').trim(); };
    return {
      name: v('name'), email: v('email'), company: v('company'),
      service: v('service'), budget: v('budget'), details: v('details')
    };
  }

  function summaryText(d) {
    return [
      'Name: ' + d.name,
      'Email: ' + d.email,
      'Company / website: ' + (d.company || '-'),
      'Service: ' + (SERVICE_LABELS[d.service] || d.service),
      'Budget: ' + (d.budget || '-'),
      '',
      d.details
    ].join('\n');
  }

  function mailtoLink(email, d) {
    var subject = 'Project enquiry — ' + (SERVICE_LABELS[d.service] || 'DevScaleSolution');
    return 'mailto:' + encodeURIComponent(email).replace('%40', '@') +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(summaryText(d));
  }

  function makeLink(label, href) {
    var a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    return a;
  }

  function makeButton(label, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
  }

  function copyText(text, button) {
    function done(ok) {
      var old = button.textContent;
      button.textContent = ok ? 'Copied' : 'Copy failed';
      window.setTimeout(function () { button.textContent = old; }, 1800);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      done(ok);
    }
  }

  /* ---------- Submit paths ---------- */
  function demoMode(status, d, cfg) {
    var actions = [];
    if (cfg.email) actions.push(makeLink('Send this by email instead', mailtoLink(cfg.email, d)));
    var copyBtn = makeButton('Copy your message', function () { copyText(summaryText(d), copyBtn); });
    actions.push(copyBtn);
    showStatus(
      status, 'info',
      'Demo mode: your message was not sent',
      'This form is not connected to an email service yet, so nothing has been delivered. ' +
      (cfg.email ? 'You can send the same details by email instead.' : 'Copy your message and share it through another channel for now.'),
      actions
    );
  }

  function sendToEndpoint(form, status, submitBtn, label, d, cfg) {
    var originalLabel = label.textContent;
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    label.textContent = 'Sending…';

    fetch(cfg.endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    }).then(function (res) {
      if (res.ok) {
        form.reset();
        ['name', 'email', 'service', 'details'].forEach(function (n) { setError(form, n, ''); });
        showStatus(status, 'success', 'Thanks, ' + (d.name.split(' ')[0] || 'there') + ' — your message was sent.',
          'We have received your project details and will follow up using the email address you provided.');
      } else {
        throw new Error('HTTP ' + res.status);
      }
    }).catch(function () {
      var actions = cfg.email ? [makeLink('Email us instead', mailtoLink(cfg.email, d))] : [];
      showStatus(status, 'error', 'Your message could not be sent',
        'Something went wrong on our side or with your connection. Your details are still in the form, so please try again' +
        (cfg.email ? ', or send them by email.' : ' in a moment.'), actions);
    }).then(function () {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      label.textContent = originalLabel;
    });
  }

  /* ---------- Init ---------- */
  function initForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    var status = form.querySelector('[data-form-status]');
    var submitBtn = form.querySelector('[data-submit]');
    var label = form.querySelector('[data-submit-label]');
    var loadedAt = Date.now();

    // Live validation: on blur, and clear errors as the user fixes them.
    Object.keys(RULES).forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener('blur', function () { if (input.value || input.getAttribute('aria-invalid')) validateField(form, name); });
      input.addEventListener('input', function () { if (input.getAttribute('aria-invalid')) validateField(form, name); });
      input.addEventListener('change', function () { if (input.getAttribute('aria-invalid')) validateField(form, name); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideStatus(status);
      var cfg = config();

      var firstInvalid = validateAll(form);
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      // Honeypot: a filled hidden field means a bot. Do nothing and claim nothing.
      if (form.elements._gotcha && form.elements._gotcha.value) return;

      if ((Date.now() - loadedAt) / 1000 < cfg.minSeconds) {
        showStatus(status, 'error', 'Please review your message',
          'That was very quick. Take a moment to check your details, then send again.');
        return;
      }

      var d = collect(form);
      if (cfg.endpoint && /^https:\/\//i.test(cfg.endpoint)) sendToEndpoint(form, status, submitBtn, label, d, cfg);
      else demoMode(status, d, cfg);
    });

    // Preselect the service when a "Discuss this service" link is used.
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-service]');
      if (!trigger) return;
      var select = form.elements.service;
      var value = trigger.getAttribute('data-service');
      if (select && select.querySelector('option[value="' + value + '"]')) {
        select.value = value;
        setError(form, 'service', '');
      }
    });
  }

  function initDirectContact() {
    var box = document.querySelector('[data-direct-contact]');
    var note = document.querySelector('[data-dev-note]');
    if (!box) return;
    var cfg = config();
    var href = (cfg.directCta.href || '').trim();
    if (!href && cfg.email) href = 'mailto:' + cfg.email;

    var safe = /^(https:\/\/|mailto:|tel:)/i.test(href);
    if (href && safe) {
      var link = box.querySelector('[data-direct-link]');
      var text = box.querySelector('[data-direct-label]');
      link.setAttribute('href', href);
      if (/^https:/i.test(href)) { link.setAttribute('target', '_blank'); link.setAttribute('rel', 'noopener noreferrer'); }
      if (text && cfg.directCta.label) text.textContent = cfg.directCta.label;
      box.hidden = false;
    } else if (note) {
      var h = window.location.hostname;
      var isLocal = !h || h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
      if (isLocal) note.hidden = false;
    }
  }

  DS.contact = {
    init: function () { initForm(); initDirectContact(); }
  };
})();
