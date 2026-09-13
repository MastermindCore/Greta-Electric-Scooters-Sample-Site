/*
 * DepthCarousel — vanilla JS port (adapted from a React Bits component)
 * Renders a depth-stacked, draggable card carousel inside a container.
 * Usage: new DepthCarousel(document.querySelector('.hero-stage'), { items, ...options })
 */
(function () {
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  class DepthCarousel {
    constructor(root, opts = {}) {
      this.root = root;
      this.items = opts.items || [];
      this.cfg = Object.assign(
        {
          cardWidth: 260,
          cardHeight: 340,
          radius: 4,
          depth: 190,
          spread: 78,
          tilt: 24,
          tiltDirection: "right",
          perspective: 1300,
          visibleCards: 4,
          falloff: 0.22,
          blur: 5,
          duration: 700,
          ease: "power3.out",
          autoplay: true,
          autoplayDelay: 3400,
          loop: true,
          showControls: true,
          showIndicators: true
        },
        opts
      );

      this.count = this.items.length;
      this.pos = 0;
      this.focus = 0;
      this.scale = 1;
      this.tween = null;
      this.cardEls = [];
      this.tintEls = [];
      this.autoTimer = null;
      this.reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      this._build();
      this._bindEvents();
      this._layout(0);
      if (this.cfg.autoplay && !this.reduced && this.count > 1) this._startAutoplay();
    }

    _build() {
      const root = this.root;
      root.classList.add("depth-carousel");
      root.style.setProperty("--dc-perspective", `${this.cfg.perspective}px`);
      root.setAttribute("role", "group");
      root.setAttribute("aria-roledescription", "carousel");
      root.setAttribute("aria-label", "Fleet vehicle showcase");
      root.tabIndex = 0;

      const stage = document.createElement("div");
      stage.className = "depth-carousel__stage";
      this.stage = stage;

      this.items.forEach((item, i) => {
        const card = document.createElement("div");
        card.className = "depth-carousel__card";
        card.style.width = this.cfg.cardWidth + "px";
        card.style.height = this.cfg.cardHeight + "px";
        card.style.borderRadius = this.cfg.radius + "px";
        card.setAttribute("aria-roledescription", "slide");
        card.setAttribute("aria-label", `${i + 1} of ${this.count}`);
        if (item.img) {
          const imgEl = document.createElement("img");
          imgEl.src = item.img;
          imgEl.alt = item.label || "";
          imgEl.draggable = false;
          card.appendChild(imgEl);
        } else {
          card.innerHTML = item.svg || "";
        }

        const tint = document.createElement("span");
        tint.className = "depth-carousel__tint";
        card.appendChild(tint);

        if (item.label) {
          const label = document.createElement("span");
          label.className = "depth-carousel__label";
          label.textContent = item.label;
          card.appendChild(label);
        }

        card.addEventListener("click", () => {
          if (this.drag && this.drag.moved) return;
          this._setFocus(i, true);
        });

        stage.appendChild(card);
        this.cardEls.push(card);
        this.tintEls.push(tint);
      });

      root.appendChild(stage);

      if (this.cfg.showControls && this.count > 1) {
        this.prevBtn = this._makeArrow("prev", "M15 5l-7 7 7 7");
        this.nextBtn = this._makeArrow("next", "M9 5l7 7-7 7");
        root.appendChild(this.prevBtn);
        root.appendChild(this.nextBtn);
      }

      if (this.cfg.showIndicators && this.count > 1) {
        const dots = document.createElement("div");
        dots.className = "depth-carousel__dots";
        dots.setAttribute("role", "tablist");
        this.dotEls = this.items.map((_, i) => {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "depth-carousel__dot" + (i === 0 ? " is-active" : "");
          dot.setAttribute("role", "tab");
          dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
          dot.addEventListener("click", () => this._setFocus(i, true));
          dots.appendChild(dot);
          return dot;
        });
        root.appendChild(dots);
        this.dotsWrap = dots;
      }
    }

    _makeArrow(dir, path) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `depth-carousel__arrow depth-carousel__arrow--${dir}`;
      btn.setAttribute("aria-label", dir === "prev" ? "Previous vehicle" : "Next vehicle");
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      btn.addEventListener("click", () => this._navigateBy(dir === "prev" ? -1 : 1));
      return btn;
    }

    _layout(pos) {
      const cfg = this.cfg;
      const n = this.count;
      if (!n) return;
      const dir = cfg.tiltDirection === "left" ? -1 : 1;
      const sc = this.scale;

      for (let i = 0; i < n; i++) {
        const el = this.cardEls[i];
        if (!el) continue;
        let d = i - pos;
        if (cfg.loop && n > 1) {
          d = ((d % n) + n) % n;
          if (d > n / 2) d -= n;
        }
        const back = Math.max(0, d);
        const az = Math.abs(d);
        const shown = az <= cfg.visibleCards + 0.5;

        const tz = -cfg.depth * d;
        const tx = dir * cfg.spread * d;
        const ry = dir * cfg.tilt * clamp(d, 0, 1);

        let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
        if (!shown) opacity = 0;

        const brightness = Math.max(0.15, 1 - back * cfg.falloff);
        const blurPx = cfg.blur > 0 ? Math.min(cfg.blur, (back / Math.max(1, cfg.visibleCards)) * cfg.blur) : 0;
        const zi = Math.round(2000 - d * 20);

        el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
        el.style.zIndex = String(zi);
        el.style.pointerEvents = shown && opacity > 0.05 ? "auto" : "none";

        const tint = this.tintEls[i];
        if (tint) tint.style.opacity = clamp(back * cfg.falloff * 1.25, 0, 0.86).toFixed(3);
      }
    }

    _notify(idx) {
      if (this.dotEls) {
        this.dotEls.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      }
    }

    _tweenTo(target, animate) {
      if (this.tween) this.tween.kill();
      const cfg = this.cfg;
      const proxy = { p: this.pos };
      const dur = animate && !this.reduced ? cfg.duration / 1000 : 0;
      this.tween = gsap.to(proxy, {
        p: target,
        duration: dur,
        ease: cfg.ease,
        onUpdate: () => {
          this.pos = proxy.p;
          this._layout(proxy.p);
        },
        onComplete: () => {
          const n = this.count;
          if (n > 0) this.pos = ((this.pos % n) + n) % n;
          this._layout(this.pos);
        }
      });
    }

    _setFocus(rawIndex, animate = true) {
      const cfg = this.cfg;
      const n = this.count;
      if (!n) return;
      const idx = cfg.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
      let delta = idx - this.pos;
      if (cfg.loop && n > 1) {
        delta = ((delta % n) + n) % n;
        if (delta > n / 2) delta -= n;
      }
      this._tweenTo(this.pos + delta, animate);
      if (idx !== this.focus) {
        this.focus = idx;
        this._notify(idx);
      }
    }

    _navigateBy(step) {
      this._setFocus(this.focus + step, true);
    }

    _startAutoplay() {
      this._stopAutoplay();
      this.autoTimer = window.setInterval(() => {
        if (!this._hovered && !this._focused) this._navigateBy(1);
      }, Math.max(this.cfg.autoplayDelay, 600));
    }
    _stopAutoplay() {
      if (this.autoTimer) clearInterval(this.autoTimer);
      this.autoTimer = null;
    }

    _bindEvents() {
      const root = this.root;

      const ro = new ResizeObserver((entries) => {
        const w = entries[0].contentRect.width;
        const needed = this.cfg.cardWidth + Math.abs(this.cfg.spread) * 2 + 100;
        this.scale = clamp(w / needed, 0.42, 1);
        this._layout(this.pos);
      });
      ro.observe(root);

      root.addEventListener("mouseenter", () => (this._hovered = true));
      root.addEventListener("mouseleave", () => (this._hovered = false));
      root.addEventListener("focusin", () => (this._focused = true));
      root.addEventListener("focusout", () => (this._focused = false));

      root.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          this._navigateBy(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          this._navigateBy(1);
        }
      });

      let wheelTimer = null;
      root.addEventListener(
        "wheel",
        (e) => {
          if (this.count < 2) return;
          e.preventDefault();
          if (this.tween) this.tween.kill();
          const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          const delta = e.deltaMode === 1 ? raw * 24 : raw;
          const step = clamp(delta / (this.cfg.cardWidth * 0.9), -0.6, 0.6);
          this.pos += step;
          this._layout(this.pos);
          if (wheelTimer) clearTimeout(wheelTimer);
          wheelTimer = setTimeout(() => this._setFocus(Math.round(this.pos), true), 130);
        },
        { passive: false }
      );

      root.addEventListener("pointerdown", (e) => {
        if (this.count < 2) return;
        if (this.tween) this.tween.kill();
        this.drag = {
          x: e.clientX,
          startPos: this.pos,
          lastX: e.clientX,
          lastT: performance.now(),
          v: 0,
          moved: false,
          id: e.pointerId
        };
      });

      root.addEventListener("pointermove", (e) => {
        const drag = this.drag;
        if (!drag) return;
        const stepPx = Math.max(this.cfg.cardWidth * 0.55 * this.scale, 40);
        const dx = e.clientX - drag.x;
        if (!drag.moved && Math.abs(dx) > 4) {
          drag.moved = true;
          try {
            root.setPointerCapture(drag.id);
          } catch (err) {}
        }
        if (!drag.moved) return;
        const now = performance.now();
        const dt = Math.max(now - drag.lastT, 1);
        drag.v = (e.clientX - drag.lastX) / dt;
        drag.lastX = e.clientX;
        drag.lastT = now;
        this.pos = drag.startPos - dx / stepPx;
        this._layout(this.pos);
      });

      const endDrag = () => {
        const drag = this.drag;
        if (!drag) return;
        this.drag = null;
        if (!drag.moved) return;
        const stepPx = Math.max(this.cfg.cardWidth * 0.55 * this.scale, 40);
        const projected = this.pos - (drag.v * 180) / stepPx;
        this._setFocus(Math.round(projected), true);
      };
      root.addEventListener("pointerup", endDrag);
      root.addEventListener("pointercancel", endDrag);
    }
  }

  window.DepthCarousel = DepthCarousel;
})();