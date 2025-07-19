// =======================================================
// --- operations/modules/division.js (VERSIÓN FINAL CON GALERA CORREGIDA) ---
// Contiene la lógica y la visualización para la operación de división.
// `divide`: Muestra el proceso completo de la división larga (extendida).
// `divideExt`: Muestra el layout clásico de la división finalizada (usual).
// =======================================================
"use strict";

import { calculateLayout } from '../utils/layout-calculator.js';
import { crearCelda } from '../utils/dom-helpers.js';
import { salida, errorMessages } from '../../config.js';

/**
 * Función de cálculo que genera un array de todos los elementos a dibujar.
 * @param {string} dividendoStr
 * @param {string} divisorStr
 * @returns {{cociente: string, displaySteps: Array<object>, totalRows: number}}
 */
function calculateDisplaySteps(dividendoStr, divisorStr) {
    const divisorBigInt = BigInt(divisorStr);
    let cociente = (BigInt(dividendoStr) / divisorBigInt).toString();
    
    const displaySteps = [];
    let currentRow = 0;
    let productsAdded = 0;

    // 1. Añadir el dividendo inicial
    displaySteps.push({ text: dividendoStr, row: currentRow, colEnd: dividendoStr.length, type: 'dividendo' });
    currentRow++;

    let chunkStr = "";
    let cocienteIndex = 0;

    for (let i = 0; i < dividendoStr.length; i++) {
        chunkStr += dividendoStr[i];
        let chunkBigInt = BigInt(chunkStr);

        if (chunkBigInt >= divisorBigInt) {
            productsAdded++;
            const producto = BigInt(cociente[cocienteIndex]) * divisorBigInt;
            const resto = chunkBigInt - producto;

            // 2. Añadir el producto a restar
            displaySteps.push({ text: producto.toString(), row: currentRow, colEnd: i + 1, type: 'producto' });
            currentRow++;

            // 3. Añadir el resto parcial
            chunkStr = resto.toString();
            
            if (i + 1 < dividendoStr.length) {
                chunkStr += dividendoStr[i + 1];
                displaySteps.push({ text: chunkStr, row: currentRow, colEnd: i + 2, type: 'resto' });
            } else { // Es el resto final
                displaySteps.push({ text: chunkStr, row: currentRow, colEnd: i + 1, type: 'resto' });
            }
            currentRow++;
            cocienteIndex++;
        }
    }
    
    if (productsAdded === 0) {
        cociente = "0";
        displaySteps.push({ text: '0', row: currentRow, colEnd: dividendoStr.length, type: 'producto' });
        currentRow++;
        displaySteps.push({ text: dividendoStr, row: currentRow, colEnd: dividendoStr.length, type: 'resto' });
        currentRow++;
    }

    return { cociente, displaySteps, totalRows: currentRow };
}


/**
 * `drawHeader`: Dibuja la parte superior de la división con el formato de galera latinoamericano.
 * @param {DocumentFragment} fragment
 * @param {object} params
 */
function drawHeader(fragment, { divisorStr, cociente, tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop, xBloqueDerecho, anchoIzquierdo, anchoDerecho, separatorWidth, galeraHeight }) {
    const yPosTopRow = paddingTop;
    const yPosCociente = paddingTop + tamCel;

    for (let i = 0; i < divisorStr.length; i++) {
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--divisor", divisorStr[i], {
            left: `${xBloqueDerecho + i * tamCel}px`, top: `${yPosTopRow}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`
        }));
    }

    const xLineaVertical = offsetHorizontal + anchoIzquierdo * tamCel + (separatorWidth / 2) * tamCel + paddingLeft;
    const xEndOfRightBlock = xBloqueDerecho + anchoDerecho * tamCel;
    const anchoLineasHorizontales = xEndOfRightBlock - xLineaVertical;

    // --- ¡CORRECCIÓN CLAVE! AÑADIR LA LÍNEA VERTICAL DE LA GALERA ---
    // Esta línea forma la "caja" junto con la línea horizontal.
    fragment.appendChild(crearCelda("output-grid__line", "", {
        left: `${xLineaVertical}px`, 
        top: `${yPosTopRow}px`, // Empieza en la fila del divisor
        width: `2px`, 
        height: `${tamCel}px`  // Solo tiene la altura de una fila
    }));
    
    // Línea horizontal (ENTRE divisor y cociente)
    fragment.appendChild(crearCelda("output-grid__line", "", {
        left: `${xLineaVertical}px`, top: `${yPosCociente}px`, width: `${anchoLineasHorizontales}px`, height: `2px`
    }));

    for (let i = 0; i < cociente.length; i++) {
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--cociente", cociente[i], {
            left: `${xBloqueDerecho + i * tamCel}px`, top: `${yPosCociente}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`
        }));
    }
}


/**
 * `divide` (DIVISIÓN EXTENDIDA "NORMAL"): Muestra el proceso de la división larga paso a paso.
 * @param {Array<[string, number]>} numerosAR
 */
export function divide(numerosAR) {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const [dividendoStr, ] = numerosAR[0];
    const [divisorStr, ] = numerosAR[1];

    if (BigInt(divisorStr) === 0n) { 
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division2}</p>`; 
        return; 
    }
    if (BigInt(dividendoStr) === 0n) { 
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division1}</p>`; 
        return; 
    }

    const { cociente, displaySteps, totalRows } = calculateDisplaySteps(dividendoStr, divisorStr);
    
    const signColumnOffset = 1; 
    const anchoIzquierdo = dividendoStr.length + signColumnOffset; 
    const anchoDerecho = Math.max(divisorStr.length, cociente.length) + 1; 
    const separatorWidth = 2; 
    const totalCols = anchoIzquierdo + separatorWidth + anchoDerecho;
    
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, totalCols, totalRows);
    const xBloqueDerecho = offsetHorizontal + (anchoIzquierdo + separatorWidth) * tamCel + paddingLeft;
    const galeraHeight = totalRows * tamCel; 

    // Dibujar el Header (Divisor, Cociente y Galera)
    drawHeader(fragment, { 
        divisorStr, cociente, tamCel, tamFuente, 
        offsetHorizontal, paddingLeft, paddingTop, xBloqueDerecho, 
        anchoIzquierdo, anchoDerecho, separatorWidth, galeraHeight 
    });

    // --- LÓGICA DE DIBUJO DE PASOS CORREGIDA ---
    displaySteps.forEach(step => {
        const colStart = step.colEnd - step.text.length + signColumnOffset;
        const xStart = offsetHorizontal + colStart * tamCel + paddingLeft;
        const yStart = paddingTop + step.row * tamCel;
        const clase = `output-grid__cell--${step.type}`;

        for (let i = 0; i < step.text.length; i++) {
            fragment.appendChild(crearCelda(`output-grid__cell ${clase}`, step.text[i], {
                left: `${xStart + i * tamCel}px`, top: `${yStart}px`,
                width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`
            }));
        }

        if (step.type === 'producto') {
            fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", "-", {
                left: `${xStart - tamCel}px`, top: `${yStart}px`,
                width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`
            }));
            fragment.appendChild(crearCelda("output-grid__line", "", {
                left: `${xStart}px`, top: `${yStart + tamCel}px`,
                width: `${step.text.length * tamCel}px`, height: `2px`
            }));
        }
    });
    
    salida.appendChild(fragment);
}


/**
 * `divideExt` (DIVISIÓN SIMPLIFICADA "EXPAND"): Muestra solo el resultado final.
 * @param {Array<[string, number]>} numerosAR
 */
export function divideExt(numerosAR) {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const [dividendoStr, ] = numerosAR[0];
    const [divisorStr, ] = numerosAR[1];

    if (BigInt(divisorStr) === 0n) { 
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division2}</p>`; 
        return; 
    }
    if (BigInt(dividendoStr) === 0n) { 
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division1}</p>`; 
        return; 
    }

    const cociente = (BigInt(dividendoStr) / BigInt(divisorStr)).toString();
    const restoFinal = (BigInt(dividendoStr) % BigInt(divisorStr)).toString();

    const anchoIzquierdo = dividendoStr.length; 
    const anchoDerecho = Math.max(divisorStr.length, cociente.length) + 1; 
    const separatorWidth = 2; 
    
    const totalCols = anchoIzquierdo + separatorWidth + anchoDerecho;
    const totalRows = 3;
    
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, totalCols, totalRows);
    const xBloqueDerecho = offsetHorizontal + (anchoIzquierdo + separatorWidth) * tamCel + paddingLeft;
    const galeraHeight = 2 * tamCel; 

    // Dibujar Header
    drawHeader(fragment, { 
        divisorStr, cociente, tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop, 
        xBloqueDerecho, anchoIzquierdo, anchoDerecho, separatorWidth, galeraHeight 
    });

    // Dibujar dividendo
    for (let i = 0; i < dividendoStr.length; i++) {
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--dividendo", dividendoStr[i], {
            left: `${offsetHorizontal + i * tamCel + paddingLeft}px`, top: `${paddingTop}px`,
            width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`
        }));
    }

    // Dibujar resto final
    const yResto = paddingTop + 2 * tamCel; 
    const xResto = offsetHorizontal + (dividendoStr.length - restoFinal.length) * tamCel + paddingLeft;
    for (let i = 0; i < restoFinal.length; i++) {
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--resto", restoFinal[i], {
            left: `${xResto + i * tamCel}px`, top: `${yResto}px`,
            width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`
        }));
    }
    
    salida.appendChild(fragment);
}