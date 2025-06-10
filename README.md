# Frontend UP 2025 - Rental de Playa

Repo del frontend para la materia de Full Stack Web Development. Este proyecto es una aplicación web para el sistema de reservas de un rental de playa en el Caribe.

## 🚀 Cómo levantar el Frontend

### Opción 1: Usando Live Server (Recomendado)

1. **Instalar la extensión Live Server en VS Code:**
   - Abrir VS Code
   - Ir a la pestaña de Extensiones (Ctrl+Shift+X)
   - Buscar "Live Server" por Ritwick Dey
   - Instalar la extensión

2. **Ejecutar el proyecto:**
   - Abrir la carpeta del proyecto en VS Code
   - Navegar al archivo `app/index.html`
   - Hacer clic derecho sobre el archivo
   - Seleccionar "Open with Live Server"
   - El proyecto se abrirá automáticamente en el navegador en `http://localhost:5500`

### Opción 2: Usando Python

1. **Navegar a la carpeta del proyecto:**
   ```powershell
   cd "..\frontend-up-2025\app"
   ```

2. **Para Python 3.x:**
   ```powershell
   python -m http.server 8000
   ```

3. **Para Python 2.x (si es necesario):**
   ```powershell
   python -m SimpleHTTPServer 8000
   ```

4. **Abrir en el navegador:**
   - Ir a `http://localhost:8000`

### Opción 3: Usando Node.js y http-server

1. **Instalar http-server globalmente:**
   ```powershell
   npm install -g http-server
   ```

2. **Navegar a la carpeta del proyecto:**
   ```powershell
   cd "c:\Users\yoluc\Documents\UP\Full Stack\frontend-up-2025\app"
   ```

3. **Ejecutar el servidor:**
   ```powershell
   http-server
   ```

4. **Abrir en el navegador:**
   - Ir a `http://localhost:8080`

## 🔗 Conexión con el Backend

**⚠️ IMPORTANTE:** Este frontend requiere estar conectado al backend para funcionar correctamente.

1. **Levantar el Backend primero:**
   - Consultar el README del repositorio del backend
   - Seguir las instrucciones para ejecutar el servidor backend
   - Asegurarse de que el backend esté corriendo en el puerto especificado

2. **Configuración de la API:**
   - El frontend está configurado para conectarse al backend
   - Verificar la configuración de la URL de la API en `js/api.js`
   - Por defecto, debería apuntar al servidor backend local

## 📁 Estructura del Proyecto

```
app/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos CSS
├── js/
│   ├── api.js          # Configuración y llamadas a la API
│   ├── app.js          # Lógica principal de la aplicación
│   ├── images.js       # Manejo de imágenes
│   └── ui.js           # Funciones de interfaz de usuario
└── img/                # Recursos de imágenes
    ├── buceo.jpg
    ├── cuatri.avif
    ├── jetsky.jpg
    ├── no-image.png
    ├── tabla-surf-adulto.jpg
    └── tabla-surf-niño.jpg
```

## 🛠️ Funcionalidades

- **Gestión de Productos:** Visualización de productos disponibles para alquiler
- **Sistema de Reservas:** Crear y gestionar reservas de productos
- **Gestión de Clientes:** Administrar información de clientes
- **Interfaz Responsiva:** Diseño adaptable para diferentes dispositivos

## 📋 Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión al backend (ver README del backend)
- Para Live Server: VS Code con extensión Live Server
- Para Python: Python 2.7+ o Python 3.x
- Para http-server: Node.js y npm

## 🚨 Resolución de Problemas

1. **Error de CORS:** Asegúrate de que el backend esté configurado para permitir requests desde el frontend
2. **Recursos no encontrados:** Verifica que estés ejecutando el servidor desde la carpeta `app/`
3. **API no responde:** Confirma que el backend esté ejecutándose y sea accesible

---

📚 **Materia:** Full Stack Web Development  
🏫 **Universidad:** UP (Universidad de Palermo)


# 👨‍💻 Autor

-   [Lucas Chialchia]((https://github.com/LucasChch))

