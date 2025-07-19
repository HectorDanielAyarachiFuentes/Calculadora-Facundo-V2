// =======================================================
// --- main.js (VERSIÓN FINAL Y CORREGIDA) ---
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

// --- VARIABLES DE ESTADO ---
let w;
let divext = false;
let lastDivisionState = { operacionInput: '', numerosAR: null, tipo: '' };

// --- INICIALIZACIÓN Y EVENTOS ---
function alCargar() {
    w = Math.min(window.innerHeight / 1.93, window.innerWidth / 1.5);
    contenedor.style.width = `${w}px`;
    display.style.fontSize = `${w * 0.085}px`;
    teclado.style.fontSize = `${0.1 * w}px`;
    // ... y el resto de tus cálculos de tamaño ...

    contenedor.style.opacity = "1";
    display.innerHTML = '0';

    activadoBotones('0');
    if (window.HistoryManager) HistoryManager.init();
    if (window.HistoryPanel) HistoryPanel.init();
    actualizarEstadoDivisionUI(false);
    setupEventListeners();
}

function setupEventListeners() {
    teclado.addEventListener('click', handleButtonClick);
    divVolver.addEventListener('click', handleButtonClick);
    document.addEventListener('keydown', handleKeyboardInput);
    window.addEventListener('resize', alCargar);
}

// --- MANEJADORES DE ACCIONES ---
function handleButtonClick(event) {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    const value = button.dataset.value;
    const action = button.dataset.action;
    if (value) escribir(value);
    else if (action) handleAction(action);
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

// --- LÓGICA DE LA APLICACIÓN ---
function escribir(t) {
    if (!['c', 'del'].includes(t)) {
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

function calcular() {
    const entrada = display.innerHTML;
    const operadorMatch = entrada.match(/[\+\-x/]/);
    if (!operadorMatch) return;

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
    });
}

function divideExpandida(esExpandida) {
    divext = esExpandida;
    actualizarEstadoDivisionUI(true);
    bajarteclado();
    requestAnimationFrame(() => {
        if (!lastDivisionState.numerosAR) return;
        salida.innerHTML = "";
        divext ? divideExt(lastDivisionState.numerosAR) : divide(lastDivisionState.numerosAR);
    });
}

// --- FUNCIONES DE UI ---
function subirteclado() {
    teclado.classList.remove('keyboard--hidden');
    salida.classList.remove('output-screen--visible');
    divVolver.classList.remove('bottom-nav--visible');
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

    document.querySelectorAll('.keyboard__button[data-value]').forEach(btn => {
        if (!isNaN(parseInt(btn.dataset.value, 10))) {
            btn.disabled = deshabilitarNumeros;
        }
    });

    const puedeAnadirOperador = !esSoloCero && !tieneOperadorAlFinal && !tieneComaAlFinal;
    document.querySelectorAll('[data-value="+"], [data-value="-"], [data-value="x"], [data-value="/"]').forEach(btn => {
        btn.disabled = !puedeAnadirOperador || demasiadosCaracteres;
    });

    const puedeAnadirComa = !ultimoNumero.includes(',') && !tieneOperadorAlFinal;
    const btnComa = document.querySelector('[data-value=","]');
    if (btnComa) btnComa.disabled = !puedeAnadirComa || deshabilitarNumeros;

    const esNumeroEnteroSimple = /^\d+$/.test(contDisplay) && !esSoloCero;
    document.querySelectorAll('[data-action="primos"], [data-action="raiz"]').forEach(btn => {
        btn.disabled = !esNumeroEnteroSimple;
    });

    const esCalculable = /[\+\-x/]/.test(contDisplay) && !tieneOperadorAlFinal && !tieneComaAlFinal;
    const btnIgual = document.querySelector('[data-action="calculate"]');
    if (btnIgual) btnIgual.disabled = !esCalculable;
}

// --- PUNTO DE ENTRADA ---
document.addEventListener('DOMContentLoaded', alCargar);