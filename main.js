// =======================================================
// --- main.js (VERSIÓN CON CORRECCIÓN DE EVENTOS) ---
// =======================================================
"use strict";

// --- IMPORTACIONES (sin cambios) ---
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

// --- VARIABLES DE ESTADO (sin cambios) ---
let w;
let divext = false;
let lastDivisionState = {
    operacionInput: '',
    numerosAR: null,
    tipo: ''
};

// --- INICIALIZACIÓN Y EVENTOS (sin cambios) ---
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
    HistoryManager.init(); 
    HistoryPanel.init();    
    actualizarEstadoDivisionUI(false); 
    setupEventListeners();
}

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

// --- MANEJADORES DE ACCIONES ---

/**
 * Maneja los clics en los botones de la calculadora.
 * @param {Event} event - El objeto del evento de clic.
 */
function handleButtonClick(event) {
    // --- ¡LA CORRECCIÓN ESTÁ AQUÍ! ---
    // 1. Primero, comprobamos si el clic fue en el 'divVolver'.
    //    Como es un DIV, necesita un tratamiento especial.
    if (divVolver.contains(event.target)) {
        handleAction('hide-screen'); // Llamamos directamente a la acción correcta.
        return; // Y terminamos la función aquí.
    }

    // 2. Si no fue 'divVolver', continuamos con la lógica original para el teclado.
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

async function handleAction(action) {
    switch (action) {
        case 'view-screen': bajarteclado(); break;
        case 'calculate': await calcular(); break; 
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

// --- LÓGICA DE LA APLICACIÓN (sin cambios) ---
function escribir(t) {
    const currentDisplay = display.innerHTML;
    const isOperator = ['+', '-', 'x', '/'].includes(t);
    const hasBinaryOperatorInExpression = /[+\-x/]/.test(currentDisplay.slice(currentDisplay.startsWith('-') ? 1 : 0).replace(/^[0-9,]+/, ''));
    if (t === "c") {
        display.innerHTML = "0";
    } else if (t === "del") {
        display.innerHTML = currentDisplay.slice(0, -1) || "0";
    } else if (isOperator) {
        const lastChar = currentDisplay.slice(-1);
        const lastCharIsOperator = ['+', '-', 'x', '/'].includes(lastChar);
        if (hasBinaryOperatorInExpression && !lastCharIsOperator) {
            return;
        } else if (lastCharIsOperator) {
            if (lastChar === t) return;
            display.innerHTML = currentDisplay.slice(0, -1) + t;
        } else if (currentDisplay === "0") {
            if (t === '-') { display.innerHTML = t; } else { return; }
        } else if (currentDisplay.endsWith(',')) {
            return;
        } else {
            display.innerHTML = currentDisplay + t;
        }
    } else {
        if (t === ',' && currentDisplay.endsWith(',')) return;
        display.innerHTML = (currentDisplay === "0" && t !== ',') ? t : currentDisplay + t;
    }
    activadoBotones(display.innerHTML);
    actualizarEstadoDivisionUI(false);
}

async function calcular() {
    const entrada = display.innerHTML;
    const operadorMatch = entrada.match(/[\+\-x/]/);
    if (!operadorMatch || !/^-?[0-9,]+\s*[+\-x/]\s*(-?[0-9,]+)?$/.test(entrada) || ['+', '-', 'x', '/'].includes(entrada.slice(-1)) || entrada.endsWith(',')) {
        salida.innerHTML = '';
        salida.appendChild(crearMensajeError(errorMessages.invalidOperation));
        bajarteclado();
        actualizarEstadoDivisionUI(false);
        return;
    }
    const operador = operadorMatch[0];
    const numerosAR = parsearNumeros(entrada, operador);
    bajarteclado();
    salida.innerHTML = "";
    switch (operador) {
        case "+": await suma(numerosAR); break;
        case "-": resta(numerosAR); break;
        case "x": multiplica(numerosAR); break;
        case "/":
            lastDivisionState = { operacionInput: entrada, numerosAR, tipo: 'division' };
            divext ? divideExt(numerosAR) : divide(numerosAR);
            break;
        default:
            salida.appendChild(crearMensajeError(errorMessages.invalidOperation));
    }
    const calculationError = salida.querySelector('.output-screen__error-message');
    if (operador === '/' && !calculationError) {
        actualizarEstadoDivisionUI(true);
    } else {
        actualizarEstadoDivisionUI(false);
    }
    if (!calculationError) {
        HistoryManager.add({ input: entrada, visualHtml: salida.innerHTML });
    }
    activadoBotones(display.innerHTML);
}

function divideExpandida(esExpandida) {
    divext = esExpandida;
    actualizarEstadoDivisionUI(true);
    bajarteclado();
    requestAnimationFrame(() => {
        if (!lastDivisionState.numerosAR || lastDivisionState.tipo !== 'division') {
            salida.appendChild(crearMensajeError(errorMessages.noDivisionCalculated));
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
    teclado.classList.remove('keyboard--hidden');
    salida.classList.remove('output-screen--visible');
    divVolver.classList.remove('bottom-nav--visible');
    activadoBotones(display.innerHTML);
    HistoryPanel.close(); // Esta línea ahora funcionará correctamente.
}

function bajarteclado() {
    teclado.classList.add('keyboard--hidden');
    salida.classList.add('output-screen--visible');
    divVolver.classList.add('bottom-nav--visible');
}

function actualizarEstadoDivisionUI(esDivisionValida) {
    if (esDivisionValida) {
        botExp.style.display = divext ? "none" : "inline-block";
        botNor.style.display = divext ? "inline-block" : "none";
    }
    else if (botExp && botNor) { 
        botExp.style.display = "none";
        botNor.style.display = "none";
        lastDivisionState = { operacionInput: '', numerosAR: null, tipo: '' };
    }
}

function activadoBotones(contDisplay) {
    const esSoloCero = contDisplay === '0';
    const hasBinaryOperatorInExpression = /[+\-x/]/.test(contDisplay.slice(contDisplay.startsWith('-') ? 1 : 0).replace(/^[0-9,]+/, ''));
    const partes = contDisplay.split(/[\+\-x/]/);
    const ultimoNumero = partes[partes.length - 1];
    const demasiadosCaracteres = contDisplay.length >= 21;
    const ultimoNumeroDemasiadoLargo = ultimoNumero.length >= 15;
    const deshabilitarNumeros = demasiadosCaracteres || ultimoNumeroDemasiadoLargo;
    document.querySelectorAll('.keyboard__button--number').forEach(btn => {
        btn.disabled = deshabilitarNumeros;
    });
    document.querySelectorAll('[data-value="+"], [data-value="-"], [data-value="x"], [data-value="/"]').forEach(btn => {
        if (demasiadosCaracteres || hasBinaryOperatorInExpression || esSoloCero || contDisplay.endsWith(',')) {
            btn.disabled = true;
        } else {
            btn.disabled = false;
        }
    });
    const puedeAnadirComa = !ultimoNumero.includes(',');
    const btnComa = document.querySelector('[data-value=","]');
    if (btnComa) btnComa.disabled = !puedeAnadirComa || deshabilitarNumeros;
    const esNumeroEnteroSimple = /^\d+$/.test(contDisplay) && !esSoloCero && !hasBinaryOperatorInExpression;
    document.querySelectorAll('[data-action="primos"], [data-action="raiz"]').forEach(btn => {
        btn.disabled = !esNumeroEnteroSimple;
    });
    const esCalculable = /^-?[0-9,]+\s*[+\-x/]\s*(-?[0-9,]+)$/.test(contDisplay);
    const btnIgual = document.querySelector('[data-action="calculate"]');
    if (btnIgual) btnIgual.disabled = !esCalculable;
}

// --- PUNTO DE ENTRADA ---
document.addEventListener('DOMContentLoaded', alCargar);