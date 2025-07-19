[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/HectorDanielAyarachiFuentes/Calculadora-Facundo-V2)

Entiendo que quieres el README en formato Markdown (.md). El README que te proporcioné anteriormente ya está en formato Markdown. <cite/>

Aquí tienes el archivo README.md completo basado en **La Calculadora de Facundo** [1](#4-0) :

```markdown
# 🧮 La Calculadora de Facundo

Una calculadora web educativa moderna que visualiza algoritmos matemáticos paso a paso con animaciones interactivas.

## ✨ Características

- **Visualización Educativa**: Muestra el proceso completo de operaciones matemáticas con grillas visuales
- **Operaciones Avanzadas**: Suma, resta, multiplicación, división (normal y expandida), factorización prima y raíz cuadrada
- **Interfaz Responsiva**: Se adapta automáticamente a diferentes tamaños de pantalla
- **Historial Persistente**: Guarda automáticamente las operaciones realizadas
- **Soporte de Teclado**: Funciona tanto con teclado físico como virtual
- **Precisión BigInt**: Maneja números grandes sin pérdida de precisión

## 🚀 Demo en Vivo

Visita: [https://hectordanielayarachifuentes.github.io/CALCULADORA-FACUNDO/](https://hectordanielayarachifuentes.github.io/CALCULADORA-FACUNDO/)

## 🛠️ Tecnologías

- **HTML5**: Estructura semántica con soporte para accesibilidad
- **CSS3**: Diseño responsivo con variables CSS y animaciones
- **JavaScript ES6+**: Módulos, BigInt, y manipulación avanzada del DOM
- **LocalStorage**: Persistencia de historial sin servidor

## 📁 Estructura del Proyecto

```
├── index.html              # Documento principal
├── main.js                 # Orquestador de la aplicación
├── style.css              # Estilos principales
├── config.js              # Configuración y referencias DOM
├── history.js             # Sistema de historial
└── operations/
    ├── index.js           # Exportaciones centralizadas
    ├── modules/           # Módulos de operaciones matemáticas
    │   ├── addition.js
    │   ├── subtraction.js
    │   ├── multiplication.js
    │   ├── division.js
    │   ├── square-root.js
    │   └── prime-factors.js
    └── utils/             # Utilidades auxiliares
        ├── dom-helpers.js
        ├── layout-calculator.js
        └── parsers.js
```

## 🎯 Funcionalidades Principales

### Operaciones Básicas
- **Suma y Resta**: Con visualización de acarreo
- **Multiplicación**: Muestra productos parciales paso a paso
- **División**: Modo normal y expandido con algoritmo de división larga

### Operaciones Especiales
- **Factorización Prima**: Descomposición visual en factores primos
- **Raíz Cuadrada**: Cálculo con visualización del proceso

### Sistema de Historial
- Almacenamiento automático de operaciones
- Interfaz deslizable desde el lateral derecho
- Persistencia en localStorage

## 🎮 Uso

### Teclado Virtual
Utiliza los botones en pantalla para introducir números y operadores.

### Atajos de Teclado
- **Números**: `0-9`
- **Operadores**: `+`, `-`, `*` (o `x`), `/`
- **Decimal**: `,` o `.`
- **Calcular**: `Enter` o `=`
- **Borrar**: `Backspace`
- **Limpiar**: `Delete` o `Escape`

### Navegación
- **Ver Pantalla**: Muestra los resultados visuales
- **Volver**: Regresa al teclado
- **DIV EXPAND./NORMAL**: Alterna entre modos de división

## 🔧 Instalación Local

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/HectorDanielAyarachiFuentes/Calculadora-Facundo-V2.git
   ```

2. **Navega al directorio**:
   ```bash
   cd Calculadora-Facundo-V2
   ```

3. **Abre en un servidor local**:
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js (npx)
   npx serve .
   
   # O simplemente abre index.html en tu navegador
   ```

4. **Visita**: `http://localhost:8000`

## 🏗️ Arquitectura Técnica

### Patrón Modular
La aplicación utiliza ES6 modules con una arquitectura basada en eventos:

- **main.js**: Orquestador principal y manejo de eventos
- **operations/**: Módulos especializados para cada operación matemática
- **utils/**: Utilidades para DOM, layout y parsing

### Gestión de Estado
- Estado global mínimo con variables específicas
- Sistema de historial con patrón Manager/Panel
- Persistencia automática en localStorage

### Renderizado Visual
- Generación dinámica de grillas matemáticas
- Posicionamiento absoluto calculado dinámicamente
- Animaciones CSS con JavaScript

## 🎨 Personalización

### Variables CSS
El tema se puede personalizar modificando las variables CSS en `style.css`:

```css
:root {
    --primary-color: #66FF66;
    --background-color: #1a1a1a;
    --text-color: #ffffff;
    /* ... más variables */
}
```

### Configuración
Ajusta límites y comportamientos en `config.js` y los módulos de operaciones.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Hector Daniel Ayarachi Fuentes** (Facundo Killer)
- GitHub: [@HectorDanielAyarachiFuentes](https://github.com/HectorDanielAyarachiFuentes)

## 🙏 Agradecimientos

- Inspirado en métodos de enseñanza matemática tradicionales
- Diseñado para estudiantes y educadores
- Construido con amor para la comunidad educativa

---

⭐ **¡Dale una estrella si te gusta el proyecto!** ⭐
```

## Notes

Este README está completamente en formato Markdown (.md) y listo para ser guardado como `README.md` en la raíz del repositorio. Incluye toda la información esencial del proyecto basada en el análisis del código fuente [2](#4-1) , con estructura clara, emojis para mejor legibilidad, y secciones organizadas que cubren desde instalación hasta contribución.

Wiki pages you might want to explore:
- [Overview (HectorDanielAyarachiFuentes/Calculadora-Facundo-V2)](/wiki/HectorDanielAyarachiFuentes/Calculadora-Facundo-V2#1)
