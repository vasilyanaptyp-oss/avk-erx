/* AVK ERX: phone menu (all sheets) and the request form on kontakti.html (opens the visitor's mail program). */
(function () {
  'use strict';
  var d = document;
  var TO = 'avkerx@gmail.com';

  /* ---------- phone menu ---------- */
  var btn = d.querySelector('.menubtn');
  var menu = d.getElementById('izvelne');
  if (btn && menu) {
    var label = btn.querySelector('.menubtn__t');
    var setMenu = function (open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.hidden = !open;
      if (label) label.textContent = open ? 'Aizvērt' : 'Izvēlne';
    };
    btn.addEventListener('click', function () {
      setMenu(btn.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        btn.focus();
      }
    });
    var mq = window.matchMedia('(min-width: 1200px)');
    var onMq = function () { if (mq.matches) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
  }

  /* ---------- request form ---------- */
  var form = d.getElementById('forma');
  if (!form) return;
  var done = d.getElementById('form-done');
  var f = {
    vards: form.elements.vards,
    kontakts: form.elements.kontakts,
    eka: form.elements.eka,
    vajag: form.elements.vajag,
    zina: form.elements.zina
  };
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, msg) {
    var field = input.closest('.field');
    var err = d.getElementById('e-' + input.id.replace('f-', ''));
    if (msg) {
      field.classList.add('is-bad');
      input.setAttribute('aria-invalid', 'true');
      if (err) { err.textContent = msg; err.hidden = false; }
    } else {
      field.classList.remove('is-bad');
      input.removeAttribute('aria-invalid');
      if (err) { err.textContent = ''; err.hidden = true; }
    }
  }

  var rules = {
    vards: function (v) { return v ? '' : 'Lūdzu, ierakstiet vārdu.'; },
    kontakts: function (v) {
      if (!v) return 'Lūdzu, ierakstiet tālruni vai e-pastu.';
      var ok = v.indexOf('@') > -1
        ? EMAIL.test(v)
        : (v.replace(/\D/g, '').length >= 8 && !/[^\d\s+()-]/.test(v));
      return ok ? '' : 'Šķiet, tālrunis vai e-pasts nav pareizs.';
    },
    zina: function (v) { return v.length >= 3 ? '' : 'Lūdzu, īsi aprakstiet objektu.'; }
  };

  function checkOne(k) {
    var msg = rules[k](f[k].value.trim());
    setError(f[k], msg);
    return !msg;
  }

  function check() {
    var bad = [];
    Object.keys(rules).forEach(function (k) { if (!checkOne(k)) bad.push(f[k]); });
    return bad;
  }

  function buildMailto() {
    var eka = f.eka.value;
    var vajag = f.vajag.value;
    var subject = 'Jautājums par objektu' + (vajag ? ': ' + vajag.toLowerCase() : '');
    var lines = [
      'Labdien!',
      '',
      f.zina.value.trim(),
      '',
      'Ēkas veids: ' + (eka || 'nav norādīts'),
      'Vajadzīgs: ' + (vajag || 'nav norādīts'),
      '',
      'Vārds: ' + f.vards.value.trim(),
      'Kontakti: ' + f.kontakts.value.trim()
    ];
    return 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\r\n'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = check();
    if (bad.length) {
      if (done) done.hidden = true;
      bad[0].focus();
      return;
    }
    var url = buildMailto();
    window.AVK_LAST_MAILTO = url;
    if (done) done.hidden = false;
    if (!window.AVK_NO_MAILTO) window.location.href = url;
  });

  /* re-check a field once the visitor fixes it */
  Object.keys(rules).forEach(function (k) {
    f[k].addEventListener('input', function () {
      if (f[k].getAttribute('aria-invalid') === 'true') checkOne(k);
    });
  });

  window.AVK = { buildMailto: buildMailto, check: check };
})();
