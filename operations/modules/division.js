// =======================================================
// --- operations/modules/division.js (VERSIÓN CON ALINEAMIENTO EXTENDIDO CORREGIDO) ---
// Contiene la lógica y la visualización para la operación de división.
// `divide`: Muestra el proceso completo de la división larga (extendida).
// `divideExt`: Muestra el layout clásico de la división finalizada (usual).
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
        } else {
            if (cocienteFinal.length > 0) {
                 steps.push({
                    dividendoParcial: chunk,
                    producto: "0",
                    resto: chunk,
                    posicion: i
                });
            }
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
 * Dibuja la parte superior de la división (dividendo, divisor, cociente y la galera).
 * Esta función es compartida por ambos modos de división.
 * @param {DocumentFragment} fragment - Fragmento del DOM para añadir elementos.
 * @param {object} params - Objeto con parámetros de dibujado.
 * @returns {number} La posición Y actual después de dibujar la cabecera.
 */
function drawHeader(fragment, { dividendoStr, divisorStr, cociente, tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop, xBloqueDerecho, anchoIzquierdo, anchoDerecho, separatorWidth, galeraHeight }) {
    
    // Posiciones Y de las diferentes filas lógicas
    const yPosDividendo = paddingTop;       // Fila 0: Para el dividendo y la parte superior de la galera
    const yPosDivisor = paddingTop + tamCel; // Fila 1: Para el divisor (una celda más abajo que el dividendo/línea horizontal)
    const yPosCociente = paddingTop + (tamCel * 2); // Fila 2: Para el cociente (dos celdas más abajo)

    // Fila 0: Dividendo
    for (let i = 0; i < dividendoStr.length; i++) {
        fragment.appendChild(crearCelda(
            "output-grid__cell output-grid__cell--dividendo", 
            dividendoStr[i], 
            { 
                left: `${offsetHorizontal + i * tamCel + paddingLeft}px`, 
                top: `${yPosDividendo}px`, 
                width: `${tamCel}px`, 
                height: `${tamCel}px`, 
                fontSize: `${tamFuente}px` 
            }
        ));
    }
    
    // "La galera" (líneas de división)
    const xLineaVertical = offsetHorizontal + anchoIzquierdo * tamCel + (separatorWidth / 2) * tamCel + paddingLeft;
    const xEndOfRightBlock = xBloqueDerecho + anchoDerecho * tamCel;
    const anchoLineasHorizontales = xEndOfRightBlock - xLineaVertical;

    // Línea vertical: Debe empezar en la misma fila que el dividendo (yPosDividendo) y extenderse hacia abajo.
    fragment.appendChild(crearCelda(
        "output-grid__line", 
        "", 
        { 
            left: `${xLineaVertical}px`, 
            top: `${yPosDividendo}px`, 
            width: `2px`, 
            height: `${galeraHeight}px` 
        }
    ));
    
    // Línea horizontal superior: Debe empezar en la misma posición X y Y que la línea vertical, y extenderse a la derecha.
    fragment.appendChild(crearCelda(
        "output-grid__line", 
        "", 
        { 
            left: `${xLineaVertical}px`, 
            top: `${yPosDividendo}px`, 
            width: `${anchoLineasHorizontales}px`, 
            height: `2px` 
        }
    ));
    
    // Fila 1: Divisor (colocado debajo de la línea horizontal y a la derecha de la vertical)
    for (let i = 0; i < divisorStr.length; i++) {
        fragment.appendChild(crearCelda(
            "output-grid__cell output-grid__cell--divisor", 
            divisorStr[i], 
            { 
                left: `${xBloqueDerecho + i * tamCel}px`, 
                top: `${yPosDivisor}px`, 
                width: `${tamCel}px`, 
                height: `${tamCel}px`, 
                fontSize: `${tamFuente}px` 
            }
        ));
    }
    
    // Fila 2: Cociente (debajo del divisor)
    for (let i = 0; i < cociente.length; i++) {
        fragment.appendChild(crearCelda(
            "output-grid__cell output-grid__cell--cociente", 
            cociente[i], 
            { 
                left: `${xBloqueDerecho + i * tamCel}px`, 
                top: `${yPosCociente}px`, 
                width: `${tamCel}px`, 
                height: `${tamCel}px`, 
                fontSize: `${tamFuente}px` 
            }
        ));
    }

    return yPosCociente;
}

/**
 * `divide` (DIVISIÓN EXTENDIDA): Muestra el proceso de la división larga paso a paso.
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

    const { cociente, steps } = longDivisionCore(dividendoStr, divisorStr);
    
    // Cálculos de layout:
    const anchoIzquierdo = dividendoStr.length + 1; // Para el signo menos
    const anchoDerecho = Math.max(divisorStr.length, cociente.length) + 1; // +1 para padding
    const separatorWidth = 2; // Espacio entre dividendo y galera
    
    const totalCols = anchoIzquierdo + separatorWidth + anchoDerecho;
    const totalRows = 3 + (steps.length * 2); // 3 filas de encabezado + 2 por cada paso
    
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, totalCols, totalRows);
    
    const xBloqueDerecho = offsetHorizontal + (anchoIzquierdo + separatorWidth) * tamCel + paddingLeft;

    // Altura de la galera para la división extendida: Cubre todas las filas.
    const galeraHeight = totalRows * tamCel; 

    let currentYOffsetForSteps = drawHeader(fragment, { 
        dividendoStr, 
        divisorStr, 
        cociente, 
        tamCel, 
        tamFuente, 
        offsetHorizontal, 
        paddingLeft, 
        paddingTop, 
        xBloqueDerecho, 
        anchoIzquierdo, 
        anchoDerecho, 
        separatorWidth, 
        galeraHeight 
    });
    
    // Dibujar los pasos de la resta
    steps.forEach((step, stepIndex) => {
        currentYOffsetForSteps += tamCel; 
        
        // CORRECCIÓN CLAVE: El `producto` y el `resto` se alinean con la posición final
        // del `dividendoParcial`.
        const endPositionOfPartialDividend = step.posicion;
        
        // La posición X del producto se calcula desde la derecha.
        const xProducto = offsetHorizontal + (endPositionOfPartialDividend - step.producto.length + 1) * tamCel + paddingLeft;
        
        // Signo menos, alineado a la izquierda del producto
        fragment.appendChild(crearCelda(
            "output-grid__cell output-grid__cell--producto", 
            "-", 
            { 
                left: `${xProducto - tamCel}px`, 
                top: `${currentYOffsetForSteps}px`, 
                width: `${tamCel}px`, 
                height: `${tamCel}px`, 
                fontSize: `${tamFuente}px` 
            }
        ));

        // Dígitos del producto
        for (let i = 0; i < step.producto.length; i++) {
            fragment.appendChild(crearCelda(
                "output-grid__cell output-grid__cell--producto", 
                step.producto[i], 
                { 
                    left: `${xProducto + i * tamCel}px`, 
                    top: `${currentYOffsetForSteps}px`, 
                    width: `${tamCel}px`, 
                    height: `${tamCel}px`, 
                    fontSize: `${tamFuente}px` 
                }
            ));
        }

        // Línea de resta (debajo del producto)
        fragment.appendChild(crearCelda(
            "output-grid__line", 
            "", 
            { 
                left: `${xProducto}px`, 
                top: `${currentYOffsetForSteps + tamCel}px`, 
                width: `${step.producto.length * tamCel}px`, 
                height: `2px` 
            }
        ));
        
        currentYOffsetForSteps += tamCel; 

        // La posición X del resto se calcula desde la derecha.
        const xResto = offsetHorizontal + (endPositionOfPartialDividend - step.resto.length + 1) * tamCel + paddingLeft;
        
        // Dígitos del resto parcial
        for (let i = 0; i < step.resto.length; i++) {
            fragment.appendChild(crearCelda(
                "output-grid__cell output-grid__cell--resto", 
                step.resto[i], 
                { 
                    left: `${xResto + i * tamCel}px`, 
                    top: `${currentYOffsetForSteps}px`, 
                    width: `${tamCel}px`, 
                    height: `${tamCel}px`, 
                    fontSize: `${tamFuente}px` 
                }
            ));
        }

        // Si no es el último paso, "bajar" el siguiente dígito del dividendo original
        if (stepIndex < steps.length - 1 && (step.posicion + 1) < dividendoStr.length) {
            const nextDigitIndex = step.posicion + 1;
            const nextDigit = dividendoStr[nextDigitIndex];
            const xNextDigit = offsetHorizontal + nextDigitIndex * tamCel + paddingLeft;
            fragment.appendChild(crearCelda(
                "output-grid__cell output-grid__cell--dividendo", 
                nextDigit, 
                { 
                    left: `${xNextDigit}px`, 
                    top: `${currentYOffsetForSteps}px`, // Se baja en la misma fila del resto
                    width: `${tamCel}px`, 
                    height: `${tamCel}px`, 
                    fontSize: `${tamFuente}px` 
                }
            ));
        }
    });
    
    salida.appendChild(fragment);
}

/**
 * `divideExt` (DIVISIÓN SIMPLIFICADA): Muestra el dividendo, divisor, cociente y el resto final.
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

    const { cociente, steps } = longDivisionCore(dividendoStr, divisorStr);
    const restoFinal = steps.length > 0 ? steps[steps.length - 1].resto : dividendoStr;

    // Layout para el modo usual (simplificado):
    const anchoIzquierdo = dividendoStr.length; // No se necesita espacio para signo menos
    const anchoDerecho = Math.max(divisorStr.length, cociente.length) + 1; // +1 para padding
    const separatorWidth = 2; // Espacio entre dividendo y galera
    
    const totalCols = anchoIzquierdo + separatorWidth + anchoDerecho;
    const totalRows = 4; // Dividendo, Divisor, Cociente, Resto Final
    
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, totalCols, totalRows);
    
    const xBloqueDerecho = offsetHorizontal + (anchoIzquierdo + separatorWidth) * tamCel + paddingLeft;

    // Altura de la galera para el modo SIMPLIFICADO: Cubre solo las 3 primeras filas.
    const galeraHeight = 3 * tamCel; 

    let yPos = drawHeader(fragment, { 
        dividendoStr, 
        divisorStr, 
        cociente, 
        tamCel, 
        tamFuente, 
        offsetHorizontal, 
        paddingLeft, 
        paddingTop, 
        xBloqueDerecho, 
        anchoIzquierdo, 
        anchoDerecho, 
        separatorWidth, 
        galeraHeight 
    });

    // Dibujar solo el resto final (Algoritmo Usual)
    yPos += tamCel; 
    const xResto = offsetHorizontal + (dividendoStr.length - restoFinal.length) * tamCel + paddingLeft;
    for (let i = 0; i < restoFinal.length; i++) {
        fragment.appendChild(crearCelda(
            "output-grid__cell output-grid__cell--resto", 
            restoFinal[i], 
            { 
                left: `${xResto + i * tamCel}px`, 
                top: `${yPos}px`, 
                width: `${tamCel}px`, 
                height: `${tamCel}px`, 
                fontSize: `${tamFuente}px` 
            }
        ));
    }
    
    salida.appendChild(fragment);
}