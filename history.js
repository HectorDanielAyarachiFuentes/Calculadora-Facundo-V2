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
    }

    add(item) {
        // --- ¡NUEVA LÓGICA DE DETECCIÓN DE DUPLICADOS! ---
        const duplicateIndex = this.history.findIndex(existingItem => existingItem.input === item.input);
        if (duplicateIndex !== -1) {
            // Si se encuentra un duplicado, muestra la alerta
            alert('¡Oye! Ya has realizado esta operación antes. ¡Mira el historial!');
            // Abre el panel y resalta el elemento existente
            if (!HistoryPanel.isOpen()) {
                HistoryPanel.open();
            }
            HistoryPanel.highlightItem(duplicateIndex);
        }
        
        // El resto de la lógica para añadir el elemento continúa como siempre
        if (!item.result) {
            item.result = HistoryPanel.extractResultText(item.visualHtml);
        }
        this.history.unshift(item);
        if (this.history.length > this.MAX_HISTORY_ITEMS) {
            this.history.pop();
        }
        this.saveHistory();
        HistoryPanel.renderHistory();
        // Si no era un duplicado, resalta el nuevo elemento que se acaba de añadir
        if (duplicateIndex === -1) {
            HistoryPanel.highlightLastItem();
        }
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
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.confirmAndClear = this.confirmAndClear.bind(this);
    }

    init() {
        this.addEventListeners();
        this.renderHistory();
    }

    addEventListeners() {
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }
        if (this.clearButton) {
            this.clearButton.addEventListener('click', this.confirmAndClear);
        }
    }

    confirmAndClear() {
        const isConfirmed = window.confirm(
            '¿Estás seguro de que quieres borrar todo el historial?\n\nEsta acción no se puede deshacer.'
        );

        if (isConfirmed) {
            HistoryManager.clearAll();
        }
    }

    renderHistory() {
        this.list.innerHTML = '';
        HistoryManager.getHistory().forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'history-panel__item';
            li.dataset.index = index;
            li.innerHTML = `
                <span class="history-panel__input">${item.input}</span>
                <span class="history-panel__result">= ${item.result}</span>
            `;
            li.addEventListener('click', () => {
                salida.innerHTML = item.visualHtml; 
                display.innerHTML = item.input;
                this.close();
            });
            this.list.appendChild(li);
        });
    }

    extractResultText(htmlString) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        const cocienteElements = tempDiv.querySelectorAll('.output-grid__cell--cociente');
        if (cocienteElements.length > 0) {
            return Array.from(cocienteElements).map(el => el.textContent).join('');
        }
        const resto = tempDiv.querySelector('.output-grid__cell--resto'); 
        if (resto) {
            return `Resto: ${resto.textContent}`;
        }
        const error = tempDiv.querySelector('.output-screen__error-message');
        if (error) return error.textContent;
        return tempDiv.textContent.trim().split('\n')[0] || 'Resultado';
    }
    
    handleOutsideClick(event) {
        if (this.isOpen() && !this.panel.contains(event.target)) {
            this.close();
        }
    }
    
    isOpen() {
        return this.panel.classList.contains('history-panel--open');
    }

    open() {
        if (this.isOpen()) return;
        this.panel.classList.add('history-panel--open');
        document.addEventListener('click', this.handleOutsideClick, true);
    }

    close() {
        if (!this.isOpen()) return;
        this.panel.classList.remove('history-panel--open');
        document.removeEventListener('click', this.handleOutsideClick, true);
    }
    
    toggle() {
        this.isOpen() ? this.close() : this.open();
    }
    
    // --- NUEVO MÉTODO GENÉRICO PARA RESALTAR ---
    highlightItem(index) {
        const itemToHighlight = this.list.querySelector(`.history-panel__item[data-index="${index}"]`);
        if (itemToHighlight) {
            // Desplazarse al elemento si está fuera de la vista
            itemToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Aplicar la animación
            itemToHighlight.classList.add('history-item-highlight');
            setTimeout(() => {
                itemToHighlight.classList.remove('history-item-highlight');
            }, 1500); // Duración un poco más larga para que el usuario pueda verlo bien
        }
    }

    highlightLastItem() {
        // El último elemento añadido es siempre el primero en la lista (índice 0)
        this.highlightItem(0);
    }
}

// Exporta las instancias de las clases
export const HistoryManager = new HistoryManagerClass();
export const HistoryPanel = new HistoryPanelClass();