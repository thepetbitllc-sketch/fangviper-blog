/* ==========================================================
   FANG VIPER — self-promo ad engine
   Every ad points to the store (fangviper.com), not this blog.
   Edit STORE / PRODUCTS below to change what gets promoted.
   ========================================================== */
(function () {
  const STORE = "https://fangviper.com";
  const IMG = "assets/img/products/";

  // id is referenced by posts' `adMatch` in data.js
  // Photos are local copies of the store's product images (600px).
  const PRODUCTS = [
    { id: "nobody",  name: "Nobody Is Coming Tee",        price: "$39.99", handle: "nobody-is-coming",       kicker: "Wear the reminder",      img: IMG + "nobody.jpg" },
    { id: "outwork", name: "Outwork Tee",                 price: "$39.99", handle: "outwork",                kicker: "Built for the grind",    img: IMG + "outwork.jpg" },
    { id: "made",    name: "Made Not Born Tee",           price: "$39.99", handle: "made-not-born",          kicker: "Earned, not given",      img: IMG + "made.jpg" },
    { id: "bag",     name: "Iron Blueprint Gym Bag",      price: "$74.99", handle: "iron-blueprint-1",       kicker: "New drop",               img: IMG + "bag.jpg" },
    { id: "bottle",  name: "Fang Viper Bottle",           price: "$49.99", handle: "fang-viper-bottle",      kicker: "Stay cold. Stay sharp",  img: IMG + "bottle.jpg" },
    { id: "hydrate", name: "Hydrate Then Dominate Bottle",price: "$49.99", handle: "hydrate-then-dominate",  kicker: "Fuel the session",       img: IMG + "hydrate.jpg" },
    { id: "mug",     name: "Discipline Over Mood Mug",    price: "$29.99", handle: "discipline-over-mood",   kicker: "Morning ritual",         img: IMG + "mug.jpg" },
    { id: "journal", name: "Keep Climbing Journal",       price: "$44.99", handle: "keep-climbing",          kicker: "Log the work",           img: IMG + "journal.jpg" }
  ];

  const ANNOUNCEMENTS = [
    "New drop — Iron Blueprint gym bag is live at FangViper.com",
    "Train in the words you live by — shop the tee collection",
    "Hydrate then dominate — insulated bottles now in stock"
  ];

  // --- helpers -------------------------------------------------
  const store = {
    get(k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set(k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (e) {} }
  };
  const link = (p, placement) =>
    `${STORE}${p ? "/products/" + p.handle : "/collections/all"}?utm_source=fangviper_blog&utm_medium=${placement}&utm_campaign=blog_ads`;
  const storeUrl = (placement, q) =>
    `${STORE}${q ? "/search?type=product&q=" + encodeURIComponent(q) + "&" : "/collections/all?"}utm_source=fangviper_blog&utm_medium=${placement}&utm_campaign=blog_ads`;
  const img = p => p.img;
  const byId = id => PRODUCTS.find(p => p.id === id);
  const pick = (n, exclude) => {
    const pool = PRODUCTS.filter(p => p.id !== exclude).sort(() => Math.random() - 0.5);
    return pool.slice(0, n);
  };
  const ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  const CLOSE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

  let modalOpen = false;
  let lastPop = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
        txt.innerHTML = `<a href="${link(null, "announcement")}" target="_blank" rel="noopener">${ANNOUNCEMENTS[i]} <span class="announce__arrow">${ARROW}</span></a>`;
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

  // --- 2. Slide-in toast ---------------------------------------
  let toastCount = 0;
  function toast(product, placement) {
    if (modalOpen || toastCount >= 2 || document.querySelector(".ad-toast")) return;
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

  // --- 3. Modal pop-up (once per session) ----------------------
  function modal(trigger) {
    if (modalOpen || store.get("fv_modal_seen", true)) return;
    if (Number(store.get("fv_modal_snooze") || 0) > Date.now()) return;
    modalOpen = true; lastPop = Date.now();
    store.set("fv_modal_seen", "1", true);
    const ps = pick(3);
    const wrap = document.createElement("div");
    wrap.className = "ad-modal";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-label", "FangViper store");
    wrap.innerHTML = `
      <div class="ad-modal__backdrop" data-close></div>
      <div class="ad-modal__card">
        <button class="ad-x" data-close aria-label="Close">${CLOSE}</button>
        <div class="ad-modal__media">
          ${ps.map((p, i) => `<img class="${i === 0 ? "on" : ""}" src="${img(p, 800)}" alt="${p.name}">`).join("")}
          <div class="ad-modal__logo"><img src="assets/img/logo-white.png" alt=""></div>
        </div>
        <div class="ad-modal__body">
          <span class="ad-tag">From the FangViper store</span>
          <h3 class="ad-modal__title"><span>You read like</span><span>you train.</span></h3>
          <p>Gear built for people who show up when nobody's watching. Tees, bottles, bags and journals — all black &amp; white, all attitude.</p>
          <ul class="ad-modal__list">
            ${ps.map((p, i) => `<li class="${i === 0 ? "on" : ""}"><a href="${link(p, "modal_" + trigger)}" target="_blank" rel="noopener"><span>${p.name}</span><b>${p.price}</b></a></li>`).join("")}
          </ul>
          <a class="btn btn--light btn--block" data-magnetic href="${link(null, "modal_" + trigger)}" target="_blank" rel="noopener">Shop FangViper.com ${ARROW}</a>
          <button class="ad-modal__skip" data-close>No thanks, keep reading</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    document.documentElement.classList.add("no-scroll");
    requestAnimationFrame(() => wrap.classList.add("in"));
    // cycle products
    let k = 0;
    const imgs = wrap.querySelectorAll(".ad-modal__media > img");
    const lis = wrap.querySelectorAll(".ad-modal__list li");
    const cyc = setInterval(() => {
      imgs[k].classList.remove("on"); lis[k].classList.remove("on");
      k = (k + 1) % imgs.length;
      imgs[k].classList.add("on"); lis[k].classList.add("on");
    }, 2600);
    lis.forEach((li, i) => li.addEventListener("mouseenter", () => {
      imgs[k].classList.remove("on"); lis[k].classList.remove("on");
      k = i; imgs[k].classList.add("on"); lis[k].classList.add("on");
    }));
    const close = () => {
      clearInterval(cyc);
      wrap.classList.remove("in");
      document.documentElement.classList.remove("no-scroll");
      store.set("fv_modal_snooze", String(Date.now() + 1000 * 60 * 60 * 12));
      setTimeout(() => { wrap.remove(); modalOpen = false; }, 500);
      document.removeEventListener("keydown", esc);
    };
    const esc = e => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc);
    wrap.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", close));
    wrap.querySelector(".btn").focus({ preventScroll: true });
  }

  // --- 4. In-feed native card (home grid) ----------------------
  function feedCard() {
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

  // --- 5. Inline article ad ------------------------------------
  function inlineAd(matchId) {
    const p = byId(matchId) || pick(1)[0];
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

  // --- 6. Sticky rail ad (article, desktop) --------------------
  function railAd(mount) {
    if (!mount) return;
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

  function exitIntent(fn) {
    if (matchMedia("(pointer: coarse)").matches) return;
    document.addEventListener("mouseout", e => {
      if (!e.relatedTarget && e.clientY <= 0) fn();
    });
  }

  function boot() {
    announcement();
    exitIntent(() => modal("exit"));
  }

  function view(page, ctx) {
    triggers = [];
    clearTimeout(homeTimer);
    if (page === "home") {
      homeTimer = setTimeout(() => toast(null, "toast_timed"), 14000);
      scrollDepth(0.45, () => modal("scroll"));
      scrollDepth(0.8, () => toast(null, "toast_scroll"));
    }
    if (page === "article") {
      scrollDepth(0.3, () => toast(byId(ctx && ctx.adMatch), "toast_article"));
      scrollDepth(0.62, () => modal("article_scroll"));
    }
  }

  window.FV_ADS = { boot, view, toast, modal, feedCard, inlineAd, railAd, link, storeUrl, pick, img, PRODUCTS };
})();
