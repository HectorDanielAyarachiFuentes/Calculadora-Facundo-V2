// =======================================================
// --- operations/modules/addition.js (VERSIÓN FINAL Y DEFINITIVA) ---
// =======================================================
"use strict";

import { calculateLayout } from '../utils/layout-calculator.js';
import { crearCelda, crearFlechaLlevada, esperar } from '../utils/dom-helpers.js';
import { salida } from '../../config.js';

let sumaAnimationLoopId = null;

async function startCarryLoopAnimation(elements) {
    if (sumaAnimationLoopId) clearTimeout(sumaAnimationLoopId);
    if (elements.length === 0) return;

    const loop = async () => {
        for (const element of elements) {
            if (element.tagName.toLowerCase() === 'svg') {
                const path = element.querySelector('path[d^="M"]');
                if (path) {
                    const length = path.getTotalLength();
                    path.style.transition = 'none';
                    path.style.strokeDashoffset = length;
                    path.offsetHeight;
                    path.style.transition = 'stroke-dashoffset .8s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
                    path.style.strokeDashoffset = '0';
                }
            } else {
                element.classList.add('pulse');
                setTimeout(() => element.classList.remove('pulse'), 500);
            }
            await esperar(200);
        }
        
        sumaAnimationLoopId = setTimeout(loop, 3000);
    };

    loop();
}


/**
 * Realiza y visualiza la operación de suma de varios operandos.
 * @param {Array<[string, number]>} numerosAR - Array de operandos parseados.
 */
export function suma(numerosAR) {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();
    if (sumaAnimationLoopId) clearTimeout(sumaAnimationLoopId);

    // --- 1. CÁLCULOS DE LA OPERACIÓN ---
    let maxDecimales = 0;
    numerosAR.forEach(n => maxDecimales = Math.max(maxDecimales, n[1]));

    const operandosBigIntStr = numerosAR.map(n => n[0].padEnd(n[0].length + maxDecimales - n[1], '0'));
    let longitudMaxOperandos = Math.max(...operandosBigIntStr.map(n => n.length));
    
    let total = 0n;
    operandosBigIntStr.forEach(n => total += BigInt(n));
    let resultadoRaw = total.toString();
    
    // La longitud máxima ahora se basa en el resultado si es más largo
    const longitudMaximaTotal = Math.max(longitudMaxOperandos, resultadoRaw.length);

    const operandosPadded = operandosBigIntStr.map(n => n.padStart(longitudMaximaTotal, '0'));
    const resultadoPadded = resultadoRaw.padStart(longitudMaximaTotal, '0');

    // --- 2. CÁLCULO DEL LAYOUT ---
    const anchoGridEnCeldas = longitudMaximaTotal + 1; // +1 para el signo '+'
    const altoGridEnCeldas = numerosAR.length + 3; // Operandos + llevadas + línea + resultado
    
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, anchoGridEnCeldas, altoGridEnCeldas);
    
    // --- 3. LÓGICA DE VISUALIZACIÓN ---
    const llevadas = {};
    let carry = 0;
    // --- ¡CORRECCIÓN CLAVE EN EL BUCLE DE LLEVADAS! ---
    // El bucle ahora itera sobre la longitud MÁXIMA total.
    for (let i = longitudMaximaTotal - 1; i >= 0; i--) {
        let sumaColumna = carry;
        operandosPadded.forEach(n => sumaColumna += parseInt(n[i] || '0'));
        carry = Math.floor(sumaColumna / 10);
        
        if (carry > 0) {
            // La clave es la columna (desde la izquierda) donde va la llevada
            llevadas[i - 1] = carry.toString();
        }
    }

    // Dibujar las llevadas y las flechas
    for (const posStr in llevadas) {
        const col = parseInt(posStr);
        if (col < -1) continue; // Ignorar llevadas fuera del área visible
        const carryStr = llevadas[posStr];
        
        const leftBase = offsetHorizontal + (col + 1) * tamCel + paddingLeft;
        const topPosLlevada = paddingTop + 0.1 * tamCel;
        
        const numeroLlevada = crearCelda(
            "output-grid__cell output-grid__cell--resto loop-anim-element",
            carryStr, 
            { 
                left: `${leftBase}px`, top: `${topPosLlevada}px`, width: `${tamCel * carryStr.length}px`, 
                height: `${tamCel}px`, fontSize: `${tamFuente * 0.7}px`, textAlign: 'center' 
            }
        );
        fragment.appendChild(numeroLlevada);

        const topFlecha = topPosLlevada + tamCel * 0.8;
        const altoFlecha = (paddingTop + 1.5 * tamCel) - topFlecha;
        const anchoFlecha = tamCel * 0.8;
        const leftFlecha = leftBase + (tamCel * carryStr.length - anchoFlecha); 

        const flecha = crearFlechaLlevada(leftFlecha, topFlecha, anchoFlecha, altoFlecha);
        flecha.classList.add('loop-anim-element');
        fragment.appendChild(flecha);
    }

    // Dibujar los operandos, alineados a la derecha
    let yPos = paddingTop + 1.5 * tamCel;
    operandosPadded.forEach((n) => {
        for (let i = 0; i < n.length; i++) {
            let cellLeft = offsetHorizontal + (i + 1) * tamCel + paddingLeft;
            fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--dividendo", n[i], { left: `${cellLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
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
    for (let i = 0; i < resultadoPadded.length; i++) {
        let cellLeft = offsetHorizontal + (i + 1) * tamCel + paddingLeft;
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--cociente", resultadoPadded[i], { left: `${cellLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    salida.appendChild(fragment);
    
    const elementsToLoop = salida.querySelectorAll('.loop-anim-element');
    startCarryLoopAnimation(elementsToLoop);
}