// =======================================================
// --- operations/modules/division.js (VERSIÓN CORREGIDA Y COMPLETA) ---
// Contiene la lógica y la visualización para la operación de división.
// `divide`: Muestra un resumen de cociente y resto.
// `divideExt`: Muestra el proceso completo de la división larga.
// =======================================================
"use strict";

import { calculateLayout } from '../utils/layout-calculator.js';
import { crearCelda } from '../utils/dom-helpers.js';
import { salida, errorMessages } from '../../config.js';

/**
 * Realiza y visualiza la operación de división (versión simple).
 * MUESTRA UN RESUMEN CON EL COCIENTE Y EL RESTO.
 * @param {Array<[string, number]>} numerosAR - Los operandos [dividendo, divisor].
 */
export function divide(numerosAR) {
    salida.innerHTML = "";

    const [num1Str, numDec1] = numerosAR[0];
    const [num2Str, numDec2] = numerosAR[1];

    if (BigInt(num2Str) === 0n) {
        salida.innerHTML = errorMessages.division2; // Simplificado para usar los de config.js
        return;
    }
    if (BigInt(num1Str) === 0n) {
        salida.innerHTML = errorMessages.division1;
        return;
    }

    // Para la división simple, ignoramos los decimales del input para dar un resultado de división entera.
    const cocienteBigInt = BigInt(num1Str) / BigInt(num2Str);
    const restoBigInt = BigInt(num1Str) % BigInt(num2Str);

    const cocienteStr = cocienteBigInt.toString();
    const restoStr = restoBigInt.toString();
    
    // --- LÓGICA DE VISUALIZACIÓN SIMPLIFICADA ---
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'division-summary'; // Usaremos CSS para estilizar esto

    const pCociente = document.createElement('p');
    pCociente.innerHTML = `Cociente: <span class="caja4">${cocienteStr}</span>`;
    
    const pResto = document.createElement('p');
    pResto.innerHTML = `Resto: <span class="caja2">${restoStr}</span>`;

    summaryContainer.appendChild(pCociente);
    summaryContainer.appendChild(pResto);
    
    salida.appendChild(summaryContainer);
}

/**
 * Realiza y visualiza la operación de división (versión extendida o "larga").
 * @param {Array<[string, number]>} numerosAR - Los operandos [dividendo, divisor].
 */
export function divideExt(numerosAR) {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();
    
    // --- 1. CÁLCULOS DE LA OPERACIÓN ---
    const [actualNum1Str, numDec1] = numerosAR[0];
    const [actualNum2Str, numDec2] = numerosAR[1];

    if (BigInt(actualNum2Str) === 0n) {
        salida.innerHTML = errorMessages.division2;
        return;
    }
    if (BigInt(actualNum1Str) === 0n) {
        salida.innerHTML = errorMessages.division1;
        return;
    }

    // Lógica para la división larga paso a paso
    const steps = [];
    let fullCalculatedQuotient = "";
    let currentChunkAccumulator = "";
    if (actualNum1Str !== '0') {
        let dividendPointer = 0;
        while (dividendPointer < actualNum1Str.length) {
            currentChunkAccumulator += actualNum1Str[dividendPointer++];
            let chunkForCalc = currentChunkAccumulator.replace(/^0+/, '') || '0';
            let quotientDigit = '0';

            if (BigInt(chunkForCalc) >= BigInt(actualNum2Str)) {
                quotientDigit = (BigInt(chunkForCalc) / BigInt(actualNum2Str)).toString();
                const product = (BigInt(quotientDigit) * BigInt(actualNum2Str)).toString();
                const remainder = (BigInt(chunkForCalc) - BigInt(product)).toString();
                
                steps.push({ dividendValue: chunkForCalc, product: product, remainder: remainder });
                currentChunkAccumulator = remainder;
            } else if (fullCalculatedQuotient.length > 0) {
                 quotientDigit = '0';
            }
            fullCalculatedQuotient += quotientDigit;
        }
        if (fullCalculatedQuotient === "") {
             fullCalculatedQuotient = "0";
             steps.push({ dividendValue: actualNum1Str, product: "0", remainder: actualNum1Str });
        }
    } else {
        fullCalculatedQuotient = '0';
        steps.push({ dividendValue: '0', product: '0', remainder: '0' });
    }
    
    // Eliminar ceros a la izquierda del cociente final
    fullCalculatedQuotient = fullCalculatedQuotient.replace(/^0+/, '') || '0';
    
    // --- PREPARACIÓN PARA VISUALIZACIÓN ---
    let displayedDividend = actualNum1Str;
    let displayedDivisor = actualNum2Str;
    let displayedQuotient = fullCalculatedQuotient;

    // Manejo de comas (si decides implementarlo visualmente en la división larga)
    if (numDec1 > 0) displayedDividend = displayedDividend.slice(0, -numDec1) + ',' + displayedDividend.slice(-numDec1);
    if (numDec2 > 0) displayedDivisor = displayedDivisor.slice(0, -numDec2) + ',' + displayedDivisor.slice(-numDec2);
    // (Lógica para comas en el cociente omitida por simplicidad en la división larga, pero se puede añadir)

    // --- 2. CÁLCULO DEL LAYOUT ---
    let maxLeftWidth = displayedDividend.length;
    steps.forEach(s => {
        maxLeftWidth = Math.max(maxLeftWidth, s.dividendValue.length, s.product.length, s.remainder.length);
    });
    const maxRightWidth = Math.max(displayedDivisor.length, displayedQuotient.length);
    const separatorWidth = 1.5;
    const totalCols = maxLeftWidth + separatorWidth + maxRightWidth;
    const totalRows = 2 + steps.length * 2.5;
    
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, totalCols, totalRows);

    // --- 3. LÓGICA DE VISUALIZACIÓN ---
    let yPos = paddingTop;
    let xOffset = 0;

    // --- DIBUJAR PARTE SUPERIOR (Dividendo, Divisor, Cociente y Líneas) ---
    // Dividendo
    for (let j = 0; j < displayedDividend.length; j++) {
        const leftPos = offsetHorizontal + j * tamCel + paddingLeft;
        fragment.appendChild(crearCelda("caja", displayedDividend[j], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    // Divisor
    const rightBlockX = offsetHorizontal + (maxLeftWidth + separatorWidth) * tamCel + paddingLeft;
    for (let i = 0; i < displayedDivisor.length; i++) {
        fragment.appendChild(crearCelda("caja3", displayedDivisor[i], { left: `${rightBlockX + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    // Cociente
    yPos += tamCel;
    for (let i = 0; i < displayedQuotient.length; i++) {
        fragment.appendChild(crearCelda("caja4", displayedQuotient[i], { left: `${rightBlockX + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    // Líneas de la división
    const lineX = offsetHorizontal + maxLeftWidth * tamCel + (separatorWidth * tamCel / 2) + paddingLeft;
    fragment.appendChild(crearCelda("linea-vertical", "", { left: `${lineX - 1}px`, top: `${paddingTop}px`, width: `2px`, height: `${salida.clientHeight - paddingTop*2}px`, backgroundColor: "#ddd" }));
    fragment.appendChild(crearCelda("linea-horizontal", "", { left: `${lineX}px`, top: `${paddingTop + tamCel - 1}px`, width: `${maxRightWidth * tamCel}px`, height: `2px`, backgroundColor: "#ddd" }));

    // --- DIBUJAR PASOS INTERMEDIOS ---
    yPos = paddingTop; // Reiniciar Y para los pasos
    let lastRemainderLength = 0;

    steps.forEach((step, index) => {
        // Dibujar el producto de la resta
        yPos += tamCel;
        const prod = step.product;
        xOffset = (step.dividendValue.length - prod.length);
        const prodLeft = offsetHorizontal + xOffset * tamCel + paddingLeft;
        
        for (let k = 0; k < prod.length; k++) {
            fragment.appendChild(crearCelda("caja3", prod[k], { left: `${prodLeft + k * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`, borderTop: `1px #ddd solid`, color: '#ccc' }));
        }

        // Dibujar el resto
        yPos += tamCel;
        const rem = step.remainder;
        xOffset = (step.dividendValue.length - rem.length);
        const remLeft = offsetHorizontal + xOffset * tamCel + paddingLeft;

        for (let k = 0; k < rem.length; k++) {
            fragment.appendChild(crearCelda("caja2", rem[k], { left: `${remLeft + k * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`, color: '#ffff00' }));
        }
        
        // El siguiente dividendo es el resto + el siguiente dígito del dividendo original
        const nextDigitIndex = steps.slice(0, index + 1).reduce((acc, s) => acc + s.dividendValue.length - (s.remainder.length > 1 ? s.remainder.length -1 : 0), 0);
        if (nextDigitIndex < actualNum1Str.length) {
            const nextDigit = actualNum1Str[nextDigitIndex];
            const nextDigitLeft = remLeft + rem.length * tamCel;
            fragment.appendChild(crearCelda("caja", nextDigit, { left: `${nextDigitLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
        }
    });
    
    salida.appendChild(fragment);
}