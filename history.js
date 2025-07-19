// =======================================================
// --- history.js ---
// Gestiona la lógica del historial de cálculos,
// su almacenamiento y la interacción con el panel de historial.
// =======================================================
"use strict";

const HistoryManager = (function() {
    const HISTORY_KEY = "calculatorHistory";
    let history = [];

    function load() {
        try {
            history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        } catch (e) {
            console.error("Error al cargar historial desde localStorage:", e);
            history = [];
        }
    }

    function save() {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch (e) {
            console.error("Error al guardar historial en localStorage:", e);
        }
    }

    function dispatch(name, detail) {
        window.dispatchEvent(new CustomEvent(name, { detail }));
    }

    return {
        init: function() {
            load();
        },
        add: function(entry) {
            const existingIndex = history.findIndex(item =>
                item.input === entry.input &&
                item.visualHtml === entry.visualHtml &&
                item.type === entry.type
            );

            if (existingIndex !== -1) {
                const [movedEntry] = history.splice(existingIndex, 1);
                history.unshift(movedEntry);
                dispatch("history:duplicate", { index: 0 });
            } else {
                history.unshift(entry);
                if (history.length > 50) {
                    history.pop();
                }
                dispatch("history:updated");
            }
            save();
        },
        getAll: () => [...history],
        clear: function() {
            history = [];
            save();
            dispatch("history:updated");
        }
    };
})();

const HistoryPanel = (function() {
    let panel, list, toggleBtn, clearBtn;

    function render() {
        const entries = HistoryManager.getAll();
        list.innerHTML = "";

        if (entries.length === 0) {
            list.innerHTML = '<li><span class="history-input">El historial está vacío.</span></li>';
            clearBtn.disabled = true;
            return;
        }

        clearBtn.disabled = false;

        entries.forEach((entry, i) => {
            const li = document.createElement("li");
            li.dataset.historyIndex = i;
            li.setAttribute('role', 'option');

            let resText = "";
            if (entry.type === 'visual') {
                resText = "[Visual]";
            } else {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = entry.visualHtml;
                const resCells = tempDiv.querySelectorAll('.caja4');
                if (resCells.length > 0) {
                    resText = Array.from(resCells).map(c => c.textContent).join('').trim();
                } else if (tempDiv.querySelector('.error')) {
                    resText = "[ERROR]";
                } else {
                    resText = tempDiv.textContent.replace(/<[^>]*>/g, '').trim();
                }
            }
            resText = resText || "?";

            li.innerHTML = `<span class="history-input">${entry.input}</span><span class="history-result-preview">= ${resText}</span>`;
            list.appendChild(li);
        });
    }

    function onItemClick(e) {
        const item = e.target.closest("li[data-history-index]");
        if (!item) return;

        const entry = HistoryManager.getAll()[item.dataset.historyIndex];
        if (entry) {
            display.innerHTML = entry.input;
            const isDivision = entry.input.includes('/');

            bajarteclado(); 

            requestAnimationFrame(() => {
                if (isDivision) {
                    const operator = entry.input.match(/[\+\-x/]/)[0];
                    const numerosAR = parsearNumeros(entry.input, operator);
                    lastDivisionState = { operacionInput: entry.input, numerosAR, tipo: 'division' };
                    divext = false;
                    divide(numerosAR);
                    actualizarEstadoDivisionUI(true);
                } else {
                    salida.innerHTML = entry.visualHtml;
                    actualizarEstadoDivisionUI(false);
                }
                activadoBotones(entry.input);
            });

            panel.classList.remove("open");
            toggleBtn.setAttribute('aria-expanded', 'false');
            panel.setAttribute('aria-hidden', 'true');
        }
    }

    function onClear() {
        if (confirm("¿Seguro que quieres borrar todo el historial?")) {
            HistoryManager.clear();
            actualizarEstadoDivisionUI(false);
        }
    }

    function onDuplicate(e) {
        if (!panel.classList.contains("open")) {
            panel.classList.add("open");
            toggleBtn.setAttribute('aria-expanded', 'true');
            panel.setAttribute('aria-hidden', 'false');
        }
        render();

        const firstItem = list.querySelector('li[data-history-index="0"]');
        if (firstItem) {
            firstItem.classList.remove("history-item-highlight");
            void firstItem.offsetWidth;
            firstItem.classList.add("history-item-highlight");
        }
    }

    return {
        init: function() {
            panel = document.getElementById("history-panel");
            list = document.getElementById("history-list");
            toggleBtn = document.getElementById("history-toggle-btn");
            clearBtn = document.getElementById("clear-history-btn");

            toggleBtn.addEventListener("click", () => {
                const isOpen = panel.classList.toggle("open");
                toggleBtn.setAttribute('aria-expanded', String(isOpen));
                panel.setAttribute('aria-hidden', String(!isOpen));
            });
            clearBtn.addEventListener("click", onClear);
            list.addEventListener("click", onItemClick);

            window.addEventListener("history:updated", render);
            window.addEventListener("history:duplicate", onDuplicate);

            document.body.addEventListener("click", (event) => {
                if (panel.classList.contains("open") && !panel.contains(event.target) && !toggleBtn.contains(event.target)) {
                    panel.classList.remove("open");
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    panel.setAttribute('aria-hidden', 'true');
                }
            });

            render();
        }
    };
})();