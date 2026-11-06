#!/usr/bin/env python3
"""Apply SHAMEGRIN YouTube title cleanup + unlist junk. Safari must stay on Studio."""
from __future__ import annotations

import json
import subprocess
import time

UNLIST = {
    "s8WV2qWAmzA": "September 7, 2026 (dup of Outrun the Crash)",
    "hWNrlGFVDF8": "Soft Landing duplicate",
}

TITLES = {
    "DzS_yskNkk8": "SHAMEGRIN — Drywall (Official Music Video)",
    "uqzotwwYTT4": "SHAMEGRIN — Trying To Outrun The Crash (Official Audio)",
    "imgoe6pz-mg": "SHAMEGRIN — One More Day | sad emo rap",
    "NA1AAD-X6jM": "SHAMEGRIN — Dirty Money | dark emo rap",
    "F4gJ_kElX5w": "SHAMEGRIN — Are You ShameGrin | dark emo rap",
    "d-Z2KXBoXBE": "SHAMEGRIN — Scars And Ink | emo rap",
    "_z_Xzj_VTuw": "SHAMEGRIN — Soft Landing (Official Audio)",
    "29V67ss0lLQ": "SHAMEGRIN — Wash Away Tears | sad rap",
    "0Qd4sDmAY8c": "SHAMEGRIN — Ashes | dark emo rap",
    "m0N3k0kF648": "SHAMEGRIN — How Many Times | sad emo rap",
    "xyrD-AaclJA": "SHAMEGRIN — Give Me One Reason To Stay (Mashup)",
    "nXPz9JX-3Do": "SHAMEGRIN — Just So Tired | sad rap",
    "_QnyM2z16v8": "SHAMEGRIN — Cold Concrete (Lyric Breakdown)",
    "1nrsxa1xf6Y": "SHAMEGRIN — Cold Concrete | emo rap",
    "Oq0840eGMv4": "SHAMEGRIN — The Fire Never Left | dark rap",
    "T8NcPeSZKV0": "SHAMEGRIN — I Can't Undo This | dark emo rap",
    "BJr4uyPi8lQ": "SHAMEGRIN — Shape | emotional hip hop",
    "HpT1HXTEIP8": "SHAMEGRIN — I Felt The Blade (After The Fire)",
    "v4tt0XLzOT4": "SHAMEGRIN — Bodies Hit The Floor (Official Music Video)",
    "3mgjDGW2pCM": "SHAMEGRIN — Stairs (Official Music Video)",
    "Seo3S20NW9M": "SHAMEGRIN — Madness Into An Anthem (Official Music Video)",
    "J5n5WaIfoGk": "SHAMEGRIN — Stand In My Lane (Official Audio)",
    "IuQ6mbwpHhA": "SHAMEGRIN — Dead To The Game | dark rap",
}


def osa(script: str) -> str:
    r = subprocess.run(["osascript"], input=script, text=True, capture_output=True)
    if r.returncode != 0:
        raise RuntimeError((r.stderr or r.stdout or "osascript failed").strip())
    return (r.stdout or "").strip()


def js(code: str) -> str:
    return osa(
        f"""
tell application "Safari"
  activate
  if (count of windows) = 0 then make new document
  return do JavaScript {json.dumps(code)} in current tab of window 1
end tell
"""
    )


def stay() -> None:
    osa(
        """
tell application "Safari" to activate
delay 0.1
tell application "System Events"
  if not (exists process "Safari") then return
  tell process "Safari"
    if exists (button "Stay on Page" of window 1) then click button "Stay on Page" of window 1
  end tell
end tell
"""
    )


def go(url: str) -> None:
    stay()
    osa(
        f"""
tell application "Safari"
  activate
  if (count of windows) = 0 then make new document
  set URL of current tab of window 1 to {json.dumps(url)}
end tell
"""
    )
    time.sleep(5)
    stay()


def wait_form(tries: int = 18) -> bool:
    for _ in range(tries):
        stay()
        if js(
            """
            (function(){
              const h=document.querySelector('#title-textarea');
              if(!h) return '0';
              const b=(h.shadowRoot&&h.shadowRoot.querySelector('#textbox'))||h.querySelector('#textbox');
              return b?'1':'0';
            })();
            """
        ) == "1":
            return True
        time.sleep(0.5)
    return False


def set_title(title: str) -> str:
    payload = {"title": title}
    return js(
        """
        (function(){
          const p = PAYLOAD;
          function boxIn(host){
            if (!host) return null;
            return (host.shadowRoot && host.shadowRoot.querySelector('#textbox')) || host.querySelector('#textbox');
          }
          function setBox(host, text){
            const box = boxIn(host);
            if (!box) return false;
            box.focus();
            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(box);
            sel.removeAllRanges();
            sel.addRange(range);
            const ok = document.execCommand('insertText', false, text);
            if (!ok) {
              box.innerText = text;
              box.dispatchEvent(new InputEvent('input', {bubbles:true, composed:true}));
            }
            return true;
          }
          return JSON.stringify({t: setBox(document.querySelector('#title-textarea'), p.title)});
        })();
        """.replace("PAYLOAD", json.dumps(payload))
    )


def current_vis() -> str:
    return js("(document.querySelector('#visibility-text')||{}).innerText || ''")


def unlist() -> str:
    vis = current_vis()
    if vis.strip().lower() == "unlisted":
        return "already unlisted"
    js(
        """
        (function(){
          const el = document.querySelector('#visibility-text');
          if (el) el.click();
          return el ? 'opened' : 'no vis';
        })();
        """
    )
    time.sleep(1.1)
    clicked = js(
        """
        (function(){
          function all(root, acc){
            acc = acc || [];
            root = root || document;
            for (const el of root.querySelectorAll('*')) {
              acc.push(el);
              if (el.shadowRoot) all(el.shadowRoot, acc);
            }
            return acc;
          }
          const radio = all().find(el => el.getAttribute && el.getAttribute('name')==='UNLISTED');
          if (!radio) return 'NO RADIO';
          radio.click();
          return 'radio';
        })();
        """
    )
    time.sleep(0.5)
    done = js(
        """
        (function(){
          function all(root, acc){
            acc = acc || [];
            root = root || document;
            for (const el of root.querySelectorAll('*')) {
              acc.push(el);
              if (el.shadowRoot) all(el.shadowRoot, acc);
            }
            return acc;
          }
          const btn = all().find(el => el.tagName==='BUTTON' && (el.getAttribute('aria-label')||'')==='Done');
          if (!btn) return 'NO DONE';
          btn.click();
          return 'done';
        })();
        """
    )
    time.sleep(0.8)
    return f"{clicked}/{done}/{current_vis()}"


def click_save() -> str:
    return js(
        """
        (function(){
          const b = document.querySelector('#save');
          if (!b) return 'NO SAVE';
          try { b.disabled = false; b.removeAttribute('aria-disabled'); } catch(e) {}
          b.click();
          return 'save';
        })();
        """
    )


def wait_saved(timeout: int = 18) -> bool:
    start = time.time()
    while time.time() - start < timeout:
        stay()
        t = js("(document.body.innerText||'')") or ""
        if "All changes saved" in t or "Changes saved" in t:
            return True
        time.sleep(0.6)
    return False


def process(vid: str, title: str | None, make_unlisted: bool) -> str:
    go(f"https://studio.youtube.com/video/{vid}/edit")
    if not wait_form():
        return "FAIL form"
    bits = []
    if make_unlisted:
        bits.append("unlist:" + unlist())
    if title:
        bits.append("title:" + set_title(title))
    bits.append(click_save())
    bits.append("SAVED" if wait_saved() else "SAVE?")
    bits.append("vis=" + current_vis())
    return " ".join(bits)


def main() -> int:
    results = []
    jobs: list[tuple[str, str | None, bool, str]] = []
    for vid, why in UNLIST.items():
        jobs.append((vid, None, True, why))
    for vid, title in TITLES.items():
        jobs.append((vid, title, False, title))

    print(f"{len(jobs)} videos")
    for i, (vid, title, make_unlisted, note) in enumerate(jobs, 1):
        print(f"[{i}/{len(jobs)}] {vid}  {note}", flush=True)
        try:
            line = process(vid, title, make_unlisted)
        except Exception as e:
            stay()
            line = f"ERROR {e}"
        print(" ", line, flush=True)
        results.append(f"{vid}  {line}  {note}")
        time.sleep(0.8)
    print("---")
    print("\n".join(results))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
