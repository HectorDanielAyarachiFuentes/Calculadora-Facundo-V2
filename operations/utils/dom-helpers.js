// =======================================================
// --- operations/utils/dom-helpers.js (VERSIÓN FINAL) ---
// Única fuente de verdad para crear elementos visuales.
// Incluye las animaciones avanzadas de visuals.js
// =======================================================
"use strict";

/**
 * Función de utilidad para crear una pausa en funciones asíncronas.
 * @param {number} ms - Milisegundos a esperar.
 * @returns {Promise<void>}
 */
export const esperar = ms => new Promise(res => setTimeout(res, ms));

/**
 * Crea un elemento <div> genérico para usar como celda en la grilla visual.
 * @param {string} className - La clase CSS para aplicar al div.
 * @param {string} content - El contenido de texto para el div.
 * @param {object} styles - Un objeto de JavaScript con los estilos a aplicar.
 * @returns {HTMLDivElement} El elemento <div> creado y estilizado.
 */
export function crearCelda(className, content, styles) {
    const celda = document.createElement('div');
    celda.className = className;
    celda.textContent = content; // Usamos textContent por seguridad, previene inyección de HTML
    Object.assign(celda.style, styles);
    celda.style.position = "absolute"; // Asegurar posición absoluta para todas las celdas
    return celda;
}

/**
 * Crea una celda que aparece con una animación CSS.
 * @param {string} className - Clase CSS para la celda.
 * @param {string} content - Contenido de texto.
 * @param {object} styles - Objeto con estilos CSS.
 * @param {number} delay - Retraso en ms para la animación.
 * @returns {HTMLDivElement} El elemento <div> creado y listo para animar.
 */
export function crearCeldaAnimada(className, content, styles, delay = 0) {
    const celda = crearCelda(className, content, styles);
    // Añadimos una clase que activará la animación definida en el CSS
    celda.classList.add('fade-in-scale');
    celda.style.animationDelay = `${delay}ms`;
    return celda;
}

/**
 * Crea una flecha SVG animada para visualizar las "llevadas".
 * Esta es la versión avanzada de tu `visuals.js`.
 * @param {number} left - Posición horizontal.
 * @param {number} top - Posición vertical.
 * @param {number} width - Ancho del SVG.
 * @param {number} height - Alto del SVG.
 * @returns {SVGElement} El elemento SVG de la flecha animada.
 */
export function crearFlechaLlevada(left, top, width, height) {
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