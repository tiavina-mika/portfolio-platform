(function () {
  var KEY = 'aldaron-currency', RKEY = 'aldaron-rates';
  var rates = { EUR: 1, USD: 1.08, MGA: 4900 };
  var cur = 'EUR';
  try { cur = localStorage.getItem(KEY) || 'EUR'; } catch (e) {}
  try { var c = JSON.parse(localStorage.getItem(RKEY) || 'null'); if (c && Date.now() - c.t < 432e5) { rates.USD = c.USD; rates.MGA = c.MGA; } else load(); } catch (e) { load(); }
  function load() {
    fetch('https://open.er-api.com/v6/latest/EUR').then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.rates && d.rates.USD && d.rates.MGA) {
        rates.USD = d.rates.USD; rates.MGA = d.rates.MGA;
        try { localStorage.setItem(RKEY, JSON.stringify({ t: Date.now(), USD: rates.USD, MGA: rates.MGA })); } catch (e) {}
        if (cur !== 'EUR') refresh();
      }
    }).catch(function () {});
  }
  var NB = '\u00a0', N = '(\\d[\\d\\u00a0\\u202f ]*(?:[.,]\\d+)?)';
  function parse(s) { return parseFloat(s.replace(/[\u00a0\u202f ]/g, '').replace(',', '.')); }
  function fmt(eur, withSym) {
    if (cur === 'USD') { var u = Math.round(eur * rates.USD); return (withSym ? '$' : '') + String(u).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    var a = Math.round(eur * rates.MGA / 1000) * 1000;
    return String(a).replace(/\B(?=(\d{3})+(?!\d))/g, NB) + (withSym ? NB + 'Ar' : '');
  }
  var reRange = new RegExp(N + '(\\s(?:à|hatramin.ny|to|–|-)\\s)€?' + N + '\\s?€', 'g');
  var reSuf = new RegExp(N + '\\s?€', 'g');
  var rePre = new RegExp('€\\s?' + N, 'g');
  function conv(s) {
    if (s.indexOf('€') < 0) return s;
    s = s.replace(reRange, function (m, a, sep, b) { return fmt(parse(a), false) + sep + fmt(parse(b), true); });
    s = s.replace(reSuf, function (m, a) { return fmt(parse(a), true); });
    return s.replace(rePre, function (m, a) { return fmt(parse(a), true); });
  }
  var orig = new WeakMap(), busy = false, ver = 0;
  function apply(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) { var p = n.parentNode; if (p && (p.tagName === 'SCRIPT' || p.tagName === 'STYLE' || p.tagName === 'OPTION')) continue; list.push(n); }
    list.forEach(function (n) {
      var rec = orig.get(n), v = n.nodeValue;
      if (rec && rec.out === v) { if (rec.cur === cur && rec.ver === ver) return; v = rec.src; }
      else if (rec && rec.src === v && rec.cur === cur && rec.ver === ver) return;
      if (v.indexOf('€') < 0) { if (rec) orig.delete(n); return; }
      var out = cur === 'EUR' ? v : conv(v);
      orig.set(n, { src: v, out: out, cur: cur, ver: ver });
      if (out !== n.nodeValue) n.nodeValue = out;
    });
  }
  function refresh() { busy = true; ver++; try { apply(document.body); } finally { busy = false; } }
  var mo = new MutationObserver(function () { if (busy) return; busy = true; try { apply(document.body); ensure(); } finally { setTimeout(function () { busy = false; }, 0); } });
  function ensure() {
    if (document.getElementById('ald-cur')) return;
    var h = document.querySelector('header'); if (!h) return;
    var s = document.createElement('select'); s.id = 'ald-cur'; s.setAttribute('aria-label', 'Devise · Currency');
    s.style.cssText = 'min-height:44px;padding:0 10px;border-radius:6px;border:1px solid var(--input);background:transparent;color:var(--foreground);font:500 13px/1 var(--font-mono,monospace);letter-spacing:.04em;cursor:pointer';
    [['EUR', '€ EUR'], ['USD', '$ USD'], ['MGA', 'Ar MGA']].forEach(function (o) { var e = document.createElement('option'); e.value = o[0]; e.textContent = o[1]; e.style.color = 'initial'; if (o[0] === cur) e.selected = true; s.appendChild(e); });
    s.addEventListener('change', function () { cur = s.value; try { localStorage.setItem(KEY, cur); } catch (e) {} refresh(); });
    var t = h.lastElementChild;
    if (t && t.tagName === 'DIV' && getComputedStyle(t).display === 'flex') t.insertBefore(s, t.firstChild); else h.appendChild(s);
  }
  function start() { ensure(); apply(document.body); mo.observe(document.body, { childList: true, subtree: true, characterData: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
