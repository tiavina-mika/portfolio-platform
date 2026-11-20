(function () {
  var p = location.pathname, kind = /Projects/.test(p) ? 'projects' : /About/.test(p) ? 'about' : /Legal|Privacy/.test(p) ? 'text' : null;
  if (!kind) return;
  var DUR = 800, done = false;
  var st = document.createElement('style');
  st.textContent = '@keyframes aldsk{0%{background-position:200% 0}100%{background-position:-200% 0}}.sk{display:block;border-radius:6px;background:linear-gradient(90deg,var(--muted) 25%,var(--accent,var(--border)) 50%,var(--muted) 75%);background-size:200% 100%;animation:aldsk 1.4s linear infinite}@media (prefers-reduced-motion:reduce){.sk{animation:none}}';
  document.head.appendChild(st);
  function b(w, h, x) { return '<span class="sk" style="width:' + w + ';height:' + h + 'px;max-width:100%;' + (x || '') + '"></span>'; }
  function lines(n, last) { var o = ''; for (var i = 0; i < n; i++) o += b(i === n - 1 ? last : '100%', 14); return '<div style="display:grid;gap:10px">' + o + '</div>'; }
  function head(w) { return '<div style="display:grid;gap:16px;padding:56px 0 40px;max-width:720px">' + b('120px', 12) + b(w, 44) + b('70%', 44) + lines(2, '60%') + '</div>'; }
  var card = '<div style="border:1px solid var(--border);border-radius:12px;padding:20px;display:grid;gap:14px;background:var(--card)">' + b('100%', 160, 'border-radius:8px') + b('40%', 12) + b('75%', 22) + lines(3, '55%') + '<div style="display:flex;gap:8px">' + b('72px', 24) + b('72px', 24) + '</div></div>';
  var html = {
    projects: head('85%') + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;padding-bottom:48px">' + card + card + card + card + '</div>',
    about: head('80%') + '<div style="display:grid;gap:40px;padding-bottom:48px"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px">' + b('100%', 280, 'border-radius:12px') + lines(7, '50%') + '</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px">' +
      [1, 2, 3].map(function () { return '<div style="display:grid;gap:12px;border-top:1px solid var(--border);padding-top:20px">' + b('40%', 12) + b('70%', 22) + lines(3, '60%') + '</div>'; }).join('') + '</div></div>',
    text: head('55%') + '<div style="max-width:72ch;padding-bottom:48px">' + [1, 2, 3, 4, 5].map(function () { return '<div style="display:grid;gap:12px;padding:32px 0;border-top:1px solid var(--border)">' + b('35%', 22) + lines(3, '70%') + '</div>'; }).join('') + '</div>'
  }[kind];
  function show(main) {
    var sk = document.createElement('div');
    sk.setAttribute('role', 'status'); sk.setAttribute('aria-label', 'Chargement'); sk.setAttribute('aria-busy', 'true');
    sk.innerHTML = html;
    main.style.display = 'none';
    main.parentNode.insertBefore(sk, main);
    setTimeout(function () { sk.remove(); main.style.display = ''; }, DUR);
  }
  function tick() {
    if (done) return;
    var m = document.querySelector('main');
    if (m) { done = true; mo.disconnect(); show(m); }
  }
  var mo = new MutationObserver(tick);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  tick();
})();
