/*
 * Text effects — vanilla ports of the SplitText / ScrollReveal ideas (no React needed).
 * Three tools:
 *   revealWords(el, opts)          — animate an element's words in immediately (hero entrance)
 *   revealWordsOnScroll(el, opts)  — same, but triggered once when the element enters view
 *   scrubWordReveal(el, opts)      — words fade/sharpen progressively as the user scrolls past
 */
(function () {
  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Splits an element's text into `.split-word` spans while preserving any
  // non-text child nodes (e.g. <br> line breaks) exactly where they were.
  function wrapWords(el) {
    if (el.dataset.split === "1") return el.querySelectorAll(".split-word");
    el.dataset.split = "1";
    const nodes = Array.from(el.childNodes);
    el.innerHTML = "";
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((chunk) => {
          if (!chunk) return;
          if (/^\s+$/.test(chunk)) {
            el.appendChild(document.createTextNode(chunk));
          } else {
            const span = document.createElement("span");
            span.className = "split-word";
            span.textContent = chunk;
            el.appendChild(span);
          }
        });
      } else {
        el.appendChild(node.cloneNode(true));
      }
    });
    return el.querySelectorAll(".split-word");
  }

  function revealWords(el, opts = {}) {
    const { stagger = 0.04, duration = 0.6, y = 16, ease = "power3.out", delay = 0 } = opts;
    const words = wrapWords(el);
    if (reduced || typeof gsap === "undefined") {
      words.forEach((w) => {
        w.style.opacity = "1";
        w.style.transform = "none";
      });
      return;
    }
    gsap.set(words, { opacity: 0, y });
    gsap.to(words, { opacity: 1, y: 0, duration, ease, stagger, delay });
  }

  function revealWordsOnScroll(el, opts = {}) {
    const { threshold = 0.2, ...rest } = opts;
    if (reduced || typeof IntersectionObserver === "undefined") {
      revealWords(el, rest);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealWords(el, rest);
            io.unobserve(el);
          }
        });
      },
      { threshold }
    );
    io.observe(el);
  }

  // Scroll-scrubbed word reveal: opacity/blur tied continuously to scroll position,
  // rather than firing once — used for a single emphasis moment, not everywhere.
  function scrubWordReveal(el, opts = {}) {
    const { blurStrength = 6, baseOpacity = 0.15 } = opts;
    const words = wrapWords(el);
    words.forEach((w) => {
      w.style.willChange = "opacity, filter";
      w.style.display = "inline-block";
    });

    if (reduced) {
      words.forEach((w) => {
        w.style.opacity = "1";
        w.style.filter = "none";
      });
      return;
    }

    const n = words.length;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh;
      const end = vh * 0.4;
      const raw = (start - rect.top) / (start - end);
      const progress = Math.min(1, Math.max(0, raw));
      words.forEach((w, i) => {
        const local = Math.min(1, Math.max(0, progress * n - i * 0.75));
        w.style.opacity = String(baseOpacity + (1 - baseOpacity) * local);
        w.style.filter = `blur(${blurStrength * (1 - local)}px)`;
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  window.TextEffects = { revealWords, revealWordsOnScroll, scrubWordReveal, wrapWords };
})();
