(function () {
  const search = document.getElementById("search");
  const items = Array.from(document.querySelectorAll(".video-item"));
  const empty = document.getElementById("empty");
  const meta = document.getElementById("searchMeta");
  const total = items.length;

  if (search) {
    search.addEventListener("input", () => {
      const term = search.value.trim().toLowerCase();
      let shown = 0;
      items.forEach((item) => {
        const match = !term || (item.dataset.title || "").includes(term);
        item.hidden = !match;
        if (match) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
      if (meta) meta.textContent = term ? shown + " of " + total + " tracks" : total + " tracks";
    });
  }

  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.url);
        const original = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => { btn.textContent = original; }, 1200);
      } catch {
        window.prompt("Copy URL", btn.dataset.url);
      }
    });
  });

  const shareCopy = document.getElementById("shareCopy");
  const shareToast = document.getElementById("shareToast");
  const shareUrl = document.getElementById("shareUrl");
  if (shareCopy && shareUrl) {
    shareCopy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(shareUrl.textContent.trim());
        if (shareToast) shareToast.hidden = false;
      } catch {
        window.prompt("Copy link", shareUrl.textContent.trim());
      }
    });
  }

  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const chips = document.querySelectorAll(".filter-chip");
  const cards = document.querySelectorAll(".product-card");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const f = chip.dataset.filter;
      cards.forEach((card) => {
        card.hidden = f !== "all" && card.dataset.category !== f;
      });
    });
  });

  const KEY = "sg-cart";
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  const countEl = document.getElementById("cartCount");
  const itemsEl = document.getElementById("cartItems");
  const emptyEl = document.getElementById("cartEmpty");
  const totalEl = document.getElementById("cartTotal");
  const toast = document.getElementById("toast");

  function cart() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  }
  function save(c) {
    localStorage.setItem(KEY, JSON.stringify(c));
    renderCart();
  }
  function renderCart() {
    if (!countEl) return;
    const c = cart();
    const n = c.reduce((s, i) => s + i.qty, 0);
    const sum = c.reduce((s, i) => s + i.qty * i.price, 0);
    countEl.textContent = String(n);
    if (totalEl) totalEl.textContent = "$" + sum + " CAD";
    if (!itemsEl) return;
    itemsEl.innerHTML = c.map((i, idx) =>
      `<div class="cart-line"><strong>${i.name}</strong><div class="meta">${i.size || ""} · $${i.price}</div>
       <div class="qty-controls"><button type="button" data-q="${idx}" data-d="-1">−</button><span>${i.qty}</span>
       <button type="button" data-q="${idx}" data-d="1">+</button></div></div>`
    ).join("");
    if (emptyEl) emptyEl.hidden = c.length !== 0;
  }
  function openCart(on) {
    if (!drawer) return;
    drawer.hidden = !on;
    if (overlay) overlay.hidden = !on;
  }
  document.getElementById("cartOpen")?.addEventListener("click", () => openCart(true));
  document.getElementById("cartClose")?.addEventListener("click", () => openCart(false));
  overlay?.addEventListener("click", () => openCart(false));
  itemsEl?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-q]");
    if (!btn) return;
    const c = cart();
    const i = Number(btn.dataset.q);
    c[i].qty += Number(btn.dataset.d);
    if (c[i].qty <= 0) c.splice(i, 1);
    save(c);
  });
  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const size = card.querySelector(".product-size")?.value || "";
      const c = cart();
      const id = card.dataset.id + size;
      const found = c.find((x) => x.line === id);
      if (found) found.qty += 1;
      else c.push({ line: id, name: card.dataset.name, price: Number(card.dataset.price), size, qty: 1 });
      save(c);
      if (toast) {
        toast.hidden = false;
        setTimeout(() => { toast.hidden = true; }, 1200);
      }
    });
  });
  renderCart();
})();
