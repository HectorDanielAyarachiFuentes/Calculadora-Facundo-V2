// =======================================================
// --- main.js ---
// Punto de entrada principal. Gestiona la inicialización,
// los eventos de usuario y el estado de la UI.
// DEBE CARGARSE COMO UN MÓDULO.
// =======================================================
"use strict";

// --- IMPORTACIONES DE MÓDULOS ---
// Importa las funciones de operación desde nuestro módulo centralizado
import {
    suma,
    resta,
    multiplica,
    divide,
    divideExt,
    desFacPri,
    raizCuadrada,
    parsearNumeros
} from './operations/index.js';

// Importa los elementos del DOM y mensajes desde el módulo de configuración
import {
    display,
    salida,
    contenedor,
    teclado,
    divVolver,
    botExp,
    botNor,
    errorMessages
} from './config.js';

// Nota: HistoryManager y HistoryPanel deberían idealmente ser importados también si se refactorizan a módulos.
// import { HistoryManager } from './history.js';
// import { HistoryPanel } from './historyPanel.js';

// --- VARIABLES DE ESTADO DE LA APLICACIÓN ---
// Estas variables definen el estado actual de la calculadora y son gestionadas por main.js.
let w; // Ancho base para UI responsiva.
let divext = false; // ¿Está activada la vista de división extendida?
let lastDivisionState = {
    operacionInput: '',
    numerosAR: null,
    tipo: ''
};


// =======================================================
// --- INICIALIZACIÓN Y EVENTOS ---
// =======================================================

/**
 * Función de inicialización que se ejecuta al cargar la página.
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

    activadoBotones('0');
    // Asumimos que HistoryManager y HistoryPanel están disponibles globalmente por ahora
    HistoryManager.init();
    HistoryPanel.init();
    actualizarEstadoDivisionUI(false);

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
 * @param {Event} event
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
 * @param {KeyboardEvent} event
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
        if (!document.getElementById("tcal").disabled) calcular();
    } else if (key === 'Backspace') escribir('del');
    else if (key === 'Delete' || key === 'Escape') escribir('c');
}

/**
 * Dirige las acciones especiales de los botones a su función correspondiente.
 * @param {string} action
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
                if (!salida.querySelector('.error')) {
                    HistoryManager.add({ input: `Factores Primos(${display.innerHTML})`, visualHtml: salida.innerHTML, type: 'visual' });
                }
                actualizarEstadoDivisionUI(false);
            });
            break;
        case 'raiz':
            bajarteclado();
            requestAnimationFrame(() => {
                raizCuadrada();
                if (!salida.querySelector('.error')) {
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
 * @param {string} t
 */
function escribir(t) {
    if (t === '/' || ['+', '-', 'x', ',', 'c', 'del'].includes(t) || !isNaN(parseInt(t))) {
        actualizarEstadoDivisionUI(false);
    }
    if (t === "c") {
        display.innerHTML = "0";
    } else if (t === "del") {
        display.innerHTML = display.innerHTML.slice(0, -1) || "0";
    } else {
        if (t === ',' && display.innerHTML.endsWith(',')) return;
        if (['+', '-', 'x', '/'].includes(t) && ['+', '-', 'x', '/'].includes(display.innerHTML.slice(-1))) {
            display.innerHTML = display.innerHTML.slice(0, -1) + t;
        } else {
            display.innerHTML = (display.innerHTML === "0" && t !== ",") ? t : display.innerHTML + t;
        }
    }
    activadoBotones(display.innerHTML);
}

/**
 * Función principal que orquesta el cálculo.
 */
function calcular() {
    const entrada = display.innerHTML;
    const operadorMatch = entrada.match(/[\+\-x/]/);

    if (!operadorMatch) {
        salida.innerHTML = errorMessages.invalidOperation;
        bajarteclado();
        actualizarEstadoDivisionUI(false);
        return;
    }

    const operador = operadorMatch[0];
    const numerosAR = parsearNumeros(entrada, operador);
    
    bajarteclado();
    requestAnimationFrame(() => {
        salida.innerHTML = "";
        switch (operador) {
            case "+": suma(numerosAR); break;
            case "-": resta(numerosAR); break;
            case "x": multiplica(numerosAR); break;
            case "/":
                lastDivisionState = { operacionInput: entrada, numerosAR, tipo: 'division' };
                divext ? divideExt(numerosAR) : divide(numerosAR);
                break;
            default: salida.innerHTML = errorMessages.invalidOperation;
        }
        
        const calculationError = salida.querySelector('.error');
        if (operador === '/' && !calculationError) {
            actualizarEstadoDivisionUI(true);
        } else {
            actualizarEstadoDivisionUI(false);
        }
        if (!calculationError) {
            HistoryManager.add({ input: entrada, visualHtml: salida.innerHTML });
        }
    });
}

/**
 * Cambia entre la vista de división normal y expandida.
 * @param {boolean} esExpandida
 */
function divideExpandida(esExpandida) {
    divext = esExpandida;
    actualizarEstadoDivisionUI(true);
    bajarteclado();
    requestAnimationFrame(() => {
        if (!lastDivisionState.numerosAR || lastDivisionState.tipo !== 'division') {
            salida.innerHTML = errorMessages.noDivisionCalculated;
            return;
        }
        salida.innerHTML = "";
        divext ? divideExt(lastDivisionState.numerosAR) : divide(lastDivisionState.numerosAR);
    });
}

// =======================================================
// --- FUNCIONES DE UI ---
// =======================================================

function subirteclado() {
    teclado.classList.remove('visible-salida-teclado');
    salida.classList.remove('visible-salida-teclado');
    divVolver.classList.remove('visible-salida-nav');
}

function bajarteclado() {
    teclado.classList.add('visible-salida-teclado');
    salida.classList.add('visible-salida-teclado');
    divVolver.classList.add('visible-salida-nav');
}

function actualizarEstadoDivisionUI(esDivisionValida) {
    if (esDivisionValida) {
        botExp.style.display = divext ? "none" : "inline-block";
        botNor.style.display = divext ? "inline-block" : "none";
    } else {
        botExp.style.display = "none";
        botNor.style.display = "none";
        lastDivisionState = { operacionInput: '', numerosAR: null, tipo: '' };
    }
}

function activadoBotones(contDisplay) {
    const esSoloCero = contDisplay === '0';
    const tieneOperadorAlFinal = /[\+\-x/]$/.test(contDisplay);
    const tieneComaAlFinal = /,$/.test(contDisplay);
    const partes = contDisplay.split(/[\+\-x/]/);
    const ultimoNumero = partes[partes.length - 1];
    const demasiadosCaracteres = contDisplay.length >= 21;
    const ultimoNumeroDemasiadoLargo = ultimoNumero.length >= 15;
    const deshabilitarNumeros = demasiadosCaracteres || ultimoNumeroDemasiadoLargo;

    ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9'].forEach(id => document.getElementById(id).disabled = deshabilitarNumeros);
    const puedeAnadirOperador = !esSoloCero && !tieneOperadorAlFinal && !tieneComaAlFinal;
    ['tmas', 'tmen', 'tpor', 'tdiv'].forEach(id => document.getElementById(id).disabled = !puedeAnadirOperador || demasiadosCaracteres);
    const esNumeroEnteroSimple = /^\d+$/.test(contDisplay) && !esSoloCero;
    document.getElementById("tpri").disabled = !esNumeroEnteroSimple;
    document.getElementById("trai").disabled = !esNumeroEnteroSimple;
    const puedeAnadirComa = !ultimoNumero.includes(',') && !tieneOperadorAlFinal && !deshabilitarNumeros;
    document.getElementById("tcom").disabled = !puedeAnadirComa;
    const esCalculable = /[\+\-x/]/.test(contDisplay) && !tieneOperadorAlFinal && !tieneComaAlFinal;
    document.getElementById("tcal").disabled = !esCalculable;
    const historyToggle = document.getElementById("history-toggle-btn");
    const historyPanel = document.getElementById("history-panel");
    if (historyToggle && historyPanel) {
        historyToggle.setAttribute('aria-expanded', historyPanel.classList.contains('open').toString());
    }
}

// =======================================================
// --- PUNTO DE ENTRADA ---
// =======================================================
document.addEventListener('DOMContentLoaded', alCargar);