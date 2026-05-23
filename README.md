# HADES

**HADES** es una herramienta de escritorio orientada a la ayuda, aprendizaje y concientización en seguridad digital. Su objetivo es acompañar a usuarios no técnicos mediante módulos educativos, diagnósticos básicos, simuladores y guías preventivas frente a riesgos comunes de ciberseguridad.

El proyecto se desarrolla como parte del **Proyecto Final de Carrera** de la carrera **Licenciatura en Sistemas**.

---

## Descripción general

La herramienta busca ofrecer una experiencia simple y guiada para que el usuario pueda:

- conocer conceptos básicos de seguridad digital;
- evaluar hábitos preventivos;
- realizar diagnósticos simples de seguridad y privacidad;
- practicar con simuladores educativos;
- recibir recomendaciones ante posibles incidentes;
- registrar información básica de uso de manera local.

La aplicación se desarrolla con **Electron**, utilizando vistas construidas con **HTML**, **Tailwind CSS** y **JavaScript**. Para el almacenamiento local se utiliza **SQLite**.

---

## Tecnologías utilizadas

- **Electron:** framework para ejecutar la herramienta como aplicación de escritorio.
- **JavaScript:** lenguaje principal para la lógica de la aplicación.
- **HTML:** estructura de las vistas.
- **Tailwind CSS:** estilos y diseño visual de la interfaz.
- **SQLite:** base de datos local para almacenar información de la herramienta.
- **Node.js / npm:** entorno y gestor de dependencias del proyecto.
- **Git / GitHub:** control de versiones y repositorio del código fuente.

---

## Estructura del proyecto

```text
Proyecto_Final_Carrera/
│
├── electron/
│   ├── main.js
│   └── preload.js
│
├── src/
│   ├── pages/
│   │   ├── bienvenida.html
│   │   ├── dashboard.html
│   │   ├── diagnostico.html
│   │   └── entrenamiento.html
│   │
│   ├── assets/
│   │   ├── css/
│   │   │   ├── app.css
│   │   │   └── bienvenida.css
│   │   │
│   │   └── js/
│   │       └── bienvenida.js
│   │
│   └── database/
│       └── db.js
│
├── docs/
│   └── design-system.md
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md

