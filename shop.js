(function () {
  const KEY = "shamegrin_cart_v1";
  const currency = (window.SHAMEGRIN_STORE && window.SHAMEGRIN_STORE.currency) || "CAD";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const cartOpen = $("#cartOpen");
  const cartOpenMobile = $("#cartOpenMobile");
  const cartClose = $("#cartClose");
  const cartDrawer = $("#cartDrawer");
  const cartOverlay = $("#cartOverlay");
  const cartItems = $("#cartItems");
  const cartEmpty = $("#cartEmpty");
  const cartCount = $("#cartCount");
  const cartTotal = $("#cartTotal");
  const checkoutOpen = $("#checkoutOpen");
  const checkoutModal = $("#checkoutModal");
  const checkoutClose = $("#checkoutClose");
  const checkoutBackdrop = $("#checkoutBackdrop");
  const checkoutForm = $("#checkoutForm");
  const checkoutSummary = $("#checkoutSummary");
  const checkoutStatus = $("#checkoutStatus");
  const toast = $("#toast");
  const navToggle = $("#navToggle");
  const mobileMenu = $("#mobileMenu");
  const mobileCartBar = $("#mobileCartBar");
  const mcbCount = $("#mcbCount");
  const mcbTotal = $("#mcbTotal");

  let cart = loadCart();

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  }
  function saveCart() {
    localStorage.setItem(KEY, JSON.stringify(cart));
    renderCart();
  }

  function money(n) {
    return `$${Number(n).toFixed(n % 1 ? 2 : 0)} ${currency}`;
  }

  function lineKey(item) {
    return `${item.id}__${item.size || ""}__${item.color || ""}`;
  }

  function toastMsg(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastMsg._t);
    toastMsg._t = setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  }

  function openCart() {
    cartDrawer.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    cartOverlay.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    cartOverlay.hidden = true;
    document.body.style.overflow = "";
  }
  function openCheckout() {
    if (!cart.length) return;
    renderCheckoutSummary();
    checkoutModal.hidden = false;
    checkoutModal.setAttribute("aria-hidden", "false");
    checkoutStatus.textContent = "";
    checkoutStatus.className = "checkout-status";
  }
  function closeCheckout() {
    checkoutModal.hidden = true;
    checkoutModal.setAttribute("aria-hidden", "true");
  }

  function addItem(item) {
    const key = lineKey(item);
    const existing = cart.find((c) => lineKey(c) === key);
    if (existing) existing.qty = Math.min(20, existing.qty + (item.qty || 1));
    else cart.push({ ...item, qty: item.qty || 1 });
    saveCart();
    toastMsg("Added to cart");
    openCart();
  }

  function renderCart() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (cartCount) cartCount.textContent = String(count);
    if (cartTotal) cartTotal.textContent = money(total);
    if (checkoutOpen) checkoutOpen.disabled = count === 0;
    if (mcbCount) mcbCount.textContent = String(count);
    if (mcbTotal) mcbTotal.textContent = money(total);
    if (mobileCartBar) {
      mobileCartBar.classList.toggle("is-empty", count === 0);
    }

    if (!cartItems) return;
    cartItems.innerHTML = "";
    if (cartEmpty) cartEmpty.classList.toggle("is-visible", cart.length === 0);

    cart.forEach((item, idx) => {
      const el = document.createElement("div");
      el.className = "cart-line";
      el.innerHTML = `
        <div>
          <div class="cart-line-name">${escapeHtml(item.name)}</div>
          <div class="cart-line-meta">${escapeHtml([item.size, item.color].filter(Boolean).join(" · ") || "Standard")}</div>
        </div>
        <div class="cart-line-price">${money(item.price * item.qty)}</div>
        <div class="cart-line-actions">
          <div class="qty-controls">
            <button type="button" data-dec="${idx}" aria-label="Decrease">−</button>
            <span>${item.qty}</span>
            <button type="button" data-inc="${idx}" aria-label="Increase">+</button>
          </div>
          <button type="button" class="cart-remove" data-rm="${idx}">Remove</button>
        </div>`;
      cartItems.appendChild(el);
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCheckoutSummary() {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    checkoutSummary.innerHTML =
      cart
        .map(
          (i) =>
            `<div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:6px">
              <span>${escapeHtml(i.qty)}× ${escapeHtml(i.name)}${i.size ? " · " + escapeHtml(i.size) : ""}</span>
              <span>${money(i.price * i.qty)}</span>
            </div>`
        )
        .join("") +
      `<div style="display:flex;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.08);color:#f2f2f5;font-weight:700">
        <span>Total</span><span style="color:#00d96a">${money(total)}</span>
      </div>`;
  }

  // Filters
  $$(".filter-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".filter-chip").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const f = btn.dataset.filter;
      $$(".product-card").forEach((card) => {
        const show = f === "all" || card.dataset.category === f;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  // Add to cart
  $$("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      if (!card) return;
      const sizeEl = card.querySelector(".product-size");
      const colorEl = card.querySelector(".product-color");
      addItem({
        id: card.dataset.id,
        name: card.dataset.name,
        price: parseFloat(card.dataset.price || "0"),
        size: sizeEl ? sizeEl.value : "",
        color: colorEl ? colorEl.value : "",
        qty: 1,
      });
    });
  });

  cartItems?.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.dataset.inc != null) {
      const i = +t.dataset.inc;
      cart[i].qty = Math.min(20, cart[i].qty + 1);
      saveCart();
    }
    if (t.dataset.dec != null) {
      const i = +t.dataset.dec;
      cart[i].qty -= 1;
      if (cart[i].qty <= 0) cart.splice(i, 1);
      saveCart();
    }
    if (t.dataset.rm != null) {
      cart.splice(+t.dataset.rm, 1);
      saveCart();
    }
  });

  cartOpen?.addEventListener("click", openCart);
  cartOpenMobile?.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    openCart();
  });
  mobileCartBar?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);
  cartOverlay?.addEventListener("click", closeCart);
  checkoutOpen?.addEventListener("click", openCheckout);
  checkoutClose?.addEventListener("click", closeCheckout);
  checkoutBackdrop?.addEventListener("click", closeCheckout);

  navToggle?.addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
  });
  mobileMenu?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => document.body.classList.remove("menu-open"));
  });

  checkoutForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!cart.length) return;
    const fd = new FormData(checkoutForm);
    const payload = {
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      address: fd.get("address"),
      city: fd.get("city"),
      region: fd.get("region"),
      postal: fd.get("postal"),
      country: fd.get("country"),
      notes: fd.get("notes"),
      currency,
      items: cart,
    };

    checkoutStatus.textContent = "Submitting…";
    checkoutStatus.className = "checkout-status";

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        checkoutStatus.textContent =
          data.message ||
          "Order received — check your email for confirmation.";
        checkoutStatus.className = "checkout-status is-ok";
        cart = [];
        saveCart();
        setTimeout(() => {
          closeCheckout();
          closeCart();
          toastMsg("Order emailed");
        }, 1800);
        return;
      }
      // Fallback: store order locally + mailto
      if (res.status === 404 || res.status === 405 || res.status === 502 || !res.ok) {
        const localKey = "shamegrin_orders";
        const list = JSON.parse(localStorage.getItem(localKey) || "[]");
        const orderId = Date.now();
        list.push({ id: orderId, ...payload, at: new Date().toISOString() });
        localStorage.setItem(localKey, JSON.stringify(list));
        const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
        const body = encodeURIComponent(
          `New SHAMEGRIN order #${orderId}\n\n` +
            cart.map((i) => `${i.qty}x ${i.name} (${i.size || "-"} ${i.color || ""}) — $${i.price * i.qty}`).join("\n") +
            `\n\nTotal: $${total} ${currency}\n` +
            `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone || "-"}\n` +
            `Ship: ${payload.address || ""} ${payload.city || ""} ${payload.region || ""} ${payload.postal || ""} ${payload.country || ""}\n` +
            `Notes: ${payload.notes || ""}`
        );
        const mail = (window.SHAMEGRIN_STORE && window.SHAMEGRIN_STORE.email) || "shamegrin@icloud.com";
        window.location.href = `mailto:${mail}?subject=${encodeURIComponent("SHAMEGRIN order #" + orderId)}&body=${body}`;
        checkoutStatus.textContent = `Order #${orderId} saved. Complete via email if mail client opens.`;
        checkoutStatus.className = "checkout-status is-ok";
        cart = [];
        saveCart();
        return;
      }
      checkoutStatus.textContent = data.error || "Something went wrong.";
      checkoutStatus.className = "checkout-status is-err";
    } catch {
      checkoutStatus.textContent = "Network error — try again.";
      checkoutStatus.className = "checkout-status is-err";
    }
  });

  renderCart();
})();
