// ---------------------------------------------------------------------------
// Greta Electric — page wiring
// ---------------------------------------------------------------------------

/* --------------------------- Blueprint scooter art -------------------------
 * A single reusable line-art scooter silhouette drawn as a technical/spec
 * sketch (dashed registration grid + dimension line) rather than a photo —
 * ties visually to the "spec sheet" language used throughout the catalogue.
 * -------------------------------------------------------------------------- */
function scooterSVG({ accent = "#f2a311", muted = "#5b6067", showDims = true } = {}) {
  return `
  <svg viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <defs>
      <pattern id="grid-${accent.replace('#','')}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${muted}" stroke-width="0.4" opacity="0.35"/>
      </pattern>
    </defs>
    <rect width="300" height="380" fill="url(#grid-${accent.replace('#','')})" />

    <g transform="translate(24,150)" fill="none" stroke="#e9eaea" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <!-- rear wheel -->
      <circle cx="26" cy="118" r="30" stroke="#e9eaea" stroke-width="3"/>
      <circle cx="26" cy="118" r="7" fill="#e9eaea" stroke="none"/>
      <!-- front wheel -->
      <circle cx="196" cy="118" r="30" stroke="#e9eaea" stroke-width="3"/>
      <circle cx="196" cy="118" r="7" fill="#e9eaea" stroke="none"/>
      <!-- floorboard / body -->
      <path d="M4 118 H 60 C 78 118 84 96 100 84 C 112 76 128 74 140 74 H 158" />
      <!-- footwell to seat riser -->
      <path d="M158 74 C 178 74 182 58 182 40" />
      <!-- seat -->
      <path d="M150 40 H 200" stroke-width="6" />
      <!-- steering column to handlebar -->
      <path d="M196 88 L 210 6" />
      <path d="M188 6 H 232" stroke-width="6" />
      <!-- headlamp -->
      <circle cx="216" cy="96" r="6" fill="${accent}" stroke="none"/>
    </g>

    ${
      showDims
        ? `<g stroke="${muted}" stroke-width="1" opacity="0.55">
            <line x1="24" y1="300" x2="276" y2="300" stroke-dasharray="3 4"/>
            <line x1="24" y1="294" x2="24" y2="306"/>
            <line x1="276" y1="294" x2="276" y2="306"/>
          </g>`
        : ""
    }
  </svg>`;
}

/* ------------------------------- Solution icons ----------------------------- */
const icons = {
  delivery: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="14" width="20" height="14" rx="1"/><path d="M24 19h7l5 6v3h-12z"/><circle cx="12" cy="30" r="3.2"/><circle cx="29" cy="30" r="3.2"/></svg>`,
  shared: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="4"/><circle cx="30" cy="10" r="4"/><circle cx="20" cy="30" r="4"/><path d="M13 12 L27 12 M12 14 L19 27 M28 14 L21 27"/></svg>`,
  corporate: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="9" y="6" width="22" height="28"/><line x1="14" y1="12" x2="18" y2="12"/><line x1="22" y1="12" x2="26" y2="12"/><line x1="14" y1="18" x2="18" y2="18"/><line x1="22" y1="18" x2="26" y2="18"/><line x1="14" y1="24" x2="18" y2="24"/><line x1="22" y1="24" x2="26" y2="24"/><rect x="17" y="29" width="6" height="5"/></svg>`,
  government: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 5 L34 12 H6 Z"/><line x1="9" y1="14" x2="9" y2="30"/><line x1="17" y1="14" x2="17" y2="30"/><line x1="23" y1="14" x2="23" y2="30"/><line x1="31" y1="14" x2="31" y2="30"/><line x1="5" y1="33" x2="35" y2="33"/></svg>`,
  distribution: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="20" cy="20" r="15"/><ellipse cx="20" cy="20" rx="15" ry="6"/><line x1="5" y1="20" x2="35" y2="20"/><line x1="20" y1="5" x2="20" y2="35"/></svg>`
};

/* ---------------------------------- Data ------------------------------------ */

const vehicles = [
  { name: "Harper", fit: "Urban fleets", range: "XX km", speed: "XX km/h", img: "assets/model-harper.png" },
  { name: "Harper ZX", fit: "Fleet deployment", range: "XX km", speed: "XX km/h", img: "assets/model-harper-zx.png" },
  { name: "Glide", fit: "High-performance fleets", range: "XX km", speed: "XX km/h", img: "assets/model-glide.png" },
  { name: "Evespa", fit: "Urban mobility", range: "XX km", speed: "XX km/h", img: "assets/model-evespa.png" }
];

const solutions = [
  { icon: "delivery", title: "Delivery fleets", body: "Reduce operating costs and transition last-mile delivery to electric." },
  { icon: "shared", title: "Shared mobility", body: "Deploy reliable scooters across cities and mobility networks." },
  { icon: "corporate", title: "Corporate fleets", body: "Electrify employee and operational transportation." },
  { icon: "government", title: "Government & infrastructure", body: "Support large-scale sustainable transportation initiatives." },
  { icon: "distribution", title: "Distribution partners", body: "Partner with Greta to bring electric mobility to new markets." }
];

const resources = [
  "Product brochures",
  "Technical specifications",
  "Battery information",
  "Fleet guide",
  "Maintenance information",
  "Certifications",
  "Press releases",
  "News"
];

/* --------------------------------- Render ------------------------------------ */

function renderVehicles() {
  const grid = document.getElementById("vehicleGrid");
  grid.innerHTML = vehicles
    .map(
      (v) => `
    <article class="vehicle-card">
      <div class="vehicle-figure"><img src="${v.img}" alt="${v.name} electric scooter" loading="lazy" /></div>
      <div>
        <div class="vehicle-name">${v.name}</div>
        <div class="vehicle-fit">${v.fit}</div>
      </div>
      <div class="vehicle-specs">
        <div><span>RANGE</span>${v.range}</div>
        <div><span>TOP SPEED</span>${v.speed}</div>
      </div>
      <a class="card-link" href="#contact">View specifications →</a>
    </article>`
    )
    .join("");
}

function renderSolutions() {
  const grid = document.getElementById("solutionsGrid");
  grid.innerHTML = solutions
    .map(
      (s) => `
    <div class="solution-card">
      <div class="icon">${icons[s.icon]}</div>
      <h3>${s.title}</h3>
      <p>${s.body}</p>
    </div>`
    )
    .join("");
}

function renderResources() {
  const grid = document.getElementById("resourceGrid");
  grid.innerHTML = resources
    .map(
      (r) => `<a class="resource-card" href="#resources"><span class="label">${r}</span><span class="icon">↓</span></a>`
    )
    .join("");
}

/* -------------------------------- Header + nav -------------------------------- */

function initHeader() {
  const header = document.getElementById("siteHeader");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

/* ---------------------------------- Form -------------------------------------- */

function initForm() {
  const form = document.getElementById("quoteForm");
  const status = document.getElementById("formStatus");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.classList.add("is-visible");
    form.reset();
  });
}

/* ------------------------------- Hero carousel --------------------------------- */

function initHeroCarousel() {
  const items = vehicles.map((v) => ({
    img: v.img,
    label: v.name.toUpperCase()
  }));
  new DepthCarousel(document.getElementById("heroCarousel"), {
    items,
    cardWidth: 260,
    cardHeight: 195,
    depth: 150,
    spread: 62,
    tilt: 24,
    visibleCards: 3,
    autoplay: true,
    autoplayDelay: 3600
  });
}

/* ------------------------------- About scroll-expand ---------------------------- */

function initAboutExpand() {
  new ScrollExpand(document.getElementById("aboutMedia"), {
    title: "GRETA",
    hint: "Scroll",
    useWindowScroll: true,
    scrollDistance: 1.1,
    holdDistance: 0.25,
    mediaZoom: 1.08,
    mediaImage: "assets/fleet-lineup-road.png",
    overlayScrim: 0.7,
    overlayHeading: "Driving the transition to sustainable mobility.",
    overlayBody: "Manufacturing, R&D, and support built around fleets — not single-unit retail."
  });
}

/* ------------------------------- Text animations -------------------------------- */

function initTextEffects() {
  if (typeof TextEffects === "undefined") return;

  // Hero entrance: eyebrow -> headline (word stagger) -> lede -> buttons
  const eyebrow = document.querySelector(".hero-copy .eyebrow");
  const h1 = document.querySelector(".hero-copy h1");
  const lede = document.querySelector(".hero-copy .lede");
  const btnRow = document.querySelector(".hero-copy .btn-row");

  if (typeof gsap !== "undefined") {
    gsap.set([eyebrow, lede, btnRow], { opacity: 0, y: 14 });
    gsap.to(eyebrow, { opacity: 1, y: 0, duration: 0.6, delay: 0.05 });
    gsap.to(lede, { opacity: 1, y: 0, duration: 0.6, delay: 0.6 });
    gsap.to(btnRow, { opacity: 1, y: 0, duration: 0.6, delay: 0.85 });
  } else {
    [eyebrow, lede, btnRow].forEach((el) => {
      if (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      }
    });
  }
  if (h1) TextEffects.revealWords(h1, { stagger: 0.05, duration: 0.7, y: 26, delay: 0.15 });

  // Every section heading gets a quiet word-reveal as it enters view
  document.querySelectorAll("main h2").forEach((h2) => {
    TextEffects.revealWordsOnScroll(h2, { stagger: 0.03, duration: 0.5, y: 14, threshold: 0.4 });
  });

  // The deployment quote is the one dramatic moment: scroll-scrubbed blur reveal
  const quote = document.querySelector(".callout-card blockquote");
  if (quote) TextEffects.scrubWordReveal(quote, { blurStrength: 8, baseOpacity: 0.12 });
}

/* ----------------------------------- Boot -------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  renderVehicles();
  renderSolutions();
  renderResources();
  initHeader();
  initForm();
  initHeroCarousel();
  initAboutExpand();
  initTextEffects();
});