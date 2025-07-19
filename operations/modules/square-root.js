// =======================================================
// --- operations/modules/square-root.js (VERSIÓN FINAL CON COLORES CORREGIDOS) ---
// =======================================================
"use strict";

import { crearCelda } from '../utils/dom-helpers.js'; // Necesitamos crearCelda
import { calculateLayout } from '../utils/layout-calculator.js'; // Para calcular tamaño de fuente y centrado
import { salida, display, errorMessages } from '../../config.js'; // Importar display también

/**
 * Realiza y visualiza el cálculo de la raíz cuadrada.
 */
export function raizCuadrada() {
    salida.innerHTML = "";
    let hadError = false;
    const entrada = display.innerHTML;

    if (/[+\-x/]/.test(entrada)) {
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.invalidSqrtInput}</p>`; hadError = true;
    } else if (isNaN(parseInt(entrada)) || entrada.includes(',')) {
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.integerSqrtRequired}</p>`; hadError = true;
    } else {
        const numero = parseInt(entrada, 10);
        if (numero < 0) {
            salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.negativeSqrt}</p>`; hadError = true;
        } else if (numero === 0) {
            salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.raiz1}</p>`; // Este mensaje podría no ser un error
            // Si quieres que el 0 se muestre como un resultado normal, cámbialo a:
            // const { tamCel, tamFuente } = calculateLayout(salida, 1, 1); // Layout para un solo elemento
            // salida.appendChild(crearCelda("output-grid__cell output-grid__cell--cociente", "0", {
            //     width: "100%", height: "100%", fontSize: `${tamFuente}px`
            // }));
        } else {
            const resultado = Math.sqrt(numero);
            if (resultado % 1 !== 0) {
                salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.nonExactSqrt}</p>`; hadError = true;
            } else {
                // CORRECCIÓN: Usamos calculateLayout para el tamaño
                // El layout para un solo número centrado es 1 columna y 1 fila.
                const { tamCel, tamFuente } = calculateLayout(salida, resultado.toString().length, 1);

                // CORRECCIÓN: Creamos la celda con crearCelda y las clases BEM
                const resultadoCelda = crearCelda(
                    "output-grid__cell output-grid__cell--cociente", // Clase para el resultado principal (color verde)
                    resultado.toString(),
                    {
                        // Para centrar un solo elemento en el contenedor de salida
                        position: 'relative', // Para centrarlo con flexbox en salida (si aplica)
                        width: '100%', // Ocupa todo el ancho
                        height: '100%', // Ocupa todo el alto
                        fontSize: `${tamFuente}px`, // Tamaño de fuente calculado
                        display: 'flex',          // Para centrar el contenido DENTRO de esta celda
                        justifyContent: 'center',
                        alignItems: 'center'
                    }
                );
                salida.appendChild(resultadoCelda);
            }
        }
    }

    // Las llamadas a HistoryManager y actualizarEstadoDivisionUI están en main.js
}