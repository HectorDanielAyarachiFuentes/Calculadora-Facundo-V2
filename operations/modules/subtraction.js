// =======================================================
// --- operations/modules/subtraction.js (VERSIÓN FINAL CORREGIDA) ---
// =======================================================
"use strict";

import { calculateLayout } from '../utils/layout-calculator.js';
import { crearCelda, crearCeldaAnimada, esperar } from '../utils/dom-helpers.js';
import { salida } from '../../config.js';

/**
 * Realiza y visualiza la operación de resta CON ANIMACIONES SECUENCIALES.
 * @param {Array<[string, number]>} numerosAR - Los operandos.
 */
export async function resta(numerosAR) {
    salida.innerHTML = "";

    // --- 1. CÁLCULOS DE LA OPERACIÓN ---
    const maxDecimales = Math.max(numerosAR[0][1], numerosAR[1][1]);
    const n1Calc = numerosAR[0][0].padEnd(numerosAR[0][0].length + maxDecimales - numerosAR[0][1], '0');
    const n2Calc = numerosAR[1][0].padEnd(numerosAR[1][0].length + maxDecimales - numerosAR[1][1], '0');
    
    const resultadoBigInt = BigInt(n1Calc) - BigInt(n2Calc);
    let resultadoRaw = resultadoBigInt.toString();
    
    let resultadoConComa = resultadoRaw;
    if (maxDecimales > 0) {
        let absResult = resultadoConComa.startsWith('-') ? resultadoConComa.substring(1) : resultadoConComa;
        if (absResult.length <= maxDecimales) absResult = '0'.repeat(maxDecimales - absResult.length + 1) + absResult;
        let formattedAbs = absResult.slice(0, absResult.length - maxDecimales) + ',' + absResult.slice(absResult.length - maxDecimales);
        resultadoConComa = resultadoConComa.startsWith('-') ? '-' + formattedAbs : formattedAbs;
    }
    if (resultadoConComa.includes(',')) resultadoConComa = resultadoConComa.replace(/0+$/, '').replace(/,$/, '');

    let n1Display = numerosAR[0][0];
    if (numerosAR[0][1] > 0) n1Display = n1Display.slice(0, n1Display.length - numerosAR[0][1]) + ',' + n1Display.slice(n1Display.length - numerosAR[0][1]);
    let n2Display = numerosAR[1][0];
    if (numerosAR[1][1] > 0) n2Display = n2Display.slice(0, n2Display.length - numerosAR[1][1]) + ',' + n2Display.slice(n2Display.length - numerosAR[1][1]);
    
    // --- 2. CÁLCULO DEL LAYOUT ---
    const maxWidthInChars = Math.max(n1Display.length, n2Display.length + 1, resultadoConComa.length);
    const altoGridInRows = 4;
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, maxWidthInChars, altoGridInRows);
    
    // --- 3. LÓGICA DE VISUALIZACIÓN (CON ANIMACIONES) ---
    const delayStep = 60;

    // Animar aparición del minuendo
    let yPos = paddingTop;
    for (let i = 0; i < n1Display.length; i++) {
        const leftPos = offsetHorizontal + (maxWidthInChars - n1Display.length + i) * tamCel + paddingLeft;
        // CORRECCIÓN: Usamos las nuevas clases CSS
        salida.appendChild(crearCeldaAnimada("output-grid__cell output-grid__cell--dividendo", n1Display[i], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px' }, i * delayStep));
    }
    await esperar(n1Display.length * delayStep + 200);

    // Animar aparición del sustraendo
    yPos += tamCel;
    const signLeft = offsetHorizontal + (maxWidthInChars - n2Display.length - 1) * tamCel + paddingLeft;
    // CORRECCIÓN: Usamos las nuevas clases CSS
    salida.appendChild(crearCeldaAnimada("output-grid__cell output-grid__cell--producto", "-", { left: `${signLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px' }, 0));
    
    for (let i = 0; i < n2Display.length; i++) {
        const leftPos = offsetHorizontal + (maxWidthInChars - n2Display.length + i) * tamCel + paddingLeft;
        // CORRECCIÓN: Usamos las nuevas clases CSS
        salida.appendChild(crearCeldaAnimada("output-grid__cell output-grid__cell--dividendo", n2Display[i], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px' }, 100 + i * delayStep));
    }
    await esperar(n2Display.length * delayStep + 300);

    // Animar aparición de la línea
    yPos += tamCel;
    const lineLeft = offsetHorizontal + paddingLeft;
    const totalBlockWidth = maxWidthInChars * tamCel;
    // CORRECCIÓN: Usamos la nueva clase CSS
    const linea = crearCelda("output-grid__line", "", { left: `${lineLeft}px`, top: `${yPos}px`, width: `0px`, height: `2px`, transition: 'width 0.4s ease-out' });
    salida.appendChild(linea);

    requestAnimationFrame(() => {
        linea.style.width = `${totalBlockWidth}px`;
    });
    await esperar(400);

    // Animar aparición del resultado
    yPos += tamCel * 0.2;
    for (let i = 0; i < resultadoConComa.length; i++) {
        const leftPos = offsetHorizontal + (maxWidthInChars - resultadoConComa.length + i) * tamCel + paddingLeft;
        // CORRECCIÓN: Usamos las nuevas clases CSS
        salida.appendChild(crearCeldaAnimada("output-grid__cell output-grid__cell--cociente", resultadoConComa[i], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px' }, i * delayStep));
    }
}