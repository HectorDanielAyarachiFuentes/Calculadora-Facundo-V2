// =======================================================
// --- operations/utils/dom-helpers.js (VERSIÓN FINAL COMPLETA Y CORREGIDA) ---
// Única fuente de verdad para crear elementos visuales.
// =======================================================
"use strict";

/**
 * Función de utilidad para crear una pausa en funciones asíncronas.
 * @param {number} ms - Milisegundos a esperar.
 * @returns {Promise<void>}
 */
export const esperar = ms => new Promise(res => setTimeout(res, ms));

/**
 * Crea un elemento <div> genérico para el grid de operaciones.
 * @param {string} classNames - Una o más clases CSS separadas por espacios.
 * @param {string} content - El contenido de texto.
 * @param {object} styles - Estilos en línea (left, top, width, height, etc.).
 * @returns {HTMLDivElement} El elemento <div> creado.
 */
export function crearCelda(classNames, content, styles) {
    const celda = document.createElement('div');
    celda.className = classNames;
    celda.textContent = content;
    Object.assign(celda.style, styles);

    // --- ¡LA LÍNEA CLAVE RESTAURADA! ---
    // Asegura que la celda pueda ser posicionada con left/top
    celda.style.position = "absolute"; 

    // Centrado vertical robusto
    if (styles.height) {
        celda.style.lineHeight = styles.height;
    }
    
    return celda;
}

/**
 * Crea una celda con animación.
 * @param {string} classNames - Clases CSS.
 * @param {string} content - Contenido.
 * @param {object} styles - Estilos.
 * @param {number} delay - Retraso de animación en ms.
 * @returns {HTMLDivElement} El elemento <div> animado.
 */
export function crearCeldaAnimada(classNames, content, styles, delay = 0) {
    const celda = crearCelda(classNames, content, styles); // Reutiliza la función base
    
    celda.classList.add('animate-fade-in-scale');
    celda.style.animationDelay = `${delay}ms`;
    
    return celda;
}

/**
 * Crea una flecha SVG animada para visualizar las "llevadas".
 * @param {number} left - Posición horizontal.
 * @param {number} top - Posición vertical.
 * @param {number} width - Ancho del SVG.
 * @param {number} height - Alto del SVG.
 * @returns {SVGElement} El elemento SVG de la flecha animada.
 */
export function crearFlechaLlevada(left, top, width, height) {
    const svgNS = "http://www.w3.org/2000/svg";
    const s = document.createElementNS(svgNS, "svg");
    s.setAttribute("width", width);
    s.setAttribute("height", height);
    s.style.position = "absolute";
    s.style.left = `${left}px`;
    s.style.top = `${top}px`;
    s.style.overflow = "visible";

    const d = document.createElementNS(svgNS, "defs");
    const m = document.createElementNS(svgNS, "marker");
    const i = "arrowhead-" + Math.random().toString(36).substring(2, 9);
    m.setAttribute("id", i);
    m.setAttribute("viewBox", "0 0 10 10");
    m.setAttribute("refX", 8);
    m.setAttribute("refY", 5);
    m.setAttribute("markerWidth", 5);
    m.setAttribute("markerHeight", 5);
    m.setAttribute("orient", "auto-start-reverse");

    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    p.setAttribute("fill", "#ff5555");

    m.appendChild(p);
    d.appendChild(m);
    s.appendChild(d);

    const h = document.createElementNS(svgNS, "path");
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

/**
 * Crea y devuelve un elemento <p> con el mensaje de error estilizado.
 * @param {string} message - El texto del mensaje de error.
 * @returns {HTMLParagraphElement} El elemento <p> del mensaje de error.
 */
export function crearMensajeError(message) {
    const errorMessageElement = document.createElement('p');
    errorMessageElement.className = 'output-screen__error-message'; // Clase BEM
    errorMessageElement.innerHTML = message; // Usamos innerHTML para permitir negritas, etc.
    
    // Estos estilos aseguran que el mensaje ocupe el espacio y se centre
    errorMessageElement.style.position = 'absolute'; // Usamos absolute aquí porque el contenedor principal (salida) espera esto
    errorMessageElement.style.width = '100%';
    errorMessageElement.style.height = '100%';
    errorMessageElement.style.display = 'flex';
    errorMessageElement.style.justifyContent = 'center';
    errorMessageElement.style.alignItems = 'center';
    
    return errorMessageElement;
}