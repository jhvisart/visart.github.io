/* =========================================================
   VISART ENGINE CORE
========================================================= */

const VISART_ENGINE = {

  cards: [],

  hero: null,

  running: false,

  addCard(card) {
    this.cards.push(card);
  },

  setHero(hero) {
    this.hero = hero;
  },

  start() {

    if (this.running) return;

    this.running = true;

    const tick = () => {

      this.update();

      requestAnimationFrame(tick);

    };

    requestAnimationFrame(tick);

  },

  update() {

    /* =========================
       CARDS
    ========================= */

    this.cards.forEach(card => {

      card.currentX +=
        (card.targetX - card.currentX) * card.speed;

      card.currentY +=
        (card.targetY - card.currentY) * card.speed;

      card.el.style.setProperty(
        "--tiltX",
        `${card.currentX}deg`
      );

      card.el.style.setProperty(
        "--tiltY",
        `${card.currentY}deg`
      );

    });

    /* =========================
       HERO
    ========================= */

    if (this.hero) {

      this.hero.currentX +=
        (this.hero.targetX - this.hero.currentX) * 0.08;

      this.hero.currentY +=
        (this.hero.targetY - this.hero.currentY) * 0.08;

      this.hero.el.style.transform = `
        perspective(900px)
        rotateY(${this.hero.currentX}deg)
        rotateX(${this.hero.currentY}deg)
      `;

    }

  }

};

const IS_TOUCH_DEVICE =
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0;
window.matchMedia("(pointer: coarse)").matches;

function visartGetPoint(e) {
  const touch = e.touches?.[0] || e.changedTouches?.[0];

  return {
    x: touch ? touch.clientX : e.clientX,
    y: touch ? touch.clientY : e.clientY
  };
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarHeroTilt();
  iniciarParticulasV();
  iniciarProyectos();
  iniciarVideoFondo();
  iniciarFondoCanvas();
  iniciarScrollReveal();
  iniciarPageTransition();
  corregirIOSViewport();
});

/* ======================================= */
/* HERO TILT */
/* ======================================= */

function iniciarHeroTilt() {
  const heroCard = document.querySelector(".hero-card");

  if (!heroCard || IS_TOUCH_DEVICE) return;
   
   const heroData = {

  el: heroCard,

  currentX: 0,
  currentY: 0,

  targetX: 0,
  targetY: 0

};

VISART_ENGINE.setHero(heroData);


window.addEventListener("pointermove", (e) => {

  const x =
    (e.clientX / window.innerWidth - 0.5) * 3.5;

  const y =
    (e.clientY / window.innerHeight - 0.5) * -2.5;

  heroData.targetX = x;
  heroData.targetY = y;

}, { passive: true });

window.addEventListener("pointerleave", () => {

  heroData.targetX = 0;
  heroData.targetY = 0;

});
  
}

/* ======================================= */
/* PROYECTOS */
/* ======================================= */

function iniciarProyectos() {
  const container = document.getElementById("projects-container");

  if (!container) return;

  const tipoPagina = document.body.dataset.tipo || "landing";
  const jsonPath = document.body.dataset.json || "data/proyectos.json";

  fetch(jsonPath)
    .then((res) => {
      if (!res.ok) {
        throw new Error("No se pudo cargar proyectos.json");
      }

      return res.json();
    })

    .then((data) => {
      const proyectos =
        Array.isArray(data)
          ? data
          : data.proyectos || [];

      const filtrados = proyectos
        .filter((p) => {
         if (tipoPagina === "landing") {
          return p.landing === true;
          }
          return p.tipo === tipoPagina;
        })
        .sort((a, b) => {
          return new Date(b.fecha || 0)
            - new Date(a.fecha || 0);
        });

      container.innerHTML = "";

      if (!filtrados.length) {
        container.innerHTML = `
          <article class="project-card">
            <div class="project-body">
              <h3>No hay proyectos para esta sección</h3>
              <p>
                Agrega en el JSON un proyecto con tipo:
                <strong>${limpiar(tipoPagina)}</strong>
              </p>
            </div>
          </article>
        `;

        return;
      }

      filtrados.forEach((p) => {
        const card = document.createElement("article");
        card.className = "project-card reveal";

        const img = resolverRuta(p.img || "");
        const demo = p.manifestacion || p.demo || p.url || "#";

        card.innerHTML = `
          <div class="project-thumb">
            <img
              src="${img}"
              alt="${limpiar(p.titulo)}"
              loading="lazy"
              decoding="async"
            >

            <span class="project-badge">
              ${limpiar(p.labelTipo || p.tipo || "Proyecto")}
            </span>
          </div>

          <div class="project-body">

            <div class="project-top">
              <h3>${limpiar(p.titulo)}</h3>

              <span class="project-tag">
                ${limpiar(p.categoria || "Proyecto")}
              </span>
            </div>

            <p>${limpiar(p.descripcion || "")}</p>

            <div class="project-actions">
              <a
                class="btn btn-primary"
                href="${demo}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver demo
              </a>
            </div>

          </div>
        `;

        iniciarTiltCard(card);
        container.appendChild(card);
      });

    setTimeout(() => {
  iniciarScrollReveal();
}, 80);
    })

    .catch((err) => {
      console.error("Error cargando JSON:", err);

      container.innerHTML = `
        <article class="project-card">
          <div class="project-body">
            <h3>No se pudieron cargar los proyectos</h3>
            <p>
              Revisa la ruta del JSON:
              <strong>${limpiar(jsonPath)}</strong>
            </p>
          </div>
        </article>
      `;
    });
}

/* ======================================= */
/* TILT CARDS */
/* ======================================= */

function iniciarTiltCard(card) {
  if (!card) return;

  let currentX = 0;
  let currentY = 0;

  let targetX = 0;
  let targetY = 0;

  const engineCard = {

  el: card,

  currentX,
  currentY,

  targetX,
  targetY,

  speed: 0.12

};

VISART_ENGINE.addCard(engineCard);

  function handleCardMove(e) {
    const rect = card.getBoundingClientRect();

    const point = visartGetPoint(e);

    const px = (point.x - rect.left) / rect.width;
    const py = (point.y - rect.top) / rect.height;

    engineCard.targetY = (px - 0.5) * 28;
    engineCard.targetX = (0.5 - py) * 28;

    card.style.setProperty("--mx", `${px * 100}%`);
    card.style.setProperty("--my", `${py * 100}%`);
  }

  card.addEventListener("pointermove", handleCardMove, {
    passive: true
  });

  card.addEventListener("pointerleave", () => {
   engineCard.targetX = 0;
   engineCard.targetY = 0;
  });
}


/* ======================================= */
/* VIDEO FIX IOS */
/* ======================================= */

function iniciarVideoFondo() {
  const video = document.querySelector(".bg-video");

  if (!video) return;

  video.muted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;

  const playSafe = async () => {
    try {
      if (video.paused) {
        await video.play();
      }
    } catch (err) {}
  };

  video.addEventListener("loadeddata", playSafe);
  video.addEventListener("canplay", playSafe);
  video.addEventListener("suspend", playSafe);
  video.addEventListener("stalled", playSafe);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      playSafe();
    }
  });

  window.addEventListener("pageshow", () => {
    playSafe();
  });

  window.addEventListener("focus", () => {
    playSafe();
  });

  playSafe();
}

/* ======================================= */
/* IOS VIEWPORT FIX */
/* ======================================= */

function corregirIOSViewport() {
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  setVH();

  window.addEventListener("resize", setVH, { passive: true });
  window.addEventListener("orientationchange", setVH, { passive: true });
}

/* ======================================= */
/* SCROLL REVEAL */
/* ======================================= */

let visartRevealObserver;

function iniciarScrollReveal() {
  const elementos = document.querySelectorAll(".reveal");

  if (!elementos.length) return;

  if (visartRevealObserver) {
    visartRevealObserver.disconnect();
  }

  visartRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -60px 0px"
    }
  );

  elementos.forEach((el) => {
    visartRevealObserver.observe(el);
  });
}

/* ======================================= */
/* PAGE TRANSITIONS */
/* ======================================= */

function iniciarPageTransition() {
  const links = document.querySelectorAll("a[href]");

  links.forEach((link) => {
    const href = link.getAttribute("href");

    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto") ||
      href.startsWith("tel") ||
      link.target === "_blank"
    ) {
      return;
    }

    link.addEventListener("click", (e) => {
      if (IS_TOUCH_DEVICE) return;

      e.preventDefault();

      document.body.classList.add("is-leaving");

      setTimeout(() => {
        window.location.href = href;
      }, 280);
    });
  });
}

/* ======================================= */
/* PARTICULAS V */
/* ======================================= */

function iniciarParticulasV() {
  const canvas = document.querySelector(".v-canvas");
  const svg = document.querySelector(".v-nav");
  const path = document.querySelector(".v-nav path");

  if (!canvas || !svg || !path) return;

  const ctx = canvas.getContext("2d", {
    alpha: true,
    desynchronized: true
  });

  const particles = [];
  const pathLength = path.getTotalLength();

  function resize() {
    const rect = canvas.getBoundingClientRect();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function crearParticula() {
    const rect = canvas.getBoundingClientRect();

    const point = path.getPointAtLength(
      Math.random() * pathLength
    );

    const viewBox = svg.viewBox.baseVal;

    const x =
      ((point.x - viewBox.x) / viewBox.width) * rect.width;

    const y =
      ((point.y - viewBox.y) / viewBox.height) * rect.height;

    const accent1 = getCssVar("--accent1");
    const accent2 = getCssVar("--accent2");

    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      size: 0.45 + Math.random() * 0.9,
      life: 1,
      decay: 0.012 + Math.random() * 0.015,
      color: Math.random() > 0.5 ? accent1 : accent2
    });
  }

  function animar() {
    const rect = canvas.getBoundingClientRect();

    ctx.clearRect(0, 0, rect.width, rect.height);

    for (let i = 0; i < 2; i++) {
      crearParticula();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animar);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  animar();
}

/* ======================================= */
/* BG FX */
/* ======================================= */

function iniciarFondoCanvas() {
  const canvas = document.getElementById("bgFX");

  if (!canvas) return;

  const ctx = canvas.getContext("2d", {
    alpha: true,
    desynchronized: true
  });

  const puntos = [];

  function resize() {
    const rect = canvas.getBoundingClientRect();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    puntos.length = 0;

    for (let i = 0; i < 40; i++) {
      puntos.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        r: 1 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: 0.25 + Math.random() * 0.45
      });
    }
  }

  function animar() {
    const rect = canvas.getBoundingClientRect();

    ctx.clearRect(0, 0, rect.width, rect.height);

    const accent1 = getCssVar("--accent1");
    const accent2 = getCssVar("--accent2");

    puntos.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > rect.width) p.vx *= -1;
      if (p.y < 0 || p.y > rect.height) p.vy *= -1;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.shadowBlur = 16;
      ctx.shadowColor =
        index % 2 === 0 ? accent1 : accent2;

      ctx.fillStyle =
        index % 2 === 0 ? accent1 : accent2;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(animar);
  }

  resize();
  window.addEventListener("resize", resize, {
    passive: true
  });

  animar();
}

/* ======================================= */
/* HELPERS */
/* ======================================= */

function resolverRuta(ruta) {
  if (!ruta) return "";

  if (ruta.startsWith("http") || ruta.startsWith("/")) {
    return ruta;
  }

  const prefijoAssets =
    document.body.dataset.assets || "";

  return prefijoAssets + ruta;
}

function limpiar(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getCssVar(nombre) {
  return (
    getComputedStyle(document.body)
      .getPropertyValue(nombre)
      .trim() ||

    getComputedStyle(document.documentElement)
      .getPropertyValue(nombre)
      .trim() ||

    "#00eaff"
  );
}

VISART_ENGINE.start();
