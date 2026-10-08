/* ==========================================================
   FANG VIPER — interactions & animations
   ========================================================== */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const embedded = window.self !== window.top;
  // newest first; posts sharing a date keep the order they were added (later = newer)
  const POSTS = (window.FV_POSTS || []).map((p, i) => Object.assign(p, { _i: i })).sort((a, b) => b.date.localeCompare(a.date) || b._i - a._i);
  const bySlug = slug => POSTS.find(p => p.slug === slug);

  // On the public website every article has its own page (/<slug>/)
  // so search engines can list it. Inside the Claude artifact preview only #hash
  // links survive, so there articles open in place instead.
  const HASH_MODE = embedded;
  const articleMount = document.querySelector("[data-article][data-slug]");
  const postHref = slug => (HASH_MODE ? `#${slug}` : `${slug}/`);
  const homeHref = anchor => (HASH_MODE || !articleMount ? `#${anchor}` : `index.html#${anchor}`);
  const ADS = window.FV_ADS;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const SS = {
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  const ICON = {
    arrow: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    right: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    left: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    down: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="3"/></svg>',
    fang: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 3l6 18 2-9 2 9 6-18-8 5z" fill="currentColor"/></svg>',
    link: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    xlogo: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M3 3h5l13 18h-5z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M20.5 3l-7.2 7.8M3.5 21l7.2-7.8" stroke="currentColor" stroke-width="1.8"/></svg>'
  };

  // ---------- post helpers ----------
  POSTS.forEach((p, i) => {
    const words = p.body.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
    p.minutes = Math.max(2, Math.round(words / 200));
    p.n = String(i + 1).padStart(2, "0");
  });
  const fmtDate = d => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const readList = () => LS.get("fv_read", []);
  const progressOf = slug => LS.get("fv_prog", {})[slug] || 0;
  function saveProgress(slug, v) {
    const all = LS.get("fv_prog", {});
    if (v > (all[slug] || 0)) { all[slug] = Math.round(v * 100) / 100; LS.set("fv_prog", all); }
  }
  function markRead(slug) {
    const r = readList();
    if (!r.includes(slug)) { r.push(slug); LS.set("fv_read", r); }
    updateStreak();
  }
  function updateStreak() {
    const n = readList().length;
    $$("[data-streak] b").forEach(b => { b.textContent = n; });
  }

  // ---------- generated B&W cover art ----------
  function rng(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  }
  const f1 = n => n.toFixed(1);
  const svgWrap = (inner, par) => `<svg viewBox="0 0 400 300" preserveAspectRatio="${par || "xMidYMid slice"}" aria-hidden="true">${inner}</svg>`;

  function pattern(kind, id) {
    const r = rng(id);
    let g = "";
    switch (kind) {
      case "bars": {
        const n = 18;
        for (let i = 0; i < n; i++) {
          const h = 40 + (i / (n - 1)) * 190 + (r() * 36 - 18);
          g += `<rect x="${22 + i * 20}" y="${f1(290 - h)}" width="11" height="${f1(h)}"${i === n - 1 ? ' class="hi"' : ""} style="--i:${i}"/>`;
        }
        return svgWrap(`<g class="pat pat--bars">${g}</g>`, "xMidYMax slice");
      }
      case "horizon": {
        let y = 196, gap = 3, lines = "", stripes = "";
        while (y < 300) { lines += `<line x1="0" x2="400" y1="${f1(y)}" y2="${f1(y)}"/>`; y += gap; gap *= 1.28; }
        for (let k = 0; k < 6; k++) stripes += `<rect x="100" y="${f1(150 + k * 9 + k * k * 1.2)}" width="200" height="${f1(1.5 + k * 0.9)}" fill="#0b0b0b"/>`;
        const cid = "hz-" + id + "-" + Math.floor(r() * 1e6);
        return svgWrap(`<defs><clipPath id="${cid}"><rect x="0" y="0" width="400" height="196"/></clipPath></defs>
          <g class="pat pat--horizon"><g clip-path="url(#${cid})"><g class="sun"><circle cx="200" cy="196" r="88" fill="#fff" fill-opacity=".92"/>${stripes}</g></g>${lines}</g>`, "xMidYMax slice");
      }
      case "halftone": {
        for (let y = 0; y < 15; y++) for (let x = 0; x < 20; x++) {
          const cx = 10 + x * 20, cy = 10 + y * 20;
          const d = Math.hypot(cx - 320, cy - 70) / 380;
          g += `<circle cx="${cx}" cy="${cy}" r="${f1(Math.max(0.6, 8.5 * (1 - d)))}" style="--d:${d.toFixed(2)}"/>`;
        }
        return svgWrap(`<g class="pat pat--halftone">${g}</g>`);
      }
      case "waves": {
        for (let k = 0; k < 12; k++) {
          const y0 = 40 + k * 20, amp = 10 + k * 1.2;
          let d = "";
          for (let x = -60; x <= 720; x += 12) d += `${d ? " L" : "M"}${x} ${f1(y0 + Math.sin(x / 40 + k * 0.45) * amp)}`;
          g += `<path d="${d}" stroke-width="1.5" stroke-opacity="${(0.1 + k * 0.035).toFixed(3)}"/>`;
        }
        return svgWrap(`<g class="pat pat--waves">${g}</g>`);
      }
      case "grid": {
        let i = 0;
        for (let row = 0; row < 5; row++) for (let col = 0; col < 6; col++, i++) {
          g += `<rect x="${48 + col * 52}" y="${24 + row * 52}" width="44" height="44" rx="3"${i < 21 ? ' class="on"' : ""} style="--i:${i}"/>`;
        }
        return svgWrap(`<g class="pat pat--grid">${g}</g>`);
      }
      case "contour": {
        const s1 = r() * 6, s2 = r() * 6;
        for (let k = 1; k <= 11; k++) {
          const R = k * 19; let d = "";
          for (let s = 0; s <= 48; s++) {
            const a = (s / 48) * Math.PI * 2;
            const rr = R + Math.sin(a * 3 + s1) * R * 0.13 + Math.sin(a * 5 + s2) * R * 0.07;
            d += `${s ? " L" : "M"}${f1(260 + Math.cos(a) * rr)} ${f1(140 + Math.sin(a) * rr)}`;
          }
          g += `<path d="${d}Z" stroke-width="1.2"/>`;
        }
        return svgWrap(`<g class="pat pat--contour">${g}</g>`);
      }
      case "ripple": {
        for (let i = 0; i < 5; i++) g += `<circle cx="200" cy="150" r="190" stroke-width="1.4" style="--i:${i}"/>`;
        return svgWrap(`<g class="pat pat--ripple">${g}</g><circle cx="200" cy="150" r="5" fill="#fff"/>`);
      }
      default: return svgWrap("");
    }
  }
  const coverArt = p => p.cover.type === "photo"
    ? `<img src="${p.cover.src}" alt="${p.cover.alt || ""}" loading="lazy">`
    : pattern(p.cover.pattern, p.slug);

  function cardHTML(p, i) {
    const read = readList().includes(p.slug);
    const prog = progressOf(p.slug);
    const partial = !read && prog > 0.05;
    return `<a class="card" href="${postHref(p.slug)}" data-reveal style="--d:${((i || 0) % 3) * 0.08}s">
      <div class="card__cover">${coverArt(p)}
        ${read ? `<span class="card__badge">${ICON.check} Finished</span>` : ""}
        ${partial ? `<span class="card__progress" style="--p:${prog}"></span>` : ""}</div>
      <div class="card__body">
        <div class="card__meta"><span class="card__cat">${p.category}</span><span>${p.minutes} min read</span></div>
        <h3 class="card__title"><span>${p.title}</span></h3>
        <p class="card__excerpt">${p.excerpt}</p>
        <span class="card__more">${partial ? `Continue · ${Math.round(prog * 100)}%` : "Read article"} ${ICON.arrow}</span>
      </div>
    </a>`;
  }

  // ---------- effects ----------
  function floatText(x, y, text, color) {
    if (reduced) return;
    const s = document.createElement("span");
    s.className = "plus-one";
    s.textContent = text;
    s.style.cssText = `left:${x}px;top:${y}px;color:${color}`;
    document.body.appendChild(s);
    s.animate([{ transform: "translate(-50%,-50%)", opacity: 1 }, { transform: "translate(-50%,-190%)", opacity: 0 }], { duration: 850, easing: "ease-out" }).onfinish = () => s.remove();
  }
  function restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  function scramble(el, text) {
    if (reduced) { el.textContent = text; return; }
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%/*+=-_";
    const esc = c => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c);
    const old = el.textContent, len = Math.max(old.length, text.length), q = [];
    for (let i = 0; i < len; i++) {
      const s = Math.floor(Math.random() * 18);
      q.push({ from: old[i] || "", to: text[i] || "", s, e: s + Math.floor(Math.random() * 22), c: "" });
    }
    cancelAnimationFrame(el._raf);
    let frame = 0;
    const tick = () => {
      let out = "", done = 0;
      for (const it of q) {
        if (frame >= it.e) { done++; out += esc(it.to); }
        else if (frame >= it.s) { if (!it.c || Math.random() < 0.3) it.c = chars[Math.floor(Math.random() * chars.length)]; out += `<span class="dud">${it.c}</span>`; }
        else out += esc(it.from);
      }
      el.innerHTML = out;
      if (done < q.length) { frame++; el._raf = requestAnimationFrame(tick); }
    };
    tick();
  }

  // ---------- reveal + split ----------
  let io;
  function observe(scope) {
    const els = $$("[data-reveal]:not(.in), [data-split]:not(.in)", scope || document);
    if (!("IntersectionObserver" in window) || reduced) { els.forEach(e => e.classList.add("in")); return; }
    io = io || new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }
  function split(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = "1";
    let i = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span"); w.className = "split-w";
            const s = document.createElement("span"); s.textContent = part; s.style.setProperty("--i", i++);
            w.appendChild(s); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  }

  // ---------- global UI ----------
  function initNav() {
    const top = $("[data-top]");
    $$("[data-store]").forEach(a => { a.href = ADS ? ADS.storeUrl(a.dataset.medium || "blog_link", a.dataset.q) : "https://fangviper.com"; });
    // category links appear once that category has a post
    $$("[data-cat-link]").forEach(a => {
      const c = a.dataset.catLink;
      if (c !== "All" && !POSTS.some(p => p.category === c)) a.hidden = true;
    });
    if (!top) return;
    let last = scrollY;
    const onScroll = () => {
      const y = scrollY;
      top.classList.toggle("scrolled", y > 30);
      if (!root.classList.contains("menu-open")) {
        if (y > last + 6 && y > 260) top.classList.add("hide");
        else if (y < last - 6 || y < 260) top.classList.remove("hide");
      }
      last = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  let closeMenu = () => {};
  function initMenu() {
    const b = $("[data-burger]"), m = $("[data-menu]");
    if (!b || !m) return;
    const set = open => {
      root.classList.toggle("menu-open", open);
      root.classList.toggle("no-scroll", open);
      b.setAttribute("aria-expanded", String(open));
      b.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      m.setAttribute("aria-hidden", String(!open));
      if (open) $("[data-top]").classList.remove("hide");
    };
    closeMenu = () => set(false);
    b.addEventListener("click", () => set(!root.classList.contains("menu-open")));
    $$("a", m).forEach(a => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", e => { if (e.key === "Escape") set(false); });
  }

  // Slow, steady ticker. It drifts a little faster while the page is being scrolled.
  function initMarquee() {
    $$("[data-marquee]").forEach(m => {
      const track = $(".marquee__track", m);
      const html = track.innerHTML;
      track.innerHTML = html + html + html + html;
      if (reduced) return;
      const dir = m.dataset.dir === "right" ? 1 : -1;
      let unit = 0, x = 0, boost = 0, lastY = scrollY, visible = true;
      const measure = () => { unit = track.scrollWidth / 4; x = dir > 0 ? -unit : 0; };
      measure();
      addEventListener("resize", measure);
      if (document.fonts) document.fonts.ready.then(measure);
      new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(m);
      (function loop() {
        const dy = Math.abs(scrollY - lastY); lastY = scrollY;
        boost += (Math.min(dy, 60) * 0.08 - boost) * 0.06;
        if (visible && unit) {
          x += dir * (0.45 + boost);
          if (x <= -unit) x += unit;
          if (x > 0) x -= unit;
          track.style.transform = `translate3d(${f1(x)}px,0,0)`;
        }
        requestAnimationFrame(loop);
      })();
    });
  }

  // Hero logo drifts slightly slower than the page as you scroll.
  function initParallax() {
    const els = $$("[data-parallax]");
    if (!els.length || reduced) return;
    let ticking = false;
    const apply = () => {
      ticking = false;
      if (scrollY < innerHeight * 1.3) els.forEach(el => { el.style.translate = `0 ${f1(scrollY * 0.25)}px`; });
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }, { passive: true });
  }

  // black curtain that wipes over the screen while the view swaps
  function withCurtain(fn) {
    const curtain = $(".curtain");
    if (!curtain || reduced) { fn(); return; }
    root.classList.remove("returning"); // its one-time boot wipe must not replay
    curtain.classList.remove("curtain--boot", "leave");
    curtain.classList.add("enter");
    setTimeout(() => {
      fn();
      curtain.classList.remove("enter");
      curtain.classList.add("leave");
      setTimeout(() => curtain.classList.remove("leave"), 950);
    }, 620);
  }

  // Public website: wipe the black curtain over the screen before loading another page.
  function initTransitions() {
    const curtain = $(".curtain");
    addEventListener("pageshow", e => { if (e.persisted && curtain) curtain.classList.remove("enter"); });
    if (HASH_MODE || !curtain || reduced) return;
    document.addEventListener("click", e => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      e.preventDefault();
      root.classList.remove("returning");
      curtain.classList.remove("curtain--boot", "leave");
      curtain.classList.add("enter");
      setTimeout(() => { location.href = url.href; }, 620);
    });
  }

  // In-page anchors (#journal, #challenge) scroll smoothly; article links (#slug) go to the router.
  function initAnchors() {
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
      const id = a.getAttribute("href").slice(1);
      if (!id) { e.preventDefault(); return; }
      if (bySlug(id)) return;
      const t = document.getElementById(id);
      if (!t || t.closest("[hidden]")) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });
  }

  function initToTop() {
    const b = $("[data-totop]"), bar = $("[data-totop-bar]");
    if (!b) return;
    const C = 131.95;
    const on = () => {
      const h = root.scrollHeight - innerHeight;
      bar.style.strokeDashoffset = C * (1 - (h > 0 ? scrollY / h : 0));
      b.classList.toggle("show", scrollY > 700);
    };
    addEventListener("scroll", on, { passive: true });
    on();
    b.addEventListener("click", () => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
  }

  function initBigWord() {
    $$("[data-bigword]").forEach(el => {
      el.innerHTML = Array.from(el.textContent).map(ch => (ch === " " ? "&nbsp;" : `<span>${ch}</span>`)).join("");
    });
  }

  // ==========================================================
  // HOME
  // ==========================================================
  function initPreloader(done) {
    const pl = $("[data-preloader]");
    const returning = root.classList.contains("returning");
    if (!pl || returning || reduced) {
      if (pl) pl.classList.add("gone");
      SS.set("fv_loaded", "1");
      setTimeout(done, returning ? 380 : 0);
      return;
    }
    const num = $("[data-preload-count]", pl), fill = $(".preloader__logo-fill", pl), bar = $(".preloader__bar", pl);
    root.classList.add("no-scroll");
    const dur = 1800, t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const v = Math.round(e * 100);
      num.textContent = v;
      fill.style.setProperty("--clip", (100 - v) + "%");
      bar.style.setProperty("--p", e);
      if (k < 1) requestAnimationFrame(step);
      else setTimeout(() => {
        pl.classList.add("done");
        root.classList.remove("no-scroll");
        SS.set("fv_loaded", "1");
        setTimeout(done, 380);
        setTimeout(() => pl.classList.add("gone"), 1500);
      }, 260);
    };
    requestAnimationFrame(step);
  }

  function renderFeatured(p) {
    const el = $("[data-featured]");
    if (!el || !p) return;
    el.innerHTML = `<a class="feat" href="${postHref(p.slug)}">
      <div class="feat__media" data-reveal="clip">${coverArt(p)}<span class="feat__tag">Latest story</span></div>
      <div class="feat__body">
        <div class="feat__meta" data-reveal><b>${p.category}</b><span>${p.minutes} min read</span><span>${fmtDate(p.date)}</span></div>
        <h3 class="feat__title" data-split>${p.title}</h3>
        <p class="feat__excerpt" data-reveal style="--d:.15s">${p.excerpt}</p>
        <span class="btn btn--light" data-reveal style="--d:.25s">Read the story ${ICON.arrow}</span>
      </div>
    </a>`;
  }

  // Lists every story except the latest one. While there are none, the store banner
  // sits under the latest story instead of an empty list.
  function initJournal(list) {
    const more = $("[data-more]"), grid = $("[data-grid]"), chips = $("[data-chips]"), search = $("[data-search]");
    const empty = $("[data-empty]"), toolbar = $("[data-toolbar]"), strip = $("[data-store-strip]");
    if (!grid) return null;
    const adCard = ADS ? ADS.feedCard() : null;
    const toJournal = () => {
      if (currentView === "article") { location.hash = "journal"; return; }
      $("#journal").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    };

    if (!list.length) {
      if (strip && adCard) { adCard.classList.add("card--wide"); strip.appendChild(adCard); strip.hidden = false; }
      $$("[data-cat-link]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); toJournal(); }));
      return { refresh() {} };
    }

    more.hidden = false;
    toolbar.hidden = list.length < 4; // filters only help once there is something to filter
    // only offer categories that have at least one post
    const CATS = (window.FV_CATEGORIES || ["All"]).filter(c => c === "All" || list.some(p => p.category === c));
    let cat = new URLSearchParams(location.search).get("cat");
    if (!CATS.includes(cat)) cat = "All";
    let q = "", timer;
    chips.innerHTML = CATS.map(c => {
      const n = c === "All" ? list.length : list.filter(p => p.category === c).length;
      return `<button class="chip" role="tab" aria-selected="${c === cat}" data-chip="${c}">${c}<sup>${n}</sup></button>`;
    }).join("");

    function render(animate) {
      const items = list.filter(p => (cat === "All" || p.category === cat) &&
        (!q || (p.title + " " + p.excerpt + " " + p.category + " " + (p.keywords || []).join(" ")).toLowerCase().includes(q)));
      const paint = () => {
        grid.innerHTML = items.map(cardHTML).join("");
        if (adCard && items.length) {
          adCard.classList.remove("in");
          grid.insertBefore(adCard, grid.children[Math.min(4, items.length)] || null);
        }
        empty.hidden = items.length > 0;
        const count = grid.children.length;
        grid.classList.toggle("grid--2", [2, 4].includes(count)); // 2 or 4 cards read better as two wide columns than an orphaned row
        // with 5, 8... cards in three columns, let the ad stretch across two so the last row is full
        const span = !!adCard && grid.contains(adCard) && count > 4 && count % 3 === 2;
        if (adCard) { adCard.classList.toggle("card--span2", span); adCard.classList.toggle("card--wide", span); }
        grid.classList.remove("switching");
        observe(grid);
      };
      if (animate && !reduced) { grid.classList.add("switching"); setTimeout(paint, 280); } else paint();
    }
    const setCat = c => {
      cat = CATS.includes(c) ? c : "All";
      $$(".chip", chips).forEach(b => b.setAttribute("aria-selected", String(b.dataset.chip === cat)));
      render(true);
    };
    chips.addEventListener("click", e => { const b = e.target.closest("[data-chip]"); if (b && b.dataset.chip !== cat) setCat(b.dataset.chip); });
    search.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => { q = search.value.trim().toLowerCase(); render(true); }, 180);
    });
    $$("[data-cat-link]").forEach(a => a.addEventListener("click", e => {
      e.preventDefault();
      search.value = ""; q = "";
      if (currentView === "article") {
        cat = CATS.includes(a.dataset.catLink) ? a.dataset.catLink : "All";
        $$(".chip", chips).forEach(b => b.setAttribute("aria-selected", String(b.dataset.chip === cat)));
        toJournal();
        return;
      }
      setCat(a.dataset.catLink);
      toJournal();
    }));
    render(false);
    return { refresh: () => render(false) };
  }

  function initRotator() {
    const r = $("[data-rotator]");
    if (!r || reduced) return;
    const items = $$("span", r);
    let i = 0;
    setInterval(() => {
      const cur = items[i];
      i = (i + 1) % items.length;
      const nxt = items[i];
      cur.classList.remove("is-on"); cur.classList.add("is-out");
      nxt.style.transition = "none"; nxt.classList.remove("is-out"); void nxt.offsetWidth; nxt.style.transition = "";
      nxt.classList.add("is-on");
    }, 2200);
  }

  function initResume() {
    const el = $("[data-resume]");
    if (!el) return;
    el.hidden = true;
    const slug = LS.get("fv_lastpost");
    const p = POSTS.find(x => x.slug === slug);
    const pr = progressOf(slug);
    if (!p || pr < 0.08 || readList().includes(slug)) return;
    const C = 2 * Math.PI * 12;
    el.href = postHref(slug);
    el.innerHTML = `<svg class="resume__ring" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="12" stroke="rgba(255,255,255,.2)"/><circle cx="15" cy="15" r="12" stroke="#fff" stroke-dasharray="${f1(C)}" stroke-dashoffset="${f1(C * (1 - pr))}" transform="rotate(-90 15 15)"/></svg><b>Continue ${Math.round(pr * 100)}%</b><span>${p.title}</span>`;
    el.hidden = false;
  }

  function initChallenge() {
    const sec = $("#challenge");
    if (!sec) return;
    // rotates daily: body, business and mind
    const LIST = [
      { goal: 50, name: "Push-ups", unit: "rep" }, { goal: 10, name: "Outreach messages", unit: "message" },
      { goal: 20, name: "Pages read", unit: "page" }, { goal: 100, name: "Squats", unit: "rep" },
      { goal: 60, name: "Minutes deep work", unit: "minute" }, { goal: 30, name: "Burpees", unit: "rep" },
      { goal: 10, name: "Ideas written down", unit: "idea" }
    ];
    const now = new Date();
    const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const doy = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(now.getFullYear(), 0, 0)) / 864e5);
    const ch = LIST[doy % LIST.length];
    $$("[data-ch-goal], [data-ch-goal2]").forEach(e => { e.textContent = ch.goal; });
    $("[data-ch-name]").textContent = ch.name;
    $("[data-ch-date]").textContent = now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

    const N = 60;
    let ticks = "";
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2, r1 = 146, r2 = i % 5 === 0 ? 158 : 152;
      ticks += `<line x1="${f1(160 + Math.cos(a) * r1)}" y1="${f1(160 + Math.sin(a) * r1)}" x2="${f1(160 + Math.cos(a) * r2)}" y2="${f1(160 + Math.sin(a) * r2)}"/>`;
    }
    $("[data-ch-ticks]").innerHTML = ticks;
    const tickEls = $$("[data-ch-ticks] line");
    const bar = $("[data-ch-bar]"), doneEl = $("[data-ch-done]"), btn = $("[data-ch-rep]"), msg = $("[data-ch-msg]"), reward = $("[data-ch-reward]"), tap = $(".rep-btn__tap", btn);
    const C = 2 * Math.PI * 128;
    const saved = LS.get("fv_challenge", {});
    let done = saved.date === key ? saved.done : 0;
    const MSG = [[0, "Your first rep is waiting."], [0.01, "That's one. Keep moving."], [0.25, "Quarter done. Breathe and go."], [0.5, "Halfway. Don't you dare stop."], [0.75, "Three quarters. This is where it counts."], [0.9, "Almost there. Finish like you mean it."], [1, "Done. Respect."]];
    let lastMsg = "";
    function paint() {
      const p = Math.min(1, done / ch.goal);
      bar.style.strokeDashoffset = C * (1 - p);
      doneEl.textContent = done;
      tickEls.forEach((l, i) => l.classList.toggle("on", i / N < p));
      let m = MSG[0][1];
      MSG.forEach(([th, s]) => { if (p >= th) m = s; });
      if (m !== lastMsg) { msg.textContent = m; restart(msg, "flash"); lastMsg = m; }
      btn.classList.toggle("complete", p >= 1);
      tap.textContent = p >= 1 ? "Complete" : `Tap per ${ch.unit}`;
      reward.hidden = p < 1;
      LS.set("fv_challenge", { date: key, done });
    }
    function add(n) {
      const was = done;
      done = Math.min(ch.goal, done + n);
      if (done === was) return false;
      restart(doneEl, "bump");
      const s = document.createElement("span"); s.className = "shock";
      btn.parentElement.appendChild(s); setTimeout(() => s.remove(), 700);
      if (navigator.vibrate) navigator.vibrate(8);
      paint();
      return true;
    }
    btn.addEventListener("click", e => {
      const r = btn.getBoundingClientRect();
      if (add(1)) floatText(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, "+1", "#fff");
    });
    $$("[data-ch-add]").forEach(b => b.addEventListener("click", () => add(Number(b.dataset.chAdd))));
    $("[data-ch-reset]").addEventListener("click", () => { done = 0; paint(); });
    paint();
  }

  function initQuotes() {
    const el = $("[data-quote]");
    if (!el) return;
    const Q = window.FV_QUOTES || [];
    let i = Math.floor(Math.random() * Q.length);
    const num = $("[data-quote-n]");
    $("[data-quote-total]").textContent = String(Q.length).padStart(2, "0");
    const setNum = () => { num.textContent = String(i + 1).padStart(2, "0"); };
    el.textContent = Q[i]; setNum();
    const next = () => { i = (i + 1) % Q.length; scramble(el, Q[i]); setNum(); };
    let last = Date.now();
    $("[data-quote-next]").addEventListener("click", () => { next(); last = Date.now(); });
    let vis = false;
    new IntersectionObserver(e => { vis = e[0].isIntersecting; }).observe(el);
    setInterval(() => { if (vis && !document.hidden && Date.now() - last > 7000) { next(); last = Date.now(); } }, 1000);
  }

  function initJoin() {
    const f = $("[data-join]");
    if (!f) return;
    const input = $("input", f), msg = $("[data-join-msg]"), btn = $("button", f);
    f.addEventListener("submit", e => {
      e.preventDefault();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        restart(f, "error");
        msg.textContent = "That email doesn't look right. Try again.";
        input.focus();
        return;
      }
      f.classList.remove("error"); f.classList.add("ok");
      $("span", btn).textContent = "You're in";
      btn.disabled = true; input.disabled = true;
      msg.textContent = "Welcome to the pack.";
    });
  }

  let journal = null;
  function initHome() {
    // newest post is featured (or one marked `featured: true`); the list below holds the rest
    const featured = POSTS.find(p => p.featured) || POSTS[0];
    renderFeatured(featured);
    journal = initJournal(POSTS.filter(p => p !== featured));
    initRotator();
    initResume();
    initChallenge();
    initQuotes();
    initJoin();
  }

  // ==========================================================
  // ARTICLE VIEW
  // ==========================================================
  const RANKS = [[1, "First blood"], [3, "Pack member"], [5, "Relentless"], [9, "Apex viper"]];

  // Renders one post into [data-article] and returns a teardown function.
  function renderArticle(p) {
    const main = $("[data-article]");
    const ac = new AbortController();
    const on = (target, type, fn, opts) => target.addEventListener(type, fn, Object.assign({ signal: ac.signal }, opts || {}));
    const timers = [], observers = [];
    let alive = true;

    const idx = POSTS.indexOf(p);
    const next = POSTS[(idx + 1) % POSTS.length];
    const hasNext = POSTS.length > 1;
    const more = POSTS.filter(x => x !== p && x !== next)
      .sort((a, b) => (b.category === p.category) - (a.category === p.category)).slice(0, 3);
    const myFangs = LS.get("fv_fangs", {})[p.slug] || 0;
    document.title = p.seoTitle || `${p.title} — Fang Viper Journal`;
    LS.set("fv_lastpost", p.slug);

    main.innerHTML = `
      <header class="a-hero container">
        <a class="a-back" href="${homeHref("journal")}">${ICON.left} Back to the journal</a>
        <div class="a-kicker"><b>${p.category}</b><span>${fmtDate(p.date)}</span><span>${p.minutes} min read</span><span>By Fang Viper</span></div>
        <h1 class="a-title" data-split>${p.title}</h1>
        <p class="a-dek" data-reveal style="--d:.3s">${p.excerpt}</p>
        <div class="a-cover" data-reveal="clip">${coverArt(p)}</div>
      </header>
      <div class="a-layout container">
        <aside class="a-rail" aria-label="Reading progress">
          <div class="a-ring"><svg viewBox="0 0 96 96" aria-hidden="true"><circle class="t" cx="48" cy="48" r="44"/><circle class="b" cx="48" cy="48" r="44" data-ring/></svg><span class="a-ring__pct" data-pct>0</span></div>
          <div class="a-rail__block a-rail__block--time"><div class="a-rail__label">Time left</div><div class="a-rail__val" data-left>${p.minutes}:00</div></div>
          ${embedded ? "" : `<div class="share"><button data-copy data-tip="Copied" aria-label="Copy link">${ICON.link}</button><a data-share-x href="#" target="_blank" rel="noopener" aria-label="Share on X">${ICON.xlogo}</a></div>`}
        </aside>
        <article class="prose" id="article-body">${p.body}</article>
        <aside class="a-side" data-rail-ad></aside>
      </div>
      <section class="finish" data-finish>
        <div class="container">
          <p class="eyebrow">End of story</p>
          <div class="finish__stamp">Keep going.</div>
          <p class="finish__sub">You read every word. That's the same discipline that builds everything else.</p>
          <div class="finish__badge" data-badge></div>
          <div class="finish__actions">
            <button class="btn btn--ghost" data-fang>${ICON.fang} <span data-fang-n>${myFangs ? `Fanged ${myFangs}` : "Fang it"}</span></button>
            ${hasNext ? `<a class="btn btn--light" href="${postHref(next.slug)}">Next story ${ICON.right}</a>` : `<a class="btn btn--light" href="${homeHref("join")}">Get the next story ${ICON.right}</a>`}
          </div>
        </div>
      </section>
      ${hasNext ? `<section class="next container">
        <p class="next__label"><i></i>Up next</p>
        <a class="next__link" href="${postHref(next.slug)}" data-next>${next.title}<small>${next.category} · ${next.minutes} min read</small></a>
        ${more.length ? `<p class="next__more-title">More from the journal</p><div class="grid">${more.map(cardHTML).join("")}</div>` : ""}
      </section>` : ""}`;

    const body = $("#article-body");
    const h2s = $$("h2", body);
    h2s.forEach((h, i) => {
      h.innerHTML = `<span class="h-num">${String(i + 1).padStart(2, "0")} / ${String(h2s.length).padStart(2, "0")}</span>${h.innerHTML}`;
      h.setAttribute("data-reveal", "");
    });
    $$("li", body).forEach((li, i) => { li.setAttribute("data-reveal", ""); li.style.setProperty("--d", (i % 5) * 0.07 + "s"); });
    // links to other posts are written as data-post="slug"; point them at the right address for this host
    $$("a[data-post]", body).forEach(a => a.setAttribute("href", postHref(a.dataset.post)));
    // "heating water" analogy: each tap heats it to the next stage from the article
    $$("[data-boil]", body).forEach(box => {
      const STEPS = [
        [50, "At 50°C, nothing looks different."],
        [90, "At 90°C, still nothing dramatic."],
        [99, "At 99°C, it's still just hot water."],
        [100, "Then at 100°C, it boils. Every degree mattered."]
      ];
      const temp = $("[data-boil-temp]", box), msg = $("[data-boil-msg]", box), btn = $("[data-boil-next]", box);
      let k = 0;
      const paint = () => {
        const [t, text] = STEPS[k];
        box.style.setProperty("--t", t + "%");
        temp.textContent = t + "°C";
        msg.textContent = text;
        box.dataset.state = t === 100 ? "boil" : "";
        btn.textContent = t === 100 ? "Start again" : "Keep heating";
        restart(temp, "bump");
      };
      on(btn, "click", () => { k = (k + 1) % STEPS.length; paint(); });
    });
    // "signs you're in the middle": readers tap the ones that sound familiar
    $$("[data-signs]", body).forEach(box => {
      const out = $("[data-signs-result]", box);
      const items = $$("li", box);
      items.forEach(li => {
        li.innerHTML = `<button type="button" class="sign" aria-pressed="false">${li.innerHTML}</button>`;
        const btn = $("button", li);
        on(btn, "click", () => {
          const pressed = btn.getAttribute("aria-pressed") !== "true";
          btn.setAttribute("aria-pressed", String(pressed));
          li.classList.toggle("on", pressed);
          const n = items.filter(x => x.classList.contains("on")).length;
          out.textContent = n === 0 ? "Tap the signs that sound familiar."
            : n === 1 ? `1 of ${items.length}. Anything else sound familiar?`
            : `${n} of ${items.length}. You're not failing. You're in the middle.`;
          box.dataset.state = n >= 2 ? "middle" : "";
          restart(out, "flash");
        });
      });
    });
    // "two honest questions" check: gives back the article's own advice for the answers chosen
    $$("[data-doubt]", body).forEach(box => {
      const answers = {};
      const result = $("[data-doubt-result]", box);
      $$(".doubt-q", box).forEach((q, qi) => {
        const btns = $$("button", q);
        btns.forEach(b => {
          b.setAttribute("aria-pressed", "false");
          on(b, "click", () => {
            answers[qi] = b.dataset.a;
            btns.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
            const vals = Object.values(answers);
            const yes = vals.includes("yes"), both = vals.length === 2;
            result.textContent = yes ? "Keep going, and adjust as you learn."
              : both ? "If that's been true for a long time, change the product or the approach. Keep everything you've learned."
              : "Answer both, honestly.";
            box.dataset.state = yes ? "go" : both ? "change" : "";
            restart(result, "flash");
          });
        });
      });
    });
    $$("h3, .drive-chart, .versus__card, .table-wrap, .faq__item, .cta-line, .see-also, .doubt-check, .stage, .checkpoints, .signs, .attempt, .boil", body).forEach((el, i) => {
      el.setAttribute("data-reveal", "");
      if (el.matches(".versus__card, .faq__item")) el.style.setProperty("--d", (i % 4) * 0.1 + "s");
    });
    $$(".compare tbody tr", body).forEach((tr, i) => tr.style.setProperty("--r", i));
    const quotes = $$("blockquote", body);
    quotes.forEach(bq => {
      bq.setAttribute("data-reveal", "");
      bq.innerHTML = bq.textContent.trim().split(/\s+/).map(w => `<span class="qw">${w.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`).join(" ");
      bq._w = $$(".qw", bq);
    });
    if ("IntersectionObserver" in window && !reduced) {
      const mio = new IntersectionObserver(ents => ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); mio.unobserve(en.target); } }), { rootMargin: "0px 0px -25% 0px" });
      $$("mark", body).forEach(m => mio.observe(m));
      observers.push(mio);
    } else $$("mark", body).forEach(m => m.classList.add("in"));

    // ads inside the article
    if (ADS) {
      const ad = ADS.inlineAd(p.adMatch);
      if (h2s[2]) body.insertBefore(ad, h2s[2]); else body.appendChild(ad);
      ADS.railAd($("[data-rail-ad]"));
    }

    // share (hidden when the page runs inside an embedded preview)
    const shareX = $("[data-share-x]"), copyBtn = $("[data-copy]");
    if (shareX) shareX.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(p.title + " — Fang Viper")}&url=${encodeURIComponent(location.href)}`;
    if (copyBtn) on(copyBtn, "click", () => {
      const tip = t => { copyBtn.dataset.tip = t; copyBtn.classList.add("tip"); setTimeout(() => copyBtn.classList.remove("tip"), 1600); };
      if (!navigator.clipboard) { tip("Copy failed"); return; }
      navigator.clipboard.writeText(location.href).then(() => tip("Copied"), () => tip("Copy failed"));
    });

    // fang (like) — personal count, stored on this device
    let fangs = myFangs;
    const fangN = $("[data-fang-n]");
    $$("[data-fang]", main).forEach(b => on(b, "click", () => {
      const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (fangs >= 50) { floatText(x, r.top, "Max fangs", "#fff"); return; }
      fangs++;
      const all = LS.get("fv_fangs", {}); all[p.slug] = fangs; LS.set("fv_fangs", all);
      fangN.textContent = `Fanged ${fangs}`;
      floatText(x, r.top, "+1", "#fff");
    }));

    // progress and quote lighting
    const ring = $("[data-ring]"), pct = $("[data-pct]"), left = $("[data-left]"), readbar = $("[data-readbar]");
    const RC = 2 * Math.PI * 44;
    let maxP = progressOf(p.slug), ticking = false, prog = 0;
    const update = () => {
      ticking = false;
      if (!alive) return;
      const r = body.getBoundingClientRect();
      prog = clamp((innerHeight * 0.6 - r.top) / r.height, 0, 1);
      ring.style.strokeDashoffset = RC * (1 - prog);
      pct.textContent = Math.round(prog * 100);
      if (readbar) readbar.style.transform = `scaleX(${prog})`;
      const secs = Math.max(0, Math.round(p.minutes * 60 * (1 - prog)));
      left.textContent = prog >= 0.99 ? "Done" : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
      if (prog > maxP + 0.02) { maxP = prog; saveProgress(p.slug, maxP); }
      quotes.forEach(q => {
        const qr = q.getBoundingClientRect();
        const k = reduced ? 1 : clamp((innerHeight * 0.9 - qr.top) / (innerHeight * 0.5), 0, 1);
        const n = Math.round(k * q._w.length);
        q._w.forEach((w, i) => w.classList.toggle("lit", i < n));
      });
    };

    // "keep reading" nudge when a reader stalls mid-article
    const nudge = $("[data-nudge]");
    let lastScroll = Date.now(), nudges = 0, nudgeAt = 0;
    const hideNudge = () => { if (nudgeAt && Date.now() - nudgeAt > 1200) { nudge.classList.remove("show"); nudgeAt = 0; } };
    timers.push(setInterval(() => {
      if (nudgeAt || nudges >= 2 || Date.now() - lastScroll < 7000 || prog < 0.1 || prog > 0.8 || $(".ad-modal") || root.classList.contains("menu-open")) return;
      const mins = Math.max(1, Math.ceil(p.minutes * (1 - prog)));
      nudge.innerHTML = `${ICON.down} ${mins} min left — the best part is next`;
      nudge.classList.add("show");
      nudgeAt = Date.now(); nudges++;
    }, 1000));
    on(nudge, "click", () => {
      nudge.classList.remove("show"); nudgeAt = 0;
      scrollBy({ top: innerHeight * 0.7, behavior: reduced ? "auto" : "smooth" });
    });

    on(window, "scroll", () => {
      lastScroll = Date.now();
      hideNudge();
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    on(window, "resize", update);
    update();

    // finish = article read
    const fin = $("[data-finish]");
    const onFinish = () => {
      fin.classList.add("in");
      const before = readList().length;
      markRead(p.slug);
      saveProgress(p.slug, 1);
      const n = readList().length;
      if (n > before) $$("[data-streak]").forEach(s => restart(s, "bump"));
      let rank = RANKS[0][1], nextRank = null;
      RANKS.forEach(([k, name]) => { if (n >= k) rank = name; else if (!nextRank) nextRank = [k, name]; });
      $("[data-badge]").innerHTML = `${ICON.fang} <b>${n}</b> finished · Rank: ${rank}${nextRank ? ` · ${nextRank[0] - n} more to ${nextRank[1]}` : ""}`;
    };
    if ("IntersectionObserver" in window) {
      const fio = new IntersectionObserver((ents, o) => { if (ents[0].isIntersecting) { onFinish(); o.disconnect(); } }, { threshold: 0.4 });
      fio.observe(fin);
      observers.push(fio);
    } else onFinish();


    return () => {
      alive = false;
      ac.abort();
      timers.forEach(clearInterval);
      observers.forEach(o => o.disconnect());
      nudge.classList.remove("show");
      if (readbar) readbar.style.transform = "scaleX(0)";
      main.innerHTML = "";
    };
  }

  // ==========================================================
  // VIEWS — public site: one page per article. Artifact preview: #slug swaps views in place.
  // ==========================================================
  let currentView = null;
  let teardownArticle = null;
  let homeScroll = 0;

  function showArticle(post) {
    const home = $("[data-home]"), art = $("[data-article]");
    if (currentView === "home") homeScroll = scrollY;
    if (teardownArticle) teardownArticle();
    if (home) home.hidden = true;
    art.hidden = false;
    currentView = "article";
    teardownArticle = renderArticle(post);
    $$("[data-split]", art).forEach(split);
    observe(art);
    scrollTo(0, 0);
    if (ADS) ADS.view("article", post);
  }

  function showHome(hash, first) {
    const home = $("[data-home]"), art = $("[data-article]");
    if (teardownArticle) { teardownArticle(); teardownArticle = null; }
    if (art) art.hidden = true;
    home.hidden = false;
    const wasArticle = currentView === "article";
    currentView = "home";
    document.title = "Fang Viper Journal";
    if (wasArticle) { if (journal) journal.refresh(); initResume(); }
    const target = hash && document.getElementById(hash);
    if (target) setTimeout(() => target.scrollIntoView(), first ? 80 : 0);
    else if (wasArticle) scrollTo(0, homeScroll);
    if (ADS) ADS.view("home");
  }

  function show(first) {
    const hash = decodeURIComponent(location.hash.slice(1));
    const post = bySlug(hash);
    closeMenu();
    if (post) showArticle(post); else showHome(hash, first);
    $("[data-top]").classList.remove("hide");
  }

  // ==========================================================
  // BOOT
  // ==========================================================
  const hashPost = bySlug(decodeURIComponent(location.hash.slice(1)));
  if (!HASH_MODE && !articleMount && hashPost) {
    // an old #slug link on the public site: go to that article's own page
    location.replace(postHref(hashPost.slug));
    return;
  }

  initNav();
  initMenu();
  initAnchors();
  initTransitions();
  initToTop();
  initBigWord();
  initParallax();
  initHome();
  $$("[data-split]").forEach(split);

  if (articleMount) {
    // an article's own page (public site)
    root.classList.add("is-loaded");
    SS.set("fv_loaded", "1");
    showArticle(bySlug(articleMount.dataset.slug) || POSTS[0]);
  } else if (HASH_MODE && hashPost) {
    // artifact opened on a shared article link: skip the intro and wipe the curtain away
    root.classList.add("returning", "is-loaded");
    const pl = $("[data-preloader]");
    if (pl) pl.classList.add("gone");
    SS.set("fv_loaded", "1");
    show(true);
  } else {
    initPreloader(() => root.classList.add("is-loaded"));
    show(true);
  }
  if (HASH_MODE) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    addEventListener("hashchange", () => withCurtain(() => show(false)));
  }

  observe();
  initMarquee();
  updateStreak();
  if (ADS) ADS.boot();
})();
