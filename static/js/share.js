(function () {
  const url = (document.getElementById("shareUrl") || {}).textContent || "https://shamegrin.com/";
  const toast = document.getElementById("shareToast");
  const copyBtn = document.getElementById("shareCopy");
  const nativeBtn = document.getElementById("shareNative");

  const showToast = () => {
    if (!toast) return;
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url.trim());
      showToast();
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = url.trim();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      showToast();
    }
  };

  if (copyBtn) copyBtn.addEventListener("click", copy);

  if (nativeBtn) {
    nativeBtn.addEventListener("click", async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "SHAMEGRIN",
            text: "Dark emo rap for anxiety · No face. Just sound.",
            url: url.trim(),
          });
          return;
        } catch (_) {
          /* user cancelled or unsupported */
        }
      }
      copy();
    });
  }
})();
