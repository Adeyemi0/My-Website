/* Adediran Adeyemi - site.js (vanilla, no framework dependency) */
(function () {
  "use strict";

  const $ = (s, ctx) => (ctx || document).querySelector(s);
  const $$ = (s, ctx) => Array.from((ctx || document).querySelectorAll(s));

  /* ---------- Mobile nav ---------- */
  const toggle = $(".mobile-nav-toggle");
  const navbar = $(".navbar");
  let scrim = $(".nav-scrim");
  if (!scrim) {
    scrim = document.createElement("div");
    scrim.className = "nav-scrim";
    document.body.appendChild(scrim);
  }
  function closeNav() {
    navbar && navbar.classList.remove("nav-open");
    scrim.classList.remove("show");
    document.body.classList.remove("no-scroll");
    if (toggle) toggle.innerHTML = '<i class="bi bi-list"></i>';
  }
  function openNav() {
    navbar && navbar.classList.add("nav-open");
    scrim.classList.add("show");
    document.body.classList.add("no-scroll");
    if (toggle) toggle.innerHTML = '<i class="bi bi-x-lg"></i>';
  }
  if (toggle) {
    toggle.addEventListener("click", () => {
      navbar.classList.contains("nav-open") ? closeNav() : openNav();
    });
  }
  scrim.addEventListener("click", closeNav);
  $$(".navbar a").forEach((a) => a.addEventListener("click", closeNav));

  /* ---------- Header scroll state ---------- */
  const header = $("#header");
  function onScroll() {
    if (header) {
      if (window.scrollY > 12) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }
    const btt = $(".back-to-top");
    if (btt) window.scrollY > 400 ? btt.classList.add("active") : btt.classList.remove("active");
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Back to top ---------- */
  const btt = $(".back-to-top");
  if (btt) {
    btt.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- FAQ accordion ---------- */
  $$(".faq-q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      const a = item.querySelector(".faq-a");
      const isOpen = q.classList.contains("open");
      $$(".faq-q").forEach((other) => {
        if (other !== q) {
          other.classList.remove("open");
          other.closest(".faq-item").querySelector(".faq-a").style.maxHeight = null;
        }
      });
      if (isOpen) {
        q.classList.remove("open");
        a.style.maxHeight = null;
      } else {
        q.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal, [data-aos]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            entry.target.classList.add("aos-animate");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in", "aos-animate"));
  }

  /* ---------- Animated counters (data-counter="120") ---------- */
  $$("[data-counter]").forEach((el) => {
    const target = parseFloat(el.getAttribute("data-counter"));
    const suffix = el.getAttribute("data-suffix") || "";
    const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals")) : 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            const dur = 1400;
            const start = performance.now();
            function tick(now) {
              const p = Math.min((now - start) / dur, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              el.textContent = (target * eased).toFixed(decimals) + suffix;
              if (p < 1) requestAnimationFrame(tick);
              else el.textContent = target.toFixed(decimals) + suffix;
            }
            requestAnimationFrame(tick);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
  });

  /* ---------- TOC scrollspy (project/blog long-form pages) ---------- */
  const tocLinks = $$(".toc-list a");
  if (tocLinks.length) {
    const sections = tocLinks
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);
    function spy() {
      let current = null;
      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 140) current = sec;
      });
      tocLinks.forEach((a) => a.classList.remove("active"));
      if (current) {
        const link = tocLinks.find((a) => a.getAttribute("href") === "#" + current.id);
        if (link) link.classList.add("active");
      }
    }
    document.addEventListener("scroll", spy, { passive: true });
    spy();
  }

  /* ---------- Simple image lightbox ---------- */
  $$("[data-lightbox]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const src = trigger.getAttribute("href") || trigger.querySelector("img")?.src;
      if (!src) return;
      const overlay = document.createElement("div");
      overlay.className = "lb-overlay";
      overlay.innerHTML = `<img src="${src}" alt=""><button class="lb-close" aria-label="Close">&times;</button>`;
      document.body.appendChild(overlay);
      document.body.classList.add("no-scroll");
      requestAnimationFrame(() => overlay.classList.add("show"));
      function close() {
        overlay.classList.remove("show");
        document.body.classList.remove("no-scroll");
        setTimeout(() => overlay.remove(), 200);
      }
      overlay.addEventListener("click", close);
    });
  });

  /* ---------- Copy link / share ---------- */
  $$("[data-copy-link]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      navigator.clipboard?.writeText(window.location.href).then(() => {
        const original = btn.getAttribute("aria-label") || "";
        btn.setAttribute("aria-label", "Copied!");
        setTimeout(() => btn.setAttribute("aria-label", original), 1500);
      });
    });
  });

  /* ---------- Category / project filter chips ---------- */
  $$(".filter-bar").forEach((bar) => {
    const chips = $$(".filter-chip", bar);
    const targetSelector = bar.getAttribute("data-filter-target") || ".filterable";
    const items = $$(targetSelector);
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        const val = chip.getAttribute("data-filter");
        items.forEach((item) => {
          const cats = (item.getAttribute("data-category") || "").split(",");
          item.style.display = val === "all" || cats.includes(val) ? "" : "none";
        });
      });
    });
  });

  /* ---------- Contact form (mailto fallback, no backend assumed) ---------- */
  const form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = $("#form-status");
      const data = new FormData(form);
      if (status) {
        status.textContent = "Thanks, your message is ready to send. Opening your email client now.";
        status.style.color = "var(--success-dark)";
      }
      const subject = encodeURIComponent("New inquiry from " + (data.get("name") || "website"));
      const body = encodeURIComponent(
        `Name: ${data.get("name") || ""}\nEmail: ${data.get("email") || ""}\nCompany: ${data.get("company") || ""}\nBudget: ${data.get("budget") || ""}\n\nMessage:\n${data.get("message") || ""}`
      );
      window.location.href = `mailto:adeyemi@adediranadeyemi.com?subject=${subject}&body=${body}`;
    });
  }
})();
