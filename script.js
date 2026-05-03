Perfecto. Aquí tienes los 3 archivos completos ya corregidos, limpios y sincronizados con tu JSON.
Esto elimina los errores que tenías (IDs, CSS duplicado, coherencia con JS).
🔵 1. index.html (FINAL LIMPIO)
HTML
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>VISART | Portafolio Creativo</title>

  <meta name="google" content="notranslate">
  <meta name="description" content="Portafolio creativo de VISART con proyectos visuales, visualizers e interactivos." />

  <link rel="stylesheet" href="style.css">
</head>

<body class="page-home" data-tipo="todos" data-json="data/proyectos.json" data-assets="">
  <div class="bg-grid"></div>
document.addEventListener("DOMContentLoaded", () => {
  cargarProyectos();
});

function cargarProyectos() {
  const container = document.getElementById("projects-container");
  if (!container) return;

  fetch("data/proyectos.json")
    .then(res => res.json())
    .then(data => {
      const proyectos = data.proyectos;

      const filtrados = proyectos.filter(p => p.landing === true);

      container.innerHTML = "";

      filtrados.forEach(p => {
        const card = document.createElement("div");
        card.className = "project-card";

        card.innerHTML = `
          <div class="project-thumb">
            <img src="${p.img}">
          </div>
          <div class="project-body">
            <h3>${p.titulo}</h3>
            <p>${p.descripcion}</p>
            <a class="btn btn-primary" href="${p.manifestacion}" target="_blank">Ver demo</a>
          </div>
        `;

        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = "<p>Error cargando proyectos</p>";
    });
}
