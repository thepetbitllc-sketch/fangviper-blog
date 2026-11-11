/* ==========================================================
   FANG VIPER — self-promo ad engine
   Every ad points to the store (fangviper.com), not this blog.
   Products come from assets/js/products.js (refresh it with
   `node --use-system-ca tools/sync-products.js`).
   Ads sit inside the page (story grid, articles, sidebar) plus a
   small corner card; nothing covers the whole screen. Newsletter
   subscribers (signup.js) don't get the corner card at all.
   ========================================================== */
(function () {
  const STORE = "https://fangviper.com";

  // id = the store handle; posts' `adMatch` in data.js names one
  const PRODUCTS = (window.FV_PRODUCTS || []).filter(p => p.img);

  const ANNOUNCEMENTS = [
    { text: "The One Life collection — tees, mugs and journals", path: "/collections/one-life" },
    { text: "Pack & Go — gym bags built to carry the work", path: "/collections/pack-go" },
    { text: "Hydrate then dominate — insulated bottles", path: "/collections/hydration" },
    { text: "Train in the words you live by — shop the tees", path: "/collections/tees-polos" }
  ];

  // --- helpers -------------------------------------------------
  const store = {
    get(k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set(k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (e) {} }
  };
  const tag = placement => `utm_source=fangviper_blog&utm_medium=${placement}&utm_campaign=blog_ads`;
  const link = (p, placement, path) => `${STORE}${p ? "/products/" + p.id : path || "/collections"}?${tag(placement)}`;
  const storeUrl = (placement, q) =>
    `${STORE}${q ? "/search?type=product&q=" + encodeURIComponent(q) + "&" : "/collections?"}${tag(placement)}`;
  // Shopify's CDN resizes on the fly
  const img = (p, w) => p.img + (p.img.includes("?") ? "&" : "?") + "width=" + w;
  const byId = id => PRODUCTS.find(p => p.id === id);
  // A mix: one product per category first (tee, mug, bottle, bag, journal), then any.
  const pick = (n, exclude) => {
    const pool = PRODUCTS.filter(p => p.id !== exclude).sort(() => Math.random() - 0.5);
    const out = [], cats = new Set();
    for (const p of pool) if (out.length < n && !cats.has(p.cat)) { out.push(p); cats.add(p.cat); }
    for (const p of pool) if (out.length < n && !out.includes(p)) out.push(p);
    return out;
  };
  const isMember = () => !!(window.FV_SIGNUP && window.FV_SIGNUP.isMember());
  const ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  const CLOSE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

  let lastPop = 0;

  // --- 1. Announcement bar (rotating) --------------------------
  function announcement() {
    const bar = document.querySelector("[data-announce]");
    if (!bar) return;
    if (store.get("fv_announce_closed", true)) { bar.remove(); return; }
    const txt = bar.querySelector(".announce__text");
    let i = 0;
    const show = () => {
      txt.classList.remove("in");
      setTimeout(() => {
        const a = ANNOUNCEMENTS[i];
        txt.innerHTML = `<a href="${link(null, "announcement", a.path)}" target="_blank" rel="noopener">${a.text} <span class="announce__arrow">${ARROW}</span></a>`;
        txt.classList.add("in");
        i = (i + 1) % ANNOUNCEMENTS.length;
      }, 350);
    };
    show();
    setInterval(show, 5000);
    bar.querySelector(".announce__close").addEventListener("click", () => {
      bar.classList.add("gone");
      store.set("fv_announce_closed", "1", true);
      setTimeout(() => bar.remove(), 400);
    });
  }

  // --- 2. Corner card (the only ad that pops up; small, never for subscribers) ---
  let toastCount = 0;
  function toast(product, placement) {
    if (!PRODUCTS.length || isMember() || toastCount >= 2) return;
    if (document.querySelector(".ad-toast, .fv-invite")) return;
    if (Date.now() - lastPop < 25000) return;
    if (Number(store.get("fv_toast_snooze", true) || 0) > Date.now()) return;
    const p = product || pick(1)[0];
    toastCount++; lastPop = Date.now();
    const el = document.createElement("aside");
    el.className = "ad-toast";
    el.setAttribute("aria-label", "FangViper store promotion");
    el.innerHTML = `
      <button class="ad-x" aria-label="Close ad">${CLOSE}</button>
      <a class="ad-toast__link" href="${link(p, placement || "toast")}" target="_blank" rel="noopener">
        <div class="ad-toast__img"><img src="${img(p, 240)}" alt="${p.name}" loading="lazy"></div>
        <div class="ad-toast__body">
          <span class="ad-tag">${p.kicker}</span>
          <strong>${p.name}</strong>
          <span class="ad-toast__price">${p.price} <em>Shop now ${ARROW}</em></span>
        </div>
      </a>
      <span class="ad-toast__timer"></span>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("in"));
    const kill = snooze => {
      el.classList.remove("in");
      if (snooze) store.set("fv_toast_snooze", String(Date.now() + 60000), true);
      setTimeout(() => el.remove(), 500);
    };
    el.querySelector(".ad-x").addEventListener("click", () => kill(true));
    let t = setTimeout(() => kill(false), 11000);
    el.addEventListener("mouseenter", () => { clearTimeout(t); el.classList.add("hold"); });
    el.addEventListener("mouseleave", () => { el.classList.remove("hold"); t = setTimeout(() => kill(false), 4000); });
  }

  // --- 3. In-feed native card (home grid) ----------------------
  function feedCard() {
    if (!PRODUCTS.length) return null;
    const ps = pick(3);
    const el = document.createElement("a");
    el.className = "card card--ad";
    el.href = link(null, "feed_card");
    el.target = "_blank"; el.rel = "noopener";
    el.setAttribute("data-reveal", "");
    el.innerHTML = `
      <div class="card__cover card__cover--ad">
        ${ps.map((p, i) => `<img class="${i === 0 ? "on" : ""}" src="${img(p, 600)}" alt="${p.name}" loading="lazy">`).join("")}
        <span class="card__sponsor">Sponsored · FangViper Store</span>
      </div>
      <div class="card__body">
        <div class="card__meta"><span class="card__cat">Gear</span><span>FangViper.com</span></div>
        <h3 class="card__title"><span>Train in the words you live by.</span></h3>
        <p class="card__excerpt">${ps.map(p => p.name).join(" · ")}</p>
        <span class="card__more">Shop the drop ${ARROW}</span>
      </div>`;
    let k = 0;
    setInterval(() => {
      const im = el.querySelectorAll("img");
      im[k].classList.remove("on"); k = (k + 1) % im.length; im[k].classList.add("on");
    }, 2800);
    return el;
  }

  // --- 4. Inline article ad ------------------------------------
  function inlineAd(matchId) {
    const p = byId(matchId) || pick(1)[0];
    if (!p) return null;
    const el = document.createElement("aside");
    el.className = "ad-inline";
    el.setAttribute("data-reveal", "");
    el.innerHTML = `
      <a href="${link(p, "article_inline")}" target="_blank" rel="noopener">
        <div class="ad-inline__img"><img src="${img(p, 500)}" alt="${p.name}" loading="lazy"></div>
        <div class="ad-inline__body">
          <span class="ad-tag">Sponsored · FangViper Store</span>
          <strong>${p.name}</strong>
          <p>${p.kicker}. Made for the ones who read this far.</p>
          <span class="btn btn--light btn--sm">Get yours · ${p.price} ${ARROW}</span>
        </div>
      </a>`;
    return el;
  }

  // --- 5. Sticky rail ad (article, desktop) --------------------
  function railAd(mount) {
    if (!mount || !PRODUCTS.length) return;
    const ps = pick(4);
    mount.innerHTML = `
      <a class="ad-rail" href="${link(null, "article_rail")}" target="_blank" rel="noopener">
        <span class="ad-tag">Sponsored</span>
        <div class="ad-rail__stack">${ps.map((p, i) => `<img class="${i === 0 ? "on" : ""}" src="${img(p, 400)}" alt="${p.name}" loading="lazy">`).join("")}</div>
        <strong class="ad-rail__name">${ps[0].name}</strong>
        <span class="ad-rail__price">${ps[0].price}</span>
        <span class="ad-rail__cta">Shop ${ARROW}</span>
      </a>`;
    let k = 0;
    const im = mount.querySelectorAll("img");
    const nm = mount.querySelector(".ad-rail__name");
    const pr = mount.querySelector(".ad-rail__price");
    const t = setInterval(() => {
      if (!mount.isConnected) { clearInterval(t); return; }
      im[k].classList.remove("on"); k = (k + 1) % im.length; im[k].classList.add("on");
      nm.textContent = ps[k].name; pr.textContent = ps[k].price;
    }, 3200);
  }

  // --- triggers ------------------------------------------------
  // Scroll-depth triggers belong to the current view (home or an article)
  // and are replaced whenever the view changes.
  let triggers = [];
  let homeTimer = 0;
  addEventListener("scroll", () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    if (h <= 0) return;
    triggers = triggers.filter(t => {
      if (scrollY / h >= t.pct) { t.fn(); return false; }
      return true;
    });
  }, { passive: true });
  const scrollDepth = (pct, fn) => triggers.push({ pct, fn });

  function boot() {
    announcement();
  }

  function view(page, ctx) {
    triggers = [];
    clearTimeout(homeTimer);
    if (page === "home") {
      homeTimer = setTimeout(() => toast(null, "toast_timed"), 14000);
      scrollDepth(0.8, () => toast(null, "toast_scroll"));
    }
    if (page === "article") {
      scrollDepth(0.3, () => toast(byId(ctx && ctx.adMatch), "toast_article"));
    }
  }

  window.FV_ADS = { boot, view, toast, feedCard, inlineAd, railAd, link, storeUrl, pick, img, PRODUCTS };
})();
