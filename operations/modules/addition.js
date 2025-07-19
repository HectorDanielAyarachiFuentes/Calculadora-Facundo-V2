// =======================================================
// --- operations/modules/addition.js (VERSIÓN FINAL CORREGIDA) ---
// =======================================================
"use strict";

import { calculateLayout } from '../utils/layout-calculator.js';
import { crearCelda, crearFlechaLlevada } from '../utils/dom-helpers.js';
import { salida } from '../../config.js';

/**
 * Realiza y visualiza la operación de suma de varios operandos.
 * @param {Array<[string, number]>} numerosAR - Array de operandos parseados.
 */
export function suma(numerosAR) {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    // --- 1. CÁLCULOS DE LA OPERACIÓN ---
    let maxDecimales = 0;
    numerosAR.forEach(n => maxDecimales = Math.max(maxDecimales, n[1]));

    const operandosBigIntStr = numerosAR.map(n => n[0].padEnd(n[0].length + maxDecimales - n[1], '0'));
    const longitudMaxOperandos = Math.max(...operandosBigIntStr.map(n => n.length));
    const operandosPadded = operandosBigIntStr.map(n => n.padStart(longitudMaxOperandos, '0'));

    let total = 0n;
    operandosPadded.forEach(n => total += BigInt(n));
    let resultadoRaw = total.toString();

    let resultadoConComa = resultadoRaw;
    if (maxDecimales > 0) {
        if (resultadoConComa.length <= maxDecimales) {
            resultadoConComa = '0'.repeat(maxDecimales - resultadoConComa.length + 1) + resultadoConComa;
        }
        resultadoConComa = resultadoConComa.slice(0, resultadoConComa.length - maxDecimales) + ',' + resultadoConComa.slice(resultadoConComa.length - maxDecimales);
    }
    if (resultadoConComa.includes(',')) {
        resultadoConComa = resultadoConComa.replace(/0+$/, '').replace(/,$/, '');
    }

    // --- 2. CÁLCULO DEL LAYOUT ---
    let maxDisplayLength = 0;
    numerosAR.forEach((n) => {
        let dispNum = n[0];
        if (n[1] > 0) dispNum = dispNum.slice(0, dispNum.length - n[1]) + ',' + dispNum.slice(dispNum.length - n[1]);
        maxDisplayLength = Math.max(maxDisplayLength, dispNum.length);
    });
    maxDisplayLength = Math.max(maxDisplayLength, resultadoConComa.length);
    
    const anchoGridEnCeldas = maxDisplayLength + 1;
    const altoGridEnCeldas = numerosAR.length + 3;
    
    // CORRECCIÓN: Usamos las variables correctas devueltas por calculateLayout
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, anchoGridEnCeldas, altoGridEnCeldas);
    
    // --- 3. LÓGICA DE VISUALIZACIÓN ---

    // Calcular y dibujar las llevadas
    let llevadas = {};
    let carry = 0;
    for (let i = longitudMaxOperandos - 1; i >= 0; i--) {
        let sumaColumna = carry;
        operandosPadded.forEach(n => sumaColumna += parseInt(n[i] || '0'));
        carry = Math.floor(sumaColumna / 10);
        if (carry > 0) {
            let posLlevada = i - 1 + (maxDisplayLength - longitudMaxOperandos);
            if (maxDecimales > 0 && i < longitudMaxOperandos - maxDecimales) posLlevada--;
            if (posLlevada >= 0) llevadas[posLlevada] = carry.toString();
        }
    }

   // Y reemplázalo con este bloque corregido:
for (const pos in llevadas) {
    let col = parseInt(pos);
    if (maxDecimales > 0 && col >= maxDisplayLength - maxDecimales) col++;
    
    let leftPos = offsetHorizontal + (col + 1) * tamCel + paddingLeft;
    let topPosLlevada = paddingTop + 0.1 * tamCel;
    
    // Dibujar el número de la llevada
    fragment.appendChild(
        crearCelda(
            "output-grid__cell output-grid__cell--resto", 
            llevadas[pos], 
            { 
                left: `${leftPos}px`, 
                top: `${topPosLlevada}px`, 
                width: `${tamCel}px`, 
                height: `${tamCel}px`, 
                fontSize: `${tamFuente * 0.7}px`, 
                textAlign: 'center' 
            }
        )
    );

    // --- ¡AQUÍ ESTÁ LA MAGIA! ---
    // Descomentamos y ajustamos la llamada para dibujar la flecha.
    const topFlecha = topPosLlevada + tamCel * 0.8;
    const altoFlecha = (paddingTop + 1.5 * tamCel) - topFlecha; // Calcula la altura hasta la primera fila de números
    const anchoFlecha = tamCel * 0.8;
    const leftFlecha = leftPos + (tamCel - anchoFlecha) / 2; // Centra la flecha en la celda

    fragment.appendChild(
        crearFlechaLlevada(leftFlecha, topFlecha, anchoFlecha, altoFlecha)
    );
}
    // Dibujar los operandos
    let yPos = paddingTop + 1.5 * tamCel;
    numerosAR.forEach((n) => {
        let displayNum = n[0];
        if (n[1] > 0) displayNum = displayNum.slice(0, displayNum.length - n[1]) + ',' + displayNum.slice(displayNum.length - n[1]);
        let numOffset = maxDisplayLength - displayNum.length;
        for (let i = 0; i < displayNum.length; i++) {
            // CORRECCIÓN: Usamos paddingLeft
            let cellLeft = offsetHorizontal + (numOffset + i + 1) * tamCel + paddingLeft;
            // Usamos las nuevas clases CSS
            fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--dividendo", displayNum[i], { left: `${cellLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
        }
        yPos += tamCel;
    });

    // Dibujar el signo de suma, la línea y el resultado
    const signLeft = offsetHorizontal + paddingLeft;
    const signTop = yPos - tamCel;
    fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", "+", { left: `${signLeft}px`, top: `${signTop}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`, textAlign: 'center' }));
    
    const lineLeft = offsetHorizontal + tamCel + paddingLeft;
    const lineWidth = (anchoGridEnCeldas - 1) * tamCel;
    fragment.appendChild(crearCelda("output-grid__line", "", { left: `${lineLeft}px`, top: `${yPos}px`, width: `${lineWidth}px`, height: `2px` }));
    
    yPos += tamCel * 0.2;
    let resultOffset = maxDisplayLength - resultadoConComa.length;
    for (let i = 0; i < resultadoConComa.length; i++) {
        let cellLeft = offsetHorizontal + (resultOffset + i + 1) * tamCel + paddingLeft;
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--cociente", resultadoConComa[i], { left: `${cellLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    salida.appendChild(fragment);
}