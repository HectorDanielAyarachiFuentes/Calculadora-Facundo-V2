// =======================================================
// --- main.js (VERSIÓN FINAL Y COMPLETA) ---
// =======================================================
"use strict";

// --- IMPORTACIONES DE MÓDULOS ---
import {
    suma, resta, multiplica, divide, divideExt,
    desFacPri, raizCuadrada, parsearNumeros
} from './operations/index.js';

import {
    display, salida, contenedor, teclado, divVolver,
    botExp, botNor, errorMessages
} from './config.js';

import { crearMensajeError } from './operations/utils/dom-helpers.js';

import { HistoryManager, HistoryPanel } from './history.js';


// --- VARIABLES DE ESTADO DE LA APLICACIÓN ---
let w; // Ancho base para cálculos de tamaño responsivo.
let divext = false; // Estado para la visualización de la división expandida.
let lastDivisionState = { // Objeto para guardar el estado de la última división realizada
    operacionInput: '',
    numerosAR: null,
    tipo: ''
};

// =======================================================
// --- INICIALIZACIÓN Y EVENTOS ---
// =======================================================

/**
 * Función de inicialización que se ejecuta al cargar la página.
 * Configura el tamaño inicial de la UI y los listeners de eventos.
 */
function alCargar() {
    w = Math.min(window.innerHeight / 1.93, window.innerWidth / 1.5);
    contenedor.style.width = `${w}px`;
    contenedor.style.paddingTop = `${(w * 1.56) * 0.04}px`;
    
    display.style.fontSize = `${w * 0.085}px`;
    display.style.height = `${w * 0.11 * 1.11}px`;
    
    const cuerpoteclado = document.getElementById("cuerpoteclado");
    cuerpoteclado.style.width = `${0.95 * w}px`;
    cuerpoteclado.style.height = `${0.95 * w}px`;
    
    teclado.style.fontSize = `${0.1 * w}px`;
    
    const volver = document.getElementById("volver");
    volver.style.fontSize = `${0.15 * w}px`;
    volver.style.padding = `${0.05 * w}px ${0.03 * w}px`;
    
    botExp.style.fontSize = `${0.08 * w}px`;
    botExp.style.paddingTop = `${0.05 * w}px`;
    botNor.style.fontSize = `${0.08 * w}px`;
    botNor.style.paddingTop = `${0.05 * w}px`;

    contenedor.style.opacity = "1";
    display.innerHTML = '0';

    activadoBotones('0'); // Inicia con display en "0"
    HistoryManager.init(); 
    HistoryPanel.init();    
    actualizarEstadoDivisionUI(false); // Corregido: 'atualizar' a 'actualizar'

    setupEventListeners();
}

/**
 * Configura los listeners de eventos para la aplicación.
 */
function setupEventListeners() {
    teclado.removeEventListener('click', handleButtonClick);
    divVolver.removeEventListener('click', handleButtonClick);
    document.removeEventListener('keydown', handleKeyboardInput);
    window.removeEventListener('resize', alCargar);

    teclado.addEventListener('click', handleButtonClick);
    divVolver.addEventListener('click', handleButtonClick);
    document.addEventListener('keydown', handleKeyboardInput);
    window.addEventListener('resize', alCargar);
}


// =======================================================
// --- MANEJADORES DE ACCIONES (HANDLERS) ---
// =======================================================

/**
 * Maneja los clics en los botones de la calculadora.
 * @param {Event} event - El objeto del evento de clic.
 */
function handleButtonClick(event) {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;

    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value) {
        escribir(value);
    } else if (action) {
        handleAction(action);
    }
}

/**
 * Maneja la entrada desde el teclado físico.
 * @param {KeyboardEvent} event - El objeto del evento de teclado.
 */
function handleKeyboardInput(event) {
    const key = event.key;
    if (/[0-9+\-*/=.,cC]/.test(key) || ['Enter', 'Backspace', 'Delete', 'Escape', 'x', 'X'].includes(key)) {
        event.preventDefault();
    }

    if (/[0-9]/.test(key)) escribir(key);
    else if (key === '+') escribir('+');
    else if (key === '-') escribir('-');
    else if (key === '*' || key === 'x' || key === 'X') escribir('x');
    else if (key === '/') escribir('/');
    else if (key === '.' || key === ',') escribir(',');
    else if (key === 'Enter' || key === '=') {
        const btnIgual = document.querySelector('[data-action="calculate"]');
        if (btnIgual && !btnIgual.disabled) calcular();
    } else if (key === 'Backspace') escribir('del');
    else if (key === 'Delete' || key === 'Escape') escribir('c');
}

/**
 * Dirige las acciones especiales de los botones a su función correspondiente.
 * @param {string} action - La acción a realizar.
 */
function handleAction(action) {
    switch (action) {
        case 'view-screen': bajarteclado(); break;
        case 'calculate': calcular(); break;
        case 'clear': escribir('c'); break;
        case 'delete': escribir('del'); break;
        case 'hide-screen': subirteclado(); break;
        case 'divide-expanded': divideExpandida(true); break;
        case 'divide-normal': divideExpandida(false); break;
        case 'primos':
            bajarteclado();
            requestAnimationFrame(() => {
                desFacPri();
                if (!salida.querySelector('.output-screen__error-message')) {
                    HistoryManager.add({ input: `Factores Primos(${display.innerHTML})`, visualHtml: salida.innerHTML, type: 'visual' });
                }
                actualizarEstadoDivisionUI(false);
            });
            break;
        case 'raiz':
            bajarteclado();
            requestAnimationFrame(() => {
                raizCuadrada();
                if (!salida.querySelector('.output-screen__error-message')) {
                    HistoryManager.add({ input: `√(${display.innerHTML})`, visualHtml: salida.innerHTML, type: 'visual' });
                }
                actualizarEstadoDivisionUI(false);
            });
            break;
        default: console.warn(`Acción desconocida: ${action}`);
    }
}


// =======================================================
// --- LÓGICA DE LA APLICACIÓN ---
// =======================================================

/**
 * Escribe en el display principal de la calculadora.
 * Implementa la lógica de operador único por expresión.
 * @param {string} t - El carácter o comando a procesar ('c', 'del', etc.).
 */
function escribir(t) {
    const currentDisplay = display.innerHTML;
    const isOperator = ['+', '-', 'x', '/'].includes(t);
    // hasBinaryOperatorInExpression: Detecta si ya hay un operador binario en la expresión (ej: "5+3", "5*-3").
    // Excluye el primer número y la coma para encontrar el operador binario.
    const hasBinaryOperatorInExpression = /[+\-x/]/.test(currentDisplay.replace(/^-?[0-9,]+/, ''));
    
    // Si la última operación fue un cálculo, y se pulsa un número, limpiar el display.
    // Opcional: Podrías mantener el resultado para encadenar operaciones si no se borra.
    // if (lastCalculationDone && !isOperator && t !== ',' && t !== 'c' && t !== 'del') {
    //     display.innerHTML = '0';
    //     lastCalculationDone = false;
    // }

    if (t === "c") { // Clear
        display.innerHTML = "0";
    } else if (t === "del") { // Delete
        display.innerHTML = currentDisplay.slice(0, -1) || "0";
    }
    // Manejar entrada de operador
    else if (isOperator) {
        const lastChar = currentDisplay.slice(-1);
        const lastCharIsOperator = ['+', '-', 'x', '/'].includes(lastChar);
        
        if (hasBinaryOperatorInExpression && !lastCharIsOperator) { 
            // Caso: Ya hay un operador y un segundo número (ej: "5+3"). No permitir otro operador.
            return;
        } else if (lastCharIsOperator) { 
            // Caso: La entrada termina en operador (ej: "5+", "5-").
            // Siempre se permite cambiar el operador si el nuevo es diferente (ej: "5+" -> "5-").
            // Si el nuevo operador es el mismo, no se hace nada (ej: "5++" -> "5+").
            if (lastChar === t) return; 
            display.innerHTML = currentDisplay.slice(0, -1) + t;
        } else if (currentDisplay === "0" && t === '-') { 
            // Caso: Display es "0" y se pulsa "-", permitir iniciar número negativo.
            display.innerHTML = t; 
        } else if (currentDisplay === "0" && t !== '-') { 
            // Caso: Display es "0" y se pulsa otro operador (+, x, /). No permitir.
            return; 
        } else if (currentDisplay.endsWith(',')) {
            return; // Si termina en coma (ej. "5,"), no permitir operadores.
        } else { 
            // Caso general: Añadir el operador (ej. "5" -> "5+").
            display.innerHTML = currentDisplay + t;
        }
    }
    // Manejar entrada de número o coma
    else {
        if (t === ',' && currentDisplay.endsWith(',')) return; // Evitar comas duplicadas

        // Reemplazar "0" inicial si se pulsa un número. Mantener "0," si es el caso.
        display.innerHTML = (currentDisplay === "0" && t !== ',') ? t : currentDisplay + t;
    }
    
    activadoBotones(display.innerHTML);
    actualizarEstadoDivisionUI(false); 
}

/**
 * Función principal que orquesta el cálculo.
 * Analiza la entrada, llama a la operación correspondiente y actualiza el historial.
 */
function calcular() {
    const entrada = display.innerHTML;
    const operadorMatch = entrada.match(/[\+\-x/]/);

    // Validar que la entrada tenga el formato "numero operador numero"
    // Ignora el '-' inicial si es un número negativo
    if (!operadorMatch || !/^-?[0-9,]+\s*[+\-x/]\s*(-?[0-9,]+)$/.test(entrada)) { 
        salida.appendChild(crearMensajeError(errorMessages.invalidOperation));
        bajarteclado();
        actualizarEstadoDivisionUI(false);
        return;
    }
    // Si la expresión termina en un operador o coma, no se puede calcular
    if (['+', '-', 'x', '/'].includes(entrada.slice(-1)) || entrada.endsWith(',')) {
        salida.appendChild(crearMensajeError(errorMessages.invalidOperation));
        bajarteclado();
        actualizarEstadoDivisionUI(false);
        return;
    }

    const operador = operadorMatch[0];
    const numerosAR = parsearNumeros(entrada, operador);
    
    bajarteclado(); // Muestra la pantalla de salida
    requestAnimationFrame(() => {
        salida.innerHTML = ""; // Limpia la salida antes de dibujar
        switch (operador) {
            case "+": suma(numerosAR); break;
            case "-": resta(numerosAR); break;
            case "x": multiplica(numerosAR); break;
            case "/":
                lastDivisionState = { operacionInput: entrada, numerosAR, tipo: 'division' };
                divext ? divideExt(numerosAR) : divide(numerosAR);
                break;
            default:
                salida.appendChild(crearMensajeError(errorMessages.invalidOperation));
        }
        
        // Verifica si la operación visual resultó en un mensaje de error
        const calculationError = salida.querySelector('.output-screen__error-message');
        if (operador === '/' && !calculationError) {
            actualizarEstadoDivisionUI(true); // Muestra botones de división si fue exitosa
        } else {
            actualizarEstadoDivisionUI(false); // Oculta botones de división
        }

        // Añade al historial si no hubo error de cálculo
        if (!calculationError) {
            if (window.HistoryManager) HistoryManager.add({ input: entrada, visualHtml: salida.innerHTML });
        }
        activadoBotones(display.innerHTML); // Actualiza estado de botones después del cálculo
    });
}

/**
 * Cambia entre la vista de división normal y expandida.
 * @param {boolean} esExpandida - Si se debe mostrar la vista expandida (true) o normal (false).
 */
function divideExpandida(esExpandida) {
    divext = esExpandida;
    actualizarEstadoDivisionUI(true); // Asegura que los botones de división se muestren correctamente
    bajarteclado(); // Muestra la pantalla de salida

    requestAnimationFrame(() => {
        // Si no hay una división previa en el estado, muestra un mensaje de error
        if (!lastDivisionState.numerosAR || lastDivisionState.tipo !== 'division') {
            salida.appendChild(crearMensajeError(errorMessages.noDivisionCalculated));
            return;
        }
        salida.innerHTML = ""; // Limpia la salida
        // Redibuja la división con la vista seleccionada
        divext ? divideExt(lastDivisionState.numerosAR) : divide(lastDivisionState.numerosAR);
    });
}


// =======================================================
// --- FUNCIONES DE UI ---
// =======================================================

/**
 * Oculta la pantalla de salida y muestra el teclado.
 */
function subirteclado() {
    teclado.classList.remove('keyboard--hidden');
    salida.classList.remove('output-screen--visible');
    divVolver.classList.remove('bottom-nav--visible');
    activadoBotones(display.innerHTML); 
}

/**
 * Muestra la pantalla de salida y oculta el teclado.
 */
function bajarteclado() {
    teclado.classList.add('keyboard--hidden');
    salida.classList.add('output-screen--visible');
    divVolver.classList.add('bottom-nav--visible');
}

/**
 * Actualiza la visibilidad de los botones de división normal/expandida.
 * @param {boolean} esDivisionValida - Si la operación actual es una división válida.
 */
function actualizarEstadoDivisionUI(esDivisionValida) {
    if (esDivisionValida) {
        // Muestra el botón de la vista alternativa a la actual
        botExp.style.display = divext ? "none" : "inline-block";
        botNor.style.display = divext ? "inline-block" : "none";
    }
    // Comprobar si los elementos botExp y botNor existen antes de intentar acceder a su estilo
    // Esto es más seguro si por alguna razón no se encuentran en el DOM (aunque deberían)
    else if (botExp && botNor) { 
        botExp.style.display = "none";
        botNor.style.display = "none";
        lastDivisionState = { operacionInput: '', numerosAR: null, tipo: '' };
    }
}

/**
 * Habilita o deshabilita los botones del teclado según el contenido del display.
 * @param {string} contDisplay - El contenido actual del display.
 * @summary Lógica: Al inicio solo números y coma. Si hay un operador, deshabilitar otros.
 *          Permite - para iniciar negativos. No encadena operaciones.
 */
function activadoBotones(contDisplay) {
    const esSoloCero = contDisplay === '0';
    // hasBinaryOperatorInExpression: Detecta si ya hay un operador binario en la expresión
    // (ej: "5+3", "5*-3"). Ignora un '-' al inicio para números negativos.
    const hasBinaryOperatorInExpression = /[+\-x/]/.test(contDisplay.slice(contDisplay.startsWith('-') ? 1 : 0).replace(/^[0-9,]+/, ''));
    
    const partes = contDisplay.split(/[\+\-x/]/);
    const ultimoNumero = partes[partes.length - 1];
    const terminaEnOperador = ['+', '-', 'x', '/'].includes(contDisplay.slice(-1));

    // Deshabilitar botones de números si la entrada es demasiado larga
    const demasiadosCaracteres = contDisplay.length >= 21;
    const ultimoNumeroDemasiadoLargo = ultimoNumero.length >= 15;
    const deshabilitarNumeros = demasiadosCaracteres || ultimoNumeroDemasiadoLargo;

    document.querySelectorAll('.keyboard__button--number').forEach(btn => {
        btn.disabled = deshabilitarNumeros;
    });

    // Operadores (+, -, x, /)
    document.querySelectorAll('[data-value="+"], [data-value="-"], [data-value="x"], [data-value="/"]').forEach(btn => {
        const isMinusButton = btn.dataset.value === '-';
        if (demasiadosCaracteres) {
            btn.disabled = true; // Si la cadena es muy larga, deshabilitar operadores
        } else if (hasBinaryOperatorInExpression) {
            // Si ya existe un operador binario en la expresión
            // Deshabilita todos los operadores. No permite más de uno.
            btn.disabled = true;
        } else if (esSoloCero) {
            // Si el display es "0", deshabilitar TODOS los operadores (+, -, x, /).
            // Permite iniciar un número negativo escribiendo el número directamente (ej. 0 -> 5 -> -5)
            // Opcional: si quisieras que el - fuera activo en 0, la lógica sería diferente.
            btn.disabled = true; 
        } else if (contDisplay.endsWith(',')) {
            btn.disabled = true; // No permite operador después de una coma (ej: "5,+").
        } else {
            // Habilitar si es un número válido, no hay operador, etc.
            btn.disabled = false; 
        }
    });

    // Coma (,)
    const puedeAnadirComa = !ultimoNumero.includes(',');
    const btnComa = document.querySelector('[data-value=","]');
    if (btnComa) btnComa.disabled = !puedeAnadirComa || deshabilitarNumeros;

    // Funciones especiales (Primos, Raíz) - solo si es un número entero simple y sin operador
    const esNumeroEnteroSimple = /^\d+$/.test(contDisplay) && !esSoloCero && !hasBinaryOperatorInExpression;
    document.querySelectorAll('[data-action="primos"], [data-action="raiz"]').forEach(btn => {
        btn.disabled = !esNumeroEnteroSimple;
    });

    // Botón de Calcular (=) - habilitar si hay num1 operador num2
    const esCalculable = /^-?[0-9,]+\s*[+\-x/]\s*(-?[0-9,]+)$/.test(contDisplay);
    const btnIgual = document.querySelector('[data-action="calculate"]');
    if (btnIgual) btnIgual.disabled = !esCalculable;
}

// =======================================================
// --- PUNTO DE ENTRADA ---
// =======================================================
document.addEventListener('DOMContentLoaded', alCargar);