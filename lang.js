/* ============================================
   Trust Music™ — Language Switcher (EN / SQ)
   Default: English. Choice saved in localStorage.
   Elements carry data-sq (Albanian); data-en is
   cached from the English HTML at load.
   ============================================ */
(function () {
  'use strict';

  var KEY = 'trust-lang';
  var SUPPORTED = ['en', 'sq'];
  var current = 'en';

  try {
    var saved = localStorage.getItem(KEY);
    if (saved && SUPPORTED.indexOf(saved) !== -1) current = saved;
  } catch (e) {}

  function cacheOriginals() {
    var els = document.querySelectorAll('[data-sq]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].getAttribute('data-en') === null) els[i].setAttribute('data-en', els[i].innerHTML);
    }
    var ph = document.querySelectorAll('[data-ph-sq]');
    for (var j = 0; j < ph.length; j++) {
      if (ph[j].getAttribute('data-ph-en') === null) ph[j].setAttribute('data-ph-en', ph[j].getAttribute('placeholder') || '');
    }
    var ar = document.querySelectorAll('[data-sq-aria]');
    for (var a = 0; a < ar.length; a++) {
      if (ar[a].getAttribute('data-en-aria') === null) ar[a].setAttribute('data-en-aria', ar[a].getAttribute('aria-label') || '');
    }
    var ti = document.querySelectorAll('[data-sq-title]');
    for (var k = 0; k < ti.length; k++) {
      if (ti[k].getAttribute('data-en-title') === null) ti[k].setAttribute('data-en-title', ti[k].getAttribute('title') || '');
    }
    if (!document.documentElement.getAttribute('data-title-en')) {
      document.documentElement.setAttribute('data-title-en', document.title);
    }
    var md = document.querySelector('meta[name="description"]');
    if (md && !md.getAttribute('data-desc-en')) md.setAttribute('data-desc-en', md.getAttribute('content') || '');
  }

  function apply(lang) {
    current = lang;
    document.documentElement.lang = lang;

    var els = document.querySelectorAll('[data-sq]');
    for (var i = 0; i < els.length; i++) {
      els[i].innerHTML = (lang === 'sq') ? els[i].getAttribute('data-sq') : els[i].getAttribute('data-en');
    }

    var ph = document.querySelectorAll('[data-ph-sq]');
    for (var j = 0; j < ph.length; j++) {
      ph[j].setAttribute('placeholder', (lang === 'sq') ? ph[j].getAttribute('data-ph-sq') : ph[j].getAttribute('data-ph-en'));
    }

    var ar = document.querySelectorAll('[data-sq-aria]');
    for (var a = 0; a < ar.length; a++) {
      ar[a].setAttribute('aria-label', (lang === 'sq') ? ar[a].getAttribute('data-sq-aria') : ar[a].getAttribute('data-en-aria'));
    }

    var ti = document.querySelectorAll('[data-sq-title]');
    for (var k = 0; k < ti.length; k++) {
      ti[k].setAttribute('title', (lang === 'sq') ? ti[k].getAttribute('data-sq-title') : ti[k].getAttribute('data-en-title'));
    }

    var html = document.documentElement;
    var t = html.getAttribute('data-title-sq');
    document.title = (lang === 'sq' && t) ? t : html.getAttribute('data-title-en');

    var md = document.querySelector('meta[name="description"]');
    if (md) {
      var d = (lang === 'sq' && md.getAttribute('data-desc-sq')) ? md.getAttribute('data-desc-sq') : md.getAttribute('data-desc-en');
      if (d) md.setAttribute('content', d);
    }

    updatePills();
    try { window.dispatchEvent(new CustomEvent('trustlang', { detail: lang })); } catch (e) {}
  }

  function updatePills() {
    var sw = document.getElementById('langSwitch');
    if (!sw) return;
    var btns = sw.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-lang') === current);
    }
  }

  function init() {
    cacheOriginals();
    var sw = document.getElementById('langSwitch');
    if (sw) {
      sw.innerHTML = '<button type="button" data-lang="en">EN</button><button type="button" data-lang="sq">SQ</button>';
      sw.addEventListener('click', function (e) {
        var b = e.target && e.target.closest ? e.target.closest('button') : null;
        if (b && b.getAttribute('data-lang')) {
          apply(b.getAttribute('data-lang'));
          try { localStorage.setItem(KEY, b.getAttribute('data-lang')); } catch (err) {}
        }
      });
    }
    apply(current);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.__trustApplyLang = apply;
  window.__trustLang = function () { return current; };
})();
