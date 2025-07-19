// =======================================================
// --- operations/modules/square-root.js ---
// Contiene la lógica para calcular y visualizar la raíz cuadrada.
// Se enfoca en enteros y raíces exactas.
// =======================================================
"use strict";

// Asumimos que `salida`, `display`, y `errorMessages` son accesibles globalmente.
const salida = document.querySelector("#salida");
const display = document.querySelector("#display");
const errorMessages = {
    invalidSqrtInput: "Entrada no válida para raíz cuadrada.",
    integerSqrtRequired: "La raíz cuadrada solo se calcula para números enteros.",
    negativeSqrt: "No se puede calcular la raíz de un número negativo.",
    raiz1: "La raíz cuadrada de 0 es 0.",
    nonExactSqrt: "Esta calculadora solo muestra raíces cuadradas exactas."
};
// Las llamadas a HistoryManager y actualizarEstadoDivisionUI se deben manejar
// desde el archivo principal (ej: main.js) después de llamar a esta función.
// import { HistoryManager } from '../../history.js';
// import { actualizarEstadoDivisionUI } from '../../main.js';

/**
 * Realiza y visualiza el cálculo de la raíz cuadrada.
 */
export function raizCuadrada() {
    salida.innerHTML = "";
    const entrada = display.innerHTML;
    let hadError = false;

    if (/[+\-x/]/.test(entrada)) {
        salida.innerHTML = `<p class="error-message">${errorMessages.invalidSqrtInput}</p>`;
        hadError = true;
    } else if (isNaN(parseInt(entrada)) || entrada.includes(',')) {
        salida.innerHTML = `<p class="error-message">${errorMessages.integerSqrtRequired}</p>`;
        hadError = true;
    } else {
        const numero = parseInt(entrada, 10);
        if (numero < 0) {
            salida.innerHTML = `<p class="error-message">${errorMessages.negativeSqrt}</p>`;
            hadError = true;
        } else if (numero === 0) {
            salida.innerHTML = `<p class="result-message">${errorMessages.raiz1}</p>`;
        } else {
            const resultado = Math.sqrt(numero);
            if (resultado % 1 !== 0) {
                salida.innerHTML = `<p class="error-message">${errorMessages.nonExactSqrt}</p>`;
                hadError = true;
            } else {
                // NOTA: La variable 'w' en tu código original no estaba definida.
                // La he reemplazado con `salida.clientWidth` que es lo más probable.
                const w = salida.clientWidth;
                const availableHeight = salida.clientHeight;
                salida.innerHTML = `<p class="caja4" style="font-size: ${w * 0.1}px; text-align: center; line-height: ${availableHeight}px;">${resultado}</p>`;
            }
        }
    }

    /* Las siguientes llamadas deben ser manejadas por el código que invoca a raizCuadrada()
    if (!hadError) {
        HistoryManager.add({ input: `√(${entrada})`, visualHtml: salida.innerHTML, type: 'visual' });
    }
    actualizarEstadoDivisionUI(false);
    */
}