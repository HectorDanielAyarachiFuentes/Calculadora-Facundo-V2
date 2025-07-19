// =======================================================
// --- operations/modules/subtraction.js (VERSIÓN FINAL CON TACHADO Y NÚMEROS) ---
// =======================================================
"use strict";

import { calculateLayout } from '../utils/layout-calculator.js';
import { crearCelda, crearCeldaAnimada, esperar } from '../utils/dom-helpers.js';
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
            // Buscar hacia la izquierda un dígito del cual prestar (que no sea 0)
            while (j >= 0 && n1Array[j] === 0) {
                j--;
            }

            if (j >= 0) {
                // Se encontró de dónde prestar. Guardar los nuevos valores.
                const fromNewValue = n1Array[j] - 1;
                const toNewValue = n1Array[i] + 10;
                borrows.push({ fromIndex: j, fromNewValue, toIndex: i, toNewValue });

                // Actualizar el array para que los siguientes cálculos de préstamo sean correctos
                n1Array[j]--;
                for (let k = j + 1; k < i; k++) {
                    n1Array[k] = 9; // Los ceros intermedios se convierten en 9
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
    line.className = 'output-grid__cross-out'; // Puedes añadir estilos en CSS si quieres
    Object.assign(line.style, {
        position: 'absolute',
        backgroundColor: '#e84d4d', // Color rojo para tachar
        height: '2px',
        transform: 'rotate(-25deg)',
        transformOrigin: 'left center',
        transition: 'width 0.3s ease-out',
        width: '0px', // Empieza con ancho 0 para la animación
        ...styles
    });

    requestAnimationFrame(() => {
        line.style.width = styles.width; // Anima al ancho completo
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
    const resultadoBigInt = BigInt(minuendoStr) - BigInt(sustraendoStr);
    const resultadoStr = resultadoBigInt.toString();

    // Asegurarse de que ambos números tengan la misma longitud para la resta visual
    const maxLength = Math.max(minuendoStr.length, sustraendoStr.length);
    const n1Padded = minuendoStr.padStart(maxLength, '0');
    const n2Padded = sustraendoStr.padStart(maxLength, '0');
    
    // --- 2. CÁLCULO DEL LAYOUT ---
    const maxWidthInChars = Math.max(n1Padded.length, n2Padded.length + 1, resultadoStr.length);
    const altoGridInRows = 5; // Necesitamos una fila extra para los números de préstamo
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, maxWidthInChars, altoGridInRows);
    
    // --- 3. LÓGICA DE VISUALIZACIÓN ---
    const delayStep = 80;
    const yPosMinuendo = paddingTop + tamCel; // Bajamos una fila para dejar espacio arriba
    const yPosSustraendo = yPosMinuendo + tamCel;
    
    // Dibujar minuendo
    for (let i = 0; i < n1Padded.length; i++) {
        const leftPos = offsetHorizontal + (maxWidthInChars - n1Padded.length + i) * tamCel + paddingLeft;
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--dividendo", n1Padded[i], { left: `${leftPos}px`, top: `${yPosMinuendo}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px' }));
    }
    
    // Dibujar sustraendo
    const signLeft = offsetHorizontal + (maxWidthInChars - n2Padded.length - 1) * tamCel + paddingLeft;
    fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", "-", { left: `${signLeft}px`, top: `${yPosSustraendo}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px' }));
    for (let i = 0; i < n2Padded.length; i++) {
        const leftPos = offsetHorizontal + (maxWidthInChars - n2Padded.length + i) * tamCel + paddingLeft;
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", n2Padded[i], { left: `${leftPos}px`, top: `${yPosSustraendo}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px' }));
    }
    salida.appendChild(fragment);
    await esperar(500);

    // --- ¡NUEVO! ANIMACIÓN DE PRÉSTAMOS (BORROWING) ---
    const borrows = calculateBorrows(n1Padded, n2Padded);
    for (const borrow of borrows) {
        // --- Animar el préstamo DESDE (from) ---
        const fromCol = maxWidthInChars - n1Padded.length + borrow.fromIndex;
        const xFrom = offsetHorizontal + fromCol * tamCel + paddingLeft;
        
        // Tachar el número original
        salida.appendChild(crearTachadoAnimado({ left: `${xFrom}px`, top: `${yPosMinuendo + tamCel / 2}px`, width: `${tamCel}px` }));
        await esperar(300);

        // Mostrar el nuevo número arriba
        const yNewNum = yPosMinuendo - tamCel * 0.7;
        salida.appendChild(crearCeldaAnimada("output-grid__cell output-grid__cell--resto", borrow.fromNewValue, {
            left: `${xFrom}px`, top: `${yNewNum}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente * 0.7}px`
        }, 0));
        await esperar(500);

        // --- Animar el préstamo HACIA (to) ---
        const toCol = maxWidthInChars - n1Padded.length + borrow.toIndex;
        const xTo = offsetHorizontal + toCol * tamCel + paddingLeft;

        // Tachar el número original
        salida.appendChild(crearTachadoAnimado({ left: `${xTo}px`, top: `${yPosMinuendo + tamCel / 2}px`, width: `${tamCel}px` }));
        await esperar(300);
        
        // Mostrar el nuevo número (ej. "12") arriba
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
    for (let i = 0; i < resultadoStr.length; i++) {
        const leftPos = offsetHorizontal + (maxWidthInChars - resultadoStr.length + i) * tamCel + paddingLeft;
        salida.appendChild(crearCeldaAnimada("output-grid__cell output-grid__cell--cociente", resultadoStr[i], { left: `${leftPos}px`, top: `${yPosResultado}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px' }, i * delayStep));
    }
}