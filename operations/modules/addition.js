// =======================================================
// --- operations/modules/addition.js ---
// Contiene la lógica y la visualización para la operación de suma.
// =======================================================
"use strict";

import { calculateLayout } from '../utils/layout-calculator.js';
import { crearCelda, crearFlechaLlevada } from '../utils/dom-helpers.js';

// Asumimos que `salida` es una variable global accesible.
// Si no lo es, deberíamos pasarla como parámetro a la función `suma`.
const salida = document.querySelector("#salida");
const errorMessages = {
    // Definir aquí los mensajes de error relevantes si los hubiera
};

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
    
    const anchoGridEnCeldas = maxDisplayLength + 1; // +1 para el signo de suma
    const altoGridEnCeldas = numerosAR.length + 3; // N operandos + llevadas + línea + resultado

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

    for (const pos in llevadas) {
        let col = parseInt(pos);
        if (maxDecimales > 0 && col >= maxDisplayLength - maxDecimales) col++;
        let leftPos = offsetHorizontal + (col + 1) * tamCel + paddingLeft;
        let topPosLlevada = paddingTop + 0.1 * tamCel;
        fragment.appendChild(crearCelda("caja", llevadas[pos], { left: `${leftPos}px`, top: `${topPosLlevada}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente * .7}px`, color: "red", textAlign: 'center' }));
        // (La lógica de la flecha se podría simplificar o mantener si es necesaria)
    }

    // Dibujar los operandos
    let yPos = paddingTop + 1.5 * tamCel;
    numerosAR.forEach((n) => {
        let displayNum = n[0];
        if (n[1] > 0) displayNum = displayNum.slice(0, displayNum.length - n[1]) + ',' + displayNum.slice(displayNum.length - n[1]);
        let numOffset = maxDisplayLength - displayNum.length;
        for (let i = 0; i < displayNum.length; i++) {
            let cellLeft = offsetHorizontal + (numOffset + i + 1) * tamCel + paddingLeft;
            fragment.appendChild(crearCelda("caja3", displayNum[i], { left: `${cellLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`, color: '#ffff00' }));
        }
        yPos += tamCel;
    });

    // Dibujar el signo de suma, la línea y el resultado
    const signLeft = offsetHorizontal + paddingLeft;
    const signTop = yPos - tamCel;
    fragment.appendChild(crearCelda("caja", "+", { left: `${signLeft}px`, top: `${signTop}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`, color: "#ddd", textAlign: 'center' }));
    
    const lineLeft = offsetHorizontal + tamCel + paddingLeft;
    const lineWidth = (anchoGridEnCeldas - 1) * tamCel;
    fragment.appendChild(crearCelda("linea", "", { left: `${lineLeft}px`, top: `${yPos}px`, width: `${lineWidth}px`, height: `2px`, backgroundColor: "#ddd" }));
    
    yPos += tamCel * 0.2;
    let resultOffset = maxDisplayLength - resultadoConComa.length;
    for (let i = 0; i < resultadoConComa.length; i++) {
        let cellLeft = offsetHorizontal + (resultOffset + i + 1) * tamCel + paddingLeft;
        fragment.appendChild(crearCelda("caja4", resultadoConComa[i], { left: `${cellLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`, color: '#00ff00' }));
    }

    salida.appendChild(fragment);
}