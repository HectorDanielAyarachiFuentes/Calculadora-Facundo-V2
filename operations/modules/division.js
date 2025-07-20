// =======================================================
// --- operations/modules/division.js (VERSIÓN CORREGIDA) ---
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
    const divisor = BigInt(divisorStr);
    const cocienteCompleto = (BigInt(dividendoStr) / divisor).toString();
    const restoFinalCalculo = (BigInt(dividendoStr) % divisor);
    
    const displaySteps = [];
    let currentRow = 0;

    // 1. Añadir el dividendo inicial
    displaySteps.push({ 
        text: dividendoStr, 
        row: currentRow, 
        colEnd: dividendoStr.length, 
        type: 'dividendo' 
    });
    currentRow++;

    let restoActual = 0n;
    let posicionEnDividendo = 0;

    // Procesar cada dígito del cociente
    for (let i = 0; i < cocienteCompleto.length; i++) {
        // Bajar dígitos hasta que tengamos un número >= divisor (o hasta terminar)
        while (posicionEnDividendo < dividendoStr.length && 
               (restoActual < divisor || (restoActual === 0n && posicionEnDividendo === 0))) {
            restoActual = restoActual * 10n + BigInt(dividendoStr[posicionEnDividendo]);
            posicionEnDividendo++;
        }

        // Si no tenemos suficiente número para dividir, el dígito del cociente será 0
        if (restoActual < divisor) {
            // Añadir producto 0
            displaySteps.push({ 
                text: '0', 
                row: currentRow, 
                colEnd: posicionEnDividendo, 
                type: 'producto' 
            });
            currentRow++;
            
            // Mostrar el resto (que es el mismo número)
            if (i < cocienteCompleto.length - 1 && posicionEnDividendo < dividendoStr.length) {
                // Bajar el siguiente dígito
                restoActual = restoActual * 10n + BigInt(dividendoStr[posicionEnDividendo]);
                posicionEnDividendo++;
                displaySteps.push({ 
                    text: restoActual.toString(), 
                    row: currentRow, 
                    colEnd: posicionEnDividendo, 
                    type: 'resto' 
                });
                currentRow++;
            }
            continue;
        }

        // Calcular el producto (lo que se resta)
        const digitoCociente = BigInt(cocienteCompleto[i]);
        const producto = digitoCociente * divisor;
        const nuevoResto = restoActual - producto;

        // Añadir el producto a restar
        displaySteps.push({ 
            text: producto.toString(), 
            row: currentRow, 
            colEnd: posicionEnDividendo, 
            type: 'producto' 
        });
        currentRow++;

        // Determinar qué mostrar como resto
        if (i < cocienteCompleto.length - 1) {
            // No es el último paso
            if (posicionEnDividendo < dividendoStr.length) {
                // Hay más dígitos: bajar el siguiente
                const siguienteDigito = BigInt(dividendoStr[posicionEnDividendo]);
                const restoConSiguiente = nuevoResto * 10n + siguienteDigito;
                posicionEnDividendo++;
                
                displaySteps.push({ 
                    text: restoConSiguiente.toString(), 
                    row: currentRow, 
                    colEnd: posicionEnDividendo, 
                    type: 'resto' 
                });
                restoActual = restoConSiguiente;
            } else {
                // No hay más dígitos
                displaySteps.push({ 
                    text: nuevoResto.toString(), 
                    row: currentRow, 
                    colEnd: posicionEnDividendo, 
                    type: 'resto' 
                });
                restoActual = nuevoResto;
            }
        } else {
            // Es el último paso: SIEMPRE mostrar el resto final
            displaySteps.push({ 
                text: nuevoResto.toString(), 
                row: currentRow, 
                colEnd: posicionEnDividendo, 
                type: 'resto' 
            });
            restoActual = nuevoResto;
        }
        currentRow++;
    }

    // Caso especial: si el dividendo es menor que el divisor
    if (cocienteCompleto === "0") {
        displaySteps.push({ 
            text: '0', 
            row: currentRow, 
            colEnd: dividendoStr.length, 
            type: 'producto' 
        });
        currentRow++;
        displaySteps.push({ 
            text: dividendoStr, 
            row: currentRow, 
            colEnd: dividendoStr.length, 
            type: 'resto' 
        });
        currentRow++;
    }

    return { 
        cociente: cocienteCompleto, 
        displaySteps, 
        totalRows: currentRow 
    };
}

/**
 * `drawHeader`: Dibuja la parte superior de la división con el formato de galera latinoamericano.
 * @param {DocumentFragment} fragment
 * @param {object} params
 */
function drawHeader(fragment, { divisorStr, cociente, tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop, xBloqueDerecho, anchoIzquierdo, anchoDerecho, separatorWidth, galeraHeight }) {
    const yPosTopRow = paddingTop;
    const yPosCociente = paddingTop + tamCel;

    // Dibujar divisor
    for (let i = 0; i < divisorStr.length; i++) {
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--divisor", divisorStr[i], {
            left: `${xBloqueDerecho + i * tamCel}px`, 
            top: `${yPosTopRow}px`, 
            width: `${tamCel}px`, 
            height: `${tamCel}px`, 
            fontSize: `${tamFuente}px`
        }));
    }

    // Calcular posiciones de las líneas
    const xLineaVertical = offsetHorizontal + anchoIzquierdo * tamCel + (separatorWidth / 2) * tamCel + paddingLeft;
    const xEndOfRightBlock = xBloqueDerecho + anchoDerecho * tamCel;
    const anchoLineasHorizontales = xEndOfRightBlock - xLineaVertical;

    // Línea vertical de la galera
    fragment.appendChild(crearCelda("output-grid__line", "", {
        left: `${xLineaVertical}px`, 
        top: `${yPosTopRow}px`, 
        width: `2px`, 
        height: `${tamCel}px`
    }));
    
    // Línea horizontal (entre divisor y cociente)
    fragment.appendChild(crearCelda("output-grid__line", "", {
        left: `${xLineaVertical}px`, 
        top: `${yPosCociente}px`, 
        width: `${anchoLineasHorizontales}px`, 
        height: `2px`
    }));

    // Dibujar cociente
    for (let i = 0; i < cociente.length; i++) {
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--cociente", cociente[i], {
            left: `${xBloqueDerecho + i * tamCel}px`, 
            top: `${yPosCociente}px`, 
            width: `${tamCel}px`, 
            height: `${tamCel}px`, 
            fontSize: `${tamFuente}px`
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

    // Validaciones
    if (BigInt(divisorStr) === 0n) { 
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division2}</p>`; 
        return; 
    }
    if (BigInt(dividendoStr) === 0n) { 
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division1}</p>`; 
        return; 
    }

    const { cociente, displaySteps, totalRows } = calculateDisplaySteps(dividendoStr, divisorStr);
    
    // Calcular dimensiones
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

    // Dibujar los pasos de la división
    displaySteps.forEach(step => {
        const colStart = step.colEnd - step.text.length + signColumnOffset;
        const xStart = offsetHorizontal + colStart * tamCel + paddingLeft;
        const yStart = paddingTop + step.row * tamCel;
        const clase = `output-grid__cell--${step.type}`;

        // Dibujar cada dígito del paso
        for (let i = 0; i < step.text.length; i++) {
            fragment.appendChild(crearCelda(`output-grid__cell ${clase}`, step.text[i], {
                left: `${xStart + i * tamCel}px`, 
                top: `${yStart}px`,
                width: `${tamCel}px`, 
                height: `${tamCel}px`, 
                fontSize: `${tamFuente}px`
            }));
        }

        // Si es un producto, añadir el signo menos y la línea
        if (step.type === 'producto') {
            fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", "-", {
                left: `${xStart - tamCel}px`, 
                top: `${yStart}px`,
                width: `${tamCel}px`, 
                height: `${tamCel}px`, 
                fontSize: `${tamFuente}px`
            }));
            
            fragment.appendChild(crearCelda("output-grid__line", "", {
                left: `${xStart}px`, 
                top: `${yStart + tamCel}px`,
                width: `${step.text.length * tamCel}px`, 
                height: `2px`
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

    // Validaciones
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

    // Calcular dimensiones
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
            left: `${offsetHorizontal + i * tamCel + paddingLeft}px`, 
            top: `${paddingTop}px`,
            width: `${tamCel}px`, 
            height: `${tamCel}px`, 
            fontSize: `${tamFuente}px`
        }));
    }

    // Dibujar resto final
    const yResto = paddingTop + 2 * tamCel; 
    const xResto = offsetHorizontal + (dividendoStr.length - restoFinal.length) * tamCel + paddingLeft;
    for (let i = 0; i < restoFinal.length; i++) {
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--resto", restoFinal[i], {
            left: `${xResto + i * tamCel}px`, 
            top: `${yResto}px`,
            width: `${tamCel}px`, 
            height: `${tamCel}px`, 
            fontSize: `${tamFuente}px`
        }));
    }
    
    salida.appendChild(fragment);
}