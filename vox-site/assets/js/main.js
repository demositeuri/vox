/* VOX Beauty Salon — interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Header scroll state ---- */
  var header = document.querySelector(".header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector(".nav-toggle");
  var body = document.body;
  function closeMenu() {
    body.classList.remove("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav-overlay a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---- Hero intro ---- */
  var heroCopy = document.querySelector(".hero-copy");
  if (heroCopy) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { heroCopy.classList.add("in"); });
    });
  }

  /* ---- Reveal on scroll ---- */
  var revs = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revs.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revs.forEach(function (el) { io.observe(el); });
  }

  /* ---- Spotlight glow on service cards (ported from spotlight-card) ---- */
  document.querySelectorAll(".svc-card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", (e.clientX - r.left).toFixed(1) + "px");
      card.style.setProperty("--spot-y", (e.clientY - r.top).toFixed(1) + "px");
    });
  });

  /* ---- Gallery filters ---- */
  var filterWrap = document.querySelector(".gal-filters");
  if (filterWrap) {
    filterWrap.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      filterWrap.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var cat = btn.getAttribute("data-filter");
      document.querySelectorAll(".gallery .gitem").forEach(function (item) {
        var show = cat === "all" || item.getAttribute("data-cat") === cat;
        item.classList.toggle("hide", !show);
      });
    });
  }

  /* ---- Lightbox ---- */
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery .gitem"));
  if (items.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML =
      '<button class="lb-close" aria-label="Închide">&#10005;</button>' +
      '<button class="lb-nav lb-prev" aria-label="Anterioară">&#8249;</button>' +
      '<img alt="">' +
      '<button class="lb-nav lb-next" aria-label="Următoarea">&#8250;</button>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img");
    var cur = 0;
    function visibleItems() { return items.filter(function (i) { return !i.classList.contains("hide"); }); }
    function show(i) {
      var vis = visibleItems();
      if (!vis.length) return;
      cur = (i + vis.length) % vis.length;
      var img = vis[cur].querySelector("img");
      lbImg.src = img.getAttribute("data-full") || img.src;
      lbImg.alt = img.alt;
    }
    function open(item) {
      var vis = visibleItems();
      show(vis.indexOf(item));
      lb.classList.add("open");
      body.style.overflow = "hidden";
    }
    function close() { lb.classList.remove("open"); body.style.overflow = ""; }
    items.forEach(function (item) {
      item.addEventListener("click", function () { open(item); });
    });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); show(cur + 1); });
    lb.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); show(cur - 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(cur + 1);
      if (e.key === "ArrowLeft") show(cur - 1);
    });
  }

  /* ---- Menu-nav active tracking (servicii) ---- */
  var menuLinks = document.querySelectorAll(".menu-nav a");
  if (menuLinks.length && "IntersectionObserver" in window) {
    var mo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          menuLinks.forEach(function (l) {
            l.style.color = l.getAttribute("href") === "#" + en.target.id ? "var(--gold-ink)" : "";
            l.style.borderColor = l.getAttribute("href") === "#" + en.target.id ? "var(--line-gold)" : "";
          });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll(".menu-cat").forEach(function (c) { mo.observe(c); });
  }

  /* ---- Email obfuscation (assembled at runtime so scrapers can't harvest it) ---- */
  var EMAIL = "salut" + String.fromCharCode(64) + "voxbeautysalon" + "." + "ro";
  document.querySelectorAll("[data-email]").forEach(function (el) {
    el.setAttribute("href", "mailto:" + EMAIL);
    el.setAttribute("rel", "nofollow");
    if (!el.textContent.trim()) el.textContent = EMAIL;
  });

  /* ---- Contact form: validation + anti-bot + rate limiting ---- */
  var form = document.querySelector("form[data-contact]");
  if (form) {
    var loadedAt = Date.now();
    var status = form.querySelector(".form-status");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    function val(n) { var el = form.querySelector("[name=" + n + "]"); return el ? el.value.trim() : ""; }
    function setStatus(msg, ok) {
      if (!status) return;
      status.textContent = msg;
      status.style.color = ok ? "var(--gold-ink)" : "#b1442c";
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // 1) honeypot — real users never fill this hidden field
      var hp = form.querySelector("[name=company]");
      if (hp && hp.value) { setStatus("Îți mulțumim! Mesajul a fost trimis.", true); form.reset(); return; }
      // 2) time-trap — a submit within a few seconds of load is almost always a bot
      if (Date.now() - loadedAt < 3500) { setStatus("Te rugăm să mai încerci o dată în câteva secunde.", false); return; }
      // 3) rate limit — cooldown between messages (per browser)
      var last = parseInt(localStorage.getItem("vox_contact_ts") || "0", 10);
      if (last && Date.now() - last < 45000) {
        setStatus("Ai trimis deja un mesaj. Mai încearcă peste " + Math.ceil((45000 - (Date.now() - last)) / 1000) + " secunde.", false);
        return;
      }
      // 4) validation
      var name = val("name"), email = val("email"), msg = val("message");
      if (name.length < 2) { setStatus("Te rugăm să îți scrii numele.", false); return; }
      if (!emailRe.test(email)) { setStatus("Adresa de email nu pare validă.", false); return; }
      if (msg.length < 5) { setStatus("Scrie-ne câteva cuvinte despre întrebarea ta.", false); return; }
      // ok — open the visitor's own mail client (no data leaves the browser otherwise)
      try { localStorage.setItem("vox_contact_ts", String(Date.now())); } catch (err) {}
      var subject = "Întrebare de pe site — " + name;
      var bodyTxt = msg + "\n\n— " + name + " (" + email + ")";
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(bodyTxt);
      setStatus("Se deschide aplicația ta de email…", true);
    });
  }

  /* ---- Cookie consent (GDPR) + Google Maps gating ---- */
  (function () {
    var KEY = "vox_cookie_consent";
    function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
    function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
    function loadMaps() {
      document.querySelectorAll("[data-map] iframe[data-src]").forEach(function (f) {
        if (!f.getAttribute("src")) f.setAttribute("src", f.getAttribute("data-src"));
      });
    }
    if (get() === "all") loadMaps();

    var banner;
    if (!get()) {
      banner = document.createElement("div");
      banner.className = "cookie-banner";
      banner.setAttribute("role", "dialog");
      banner.setAttribute("aria-label", "Setări cookie-uri");
      banner.innerHTML =
        '<p>Folosim cookie-uri esențiale pentru funcționarea site-ului și, doar cu acordul tău, cookie-uri de la Google Maps pentru a afișa harta. Detalii în <a href="confidentialitate.html">Politica de confidențialitate</a>.</p>' +
        '<div class="cta"><button class="cookie-reject" type="button">Doar necesare</button><button class="cookie-accept" type="button">Acceptă</button></div>';
      document.body.appendChild(banner);
      setTimeout(function () { banner.classList.add("show"); }, 40);
      banner.querySelector(".cookie-accept").addEventListener("click", function () { set("all"); loadMaps(); banner.classList.remove("show"); });
      banner.querySelector(".cookie-reject").addEventListener("click", function () { set("necessary"); banner.classList.remove("show"); });
    }

    // per-map explicit "load map" button (grants consent for the embed)
    document.querySelectorAll(".map-load").forEach(function (btn) {
      btn.addEventListener("click", function () {
        set("all"); loadMaps();
        if (banner) banner.classList.remove("show");
      });
    });
  })();

  /* ---- Highlight today's hours ---- */
  var today = new Date().getDay(); // 0=Sun..6=Sat
  document.querySelectorAll(".hours .hr").forEach(function (row) {
    var d = parseInt(row.getAttribute("data-day"), 10);
    row.classList.toggle("today", d === today);
  });

  /* ---- Footer year ---- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Smooth (lerp) scrolling — relaxed, flowing feel ---- */
  (function () {
    if (reduce) return;                                   // honor reduced motion
    if (window.matchMedia("(pointer: coarse)").matches) return; // native scroll on touch
    var docEl = document.documentElement;
    docEl.style.scrollBehavior = "auto";                  // we drive the smoothing ourselves
    var target = window.scrollY;
    var current = target;
    var running = false;
    var EASE = 0.075;                                     // lower = slower, more gliding

    function maxScroll() { return Math.max(0, docEl.scrollHeight - window.innerHeight); }
    function clamp(v) { return Math.max(0, Math.min(v, maxScroll())); }

    function loop() {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.5) { current = target; running = false; }
      window.scrollTo(0, Math.round(current * 100) / 100);
      if (running) requestAnimationFrame(loop);
    }
    function start() { if (!running) { running = true; requestAnimationFrame(loop); } }

    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey) return;                              // let pinch-zoom through
      if (document.body.style.overflow === "hidden") return; // lightbox / menu open
      if (e.target.closest && e.target.closest(".menu-nav")) return; // horizontal strip
      var dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;                    // lines -> px
      else if (e.deltaMode === 2) dy *= window.innerHeight; // pages -> px
      e.preventDefault();
      target = clamp(target + dy);
      start();
    }, { passive: false });

    // keep our target synced when the page is scrolled by other means
    window.addEventListener("scroll", function () {
      if (!running) { target = current = window.scrollY; }
    }, { passive: true });
    window.addEventListener("resize", function () { target = clamp(target); }, { passive: true });

    // route in-page anchor links through the same easing
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var hash = a.getAttribute("href");
        if (hash.length < 2) return;
        var el = document.querySelector(hash);
        if (!el) return;
        e.preventDefault();
        var header = document.querySelector(".header");
        var menu = document.querySelector(".menu-nav");
        var off = (header ? header.offsetHeight : 0) + (menu ? menu.offsetHeight : 0) + 14;
        target = clamp(el.getBoundingClientRect().top + window.scrollY - off);
        start();
        if (history.replaceState) history.replaceState(null, "", hash);
      });
    });
  })();
})();
