// =======================================================
// --- operations/modules/prime-factors.js ---
// Contiene la lógica para calcular y visualizar la descomposición
// en factores primos de un número.
// =======================================================
"use strict";

import { calculateLayout } from '../utils/layout-calculator.js';
import { crearCelda } from '../utils/dom-helpers.js';

// Asumimos que `salida`, `display`, `errorMessages`, etc. son accesibles.
const salida = document.querySelector("#salida");
const display = document.querySelector("#display");
const errorMessages = {
    dFactorial1: "La entrada debe ser un número entero mayor que 0."
};
// Funciones como `actualizarEstadoDivisionUI` y `HistoryManager` deben ser importadas
// o pasadas como parámetros si son necesarias aquí.
// import { actualizarEstadoDivisionUI } from '../../main.js'; // Ejemplo
// import { HistoryManager } from '../../history.js'; // Ejemplo

/**
 * Realiza y visualiza la descomposición en factores primos.
 */
export function desFacPri() {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();
    const entrada = display.innerHTML;
    
    // --- 1. VALIDACIÓN Y CÁLCULO DE LA OPERACIÓN ---
    if (isNaN(parseInt(entrada, 10)) || entrada.includes(',') || parseInt(entrada, 10) <= 0) {
        salida.innerHTML = `<p class="error-message">${errorMessages.dFactorial1}</p>`;
        // actualizarEstadoDivisionUI(false); // Esta llamada debería manejarse en el controlador principal
        return;
    }
    
    let numIzda = parseInt(entrada, 10);
    const numIzdaArray = [], numDchaArray = [];

    if (numIzda === 1) {
        numIzdaArray.push(1);
        numDchaArray.push(1);
    } else {
        let tempNum = numIzda;
        let i = 2;
        while (i * i <= tempNum) {
            if (tempNum % i === 0) {
                numIzdaArray.push(tempNum);
                numDchaArray.push(i);
                tempNum /= i;
            } else {
                i++;
            }
        }
        if (tempNum > 1 || numIzdaArray.length === 0) {
            numIzdaArray.push(tempNum);
            numDchaArray.push(tempNum);
        }
    }
    numIzdaArray.push(1);

    // --- 2. CÁLCULO DEL LAYOUT ---
    const maxDigitsIzda = Math.max(...numIzdaArray.map(n => n.toString().length));
    const maxDigitsDcha = Math.max(...numDchaArray.map(n => n.toString().length));
    const separatorWidth = 1;
    const totalCols = maxDigitsIzda + separatorWidth + maxDigitsDcha;
    const numRows = numIzdaArray.length;
    
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, totalCols, numRows);

    // --- 3. LÓGICA DE VISUALIZACIÓN ---
    numIzdaArray.forEach((n, idx) => {
        let s = n.toString();
        for (let j = 0; j < s.length; j++) {
            const left = offsetHorizontal + (maxDigitsIzda - s.length + j) * tamCel + paddingLeft;
            const top = paddingTop + idx * tamCel;
            fragment.appendChild(crearCelda("caja2", s[j], { left: `${left}px`, top: `${top}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
        }
    });

    const lineX = offsetHorizontal + maxDigitsIzda * tamCel + (separatorWidth * tamCel / 2) + paddingLeft;
    fragment.appendChild(crearCelda("linea-vertical", "", { left: `${lineX - 1}px`, top: `${paddingTop}px`, width: `2px`, height: `${numRows * tamCel}px`, backgroundColor: "#ddd" }));
    
    numDchaArray.forEach((n, idx) => {
        let s = n.toString();
        for (let j = 0; j < s.length; j++) {
            const left = offsetHorizontal + (maxDigitsIzda + separatorWidth + j) * tamCel + paddingLeft;
            const top = paddingTop + idx * tamCel;
            fragment.appendChild(crearCelda("caja3", s[j], { left: `${left}px`, top: `${top}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
        }
    });

    salida.appendChild(fragment);
    // HistoryManager.add({ input: `Factores Primos(${entrada})`, visualHtml: salida.innerHTML, type: 'visual' });
    // actualizarEstadoDivisionUI(false);
}