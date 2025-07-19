// =======================================================
// --- config.js ---
// Define constantes, variables globales, elementos DOM y mensajes.
// DEBE CARGARSE PRIMERO.
// =======================================================
"use strict";

// --- Constantes de Configuración ---
const multiplicadorTamFuente = 0.9;

// --- Elementos del DOM ---
const display = document.getElementById("display");
const salida = document.getElementById("salida");
const contenedor = document.getElementById("contenedor");
const teclado = document.getElementById("teclado");
const divVolver = document.getElementById("divvolver");
const botExp = document.getElementById("botexp");
const botNor = document.getElementById("botnor");
const header = document.getElementsByTagName("header")[0];

// --- Mensajes Centralizados ---
const errorMessages = {
    division1: "<p class='error'>El dividendo es cero, por lo tanto el resultado es cero.</p>",
    division2: "<p class='error'>El divisor es cero, no existe solución.</p>",
    division3: "<p class='error'>El dividendo y el divisor son cero, no existe solución.</p>",
    multiplicacion1: "<p class='error'>Multiplicar por cero da como resultado cero.</p>",
    multiplicacion2: "<p class='error'>El resultado es demasiado grande.</p>",
    raiz1: "<p class='error'>La raíz cuadrada de cero es cero.</p>",
    dFactorial1: "<p class='error'>No se puede descomponer el cero.</p>",
    invalidOperation: "<p class='error'>Operación inválida.</p>",
    invalidSqrtInput: "<p class='error'>Esta función solo acepta un número simple.</p>",
    integerSqrtRequired: "<p class='error'>La raíz cuadrada solo funciona con números enteros.</p>",
    negativeSqrt: "<p class='error'>No se puede calcular la raíz de un número negativo.</p>",
    nonExactSqrt: "<p class='error'>Este número no tiene una raíz cuadrada entera exacta.</p>",
    noDivisionCalculated: "<p class='error'>Primero realiza una división para usar esta función.</p>"
};

// --- Variables de Estado Global ---
let w; // Ancho base para cálculos de tamaño responsivo.
let divext = false; // Estado para la visualización de la división expandida.

// Objeto para guardar el estado de la última división realizada
let lastDivisionState = {
    operacionInput: '',
    numerosAR: null,
    tipo: ''
};