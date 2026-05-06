document.addEventListener("DOMContentLoaded", () => {
  repararBackCacheIOS();
  iniciarTransicionPaginas();
  iniciarScrollReveal();
  iniciarHeroTilt();
  iniciarParticulasV();
  iniciarProyectos();
  iniciarVideoFondo();
  iniciarFondoCanvas();
});

function repararBackCacheIOS() {
  window.addEventListener("pageshow", (event) => {
    document.body.classList.remove("is-leaving");
    const shell = document.querySelector(".page-shell");
    if (shell) {
      shell.style.opacity = "1";
      shell.style.transform = "none";
      shell.style.filter = "none";
    }
    if (event.persisted) {
      window.dispatchEvent(new Event("resize"));
      const video = document.querySelector(".bg-video");
      if (video) {
        requestAnimationFrame(() => {
          video.play().catch(() => {});
        });
      }
    }
  });
}

function iniciarTransicionPaginas() {
  document.querySelectorAll("a[href^='/'], a[href^='./'], a[href^='../']").forEach(link => {
    if (link.target === "_blank") return;
    if (link.href.includes(window.location.hostname) || link.href.startsWith("/")) {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href === "#" || href === "") return;
        if (href.startsWith("#")) return;
        e.preventDefault();
        document.body.classList.add("is-leaving");
        requestAnimationFrame(() => {
          setTimeout(() => {
            window.location.href = href;
          }, 180);
        });
      });
    }
  });
}

function iniciarScrollReveal() {
  const elementos = document.querySelectorAll(".glass, .project-card, .hero-card");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.1 });
  elementos.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(el);
  });
}

function iniciarHeroTilt() {
  const heroCard = document.querySelector(".hero-card");
  if (!heroCard) return;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  if (isTouch) return;
  let raf = null;
  heroCard.addEventListener("mousemove", (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const rect = heroCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroCard.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${y * -5}deg)`;
    });
  }, { passive: true });
  heroCard.addEventListener("mouseleave", () => {
    heroCard.style.transform = `perspective(900px) rotateY(0deg) rotateX(0deg)`;
  });
}

function iniciarVideoFondo() {
  const video = document.querySelector(".bg-video");
  if (!video) return;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const playSafe = () => video.play().catch(() => {});
  video.addEventListener("stalled", playSafe);
  video.addEventListener("suspend", playSafe);
  if (!isIOS) {
    video.addEventListener("emptied", () => {
      video.load();
      playSafe();
    });
  }
}

function iniciarParticulasV() {
  const canvas = document.querySelector(".v-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particulas = [];
  let animacionActiva = true;
  function resizeCanvas() {
    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  function crearParticula() {
    return {
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      vida: 100,
      maxVida: 100
    };
  }
  function dibujar() {
    if (!animacionActiva) return;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particulas = particulas.filter(p => p.vida > 0);
    for (let i = 0; i < particulas.length; i++) {
      const p = particulas[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vida -= 1.5;
      const alpha = p.vida / p.maxVida;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 234, 255, ${alpha * 0.7})`;
      ctx.fill();
    }
    const density = window.innerWidth < 768 ? 1 : 2;
    if (particulas.length < 30) {
      for (let i = 0; i < density; i++) {
        particulas.push(crearParticula());
      }
    }
    requestAnimationFrame(dibujar);
  }
  window.addEventListener("resize", () => {
    resizeCanvas();
    particulas = [];
  });
  resizeCanvas();
  dibujar();
}

function iniciarProyectos() {
  const container = document.getElementById("projects-container");
  if (!container) return;
  const jsonUrl = document.body.getAttribute("data-json") || "/data/proyectos.json";
  fetch(jsonUrl)
    .then(res => res.json())
    .then(data => {
      if (!data.proyectos) return;
      const proyectosMostrados = data.proyectos.slice(0, 6);
      container.innerHTML = proyectosMostrados.map(p => `
        <div class="project-card">
          <img class="project-img" src="${p.imagen || '/assets/placeholder.jpg'}" alt="${p.titulo}" loading="lazy">
          <div class="project-info">
            <h3>${p.titulo}</h3>
            <p>${p.descripcion || ''}</p>
            <a href="${p.link || '#'}" class="btn btn-secondary" style="margin-top: 12px; display: inline-block;">Ver más</a>
          </div>
        </div>
      `).join("");
    })
    .catch(err => console.warn("Error cargando proyectos:", err));
}

function iniciarFondoCanvas() {
  const canvas = document.getElementById("bgFX");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let ancho, alto;
  let puntos = [];
  function resize() {
    ancho = canvas.clientWidth;
    alto = canvas.clientHeight;
    canvas.width = ancho;
    canvas.height = alto;
    const total = window.innerWidth < 768 ? 20 : 48;
    puntos = [];
    for (let i = 0; i < total; i++) {
      puntos.push({
        x: Math.random() * ancho,
        y: Math.random() * alto,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radio: Math.random() * 2 + 1
      });
    }
  }
  function animar() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, ancho, alto);
    for (let i = 0; i < puntos.length; i++) {
      const p = puntos[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = ancho;
      if (p.x > ancho) p.x = 0;
      if (p.y < 0) p.y = alto;
      if (p.y > alto) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 234, 255, 0.3)`;
      ctx.fill();
    }
    requestAnimationFrame(animar);
  }
  window.addEventListener("resize", () => {
    resize();
  });
  resize();
  animar();
}
