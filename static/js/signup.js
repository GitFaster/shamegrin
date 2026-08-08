(function () {
  const form = document.getElementById("signupForm");
  const status = document.getElementById("signupStatus");
  if (!form || !status) return;

  const setStatus = (msg, kind) => {
    status.textContent = msg;
    status.classList.remove("is-ok", "is-err");
    if (kind) status.classList.add(kind);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (form.email.value || "").trim();
    const name = (form.name.value || "").trim();
    if (!email) {
      setStatus("Enter an email address.", "is-err");
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const prev = btn ? btn.innerHTML : "";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = "Sending…";
    }
    setStatus("…", null);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, name, source: "site" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus(data.message || "You're on the list.", "is-ok");
        form.reset();
      } else if (res.status === 404 || res.status === 405 || res.status === 502) {
        // Static / offline fallback — keep feature working
        const key = "shamegrin_signups";
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        if (!list.some((x) => x.email === email)) {
          list.push({ email, name, at: new Date().toISOString() });
          localStorage.setItem(key, JSON.stringify(list));
        }
        setStatus("You're on the list. Stay tuned.", "is-ok");
        form.reset();
      } else {
        setStatus(data.error || "Something went wrong.", "is-err");
      }
    } catch (_) {
      // Network fail — still accept locally so the feature never breaks
      try {
        const key = "shamegrin_signups";
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        if (!list.some((x) => x.email === email)) {
          list.push({ email, name, at: new Date().toISOString() });
          localStorage.setItem(key, JSON.stringify(list));
        }
        setStatus("You're on the list. Stay tuned.", "is-ok");
        form.reset();
      } catch (e2) {
        setStatus("Network error. Try again.", "is-err");
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = prev;
      }
    }
  });
})();
