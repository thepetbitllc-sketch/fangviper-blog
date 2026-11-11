/* ==========================================================
   FANG VIPER - newsletter sign-up (Klaviyo) + the "no pop-ups" perk
   Sign-ups go straight into Klaviyo through its public browser API
   (site ID only, no secret key):
     Blog Newsletter (XkRtWc) - send new-post emails to this list
     Email List      (U9kkTw) - the store list; runs the Welcome Series flow
   A reader who subscribes is remembered on that device and stops
   seeing pop-up ads (ads.js asks isMember()); ads inside the articles stay.
   ========================================================== */
(function () {
  const KLAVIYO = { site: "VayrbQ", blogList: "XkRtWc", storeList: "U9kkTw" };
  const PREVIEW = window.self !== window.top; // Claude preview frame: no real sign-ups
  const MEMBER_KEY = "fv_member";
  const SNOOZE_KEY = "fv_invite_snooze";
  const SNOOZE_DAYS = 7;

  const store = {
    get(k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set(k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (e) {} }
  };
  const isMember = () => store.get(MEMBER_KEY) === "1";
  function setMember() {
    store.set(MEMBER_KEY, "1");
    document.querySelectorAll(".ad-toast").forEach(t => t.remove());
  }
  const validEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  // Readers who arrive from one of the newsletter emails are subscribers too
  // (Klaviyo tags its links utm_medium=email; ?fv=member works for hand-made links).
  try {
    const q = new URLSearchParams(location.search);
    if (q.get("fv") === "member" || q.get("utm_medium") === "email") setMember();
  } catch (e) {}

  // Resolves "ok", "invalid" (Klaviyo rejected the address), "offline" or "preview".
  async function subscribe(email, source) {
    if (PREVIEW) return "preview";
    let ok = false, invalid = false;
    for (const list of [KLAVIYO.blogList, KLAVIYO.storeList]) {
      let res;
      try {
        res = await fetch(`https://a.klaviyo.com/client/subscriptions?company_id=${KLAVIYO.site}`, {
          method: "POST",
          headers: { "Content-Type": "application/vnd.api+json", revision: "2024-10-15" },
          body: JSON.stringify({ data: {
            type: "subscription",
            attributes: { custom_source: source, profile: { data: { type: "profile", attributes: { email } } } },
            relationships: { list: { data: { type: "list", id: list } } }
          } })
        });
      } catch (e) { continue; }
      if (res.ok) ok = true;
      else if (res.status === 400) { invalid = true; break; }
    }
    if (ok) { setMember(); return "ok"; }
    return invalid ? "invalid" : "offline";
  }

  // --- the sign-up pop-up -----------------------------------------
  // A small card in the corner (a sheet on phones). It never covers the page, shows at most
  // once per visit, only after real reading, and stays away for a week after it's closed.
  const CLOSE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  let shown = false;

  function canInvite() {
    if (shown || isMember() || store.get("fv_invite_shown", true)) return false;
    if (Number(store.get(SNOOZE_KEY) || 0) > Date.now()) return false;
    if (document.hidden || document.querySelector(".ad-toast")) return false;
    const join = document.getElementById("join");
    if (join && !join.closest("[hidden]")) {
      const r = join.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) return false; // the footer sign-up is already on screen
    }
    return true;
  }

  function invite() {
    shown = true;
    store.set("fv_invite_shown", "1", true);
    const el = document.createElement("aside");
    el.className = "fv-invite";
    el.setAttribute("aria-label", "Get new posts by email");
    el.innerHTML = `
      <button class="fv-invite__x" type="button" aria-label="Close">${CLOSE}</button>
      <span class="label">The Fang Viper Journal</span>
      <h3 class="fv-invite__title">Read the next one first.</h3>
      <ul class="fv-invite__perks">
        <li>Every new post, straight to your inbox</li>
        <li>No more pop-up ads while you read</li>
        <li>First look at new FangViper drops</li>
      </ul>
      <form class="fv-invite__form" novalidate>
        <label class="field">
          <span class="field__label">Email</span>
          <input type="email" name="email" autocomplete="email" placeholder="you@example.com" required>
        </label>
        <button class="btn btn--sm" type="submit"><span>Subscribe</span></button>
        <p class="fv-invite__msg" aria-live="polite">Unsubscribe anytime. Ads stay inside the articles only.</p>
      </form>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("in")));

    const form = el.querySelector("form"), input = el.querySelector("input"), msg = el.querySelector(".fv-invite__msg");
    const btn = el.querySelector("button[type=submit]"), label = btn.querySelector("span");
    const close = snooze => {
      if (snooze) store.set(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 864e5));
      el.classList.remove("in");
      document.removeEventListener("keydown", esc);
      setTimeout(() => el.remove(), 500);
    };
    const esc = e => { if (e.key === "Escape") close(true); };
    document.addEventListener("keydown", esc);
    el.querySelector(".fv-invite__x").addEventListener("click", () => close(true));

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const email = input.value.trim();
      const bad = () => {
        form.classList.remove("error"); void form.offsetWidth; form.classList.add("error");
        msg.textContent = "That email doesn't look right. Try again.";
        input.focus();
      };
      if (!validEmail(email)) { bad(); return; }
      btn.disabled = true; label.textContent = "Joining";
      const result = await subscribe(email, "Fangviper blog pop-up");
      if (result === "ok") {
        form.classList.add("ok"); input.disabled = true; label.textContent = "You're in";
        msg.textContent = "Welcome. Pop-up ads are now off on this device.";
        setTimeout(() => close(false), 4500);
        return;
      }
      btn.disabled = false; label.textContent = "Subscribe";
      if (result === "invalid") bad();
      else if (result === "preview") msg.textContent = "Sign-up works on blog.fangviper.com.";
      else msg.textContent = "Couldn't reach the sign-up right now. Try again in a minute.";
    });
  }

  // Wait for real reading: 20 seconds on the site and a third of the way down the page.
  const start = Date.now();
  const timer = setInterval(() => {
    if (shown || isMember()) { clearInterval(timer); return; }
    const h = document.documentElement.scrollHeight - innerHeight;
    if (Date.now() - start < 20000 || h <= 0 || scrollY / h < 0.33) return;
    if (canInvite()) { clearInterval(timer); invite(); }
  }, 1000);

  window.FV_SIGNUP = { subscribe, isMember, setMember, validEmail };
})();
