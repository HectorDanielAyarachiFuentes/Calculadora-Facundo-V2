// =======================================================
// --- operations/modules/division.js (VERSIÓN FINAL COMPLETA) ---
// Usa la metodología BEM para las clases CSS, garantizando claridad y sin conflictos.
// `divide`: Muestra el layout clásico de la división finalizada.
// `divideExt`: Muestra el proceso completo de la división larga.
// =======================================================
"use strict";

import { calculateLayout } from '../utils/layout-calculator.js';
import { crearCelda } from '../utils/dom-helpers.js';
import { salida, errorMessages } from '../../config.js';

/**
 * Función interna que realiza el cálculo de la división larga. Es compartida
 * por `divide` y `divideExt` para no repetir código.
 * @param {string} dividendoStr - El dividendo como string.
 * @param {string} divisorStr - El divisor como string.
 * @returns {{cociente: string, steps: Array<object>}} - El cociente y los pasos del proceso.
 */
function longDivisionCore(dividendoStr, divisorStr) {
    const divisor = BigInt(divisorStr);
    const steps = [];
    let cocienteFinal = "";
    let chunk = "";
    
    for (let i = 0; i < dividendoStr.length; i++) {
        chunk += dividendoStr[i];
        const chunkBigInt = BigInt(chunk);

        if (cocienteFinal.length > 0 || chunkBigInt >= divisor) {
            const cocienteDigito = chunkBigInt / divisor;
            const producto = cocienteDigito * divisor;
            const resto = chunkBigInt - producto;

            steps.push({
                dividendoParcial: chunk,
                producto: producto.toString(),
                resto: resto.toString(),
                posicion: i
            });

            cocienteFinal += cocienteDigito.toString();
            chunk = resto.toString() === "0" ? "" : resto.toString();
        }
    }
    
    if (cocienteFinal === "") {
        cocienteFinal = "0";
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
 * MODO NORMAL: Muestra el layout clásico de la división ya resuelta.
 * @param {Array<[string, number]>} numerosAR
 */
export function divide(numerosAR) {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const [dividendoStr, ] = numerosAR[0];
    const [divisorStr, ] = numerosAR[1];

    if (BigInt(divisorStr) === 0n) { salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division2}</p>`; return; }
    if (BigInt(dividendoStr) === 0n) { salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division1}</p>`; return; }

    const cociente = (BigInt(dividendoStr) / BigInt(divisorStr)).toString();
    const resto = (BigInt(dividendoStr) % BigInt(divisorStr)).toString();
    const productoArestar = (BigInt(dividendoStr) - BigInt(resto)).toString();
    
    const anchoIzquierdo = Math.max(dividendoStr.length, productoArestar.length);
    const anchoDerecho = Math.max(divisorStr.length, cociente.length);
    const separatorWidth = 1.5;
    const totalCols = anchoIzquierdo + separatorWidth + anchoDerecho;
    const totalRows = 5;
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, totalCols, totalRows);
    
    let yPos = paddingTop;
    const xBloqueDerecho = offsetHorizontal + (anchoIzquierdo + separatorWidth) * tamCel + paddingLeft;

    for (let i = 0; i < dividendoStr.length; i++) fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--dividendo", dividendoStr[i], { left: `${offsetHorizontal + i * tamCel + paddingLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    for (let i = 0; i < divisorStr.length; i++) fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--divisor", divisorStr[i], { left: `${xBloqueDerecho + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    
    yPos += tamCel;

    const xProducto = offsetHorizontal + (anchoIzquierdo - productoArestar.length) * tamCel + paddingLeft;
    for (let i = 0; i < productoArestar.length; i++) fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", productoArestar[i], { left: `${xProducto + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    for (let i = 0; i < cociente.length; i++) fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--cociente", cociente[i], { left: `${xBloqueDerecho + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));

    yPos += tamCel;

    fragment.appendChild(crearCelda("output-grid__line", "", { left: `${offsetHorizontal}px`, top: `${yPos}px`, width: `${anchoIzquierdo * tamCel}px`, height: `2px` }));
    yPos += tamCel * 0.5;
    const xResto = offsetHorizontal + (anchoIzquierdo - resto.length) * tamCel + paddingLeft;
    for (let i = 0; i < resto.length; i++) fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--resto", resto[i], { left: `${xResto + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));

    const xLineaVertical = offsetHorizontal + anchoIzquierdo * tamCel + (separatorWidth * tamCel / 2) + paddingLeft;
    fragment.appendChild(crearCelda("output-grid__line", "", { left: `${xLineaVertical}px`, top: `${paddingTop}px`, width: `2px`, height: `${2 * tamCel}px` }));
    fragment.appendChild(crearCelda("output-grid__line", "", { left: `${xLineaVertical}px`, top: `${paddingTop + tamCel - 1}px`, width: `${anchoDerecho * tamCel}px`, height: `2px` }));
    
    salida.appendChild(fragment);
}


/**
 * MODO EXTENDIDO: Muestra el proceso de la división larga paso a paso.
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

    const anchoIzquierdo = dividendoStr.length;
    const anchoDerecho = Math.max(divisorStr.length, cociente.length);
    const separatorWidth = 1.5;
    const totalCols = anchoIzquierdo + separatorWidth + anchoDerecho;
    const totalRows = 2 + steps.length * 2.5;
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, totalCols, totalRows);
    
    let yPos = paddingTop;
    const xBloqueDerecho = offsetHorizontal + (anchoIzquierdo + separatorWidth) * tamCel + paddingLeft;

    for (let i = 0; i < dividendoStr.length; i++) fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--dividendo", dividendoStr[i], { left: `${offsetHorizontal + i * tamCel + paddingLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    for (let i = 0; i < divisorStr.length; i++) fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--divisor", divisorStr[i], { left: `${xBloqueDerecho + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    for (let i = 0; i < cociente.length; i++) fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--cociente", cociente[i], { left: `${xBloqueDerecho + i * tamCel}px`, top: `${yPos + tamCel}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));

    steps.forEach(step => {
        yPos += tamCel;
        let xOffset = step.posicion - step.producto.length + 1;
        const xProducto = offsetHorizontal + xOffset * tamCel + paddingLeft;
        for (let i = 0; i < step.producto.length; i++) fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", step.producto[i], { left: `${xProducto + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));

        const lineaLeft = offsetHorizontal + (step.posicion - step.dividendoParcial.length + 1) * tamCel + paddingLeft;
        fragment.appendChild(crearCelda("output-grid__line", "", { left: `${lineaLeft}px`, top: `${yPos + tamCel}px`, width: `${step.dividendoParcial.length * tamCel}px`, height: `2px` }));
        
        yPos += tamCel;
        xOffset = step.posicion - step.resto.length + 1;
        const xResto = offsetHorizontal + xOffset * tamCel + paddingLeft;
        for (let i = 0; i < step.resto.length; i++) fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--resto", step.resto[i], { left: `${xResto + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    });

    const xLineaVertical = offsetHorizontal + anchoIzquierdo * tamCel + (separatorWidth * tamCel / 2) + paddingLeft;
    fragment.appendChild(crearCelda("output-grid__line", "", { left: `${xLineaVertical}px`, top: `${paddingTop}px`, width: `2px`, height: `${yPos + tamCel - paddingTop}px` }));
    fragment.appendChild(crearCelda("output-grid__line", "", { left: `${xLineaVertical}px`, top: `${paddingTop + tamCel - 1}px`, width: `${anchoDerecho * tamCel}px`, height: `2px` }));
    
    salida.appendChild(fragment);
}