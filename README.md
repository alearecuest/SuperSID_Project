# SuperSID Advanced Analysis Project

## English

**SuperSID** is a project for the advanced analysis of sudden ionospheric disturbances (SID) using VLF radio data. This repository offers tools to calculate statistics, correlate events with solar and weather data, visualize spectrograms, create predictive models, and map SID events geographically.

### Features

- **SID event statistics:** Frequency, duration, interval, and trends.
- **Correlation analyses:** Solar activity (sunspots, flares) and local weather.
- **Spectral analysis:** Spectrograms and frequency domain visualization.
- **Prediction models:** Machine learning for SID event forecasting.
- **Geographical mapping:** Visualization of SID events across multiple stations.
- **Advanced comparisons:** Scatter plots, seasonal trends, and satellite data overlays.

### Project Structure

```
supersid/
│
├── data/                # Raw and processed data (CSV, TXT, etc.)
├── notebooks/           # Jupyter notebooks for analysis and visualization
├── analysis/            # Python scripts for advanced calculations and plots
├── docs/                # Extra documentation, papers, references
├── tests/               # Automated tests for scripts and modules
├── requirements.txt     # Project dependencies
├── README.md            # Project guide (English & Spanish)
└── .gitignore           # Git ignored files and folders
```

### Getting Started

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Add your data:** Place your SuperSID data files in the `data/` directory.
3. **Run analyses:** Use the scripts in `analysis/` or explore with notebooks in `notebooks/`.
4. **Test scripts:** Run tests in the `tests/` folder to check functionality.

### Notebooks

Find interactive examples in `notebooks/` to help you get started with data analysis and visualization.

### Contributing

Feel free to open issues or pull requests to improve the project and share new ideas!

---

### Credits

- Project maintained by [Alejandro Arévalo](https://github.com/alearecuest).
- Inspired by the [Stanford Solar Center SuperSID Project](https://solar-center.stanford.edu/SID/) and contributions from the global SID monitoring community.
- Special thanks to open-source contributors and data providers.

### License

This project is licensed under the MIT License. See the [LICENSE](docs/LICENSE.md) file for details.

### External Links

- [Stanford Solar Center SuperSID Project](https://solar-center.stanford.edu/SID/)
- [NOAA Space Weather Prediction Center](https://www.swpc.noaa.gov/)
- [NASA Solar Data Resources](https://www.nasa.gov/solar/)
- [SuperSID GitHub Repo (original)](https://github.com/alearecuest/supersid)

---

## Español

**SuperSID** es un proyecto para el análisis avanzado de perturbaciones ionosféricas súbitas (SID) utilizando datos de radio VLF. Este repositorio ofrece herramientas para calcular estadísticas, correlacionar eventos con datos solares y meteorológicos, visualizar espectrogramas, crear modelos predictivos y mapear eventos SID geográficamente.

### Características

- **Estadísticas de eventos SID:** Frecuencia, duración, intervalo y tendencias.
- **Análisis de correlación:** Actividad solar (manchas, fulguraciones) y clima local.
- **Análisis espectral:** Espectrogramas y visualización en frecuencia.
- **Modelos de predicción:** Machine learning para anticipar eventos SID.
- **Mapas geográficos:** Visualización de eventos SID en múltiples estaciones.
- **Comparaciones avanzadas:** Gráficos de dispersión, tendencias estacionales y superposición de datos satelitales.

### Estructura del Proyecto

```
supersid/
│
├── data/                # Datos crudos y procesados (CSV, TXT, etc.)
├── notebooks/           # Notebooks Jupyter para análisis y visualización
├── analysis/            # Scripts Python para cálculos y gráficos avanzados
├── docs/                # Documentación extra, papers, referencias
├── tests/               # Pruebas automáticas para scripts y módulos
├── requirements.txt     # Dependencias del proyecto
├── README.md            # Guía del proyecto (inglés y español)
└── .gitignore           # Archivos y carpetas ignorados por git
```

### Cómo Empezar

1. **Instala las dependencias:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Agrega tus datos:** Coloca los archivos de datos SuperSID en la carpeta `data/`.
3. **Ejecuta análisis:** Usa los scripts en `analysis/` o explora con los notebooks en `notebooks/`.
4. **Prueba los scripts:** Ejecuta los tests en la carpeta `tests/` para verificar el funcionamiento.

### Notebooks

Encuentra ejemplos interactivos en `notebooks/` para comenzar con el análisis y visualización de datos.

### Contribuye

¡Abre issues o pull requests para mejorar el proyecto y compartir nuevas ideas!

---

### Créditos

- Proyecto mantenido por [Alejandro Arévalo](https://github.com/alearecuest).
- Inspirado en el [Proyecto SuperSID del Stanford Solar Center](https://solar-center.stanford.edu/SID/) y en las contribuciones de la comunidad global de monitoreo SID.
- Agradecimientos especiales a colaboradores de código abierto y proveedores de datos.

### Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](docs/LICENSE.md) para más detalles.

### Enlaces Externos

- [Proyecto SuperSID del Stanford Solar Center](https://solar-center.stanford.edu/SID/)
- [Centro de Predicción del Clima Espacial NOAA](https://www.swpc.noaa.gov/)
- [Recursos de Datos Solares de NASA](https://www.nasa.gov/solar/)
- [Repositorio original SuperSID en GitHub](https://github.com/alearecuest/supersid)
