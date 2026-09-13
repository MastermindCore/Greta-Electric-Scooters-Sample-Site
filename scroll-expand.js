/*
 * ScrollExpand — vanilla JS port (adapted from a React Bits component)
 * Pins a frame in place and expands it to full-bleed as the user scrolls past it.
 * Usage: new ScrollExpand(document.querySelector('.about-media'), { title, hint, ... })
 */
(function () {
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
    return t * t * (3 - 2 * t);
  };

  class ScrollExpand {
    constructor(root, opts = {}) {
      this.root = root;
      this.cfg = Object.assign(
        {
          startWidth: 44,
          startHeight: 60,
          startRadius: 20,
          endRadius: 0,
          mediaZoom: 1.3,
          scrollDistance: 1.15,
          holdDistance: 0.3,
          smoothing: 0.1,
          overlayScrim: 0.55,
          useWindowScroll: true,
          enabled: true,
          title: "",
          hint: "",
          overlayHeading: "",
          overlayBody: "",
          mediaHTML: "",
          mediaImage: ""
        },
        opts
      );
      this._build();
      this._bind();
    }

    _build() {
      const root = this.root;
      root.classList.add("scroll-expand");
      if (!this.cfg.useWindowScroll) root.classList.add("scroll-expand--scroller");

      const track = document.createElement("div");
      track.className = "scroll-expand__track";
      this.track = track;

      const stage = document.createElement("div");
      stage.className = "scroll-expand__stage";
      this.stage = stage;

      const frame = document.createElement("div");
      frame.className = "scroll-expand__frame";
      this.frame = frame;

      const media = document.createElement("div");
      media.className = "scroll-expand__media" + (this.cfg.mediaImage ? "" : " scroll-expand-media-fill");
      if (this.cfg.mediaImage) {
        media.style.backgroundImage = `url(${this.cfg.mediaImage})`;
        media.style.backgroundSize = "cover";
        media.style.backgroundPosition = "center";
      } else {
        media.innerHTML = this.cfg.mediaHTML || "";
      }
      this.media = media;

      const scrim = document.createElement("div");
      scrim.className = "scroll-expand__scrim";
      this.scrim = scrim;

      frame.appendChild(media);
      frame.appendChild(scrim);

      if (this.cfg.overlayHeading || this.cfg.overlayBody) {
        const overlay = document.createElement("div");
        overlay.className = "scroll-expand__overlay";
        overlay.innerHTML = `${this.cfg.overlayHeading ? `<h3>${this.cfg.overlayHeading}</h3>` : ""}${
          this.cfg.overlayBody ? `<p>${this.cfg.overlayBody}</p>` : ""
        }`;
        frame.appendChild(overlay);
        this.overlay = overlay;
      }

      stage.appendChild(frame);

      if (this.cfg.title) {
        const title = document.createElement("div");
        title.className = "scroll-expand__title";
        title.textContent = this.cfg.title;
        stage.appendChild(title);
        this.title = title;
      }
      if (this.cfg.hint) {
        const hint = document.createElement("div");
        hint.className = "scroll-expand__hint";
        hint.textContent = this.cfg.hint;
        stage.appendChild(hint);
        this.hint = hint;
      }

      track.appendChild(stage);
      root.appendChild(track);
    }

    _applyProgress(p) {
      const c = this.cfg;
      const e = smoothstep(0, 1, p);

      const w = c.startWidth + (100 - c.startWidth) * e;
      const h = c.startHeight + (100 - c.startHeight) * e;
      const ix = Math.max(0, (100 - w) / 2);
      const iy = Math.max(0, (100 - h) / 2);
      const r = c.startRadius + (c.endRadius - c.startRadius) * e;
      this.frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;

      this.media.style.transform = `scale(${c.mediaZoom + (1 - c.mediaZoom) * e})`;

      if (this.scrim) this.scrim.style.opacity = `${c.overlayScrim * e}`;

      if (this.title) {
        const out = smoothstep(0.4, 0.88, p);
        this.title.style.opacity = `${1 - out}`;
        this.title.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`;
      }
      if (this.hint) {
        const gone = smoothstep(0, 0.12, p);
        this.hint.style.opacity = `${1 - gone}`;
        this.hint.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
      }
      if (this.overlay) {
        const inn = smoothstep(0.68, 1, p);
        this.overlay.style.opacity = `${inn}`;
        this.overlay.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`;
      }
    }

    _bind() {
      const root = this.root;
      const track = this.track;
      const stage = this.stage;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let raf = 0;
      let current = 0;
      let target = 0;
      let stageH = 0;
      let running = false;

      const measure = () => {
        const c = this.cfg;
        stageH = c.useWindowScroll ? window.innerHeight : root.clientHeight;
        if (stageH <= 0) return;
        stage.style.height = `${stageH}px`;
        track.style.height = `${stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance))}px`;
        const w = root.clientWidth || stageH;
        stage.style.setProperty("--se-title-size", `${clamp(w * 0.08, 26, 90)}px`);
      };

      const readProgress = () => {
        const c = this.cfg;
        if (!c.enabled) return 1;
        const span = stageH * Math.max(0.01, c.scrollDistance);
        if (c.useWindowScroll) {
          const top = track.getBoundingClientRect().top;
          return clamp(-top / span, 0, 1);
        }
        return clamp(root.scrollTop / span, 0, 1);
      };

      const tick = () => {
        const c = this.cfg;
        const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));
        current += (target - current) * k;
        if (Math.abs(target - current) < 0.0004) {
          current = target;
          running = false;
        }
        this._applyProgress(current);
        raf = running ? requestAnimationFrame(tick) : 0;
      };

      const kick = () => {
        if (running) return;
        running = true;
        if (!raf) raf = requestAnimationFrame(tick);
      };

      const onScroll = () => {
        target = readProgress();
        if (this.cfg.smoothing <= 0 || reduceMotion) {
          current = target;
          this._applyProgress(current);
          return;
        }
        kick();
      };

      const onResize = () => {
        measure();
        target = readProgress();
        current = target;
        this._applyProgress(current);
      };

      measure();
      target = readProgress();
      current = target;
      this._applyProgress(current);

      const scroller = this.cfg.useWindowScroll ? window : root;
      scroller.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      const ro = new ResizeObserver(onResize);
      ro.observe(root);
    }
  }

  window.ScrollExpand = ScrollExpand;
})();