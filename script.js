document.addEventListener("DOMContentLoaded", () => {
  iniciarHeroTilt();
  iniciarParticulasV();
  iniciarProyectos();
  iniciarVideoFondo();
  iniciarFondoCanvas();
});

function iniciarHeroTilt() {
  const heroCard = document.querySelector(".hero-card");
  if (!heroCard) return;

  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;

    heroCard.style.transform =
      `perspective(900px) rotateY(${x * 0.35}deg) rotateX(${y * -0.25}deg)`;
  });

  window.addEventListener("mouseleave", () => {
    heroCard.style.transform =
      "perspective(900px) rotateY(0deg) rotateX(0deg)";
  });
}

function iniciarProyectos() {
  const container = document.getElementById("projects-container");
  if (!container) return;

  const tipoPagina = document.body.dataset.tipo || "todos";

  fetch("/data/proyectos.json")
    .catch(() => fetch("data/proyectos.json"))
    .then(res => {
      if (!res.ok) throw new Error("No se pudo cargar proyectos.json");
      return res.json();
    })
    .then(data => {
      const proyectos = data.proyectos || [];

      const filtrados = proyectos
        .filter(p => tipoPagina === "todos" ? true : p.tipo === tipoPagina)
        .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));

      container.innerHTML = "";

      if (!filtrados.length) {
        container.innerHTML = `
          <article class="project-card">
            <div class="project-body">
              <h3>No hay proyectos para esta sección</h3>
              <p>Agrega en el JSON un proyecto con tipo: <strong>${tipoPagina}</strong>.</p>
            </div>
          </article>
        `;
        return;
      }

      filtrados.forEach(p => {
        const card = document.createElement("article");
        card.className = "project-card";

        card.innerHTML = `
          <div class="project-thumb">
            <img src="${resolverRuta(p.img)}" alt="${limpiar(p.titulo)}" loading="lazy">
            <span class="project-badge">${limpiar(p.labelTipo || p.tipo || "Proyecto")}</span>
          </div>

          <div class="project-body">
            <div class="project-top">
              <h3>${limpiar(p.titulo)}</h3>
              <span class="project-tag">${limpiar(p.categoria || "Proyecto")}</span>
            </div>

            <p>${limpiar(p.descripcion || "")}</p>

            <div class="project-actions">
              <a class="btn btn-primary" href="${p.manifestacion}" target="_blank" rel="noopener noreferrer">
                Ver demo
              </a>
            </div>
          </div>
        `;

        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error cargando JSON:", err);

      container.innerHTML = `
        <article class="project-card">
          <div class="project-body">
            <h3>No se pudieron cargar los proyectos</h3>
            <p>Revisa que exista: <strong>/data/proyectos.json</strong></p>
          </div>
        </article>
      `;
    });
}

function resolverRuta(ruta) {
  if (!ruta) return "";
  if (ruta.startsWith("http") || ruta.startsWith("/")) return ruta;
  return "/" + ruta;
}

function limpiar(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function iniciarVideoFondo() {
  const video = document.querySelector(".bg-video");
  if (!video) return;

  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = true;

  const playSafe = () => {
    if (video.paused) video.play().catch(() => {});
  };

  video.addEventListener("loadeddata", playSafe);
  video.addEventListener("canplay", playSafe);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) playSafe();
  });

  playSafe();
}

function iniciarParticulasV() {
  const canvas = document.querySelector(".v-canvas");
  const svg = document.querySelector(".v-nav");
  const path = document.querySelector(".v-nav path");

  if (!canvas || !svg || !path) return;

  const ctx = canvas.getContext("2d");
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
    const point = path.getPointAtLength(Math.random() * pathLength);
    const viewBox = svg.viewBox.baseVal;

    const x = ((point.x - viewBox.x) / viewBox.width) * rect.width;
    const y = ((point.y - viewBox.y) / viewBox.height) * rect.height;

    const cx = rect.width / 2;
    const cy = rect.height /