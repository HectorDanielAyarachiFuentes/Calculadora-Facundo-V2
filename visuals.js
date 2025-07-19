// =======================================================
// --- visuals.js ---
// Contiene funciones auxiliares para crear elementos visuales
// para la pantalla de salida.
// =======================================================
"use strict";

/**
 * Crea un elemento <div> con clase, contenido y estilos específicos.
 * @param {string} clase - La clase CSS para la celda.
 * @param {string} texto - El contenido de texto o HTML.
 * @param {object} estilos - Un objeto con estilos CSS para aplicar.
 * @returns {HTMLDivElement} El elemento div creado.
 */
function crearCelda(clase, texto, estilos) {
    const celda = document.createElement("div");
    celda.className = clase;
    celda.innerHTML = texto;
    Object.assign(celda.style, estilos);
    celda.style.position = "absolute"; // Asegurar posición absoluta para todas las celdas
    return celda;
}

/**
 * Crea un elemento SVG que representa una flecha curva para las "llevadas".
 * @param {number} left - Posición horizontal.
 * @param {number} top - Posición vertical.
 * @param {number} width - Ancho del SVG.
 * @param {number} height - Alto del SVG.
 * @returns {SVGElement} El elemento SVG de la flecha.
 */
function crearFlechaLlevada(left, top, width, height) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", width);
    s.setAttribute("height", height);
    s.style.position = "absolute";
    s.style.left = `${left}px`;
    s.style.top = `${top}px`;
    s.style.overflow = "visible";

    const d = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const m = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    const i = "arrowhead-" + Math.random().toString(36).substring(2, 9);
    m.setAttribute("id", i);
    m.setAttribute("viewBox", "0 0 10 10");
    m.setAttribute("refX", 8);
    m.setAttribute("refY", 5);
    m.setAttribute("markerWidth", 5);
    m.setAttribute("markerHeight", 5);
    m.setAttribute("orient", "auto-start-reverse");

    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    p.setAttribute("fill", "#ff5555");

    m.appendChild(p);
    d.appendChild(m);
    s.appendChild(d);

    const h = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const x1 = width * 0.9, y1 = height, cx = width * 0.1, cy = height, x2 = width * 0.2, y2 = height * 0.15;
    h.setAttribute("d", `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
    h.setAttribute("stroke", "#ff5555");
    h.setAttribute("stroke-width", 2.5);
    h.setAttribute("stroke-linecap", "round");
    h.setAttribute("fill", "none");
    h.setAttribute("marker-end", `url(#${i})`);

    s.appendChild(h);

    const l = h.getTotalLength();
    h.style.strokeDasharray = l;
    h.style.strokeDashoffset = l;
    h.style.transition = "stroke-dashoffset .8s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
    requestAnimationFrame(() => {
        h.style.strokeDashoffset = "0";
    });

    return s;
}



// =======================================================
// --- visuals.js ---
// ... (código existente: crearCelda, crearFlechaLlevada) ...
// =======================================================

/**
 * Crea un elemento <div> con animación de aparición.
 * @param {string} clase - La clase CSS para la celda.
 * @param {string} texto - El contenido de texto o HTML.
 * @param {object} estilos - Un objeto con estilos CSS para aplicar.
 * @param {number} delay - Retardo en milisegundos para la animación.
 * @returns {HTMLDivElement} El elemento div animado creado.
 */
function crearCeldaAnimada(clase, texto, estilos, delay = 0) {
    const celda = crearCelda(clase, texto, estilos); // Reutilizamos la función original
    celda.classList.add('fade-in-scale');
    celda.style.animationDelay = `${delay}ms`;
    return celda;
}