# SuperSID App – Developer Guide

Este documento explica cómo el backend API determina la **ruta de datos** donde SuperSID App guarda y lee sus datos procesados (archivos Parquet, features, etc.).

---

## Índice

- [Resolución de la ruta de datos (orden de prioridad)](#resolución-de-la-ruta-de-datos-orden-de-prioridad)  
  - [1. Variable de entorno](#1-variable-de-entorno)  
  - [2. Archivo de configuración (TOML)](#2-archivo-de-configuración-toml)  
  - [3. Valor por defecto](#3-valor-por-defecto)  
- [Ejemplos: ejecutar la API](#ejemplos-ejecutar-la-api)  
  - [Desarrollo (ruta por defecto)](#desarrollo-ruta-por-defecto)  
  - [Con variable de entorno](#con-variable-de-entorno)  
  - [Con archivo de configuración personalizado](#con-archivo-de-configuración-personalizado)  
- [Notas para desarrolladores](#notas-para-desarrolladores)  
- [Anexos útiles](#anexos-útiles)

---

## Resolución de la ruta de datos (orden de prioridad)

La aplicación resuelve la **ruta de datos** en el siguiente orden (de mayor a menor prioridad):

### 1. Variable de entorno
Si `SUPERSID_DATA` está definida, su valor se usa como directorio raíz de datos.

**Ejemplo (arrancando uvicorn con variable):**
```bash
SUPERSID_DATA=/var/supersid/data uvicorn supersid.api.server:make_app --factory --reload --port 8000
```

### 2. Archivo de configuración (TOML)
Si no hay variable de entorno, la aplicación busca un archivo de configuración (por defecto: `./configs/montevideo.toml`). Dentro del TOML se espera una sección `[data]` con `path`.

**Ejemplo `configs/montevideo.toml`:**
```toml
[data]
path = "./data"
```

> Nota: la ruta en el TOML puede ser relativa al directorio desde donde se ejecuta la app o absoluta.

### 3. Valor por defecto
Si no se encuentra ni la variable de entorno ni el archivo de configuración, la aplicación usa por defecto:
```
./data
```

---

## Ejemplos: ejecutar la API

### Desarrollo (ruta por defecto)
```bash
uvicorn supersid.api.server:make_app --factory --reload --port 8000
```

### Con variable de entorno
```bash
SUPERSID_DATA=/absolute/path/to/data uvicorn supersid.api.server:make_app --factory --reload --port 8000
```

### Con archivo de configuración personalizado
Si querés usar el TOML por defecto (`./configs/montevideo.toml`), basta con ejecutar:
```bash
uvicorn supersid.api.server:make_app --factory --reload --port 8000
```

Si la aplicación soporta pasar un archivo de configuración alternativo mediante flag o variable (p. ej. `--config`), consultá la implementación para la sintaxis exacta y usala así:
```bash
uvicorn supersid.api.server:make_app --factory --reload --port 8000 --config /path/to/otro.toml
```

---

## Notas para desarrolladores

- Asegurarse de que la ruta de datos seleccionada exista y sea **escribible** por el proceso que corre la API (permisos de usuario/grupo).
- Para **producción**, preferir **variables de entorno** por su flexibilidad y porque evitan incluir rutas específicas en el repositorio.
- Para entornos locales o múltiples estaciones, usar **archivos TOML** dentro de `configs/` (uno por estación/instancia).
- `./data` es únicamente para **desarrollo rápido** y testing; no usarlo como ruta principal en producción.
- Manejar errores claros: si la ruta no existe o no es escribible, la app debería:
  - Registrar un error claro en logs.
  - Fallar rápido (exit) con un mensaje útil o, si está permitido, crear la ruta automáticamente.
- Considerar añadir validaciones al arranque que impriman la ruta final usada para facilitar el debug.

---

## Anexos útiles

### A. Snippet Python: validar la ruta de datos
Snippet para validar existencia, que sea directorio y que sea escribible:

```python
import os
import sys

def validate_data_path(path: str) -> None:
    if not os.path.exists(path):
        raise SystemExit(f"ERROR: data path does not exist: {path}")
    if not os.path.isdir(path):
        raise SystemExit(f"ERROR: data path is not a directory: {path}")
    # comprobar permisos de escritura
    testfile = os.path.join(path, ".write_test")
    try:
        with open(testfile, "w") as f:
            f.write("ok")
        os.remove(testfile)
    except Exception as e:
        raise SystemExit(f"ERROR: no write permission on data path {path}: {e}")

if __name__ == "__main__":
    # Priorizar variable de entorno, luego fallback a ./data (la detección desde TOML
    # asume que la lectura de TOML ocurre en otro punto del arranque si aplica).
    data_path = os.environ.get("SUPERSID_DATA") or "./data"
    validate_data_path(data_path)
    print(f"Using data path: {data_path}")
```

---

### B. Ejemplo rápido de `systemd` unit (opcional)
Archivo `/etc/systemd/system/supersid.service` ejemplo:

```ini
[Unit]
Description=SuperSID API
After=network.target

[Service]
User=supersid
Group=supersid
WorkingDirectory=/opt/supersid
Environment=SUPERSID_DATA=/var/supersid/data
ExecStart=/usr/bin/env uvicorn supersid.api.server:make_app --factory --port 8000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

---

### C. Ejemplo Docker / docker-compose (pasando volumen y variable)
`Dockerfile` (simplificado):

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . /app
RUN pip install -r requirements.txt
CMD ["uvicorn", "supersid.api.server:make_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
```

`docker-compose.yml`:
```yaml
version: "3.8"
services:
  supersid:
    build: .
    ports:
      - "8000:8000"
    environment:
      - SUPERSID_DATA=/data
    volumes:
      - ./data:/data
```

---
