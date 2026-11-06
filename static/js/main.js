(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  const playerBar = document.getElementById("playerBar");

  const onScroll = () => {
    const y = window.scrollY || 0;
    if (nav) nav.classList.toggle("is-scrolled", y > 12);
    const top = document.querySelector(".site-top");
    if (top) top.classList.toggle("is-scrolled", y > 12);
    if (playerBar) playerBar.classList.toggle("is-visible", y > window.innerHeight * 0.55);

    const sectionIds = ["buy", "music", "catalog", "videos", "soundcloud", "listen", "bio", "faq", "share", "connect"];
    let current = "";
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top <= 140 && r.bottom > 140) {
        current = id;
        break;
      }
    }
    document.querySelectorAll('.nav-links a[href^="#"]').forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + current);
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && menu) {
    const setOpen = (open) => {
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!menu.classList.contains("is-open"));
      if (menu.classList.contains("is-open")) menu.scrollTop = 0;
    });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860 && menu.classList.contains("is-open")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) setOpen(false);
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  const shareUrl = "https://shamegrin.com/";
  const shareTitle = "SHAMEGRIN — The Stutter Boys and the ShameGrin";
  const shareText = "New single out now on Spotify. No face. Just sound.";
  const toast = document.getElementById("shareToast");

  const showToast = (msg) => {
    if (!toast) return;
    toast.hidden = false;
    toast.textContent = msg;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  };

  const copyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast("Link copied — send it to someone at 3am");
    } catch {
      showToast("Copy failed — select the URL above");
    }
  };

  document.getElementById("shareCopy")?.addEventListener("click", copyLink);
  document.getElementById("shareNative")?.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch {
        /* cancelled */
      }
    }
    copyLink();
  });
})();
