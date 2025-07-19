// =======================================================
// --- operations/modules/subtraction.js (VERSIÓN ESTABLE Y CORREGIDA RESTAURADA) ---
// =======================================================
"use strict";

import { calculateLayout } from '../utils/layout-calculator.js';
import { crearCelda, crearCeldaAnimada, esperar, crearFlechaLlevada } from '../utils/dom-helpers.js';
import { salida } from '../../config.js';

/**
 * Calcula los pasos de "prestar" (borrowing) para la resta.
 * @param {string} n1Str - Minuendo (número de arriba), ya paddeado con ceros.
 * @param {string} n2Str - Sustraendo (número de abajo), ya paddeado con ceros.
 * @returns {Array<object>} Un array de objetos, cada uno representando un préstamo.
 */
function calculateBorrows(n1Str, n2Str) {
    const borrows = [];
    let n1Array = n1Str.split('').map(Number);
    let n2Array = n2Str.split('').map(Number);

    for (let i = n1Array.length - 1; i >= 0; i--) {
        if (n1Array[i] < n2Array[i]) {
            let j = i - 1;
            while (j >= 0 && n1Array[j] === 0) {
                j--;
            }

            if (j >= 0) {
                const fromNewValue = n1Array[j] - 1;
                const toNewValue = n1Array[i] + 10;
                borrows.push({ fromIndex: j, fromNewValue, toIndex: i, toNewValue });

                n1Array[j]--;
                for (let k = j + 1; k < i; k++) {
                    n1Array[k] = 9;
                }
                n1Array[i] += 10;
            }
        }
    }
    return borrows;
}


/**
 * Crea una línea para tachar un número.
 * @param {object} styles - Estilos CSS (left, top, width, etc.).
 * @returns {HTMLDivElement} El elemento de la línea.
 */
function crearTachadoAnimado(styles) {
    const line = document.createElement('div');
    line.className = 'output-grid__cross-out';
    Object.assign(line.style, {
        position: 'absolute',
        backgroundColor: '#e84d4d',
        height: '2px',
        transform: 'rotate(-25deg)',
        transformOrigin: 'left center',
        transition: 'width 0.3s ease-out',
        width: '0px',
        ...styles
    });

    requestAnimationFrame(() => {
        line.style.width = styles.width;
    });
    return line;
}

/**
 * Realiza y visualiza la operación de resta con animación de "prestar" estilo cuaderno.
 * @param {Array<[string, number]>} numerosAR - Los operandos.
 */
export async function resta(numerosAR) {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    // --- 1. CÁLCULOS DE LA OPERACIÓN ---
    const minuendoStr = numerosAR[0][0];
    const sustraendoStr = numerosAR[1][0];
    const minuendoBigInt = BigInt(minuendoStr);
    const sustraendoBigInt = BigInt(sustraendoStr);
    
    const isNegative = minuendoBigInt < sustraendoBigInt;
    const n1Anim = isNegative ? sustraendoStr : minuendoStr;
    const n2Anim = isNegative ? minuendoStr : sustraendoStr;
    const resultadoAbsStr = (isNegative ? sustraendoBigInt - minuendoBigInt : minuendoBigInt - sustraendoBigInt).toString();

    // --- 2. CÁLCULO DEL LAYOUT ---
    const maxLength = Math.max(n1Anim.length, n2Anim.length);
    const n1Padded = n1Anim.padStart(maxLength, '0');
    const n2Padded = n2Anim.padStart(maxLength, '0');
    
    const resultDisplayLength = isNegative ? resultadoAbsStr.length + 1 : resultadoAbsStr.length;
    const maxWidthInChars = Math.max(maxLength + 1, resultDisplayLength);
    const altoGridInRows = 5;
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, maxWidthInChars, altoGridInRows);
    
    // --- 3. LÓGICA DE VISUALIZACIÓN ---
    const delayStep = 80;
    const yPosMinuendo = paddingTop + tamCel;
    const yPosSustraendo = yPosMinuendo + tamCel;
    
    // Dibujar minuendo y sustraendo
    for (let i = 0; i < n1Padded.length; i++) {
        const leftPos = offsetHorizontal + (maxWidthInChars - n1Padded.length + i) * tamCel + paddingLeft;
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--dividendo", n1Padded[i], { left: `${leftPos}px`, top: `${yPosMinuendo}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px' }));
    }
    const signLeft = offsetHorizontal + (maxWidthInChars - n2Padded.length - 1) * tamCel + paddingLeft;
    fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", "-", { left: `${signLeft}px`, top: `${yPosSustraendo}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px' }));
    for (let i = 0; i < n2Padded.length; i++) {
        const leftPos = offsetHorizontal + (maxWidthInChars - n2Padded.length + i) * tamCel + paddingLeft;
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", n2Padded[i], { left: `${leftPos}px`, top: `${yPosSustraendo}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px' }));
    }
    salida.appendChild(fragment);
    await esperar(500);

    // --- ANIMACIÓN DE PRÉSTAMOS (BORROWING) ---
    const borrows = calculateBorrows(n1Padded, n2Padded);
    for (const borrow of borrows) {
        const fromCol = maxWidthInChars - n1Padded.length + borrow.fromIndex;
        const xFrom = offsetHorizontal + fromCol * tamCel + paddingLeft;
        const toCol = maxWidthInChars - n1Padded.length + borrow.toIndex;
        const xTo = offsetHorizontal + toCol * tamCel + paddingLeft;
        const yNewNum = yPosMinuendo - tamCel * 0.7;

        // --- Dibuja la flecha simple de préstamo ---
        const arrowLeft = xFrom;
        const arrowTop = yNewNum - tamCel * 0.1;
        const arrowWidth = xTo - xFrom;
        const arrowHeight = tamCel * 0.8;
        salida.appendChild(crearFlechaLlevada(arrowLeft, arrowTop, arrowWidth, arrowHeight));
        await esperar(800);

        // --- Animar el préstamo DESDE (from) ---
        salida.appendChild(crearTachadoAnimado({ left: `${xFrom}px`, top: `${yPosMinuendo + tamCel / 2}px`, width: `${tamCel}px` }));
        await esperar(300);
        salida.appendChild(crearCeldaAnimada("output-grid__cell output-grid__cell--resto", borrow.fromNewValue, {
            left: `${xFrom}px`, top: `${yNewNum}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente * 0.7}px`
        }, 0));
        await esperar(300);

        // --- Animar el préstamo HACIA (to) ---
        salida.appendChild(crearTachadoAnimado({ left: `${xTo}px`, top: `${yPosMinuendo + tamCel / 2}px`, width: `${tamCel}px` }));
        await esperar(300);
        salida.appendChild(crearCeldaAnimada("output-grid__cell output-grid__cell--resto", borrow.toNewValue, {
            left: `${xTo - tamCel * 0.2}px`, top: `${yNewNum}px`, width: `${tamCel * 1.4}px`, height: `${tamCel}px`, fontSize: `${tamFuente * 0.7}px`
        }, 0));
        await esperar(500);
    }
    
    // Animar aparición de la línea
    const yPosLinea = yPosSustraendo + tamCel;
    const lineLeft = offsetHorizontal + paddingLeft;
    const totalBlockWidth = maxWidthInChars * tamCel;
    const linea = crearCelda("output-grid__line", "", { left: `${lineLeft}px`, top: `${yPosLinea}px`, width: `0px`, height: `2px`, transition: 'width 0.4s ease-out' });
    salida.appendChild(linea);

    requestAnimationFrame(() => {
        linea.style.width = `${totalBlockWidth}px`;
    });
    await esperar(400);

    // Animar aparición del resultado
    const yPosResultado = yPosLinea + tamCel * 0.2;
    const resultLeftOffset = maxWidthInChars - resultadoAbsStr.length;
    let animationDelayStart = 0;

    if (isNegative) {
        const signLeftPos = offsetHorizontal + (resultLeftOffset - 1) * tamCel + paddingLeft;
        salida.appendChild(crearCeldaAnimada("output-grid__cell output-grid__cell--cociente", "-", {
            left: `${signLeftPos}px`, top: `${yPosResultado}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px'
        }, 0));
        animationDelayStart = 1;
    }
    
    for (let i = 0; i < resultadoAbsStr.length; i++) {
        const leftPos = offsetHorizontal + (resultLeftOffset + i) * tamCel + paddingLeft;
        salida.appendChild(crearCeldaAnimada("output-grid__cell output-grid__cell--cociente", resultadoAbsStr[i], {
            left: `${leftPos}px`, top: `${yPosResultado}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente * 0.9}px` // Ligeramente más pequeño
        }, (animationDelayStart + i) * delayStep));
    }
}