// =======================================================
// --- operations/modules/division.js (VERSIÓN FINAL COMPLETA Y FUNCIONAL) ---
// Contiene la lógica y la visualización para la operación de división.
// `divide`: Muestra el layout clásico de la división finalizada (usual).
// `divideExt`: Muestra el proceso completo de la división larga (extendida).
// =======================================================
"use strict";

import { calculateLayout } from '../utils/layout-calculator.js';
import { crearCelda } from '../utils/dom-helpers.js';
import { salida, errorMessages } from '../../config.js';

/**
 * Función interna que realiza el cálculo de la división larga entera.
 * Retorna el cociente y todos los pasos intermedios.
 * @param {string} dividendoStr
 * @param {string} divisorStr
 * @returns {{cociente: string, steps: Array<object>}}
 */
function longDivisionCore(dividendoStr, divisorStr) {
    const divisor = BigInt(divisorStr);
    const steps = [];
    let cocienteFinal = "";
    let chunk = "";
    
    for (let i = 0; i < dividendoStr.length; i++) {
        chunk += dividendoStr[i];
        const chunkBigInt = BigInt(chunk);

        // Calculamos un dígito del cociente si ya hemos empezado a construir el cociente final
        // o si el 'chunk' actual es mayor o igual al divisor.
        if (cocienteFinal.length > 0 || chunkBigInt >= divisor) {
            const cocienteDigito = chunkBigInt / divisor;
            const producto = cocienteDigito * divisor;
            const resto = chunkBigInt - producto;

            steps.push({
                dividendoParcial: chunk,
                producto: producto.toString(),
                resto: resto.toString(),
                posicion: i // Posición del último dígito del dividendo parcial usado
            });

            cocienteFinal += cocienteDigito.toString();
            // El nuevo 'chunk' para la siguiente iteración es el resto.
            // Si el resto es "0", lo hacemos vacío para evitar arrastrar "0"s.
            chunk = resto.toString() === "0" ? "" : resto.toString();
        } else {
            // Si el 'chunk' no es divisible pero ya tenemos parte del cociente (ej: 120/125 -> el 0 después del 1)
            if (cocienteFinal.length > 0) {
                 // Añadimos un paso donde el producto es 0 y el resto es el mismo chunk
                 steps.push({
                    dividendoParcial: chunk,
                    producto: "0",
                    resto: chunk,
                    posicion: i
                });
            }
        }
    }
    
    // Si después de todo el bucle no se pudo calcular nada (ej. 45/654), el cociente es 0.
    if (cocienteFinal === "") {
        cocienteFinal = "0";
        // Añadimos un paso inicial para este caso
        steps.push({
            dividendoParcial: dividendoStr,
            producto: "0",
            resto: dividendoStr,
            posicion: dividendoStr.length - 1
        });
    }

    return { cociente: cocienteFinal, steps };
}

/**
 * Dibuja la parte superior de la división (dividendo, divisor, cociente y la galera).
 * Esta función es compartida por ambos modos de división.
 * @param {DocumentFragment} fragment - Fragmento del DOM para añadir elementos.
 * @param {object} params - Objeto con parámetros de dibujado (dividendoStr, divisorStr, cociente, tamCel, tamFuente, etc.).
 * @param {number} params.galeraHeight - Altura total que debe tener la línea vertical de la galera.
 * @returns {number} La posición Y actual después de dibujar la cabecera.
 */
function drawHeader(fragment, { dividendoStr, divisorStr, cociente, tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop, xBloqueDerecho, anchoIzquierdo, anchoDerecho, separatorWidth, galeraHeight }) {
    let yPos = paddingTop;

    // Fila 1: Dividendo y Divisor
    for (let i = 0; i < dividendoStr.length; i++) fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--dividendo", dividendoStr[i], { left: `${offsetHorizontal + i * tamCel + paddingLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    for (let i = 0; i < divisorStr.length; i++) fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--divisor", divisorStr[i], { left: `${xBloqueDerecho + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    
    // "La galera" (líneas de división)
    const xLineaVertical = offsetHorizontal + anchoIzquierdo * tamCel + (separatorWidth * tamCel / 2) + paddingLeft;
    const anchoLineasHorizontales = anchoDerecho * tamCel;
    
    // Línea vertical
    fragment.appendChild(crearCelda("output-grid__line", "", { left: `${xLineaVertical}px`, top: `${paddingTop}px`, width: `2px`, height: `${galeraHeight}px` }));
    // Línea horizontal superior (arriba del divisor)
    fragment.appendChild(crearCelda("output-grid__line", "", { left: `${xLineaVertical}px`, top: `${paddingTop}px`, width: `${anchoLineasHorizontales}px`, height: `2px` }));
    // Línea horizontal inferior (debajo del divisor)
    fragment.appendChild(crearCelda("output-grid__line", "", { left: `${xLineaVertical}px`, top: `${paddingTop + tamCel - 1}px`, width: `${anchoLineasHorizontales}px`, height: `2px` }));

    // Cociente (debajo de la línea inferior de la galera)
    yPos += tamCel; // Baja para el cociente
    for (let i = 0; i < cociente.length; i++) fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--cociente", cociente[i], { left: `${xBloqueDerecho + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));

    return yPos; // Devolvemos la posición Y actual para continuar dibujando
}


/**
 * MODO EXTENDIDO: Muestra el proceso de la división larga paso a paso,
 * incluyendo las restas y líneas intermedias (Algoritmo Extendido).
 * @param {Array<[string, number]>} numerosAR
 */
export function divideExt(numerosAR) {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const [dividendoStr, ] = numerosAR[0];
    const [divisorStr, ] = numerosAR[1];

    if (BigInt(divisorStr) === 0n) { salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division2}</p>`; return; }
    if (BigInt(dividendoStr) === 0n) { salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division1}</p>`; return; }

    const { cociente, steps } = longDivisionCore(dividendoStr, divisorStr);
    
    // Cálculos de layout específicos para el algoritmo extendido
    const anchoIzquierdo = dividendoStr.length + 1; // Para el signo menos
    const anchoDerecho = Math.max(divisorStr.length, cociente.length);
    const separatorWidth = 1.5;
    const totalCols = anchoIzquierdo + separatorWidth + anchoDerecho;
    const totalRows = 2 + (steps.length * 2); // Fila inicial + (producto + resto)*número de pasos
    
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, totalCols, totalRows);
    const xBloqueDerecho = offsetHorizontal + (anchoIzquierdo + separatorWidth) * tamCel + paddingLeft;

    // Calculamos la altura total que debe tener la línea vertical de la galera
    // Va desde paddingTop hasta el final de la última línea de resto
    const galeraHeight = (totalRows - 1) * tamCel; 

    // Dibujar la parte superior (dividendo, divisor, cociente, galera)
    let currentYOffsetForSteps = drawHeader(fragment, { dividendoStr, divisorStr, cociente, tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop, xBloqueDerecho, anchoIzquierdo, anchoDerecho, separatorWidth, galeraHeight });
    
    // Dibujar los pasos de la resta
    steps.forEach(step => {
        currentYOffsetForSteps += tamCel; // Baja para el producto
        
        // Posición del producto a restar (alineado con el dividendo parcial)
        const partialDividendStartingCol = step.posicion - step.dividendoParcial.length + 1;
        const xProducto = offsetHorizontal + partialDividendStartingCol * tamCel + paddingLeft;

        // Signo de resta
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", "-", { left: `${xProducto - tamCel}px`, top: `${currentYOffsetForSteps}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));

        // Dígitos del producto
        for (let i = 0; i < step.producto.length; i++) {
            fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", step.producto[i], { left: `${xProducto + i * tamCel}px`, top: `${currentYOffsetForSteps}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
        }

        // Línea de resta
        fragment.appendChild(crearCelda("output-grid__line", "", { left: `${xProducto}px`, top: `${currentYOffsetForSteps + tamCel}px`, width: `${step.producto.length * tamCel}px`, height: `2px` }));
        
        currentYOffsetForSteps += tamCel; // Baja para el resto

        // Resto parcial
        const xResto = offsetHorizontal + (step.posicion - step.resto.length + 1) * tamCel + paddingLeft;
        for (let i = 0; i < step.resto.length; i++) {
            fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--resto", step.resto[i], { left: `${xResto + i * tamCel}px`, top: `${currentYOffsetForSteps}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
        }

        // Si no es el último paso, "bajar" el siguiente dígito del dividendo original
        if (step !== steps[steps.length - 1] && (step.posicion + 1) < dividendoStr.length) {
            const nextDigitIndex = step.posicion + 1;
            const nextDigit = dividendoStr[nextDigitIndex];
            // Posición X del dígito que baja (se alinea con el dígito original)
            const xNextDigit = offsetHorizontal + nextDigitIndex * tamCel + paddingLeft;
            fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--dividendo", nextDigit, { left: `${xNextDigit}px`, top: `${currentYOffsetForSteps}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
        }
    });
    
    salida.appendChild(fragment);
}


/**
 * MODO USUAL (Simplificado): Muestra el dividendo, divisor, cociente y el resto final,
 * sin mostrar los productos ni las restas intermedias.
 * @param {Array<[string, number]>} numerosAR
 */
export function divide(numerosAR) {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const [dividendoStr, ] = numerosAR[0];
    const [divisorStr, ] = numerosAR[1];

    if (BigInt(divisorStr) === 0n) { salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division2}</p>`; return; }
    if (BigInt(dividendoStr) === 0n) { salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division1}</p>`; return; }

    const { cociente, steps } = longDivisionCore(dividendoStr, divisorStr);
    const restoFinal = steps.length > 0 ? steps[steps.length - 1].resto : dividendoStr;

    // Layout específico para el algoritmo usual (más compacto)
    const anchoIzquierdo = dividendoStr.length;
    const anchoDerecho = Math.max(divisorStr.length, cociente.length);
    const separatorWidth = 1.5;
    const totalCols = anchoIzquierdo + separatorWidth + anchoDerecho;
    const totalRows = 3; // Dividendo/Divisor/Cociente, Resto Final
    
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, totalCols, totalRows);
    const xBloqueDerecho = offsetHorizontal + (anchoIzquierdo + separatorWidth) * tamCel + paddingLeft;

    // Calculamos la altura total de la galera para el modo usual
    const galeraHeight = (totalRows - 1) * tamCel; 

    // Dibujar la parte superior (dividendo, divisor, cociente, galera)
    let yPos = drawHeader(fragment, { dividendoStr, divisorStr, cociente, tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop, xBloqueDerecho, anchoIzquierdo, anchoDerecho, separatorWidth, galeraHeight });

    // Dibujar solo el resto final (Algoritmo Usual)
    yPos += tamCel; // Espacio para el resto
    const xResto = offsetHorizontal + (dividendoStr.length - restoFinal.length) * tamCel + paddingLeft;
    for (let i = 0; i < restoFinal.length; i++) {
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--resto", restoFinal[i], { left: `${xResto + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }
    
    salida.appendChild(fragment);
}