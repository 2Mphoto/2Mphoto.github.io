/* =============================================
   2Mphoto — main.js
   ============================================= */

/* ---- Navigation mobile ---- */
const toggle = document.querySelector(".nav-toggle");
const links  = document.getElementById("navLinks");

if (toggle && links) {
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  links.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---- Année footer ---- */
const yEl = document.getElementById("y");
if (yEl) yEl.textContent = new Date().getFullYear();

/* ---- Reveal au scroll (Intersection Observer) ---- */
{
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -32px 0px" });
    revealEls.forEach(el => io.observe(el));
  }
}

/* ---- Lightbox galerie ---- */
{
  const lb       = document.getElementById("lightbox");
  const gallImgs = [...document.querySelectorAll(".masonry img")];

  if (lb && gallImgs.length) {
    const lbImg  = lb.querySelector(".lb-img");
    const lbCnt  = lb.querySelector(".lb-counter");
    let idx = 0;

    const open = (i) => {
      idx = ((i % gallImgs.length) + gallImgs.length) % gallImgs.length;
      lbImg.src         = gallImgs[idx].src;
      lbImg.alt         = gallImgs[idx].alt || `Photo ${idx + 1}`;
      lbCnt.textContent = `${idx + 1} / ${gallImgs.length}`;
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    const close = () => {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    gallImgs.forEach((img, i) => img.addEventListener("click", () => open(i)));
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", e => { e.stopPropagation(); open(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", e => { e.stopPropagation(); open(idx + 1); });
    lb.addEventListener("click", e => { if (e.target === lb) close(); });

    document.addEventListener("keydown", e => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape")     close();
      if (e.key === "ArrowRight") open(idx + 1);
      if (e.key === "ArrowLeft")  open(idx - 1);
    });

    /* Swipe mobile lightbox */
    let lbSx = null;
    lb.addEventListener("touchstart", e => { lbSx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend",   e => {
      if (lbSx === null) return;
      const dx = e.changedTouches[0].clientX - lbSx;
      lbSx = null;
      if (Math.abs(dx) < 50) return;
      open(dx < 0 ? idx + 1 : idx - 1);
    }, { passive: true });
  }
}

/* ---- Formulaire contact (Formspree) ---- */
{
  const form = document.querySelector("form.form");
  if (form) {
    const submitBtn = form.querySelector("button[type=submit]");
    const statusEl  = form.querySelector(".form-status");

    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (!submitBtn) return;

      submitBtn.disabled    = true;
      submitBtn.textContent = "Envoi…";
      if (statusEl) { statusEl.textContent = ""; statusEl.className = "form-status"; }

      try {
        const res = await fetch(form.action, {
          method:  "POST",
          body:    new FormData(form),
          headers: { "Accept": "application/json" }
        });
        if (res.ok) {
          form.reset();
          if (statusEl) {
            statusEl.textContent = "✓ Message envoyé — je te réponds rapidement !";
            statusEl.classList.add("success");
          }
        } else {
          throw new Error("HTTP " + res.status);
        }
      } catch {
        if (statusEl) {
          statusEl.textContent = "Erreur d'envoi. Réessaie ou contacte-moi directement par email.";
          statusEl.classList.add("error");
        }
      } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = "Envoyer";
      }
    });
  }
}
