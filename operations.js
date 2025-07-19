// =======================================================
// --- operations.js ---
// Contiene las funciones de cálculo y renderizado visual
// de las operaciones matemáticas (suma, resta, etc.).
// La función 'resta' incluye animaciones secuenciales.
// =======================================================
"use strict";

/**
 * Parsea la cadena de entrada en un array de operandos.
 * @param {string} entradaStr - La cadena del display.
 * @param {string} operador - El operador de la operación.
 * @returns {Array<[string, number]>} Un array de tuplas [valorSinComa, numDecimales].
 */
function parsearNumeros(entradaStr, operador) {
    const numAr = entradaStr.split(operador);
    return numAr.map(numStr => {
        let limpio = numStr.replace(/^0+(?!\b|,)/, '');
        if (limpio === '') limpio = '0';
        if (limpio.startsWith(',')) limpio = '0' + limpio;

        const p = limpio.indexOf(",") + 1;
        const d = p > 0 ? limpio.length - p : 0;
        const v = limpio.replace(",", "");
        return [v || "0", d];
    });
}

/**
 * Función de utilidad para crear una pausa. Usada en funciones asíncronas.
 * @param {number} ms - Milisegundos a esperar.
 * @returns {Promise<void>}
 */
const esperar = ms => new Promise(res => setTimeout(res, ms));


/**
 * Realiza y visualiza la operación de suma.
 * @param {Array<[string, number]>} numerosAR - Los operandos.
 */
function suma(numerosAR) {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const salidaRect = salida.getBoundingClientRect();
    const salidaPaddingLeft = parseFloat(getComputedStyle(salida).paddingLeft);
    const salidaPaddingRight = parseFloat(getComputedStyle(salida).paddingRight);
    const salidaPaddingTop = parseFloat(getComputedStyle(salida).paddingTop);
    const salidaPaddingBottom = parseFloat(getComputedStyle(salida).paddingBottom);
    const availableWidth = salidaRect.width - salidaPaddingLeft - salidaPaddingRight;
    const availableHeight = salidaRect.height - salidaPaddingTop - salidaPaddingBottom;

    let maxDecimales = 0;
    numerosAR.forEach(n => maxDecimales = Math.max(maxDecimales, n[1]));

    let operandosBigIntStr = numerosAR.map(n => n[0].padEnd(n[0].length + maxDecimales - n[1], '0'));
    let longitudMaxOperandos = Math.max(...operandosBigIntStr.map(n => n.length));
    let operandosPadded = operandosBigIntStr.map(n => n.padStart(longitudMaxOperandos, '0'));

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

    let maxDisplayLength = 0;
    numerosAR.forEach((n) => {
        let dispNum = n[0];
        if (n[1] > 0) dispNum = dispNum.slice(0, dispNum.length - n[1]) + ',' + dispNum.slice(dispNum.length - n[1]);
        maxDisplayLength = Math.max(maxDisplayLength, dispNum.length);
    });
    maxDisplayLength = Math.max(maxDisplayLength, resultadoConComa.length);
    const anchoGridEnCeldas = maxDisplayLength + 1;
    const altoGridEnCeldas = numerosAR.length + 3;

    const tamCel = Math.floor(Math.min(availableWidth / anchoGridEnCeldas, availableHeight / altoGridEnCeldas));
    const tamFuente = tamCel * multiplicadorTamFuente;

    const totalBlockWidth = anchoGridEnCeldas * tamCel;
    const offsetHorizontal = (availableWidth - totalBlockWidth) / 2;

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
        let leftPos = offsetHorizontal + (col + 1) * tamCel + salidaPaddingLeft;
        let topPosLlevada = salidaPaddingTop + 0.1 * tamCel;
        fragment.appendChild(crearCelda("caja", llevadas[pos], { left: `${leftPos}px`, top: `${topPosLlevada}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente * .7}px`, color: "red", textAlign: 'center' }));
        let topFlecha = (1.5 + numerosAR.length - 1 + 0.5) * tamCel + salidaPaddingTop;
        let altoFlecha = topFlecha - topPosLlevada - tamCel * 0.1;
        let anchoFlecha = tamCel * .7;
        let leftFlecha = leftPos + tamCel * 0.15;
        fragment.appendChild(crearFlechaLlevada(leftFlecha, topPosLlevada + tamCel * 0.8, anchoFlecha, altoFlecha));
    }

    let yPos = salidaPaddingTop + 1.5 * tamCel;
    numerosAR.forEach((n) => {
        let displayNum = n[0];
        if (n[1] > 0) displayNum = displayNum.slice(0, displayNum.length - n[1]) + ',' + displayNum.slice(displayNum.length - n[1]);
        let numOffset = maxDisplayLength - displayNum.length;
        for (let i = 0; i < displayNum.length; i++) {
            let cellLeft = offsetHorizontal + (numOffset + i + 1) * tamCel + salidaPaddingLeft;
            fragment.appendChild(crearCelda("caja3", displayNum[i], { left: `${cellLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`, color: '#ffff00' }));
        }
        yPos += tamCel;
    });

    const signLeft = offsetHorizontal + salidaPaddingLeft;
    const signTop = yPos - tamCel;
    fragment.appendChild(crearCelda("caja", "+", { left: `${signLeft}px`, top: `${signTop}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`, color: "#ddd", textAlign: 'center' }));
    
    const lineLeft = offsetHorizontal + tamCel + salidaPaddingLeft;
    const lineWidth = (anchoGridEnCeldas - 1) * tamCel;
    fragment.appendChild(crearCelda("linea", "", { left: `${lineLeft}px`, top: `${yPos}px`, width: `${lineWidth}px`, height: `2px`, backgroundColor: "#ddd" }));
    
    yPos += tamCel * 0.2;
    let resultOffset = maxDisplayLength - resultadoConComa.length;
    for (let i = 0; i < resultadoConComa.length; i++) {
        let cellLeft = offsetHorizontal + (resultOffset + i + 1) * tamCel + salidaPaddingLeft;
        fragment.appendChild(crearCelda("caja4", resultadoConComa[i], { left: `${cellLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`, color: '#00ff00' }));
    }

    salida.appendChild(fragment);
}

/**
 * Realiza y visualiza la operación de resta CON ANIMACIONES SECUENCIALES.
 * @param {Array<[string, number]>} numerosAR - Los operandos.
 */
async function resta(numerosAR) {
    salida.innerHTML = "";

    const salidaRect = salida.getBoundingClientRect();
    const salidaPaddingLeft = parseFloat(getComputedStyle(salida).paddingLeft);
    const salidaPaddingRight = parseFloat(getComputedStyle(salida).paddingRight);
    const salidaPaddingTop = parseFloat(getComputedStyle(salida).paddingTop);
    const salidaPaddingBottom = parseFloat(getComputedStyle(salida).paddingBottom);
    const availableWidth = salidaRect.width - salidaPaddingLeft - salidaPaddingRight;
    const availableHeight = salidaRect.height - salidaPaddingTop - salidaPaddingBottom;

    let maxDecimales = Math.max(numerosAR[0][1], numerosAR[1][1]);
    let n1Calc = numerosAR[0][0].padEnd(numerosAR[0][0].length + maxDecimales - numerosAR[0][1], '0');
    let n2Calc = numerosAR[1][0].padEnd(numerosAR[1][0].length + maxDecimales - numerosAR[1][1], '0');
    let resultadoBigInt = BigInt(n1Calc) - BigInt(n2Calc);
    let resultadoRaw = resultadoBigInt.toString();
    let resultadoConComa = resultadoRaw;
    if (maxDecimales > 0) {
        let absResult = resultadoConComa.startsWith('-') ? resultadoConComa.substring(1) : resultadoConComa;
        if (absResult.length <= maxDecimales) absResult = '0'.repeat(maxDecimales - absResult.length + 1) + absResult;
        let formattedAbs = absResult.slice(0, absResult.length - maxDecimales) + ',' + absResult.slice(absResult.length - maxDecimales);
        resultadoConComa = resultadoConComa.startsWith('-') ? '-' + formattedAbs : formattedAbs;
    }
    if (resultadoConComa.includes(',')) resultadoConComa = resultadoConComa.replace(/0+$/, '').replace(/,$/, '');
    let n1Display = numerosAR[0][0];
    if (numerosAR[0][1] > 0) n1Display = n1Display.slice(0, n1Display.length - numerosAR[0][1]) + ',' + n1Display.slice(n1Display.length - numerosAR[0][1]);
    let n2Display = numerosAR[1][0];
    if (numerosAR[1][1] > 0) n2Display = n2Display.slice(0, n2Display.length - numerosAR[1][1]) + ',' + n2Display.slice(n2Display.length - numerosAR[1][1]);
    const maxWidthInChars = Math.max(n1Display.length, n2Display.length + 1, resultadoConComa.length);
    const altoGridInRows = 4;
    const tamCel = Math.floor(Math.min(availableWidth / maxWidthInChars, availableHeight / altoGridInRows));
    const tamFuente = tamCel * multiplicadorTamFuente;
    const totalBlockWidth = maxWidthInChars * tamCel;
    const offsetHorizontal = (availableWidth - totalBlockWidth) / 2;
    
    const delayStep = 60;
    
    let yPos = salidaPaddingTop;
    for (let i = 0; i < n1Display.length; i++) {
        const leftPos = offsetHorizontal + (maxWidthInChars - n1Display.length + i) * tamCel + salidaPaddingLeft;
        salida.appendChild(crearCeldaAnimada("caja3", n1Display[i], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px', color: '#ffff00' }, i * delayStep));
    }
    await esperar(n1Display.length * delayStep + 200);

    yPos += tamCel;
    const signLeft = offsetHorizontal + (maxWidthInChars - n2Display.length - 1) * tamCel + salidaPaddingLeft;
    salida.appendChild(crearCeldaAnimada("caja", "-", { left: `${signLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px', color: "#ffff00" }, 0));
    
    for (let i = 0; i < n2Display.length; i++) {
        const leftPos = offsetHorizontal + (maxWidthInChars - n2Display.length + i) * tamCel + salidaPaddingLeft;
        salida.appendChild(crearCeldaAnimada("caja3", n2Display[i], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px', color: '#ffff00' }, 100 + i * delayStep));
    }
    await esperar(n2Display.length * delayStep + 300);

    yPos += tamCel;
    const lineLeft = offsetHorizontal + salidaPaddingLeft;
    const linea = crearCelda("linea", "", { left: `${lineLeft}px`, top: `${yPos}px`, width: `0px`, height: `2px`, backgroundColor: "#ddd", transition: 'width 0.4s ease-out' });
    salida.appendChild(linea);

    requestAnimationFrame(() => {
        linea.style.width = `${totalBlockWidth}px`;
    });
    await esperar(400);

    yPos += tamCel * 0.2;
    for (let i = 0; i < resultadoConComa.length; i++) {
        const leftPos = offsetHorizontal + (maxWidthInChars - resultadoConComa.length + i) * tamCel + salidaPaddingLeft;
        salida.appendChild(crearCeldaAnimada("caja4", resultadoConComa[i], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px', color: '#00ff00' }, i * delayStep));
    }
}


/**
 * Realiza y visualiza la operación de multiplicación.
 * @param {Array<[string, number]>} numerosAR - Los operandos.
 */
function multiplica(numerosAR) {
    const num1 = numerosAR[0][0], num2 = numerosAR[1][0];
    const numDec1 = numerosAR[0][1], numDec2 = numerosAR[1][1];

    if (num1 === "0" || num2 === "0") {
        salida.innerHTML = errorMessages.multiplicacion1;
        return;
    }
    const resultadoS = (BigInt(num1) * BigInt(num2)).toString();
    if (resultadoS.length > 20) {
        salida.innerHTML = errorMessages.multiplicacion2;
        return;
    }

    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const salidaRect = salida.getBoundingClientRect();
    const salidaPaddingLeft = parseFloat(getComputedStyle(salida).paddingLeft);
    const salidaPaddingRight = parseFloat(getComputedStyle(salida).paddingRight);
    const salidaPaddingTop = parseFloat(getComputedStyle(salida).paddingTop);
    const salidaPaddingBottom = parseFloat(getComputedStyle(salida).paddingBottom);
    const availableWidth = salidaRect.width - salidaPaddingLeft - salidaPaddingRight;
    const availableHeight = salidaRect.height - salidaPaddingTop - salidaPaddingBottom;

    const totalDecimalesResultado = numDec1 + numDec2;
    let num1Display = num1; if (numDec1 > 0) num1Display = num1.slice(0, num1.length - numDec1) + ',' + num1.slice(num1.length - numDec1);
    let num2Display = num2; if (numDec2 > 0) num2Display = num2.slice(0, num2.length - numDec2) + ',' + num2.slice(num2.length - numDec2);
    
    let resultadoDisplay = resultadoS;
    if (totalDecimalesResultado > 0) {
        if (resultadoDisplay.length <= totalDecimalesResultado) resultadoDisplay = '0'.repeat(totalDecimalesResultado - resultadoDisplay.length + 1) + resultadoDisplay;
        resultadoDisplay = resultadoDisplay.slice(0, resultadoDisplay.length - totalDecimalesResultado) + ',' + resultadoDisplay.slice(resultadoDisplay.length - totalDecimalesResultado);
    }
    if (resultadoDisplay.includes(',')) resultadoDisplay = resultadoDisplay.replace(/0+$/, '').replace(/,$/, '');

    const longestPartialProductLength = num2.length > 1 ? [...num2].reduce((max, d) => Math.max(max, (BigInt(num1) * BigInt(d)).toString().length), 0) : 0;
    const anchuraEnCeldas = Math.max(num1Display.length, num2Display.length + 1, resultadoDisplay.length, longestPartialProductLength + num2.length - 1);
    const alturaEnCeldas = 3 + (num2.length > 1 ? num2.length : 0);

    const tamCel = Math.floor(Math.min(availableWidth / anchuraEnCeldas, availableHeight / alturaEnCeldas));
    const tamFuente = tamCel * multiplicadorTamFuente;
    const totalBlockWidth = anchuraEnCeldas * tamCel;
    const offsetHorizontal = (availableWidth - totalBlockWidth) / 2;

    let yPos = salidaPaddingTop;
    for (let i = 0; i < num1Display.length; i++) {
        const leftPos = offsetHorizontal + (anchuraEnCeldas - num1Display.length + i) * tamCel + salidaPaddingLeft;
        fragment.appendChild(crearCelda("caja3", num1Display[i], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    yPos += tamCel;
    const signLeft = offsetHorizontal + (anchuraEnCeldas - num2Display.length - 1) * tamCel + salidaPaddingLeft;
    fragment.appendChild(crearCelda("caja", "x", { left: `${signLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`, color: "#ddd" }));
    for (let i = 0; i < num2Display.length; i++) {
        const leftPos = offsetHorizontal + (anchuraEnCeldas - num2Display.length + i) * tamCel + salidaPaddingLeft;
        fragment.appendChild(crearCelda("caja3", num2Display[i], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    yPos += tamCel;
    const lineLeft = offsetHorizontal + (anchuraEnCeldas - (num2Display.length + 1)) * tamCel + salidaPaddingLeft;
    const lineWidth = (num2Display.length + 1) * tamCel;
    fragment.appendChild(crearCelda("linea", "", { left: `${lineLeft}px`, top: `${yPos}px`, width: `${lineWidth}px`, height: `2px`, backgroundColor: "#ddd" }));

    if (num2.length > 1) {
        for (let i = num2.length - 1; i >= 0; i--) {
            let resultadoFila = (BigInt(num1) * BigInt(num2[i])).toString();
            let colOffset = num2.length - 1 - i;
            for (let j = 0; j < resultadoFila.length; j++) {
                const leftPos = offsetHorizontal + (anchuraEnCeldas - resultadoFila.length - colOffset + j) * tamCel + salidaPaddingLeft;
                fragment.appendChild(crearCelda("caja2", resultadoFila[j], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
            }
            yPos += tamCel;
        }
        const finalLineLeft = offsetHorizontal + salidaPaddingLeft;
        fragment.appendChild(crearCelda("linea", "", { left: `${finalLineLeft}px`, top: `${yPos}px`, width: `${totalBlockWidth}px`, height: `2px`, backgroundColor: "#ddd" }));
    }
    
    yPos += tamCel * 0.2;
    for (let i = 0; i < resultadoDisplay.length; i++) {
        const leftPos = offsetHorizontal + (anchuraEnCeldas - resultadoDisplay.length + i) * tamCel + salidaPaddingLeft;
        fragment.appendChild(crearCelda("caja4", resultadoDisplay[i], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    salida.appendChild(fragment);
}


/**
 * Realiza y visualiza la operación de división (versión normal).
 * @param {Array<[string, number]>} numerosAR - Los operandos.
 */
function divide(numerosAR) {
    const [num1Str, numDec1] = numerosAR[0];
    const [num2Str, numDec2] = numerosAR[1];

    if (BigInt(num2Str) === 0n) {
        salida.innerHTML = BigInt(num1Str) === 0n ? errorMessages.division3 : errorMessages.division2;
        return;
    }
    if (BigInt(num1Str) === 0n) {
        salida.innerHTML = errorMessages.division1;
        return;
    }

    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const salidaRect = salida.getBoundingClientRect();
    const salidaPaddingLeft = parseFloat(getComputedStyle(salida).paddingLeft);
    const salidaPaddingRight = parseFloat(getComputedStyle(salida).paddingRight);
    const salidaPaddingTop = parseFloat(getComputedStyle(salida).paddingTop);
    const salidaPaddingBottom = parseFloat(getComputedStyle(salida).paddingBottom);
    const availableWidth = salidaRect.width - salidaPaddingLeft - salidaPaddingRight;
    const availableHeight = salidaRect.height - salidaPaddingTop - salidaPaddingBottom;
    
    let tempNum1Str = num1Str;
    const decimalShift = numDec1 - numDec2;
    if (numDec2 > numDec1) tempNum1Str = tempNum1Str.padEnd(tempNum1Str.length + (numDec2 - numDec1), '0');
    
    let resultadoRaw = (BigInt(tempNum1Str) / BigInt(num2Str)).toString();
    let resultadoFormatted = resultadoRaw;
    if (decimalShift > 0) {
        if (resultadoFormatted.length <= decimalShift) resultadoFormatted = '0'.repeat(decimalShift - resultadoFormatted.length + 1) + resultadoFormatted;
        resultadoFormatted = resultadoFormatted.slice(0, resultadoFormatted.length - decimalShift) + ',' + resultadoFormatted.slice(resultadoFormatted.length - decimalShift);
    }
    if (resultadoFormatted.includes(',')) resultadoFormatted = resultadoFormatted.replace(/0+$/, '').replace(/,$/, '');

    let displayedDividend = num1Str; if(numDec1 > 0) displayedDividend = displayedDividend.slice(0, -numDec1) + ',' + displayedDividend.slice(-numDec1);
    let displayedDivisor = num2Str; if(numDec2 > 0) displayedDivisor = displayedDivisor.slice(0, -numDec2) + ',' + displayedDivisor.slice(-numDec2);
    
    const maxLeftWidth = displayedDividend.length;
    const maxRightWidth = Math.max(displayedDivisor.length, resultadoFormatted.length);
    const separatorWidth = 0.5;
    const totalCols = maxLeftWidth + separatorWidth + maxRightWidth;
    const totalRows = 3;

    const tamCel = Math.floor(Math.min(availableWidth / totalCols, availableHeight / totalRows));
    const tamFuente = Math.floor(tamCel * multiplicadorTamFuente);
    const totalBlockWidth = totalCols * tamCel;
    const offsetHorizontal = (availableWidth - totalBlockWidth) / 2;
    
    let yPos = salidaPaddingTop;
    for (let j = 0; j < displayedDividend.length; j++) {
        const leftPos = offsetHorizontal + (maxLeftWidth - displayedDividend.length + j) * tamCel + salidaPaddingLeft;
        fragment.appendChild(crearCelda("caja", displayedDividend[j], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    const rightBlockX = offsetHorizontal + (maxLeftWidth + separatorWidth) * tamCel + salidaPaddingLeft;
    for (let i = 0; i < displayedDivisor.length; i++) {
        fragment.appendChild(crearCelda("caja3", displayedDivisor[i], { left: `${rightBlockX + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    yPos += tamCel;
    for (let i = 0; i < resultadoFormatted.length; i++) {
        fragment.appendChild(crearCelda("caja4", resultadoFormatted[i], { left: `${rightBlockX + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    const lineX = offsetHorizontal + maxLeftWidth * tamCel + (separatorWidth * tamCel / 2) + salidaPaddingLeft;
    fragment.appendChild(crearCelda("linea-vertical", "", { left: `${lineX - 1}px`, top: `${salidaPaddingTop}px`, width: `2px`, height: `${2 * tamCel}px`, backgroundColor: "#ddd" }));
    fragment.appendChild(crearCelda("linea-horizontal", "", { left: `${lineX}px`, top: `${salidaPaddingTop + tamCel - 1}px`, width: `${maxRightWidth * tamCel}px`, height: `2px`, backgroundColor: "#ddd" }));

    salida.appendChild(fragment);
}

/**
 * Realiza y visualiza la operación de división (versión expandida).
 * @param {Array<[string, number]>} numerosAR - Los operandos.
 */
function divideExt(numerosAR) {
    const [actualNum1Str, numDec1] = numerosAR[0];
    const [actualNum2Str, numDec2] = numerosAR[1];

    if (BigInt(actualNum2Str) === 0n) {
        salida.innerHTML = BigInt(actualNum1Str) === 0n ? errorMessages.division3 : errorMessages.division2;
        return;
    }
    if (BigInt(actualNum1Str) === 0n) {
        salida.innerHTML = errorMessages.division1;
        return;
    }

    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const salidaRect = salida.getBoundingClientRect();
    const salidaPaddingLeft = parseFloat(getComputedStyle(salida).paddingLeft);
    const salidaPaddingRight = parseFloat(getComputedStyle(salida).paddingRight);
    const salidaPaddingTop = parseFloat(getComputedStyle(salida).paddingTop);
    const salidaPaddingBottom = parseFloat(getComputedStyle(salida).paddingBottom);
    const availableWidth = salidaRect.width - salidaPaddingLeft - salidaPaddingRight;
    const availableHeight = salidaRect.height - salidaPaddingTop - salidaPaddingBottom;
    
    const steps = []; let fullCalculatedQuotient = ""; let currentChunkAccumulator = "";
    if (actualNum1Str === '0') {
        fullCalculatedQuotient = '0';
        steps.push({ dividendValue: '0', product: '0', remainder: '0' });
    } else {
        let dividendPointer = 0;
        while (dividendPointer < actualNum1Str.length) {
            currentChunkAccumulator += actualNum1Str[dividendPointer++];
            let chunkForCalc = currentChunkAccumulator.replace(/^0+/, '') || '0';
            if (BigInt(chunkForCalc) >= BigInt(actualNum2Str)) {
                let q = (BigInt(chunkForCalc) / BigInt(actualNum2Str)).toString();
                let p = (BigInt(q) * BigInt(actualNum2Str)).toString();
                let r = (BigInt(chunkForCalc) % BigInt(actualNum2Str)).toString();
                fullCalculatedQuotient += q;
                steps.push({ dividendValue: currentChunkAccumulator, product: p, remainder: r });
                currentChunkAccumulator = r;
            } else if (fullCalculatedQuotient.length > 0) {
                fullCalculatedQuotient += '0';
            }
        }
        if (fullCalculatedQuotient === "") {
             fullCalculatedQuotient = "0";
             steps.push({ dividendValue: actualNum1Str, product: "0", remainder: actualNum1Str });
        }
    }
    
    let displayedQuotient = fullCalculatedQuotient;
    const finalDecimalShift = numDec1 - numDec2;
    if (finalDecimalShift > 0) {
        if (displayedQuotient.length <= finalDecimalShift) displayedQuotient = '0'.repeat(finalDecimalShift - displayedQuotient.length + 1) + displayedQuotient;
        displayedQuotient = displayedQuotient.slice(0, -finalDecimalShift) + ',' + displayedQuotient.slice(-finalDecimalShift);
    }
    if (displayedQuotient.includes(',')) displayedQuotient = displayedQuotient.replace(/0+$/, '').replace(/,$/, '');

    let displayedDividend = actualNum1Str; if(numDec1 > 0) displayedDividend = displayedDividend.slice(0,-numDec1)+','+displayedDividend.slice(-numDec1);
    let displayedDivisor = actualNum2Str; if(numDec2 > 0) displayedDivisor = displayedDivisor.slice(0,-numDec2)+','+displayedDivisor.slice(-numDec2);
    
    let maxLeftWidth = displayedDividend.length;
    steps.forEach(s => { maxLeftWidth = Math.max(maxLeftWidth, s.dividendValue.length, s.product.length + 1, s.remainder.length); });
    const maxRightWidth = Math.max(displayedDivisor.length, displayedQuotient.length);
    const separatorWidth = 0.5;
    const totalCols = maxLeftWidth + separatorWidth + maxRightWidth;
    const totalRows = 2 + steps.length * 2.5;
    
    const tamCel = Math.floor(Math.min(availableWidth / totalCols, availableHeight / totalRows));
    const tamFuente = Math.floor(tamCel * multiplicadorTamFuente);
    const totalBlockWidth = totalCols * tamCel;
    const offsetHorizontal = (availableWidth - totalBlockWidth) / 2;

    let yPos = salidaPaddingTop;
    for (let j = 0; j < displayedDividend.length; j++) {
        const leftPos = offsetHorizontal + (maxLeftWidth - displayedDividend.length + j) * tamCel + salidaPaddingLeft;
        fragment.appendChild(crearCelda("caja", displayedDividend[j], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    const rightBlockX = offsetHorizontal + (maxLeftWidth + separatorWidth) * tamCel + salidaPaddingLeft;
    for (let i = 0; i < displayedDivisor.length; i++) {
        fragment.appendChild(crearCelda("caja3", displayedDivisor[i], { left: `${rightBlockX + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }
    
    yPos += tamCel;
    for (let i = 0; i < displayedQuotient.length; i++) {
        fragment.appendChild(crearCelda("caja4", displayedQuotient[i], { left: `${rightBlockX + i * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    const lineX = offsetHorizontal + maxLeftWidth * tamCel + (separatorWidth * tamCel / 2) + salidaPaddingLeft;
    fragment.appendChild(crearCelda("linea-vertical", "", { left: `${lineX-1}px`, top: `${salidaPaddingTop}px`, width: `2px`, height: `${2 * tamCel}px`, backgroundColor: "#ddd" }));
    fragment.appendChild(crearCelda("linea-horizontal", "", { left: `${lineX}px`, top: `${salidaPaddingTop + tamCel - 1}px`, width: `${maxRightWidth * tamCel}px`, height: `2px`, backgroundColor: "#ddd" }));
    
    steps.forEach((step) => {
        yPos += tamCel;
        const prod = step.product;
        const prodLeft = offsetHorizontal + (maxLeftWidth - prod.length - 1) * tamCel + salidaPaddingLeft;
        fragment.appendChild(crearCelda("caja", "-", { left: `${prodLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`, color: '#ddd' }));
        for (let k = 0; k < prod.length; k++) {
            fragment.appendChild(crearCelda("caja3", prod[k], { left: `${prodLeft + (k + 1) * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`, borderTop: `2px #ddd solid`, color: '#ccc' }));
        }

        yPos += tamCel;
        const rem = step.remainder;
        const remLeft = offsetHorizontal + (maxLeftWidth - rem.length) * tamCel + salidaPaddingLeft;
        for (let k = 0; k < rem.length; k++) {
            fragment.appendChild(crearCelda("caja2", rem[k], { left: `${remLeft + k * tamCel}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
        }
    });

    salida.appendChild(fragment);
}


/**
 * Realiza y visualiza la descomposición en factores primos.
 */
function desFacPri() {
    const entrada = display.innerHTML;
    if (isNaN(parseInt(entrada)) || entrada.includes(',')) {
        salida.innerHTML = errorMessages.dFactorial1;
        actualizarEstadoDivisionUI(false); return;
    }
    let numIzda = parseInt(entrada, 10);

    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const salidaRect = salida.getBoundingClientRect();
    const salidaPaddingLeft = parseFloat(getComputedStyle(salida).paddingLeft);
    const salidaPaddingRight = parseFloat(getComputedStyle(salida).paddingRight);
    const salidaPaddingTop = parseFloat(getComputedStyle(salida).paddingTop);
    const salidaPaddingBottom = parseFloat(getComputedStyle(salida).paddingBottom);
    const availableWidth = salidaRect.width - salidaPaddingLeft - salidaPaddingRight;
    const availableHeight = salidaRect.height - salidaPaddingTop - salidaPaddingBottom;

    let numIzdaArray = [], numDchaArray = [];
    if (numIzda === 0) {
        salida.innerHTML = errorMessages.dFactorial1;
        actualizarEstadoDivisionUI(false); return;
    } else if (numIzda === 1) {
        numIzdaArray.push(1); numDchaArray.push(1);
    } else {
        let tempNum = numIzda; let i = 2;
        while (i * i <= tempNum) {
            if (tempNum % i === 0) {
                numIzdaArray.push(tempNum); numDchaArray.push(i);
                tempNum /= i;
            } else { i++; }
        }
        if (tempNum > 1 || numIzdaArray.length === 0) {
            numIzdaArray.push(tempNum); numDchaArray.push(tempNum);
        }
        numIzdaArray.push(1);
    }

    const maxDigitsIzda = Math.max(...numIzdaArray.map(n => n.toString().length));
    const maxDigitsDcha = Math.max(...numDchaArray.map(n => n.toString().length));
    const separatorWidth = 1;
    const totalCols = maxDigitsIzda + separatorWidth + maxDigitsDcha;
    const numRows = numIzdaArray.length;

    const tamCel = Math.floor(Math.min(availableWidth / totalCols, availableHeight / numRows));
    const tamFuente = tamCel * multiplicadorTamFuente;
    const totalBlockWidth = totalCols * tamCel;
    const offsetHorizontal = (availableWidth - totalBlockWidth) / 2;

    numIzdaArray.forEach((n, idx) => {
        let s = n.toString();
        for (let j = 0; j < s.length; j++) {
            const left = offsetHorizontal + (maxDigitsIzda - s.length + j) * tamCel + salidaPaddingLeft;
            const top = salidaPaddingTop + idx * tamCel;
            fragment.appendChild(crearCelda("caja2", s[j], { left: `${left}px`, top: `${top}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
        }
    });

    const lineX = offsetHorizontal + maxDigitsIzda * tamCel + (separatorWidth * tamCel / 2) + salidaPaddingLeft;
    fragment.appendChild(crearCelda("linea-vertical", "", { left: `${lineX - 1}px`, top: `${salidaPaddingTop}px`, width: `2px`, height: `${numRows * tamCel}px`, backgroundColor: "#ddd" }));
    
    numDchaArray.forEach((n, idx) => {
        let s = n.toString();
        for (let j = 0; j < s.length; j++) {
            const left = offsetHorizontal + (maxDigitsIzda + separatorWidth + j) * tamCel + salidaPaddingLeft;
            const top = salidaPaddingTop + idx * tamCel;
            fragment.appendChild(crearCelda("caja3", s[j], { left: `${left}px`, top: `${top}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
        }
    });

    salida.appendChild(fragment);
    HistoryManager.add({ input: `Factores Primos(${entrada})`, visualHtml: salida.innerHTML, type: 'visual' });
    actualizarEstadoDivisionUI(false);
}


/**
 * Realiza y visualiza el cálculo de la raíz cuadrada.
 */
function raizCuadrada() {
    salida.innerHTML = "";
    const entrada = display.innerHTML;
    let hadError = false;

    if (/[+\-x/]/.test(entrada)) {
        salida.innerHTML = errorMessages.invalidSqrtInput; hadError = true;
    } else if (isNaN(parseInt(entrada)) || entrada.includes(',')) {
        salida.innerHTML = errorMessages.integerSqrtRequired; hadError = true;
    } else {
        const numero = parseInt(entrada, 10);
        if (numero < 0) {
            salida.innerHTML = errorMessages.negativeSqrt; hadError = true;
        } else if (numero === 0) {
            salida.innerHTML = errorMessages.raiz1;
        } else {
            const resultado = Math.sqrt(numero);
            if (resultado % 1 !== 0) {
                salida.innerHTML = errorMessages.nonExactSqrt; hadError = true;
            } else {
                const availableHeight = salida.clientHeight;
                salida.innerHTML = `<p class="caja4" style="font-size: ${w * 0.1}px; text-align: center; line-height: ${availableHeight}px;">${resultado}</p>`;
            }
        }
    }

    if (!hadError) {
        HistoryManager.add({ input: `√(${entrada})`, visualHtml: salida.innerHTML, type: 'visual' });
    }
    actualizarEstadoDivisionUI(false);
}



