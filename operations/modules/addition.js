// =======================================================
// --- operations/modules/addition.js (VISIÓN PEDAGÓGICA FINAL) ---
// =======================================================
"use strict";

import { calculateLayout } from '../utils/layout-calculator.js';
import { crearCelda, crearFlechaLlevada, esperar } from '../utils/dom-helpers.js';
import { salida } from '../../config.js';

/**
 * Realiza la suma de forma interactiva. Al final, deja una vista estática
 * que muestra el resultado, las llevadas del proceso y las sumas
 * totales de cada columna.
 * @param {Array<[string, number]>} numerosAR - Array de operandos parseados.
 */
export async function suma(numerosAR) {
    salida.innerHTML = "";

    // --- 1. CÁLCULOS Y LAYOUT (CON AJUSTE DE ALTURA) ---
    let maxDecimales = 0;
    numerosAR.forEach(n => maxDecimales = Math.max(maxDecimales, n[1]));
    const operandosBigIntStr = numerosAR.map(n => n[0].padEnd(n[0].length + maxDecimales - n[1], '0'));
    let longitudMaxOperandos = Math.max(...operandosBigIntStr.map(n => n.length));
    let total = 0n;
    operandosBigIntStr.forEach(n => total += BigInt(n));
    let resultadoRaw = total.toString();
    const longitudMaximaTotal = Math.max(longitudMaxOperandos, resultadoRaw.length);
    const operandosPadded = operandosBigIntStr.map(n => n.padStart(longitudMaximaTotal, '0'));
    
    // ¡AJUSTE CLAVE! Añadimos una fila extra para las sumas intermedias.
    const anchoGridEnCeldas = longitudMaximaTotal + 1;
    const altoGridEnCeldas = numerosAR.length + 4; // Operandos + Sumas + Llevadas + Línea + Resultado
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, anchoGridEnCeldas, altoGridEnCeldas);
    
    // --- 2. DIBUJO DE ELEMENTOS ESTÁTICOS ---
    const fragmentEstatico = document.createDocumentFragment();
    
    // ¡AJUSTE CLAVE! Los operandos empiezan más abajo para dejar espacio a las 2 filas superiores.
    let yPos = paddingTop + 2.5 * tamCel; 
    
    operandosPadded.forEach((n) => {
        for (let i = 0; i < n.length; i++) {
            let cellLeft = offsetHorizontal + (i + 1) * tamCel + paddingLeft;
            fragmentEstatico.appendChild(crearCelda("output-grid__cell output-grid__cell--dividendo", n[i], { left: `${cellLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
        }
        yPos += tamCel;
    });
    const signLeft = offsetHorizontal + paddingLeft;
    const signTop = yPos - tamCel;
    fragmentEstatico.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", "+", { left: `${signLeft}px`, top: `${signTop}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`, textAlign: 'center' }));
    const lineLeft = offsetHorizontal + tamCel + paddingLeft;
    const lineWidth = (anchoGridEnCeldas - 1) * tamCel;
    fragmentEstatico.appendChild(crearCelda("output-grid__line", "", { left: `${lineLeft}px`, top: `${yPos}px`, width: `${lineWidth}px`, height: `2px` }));
    salida.appendChild(fragmentEstatico);

    // --- 3. LÓGICA DE VISUALIZACIÓN INTERACTIVA ---
    let carry = 0;
    const yPosResultado = yPos + tamCel * 0.2;
    
    // ¡AJUSTE CLAVE! Definimos las posiciones de las dos filas superiores.
    const topPosSumaIntermedia = paddingTop + 0.1 * tamCel; // Fila superior para '17'
    const topPosLlevada = paddingTop + 1.1 * tamCel;      // Fila inferior para '1' y la flecha

    const sumasIntermediasParaMostrarAlFinal = [];
    
    for (let i = longitudMaximaTotal - 1; i >= 0; i--) {
        let sumaColumna = carry;
        operandosPadded.forEach(n => sumaColumna += parseInt(n[i] || '0'));
        
        const sumaStr = sumaColumna.toString();
        const digitoResultado = sumaColumna % 10;
        const newCarry = Math.floor(sumaColumna / 10);

        // PASO 1: Mostrar la suma intermedia ('17') en la fila SUPERIOR.
        const xPosColumna = offsetHorizontal + (i + 1) * tamCel + paddingLeft;
        const celdaSumaIntermedia = crearCelda(
            "output-grid__cell output-grid__cell--suma-intermedia",
            sumaStr,
            { left: `${xPosColumna + tamCel * (1 - sumaStr.length)}px`, top: `${topPosSumaIntermedia}px`, width: `${tamCel * sumaStr.length}px`, height: `${tamCel}px`, fontSize: `${tamFuente * 0.9}px` }
        );
        salida.appendChild(celdaSumaIntermedia);
        await esperar(1500);

        // PASO 2: Ocultar la suma intermedia y guardarla para el final.
        celdaSumaIntermedia.style.transition = 'opacity 0.3s ease-in-out';
        celdaSumaIntermedia.style.opacity = '0';
        sumasIntermediasParaMostrarAlFinal.unshift(celdaSumaIntermedia);
        await esperar(300);

        // PASO 3: Mostrar el dígito del resultado.
        const celdaResultado = crearCelda("output-grid__cell output-grid__cell--cociente", digitoResultado.toString(), { left: `${xPosColumna}px`, top: `${yPosResultado}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` });
        salida.appendChild(celdaResultado);

        // PASO 4: Mostrar la llevada ('1') y su flecha en la SEGUNDA fila superior.
        if (newCarry > 0) {
            const carryStr = newCarry.toString();
            const colLlevada = i - 1;
            const leftBase = offsetHorizontal + (colLlevada + 1) * tamCel + paddingLeft;
            // Se crea en la posición `topPosLlevada`.
            const numeroLlevada = crearCelda("output-grid__cell output-grid__cell--resto", carryStr, { left: `${leftBase}px`, top: `${topPosLlevada}px`, width: `${tamCel * carryStr.length}px`, height: `${tamCel}px`, fontSize: `${tamFuente * 0.7}px`, textAlign: 'center' });
            
            // ¡AJUSTE CLAVE! La flecha ahora empieza más abajo y apunta a la fila de operandos.
            const topFlecha = topPosLlevada + tamCel * 0.8;
            const altoFlecha = (paddingTop + 2.5 * tamCel) - topFlecha; 
            const anchoFlecha = tamCel * 0.8;
            const leftFlecha = leftBase + (tamCel * carryStr.length - anchoFlecha); 
            const flecha = crearFlechaLlevada(leftFlecha, topFlecha, anchoFlecha, altoFlecha);
            
            salida.appendChild(numeroLlevada);
            salida.appendChild(flecha);
        }

        carry = newCarry;
        await esperar(500);
    }

    if (carry > 0) {
        let xPosFinal = offsetHorizontal + paddingLeft;
        salida.appendChild(crearCelda("output-grid__cell output-grid__cell--cociente", carry.toString(), { left: `${xPosFinal}px`, top: `${yPosResultado}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    // --- 4. PREPARACIÓN DE LA VISTA FINAL ESTÁTICA ---
    await esperar(500);

    // Simplemente volvemos a mostrar las sumas intermedias.
    // Las llevadas ('1' y flechas) ya están visibles y se quedan.
    sumasIntermediasParaMostrarAlFinal.forEach(el => {
        el.style.transition = 'opacity 0.5s ease-in';
        el.style.opacity = '1';
    });
}