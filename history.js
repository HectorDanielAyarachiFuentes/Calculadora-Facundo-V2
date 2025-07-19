// =======================================================
// --- history.js (MÓDULO ES6 COMPLETO) ---
// Gestiona el historial de operaciones, incluyendo persistencia y renderizado.
// =======================================================
"use strict";

import { display, salida } from './config.js'; // Importar display y salida directamente
import { crearMensajeError } from './operations/utils/dom-helpers.js'; // Para manejar errores

class HistoryManagerClass {
    constructor() {
        this.history = [];
        this.MAX_HISTORY_ITEMS = 10;
        this.HISTORY_STORAGE_KEY = 'calculatorHistory';
    }

    init() {
        this.loadHistory();
        HistoryPanel.renderHistory();
        // Los event listeners para los botones de historial se mueven a HistoryPanel
        // para encapsular la lógica del UI del historial.
    }

    add(item) { // item: { input: "...", visualHtml: "...", type: "visual" }
        // Asegurarse de que el resultado se extraiga y se guarde
        if (!item.result) {
            item.result = HistoryPanel.extractResultText(item.visualHtml);
        }
        this.history.unshift(item); // Añadir al principio
        if (this.history.length > this.MAX_HISTORY_ITEMS) {
            this.history.pop(); // Eliminar el más antiguo
        }
        this.saveHistory();
        HistoryPanel.renderHistory();
        HistoryPanel.highlightLastItem();
    }

    getHistory() { return this.history; }
    clearAll() {
        this.history = [];
        this.saveHistory();
        HistoryPanel.renderHistory();
    }
    loadHistory() {
        const storedHistory = localStorage.getItem(this.HISTORY_STORAGE_KEY);
        this.history = storedHistory ? JSON.parse(storedHistory) : [];
    }
    saveHistory() { localStorage.setItem(this.HISTORY_STORAGE_KEY, JSON.stringify(this.history)); }
}

class HistoryPanelClass {
    constructor() {
        this.panel = document.getElementById('history-panel');
        this.list = document.getElementById('history-list');
        this.toggleButton = document.getElementById('history-toggle-btn');
        this.clearButton = document.getElementById('clear-history-btn');
    }

    init() {
        this.addEventListeners();
        this.renderHistory();
    }

    addEventListeners() {
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggle());
        }
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => HistoryManager.clearAll());
        }
    }

    renderHistory() {
        this.list.innerHTML = '';
        HistoryManager.getHistory().forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'history-panel__item';
            li.dataset.index = index;
            // Usamos el 'input' y el 'result' pre-extraído para el preview
            li.innerHTML = `
                <span class="history-panel__input">${item.input}</span>
                <span class="history-panel__result">= ${item.result}</span>
            `;
            // Listener para cargar el resultado visual al hacer clic en el historial
            li.addEventListener('click', () => {
                salida.innerHTML = item.visualHtml; // Restaura la visualización completa
                display.innerHTML = item.input; // Opcional: restaura la entrada en el display principal
                // Si la visualización es un error, el HistoryManager ya debería haber guardado el HTML de error.
                // Si necesitas el color rojo para el error al restaurar, el HTML guardado debe contenerlo.
                // Asegúrate de que HistoryPanel sepa cómo extraer el error o el resultado.
                this.toggle(); // Cerrar el panel del historial
            });
            this.list.appendChild(li);
        });
    }

    // Extrae el texto del resultado o mensaje de error de un HTML visual
    extractResultText(htmlString) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        const cociente = tempDiv.querySelector('.output-grid__cell--cociente');
        if (cociente) return cociente.textContent;
        const resto = tempDiv.querySelector('.output-grid__cell--resto'); // Para la división final
        if (resto) return resto.textContent; // Podrías combinar con cociente si quieres "Cociente: X Resto: Y"
        const error = tempDiv.querySelector('.output-screen__error-message');
        if (error) return error.textContent;
        // Fallback: Si no es una operación visual específica, coge el primer texto significativo
        return tempDiv.textContent.trim().split('\n')[0] || 'Resultado';
    }

    toggle() {
        this.panel.classList.toggle('history-panel--open');
        this.panel.setAttribute('aria-hidden', !this.panel.classList.contains('history-panel--open'));
        this.toggleButton.setAttribute('aria-expanded', this.panel.classList.contains('history-panel--open'));
        // Si el panel se abre, podría ser útil desactivar la interactividad del teclado principal.
        // Pero como ya lo maneja 'bajarteclado/subirteclado', no es necesario aquí.
    }
}

// Exporta las instancias de las clases
export const HistoryManager = new HistoryManagerClass();
export const HistoryPanel = new HistoryPanelClass();