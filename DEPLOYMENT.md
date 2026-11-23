# 🚀 Guía de Despliegue en Producción - Sistema Nancy

Esta guía describe cómo desplegar el **Sistema Nancy** a la nube para que Nancy y su equipo puedan acceder desde cualquier teléfono móvil o computadora sin depender de tener la PC local encendida.

---

## 1. Arquitectura de Producción

* **Frontend y Backend**: [Vercel](https://vercel.com) (Plan Hobby Gratuito con SSL automático HTTPS).
* **Base de Datos**: [Supabase](https://supabase.com) (PostgreSQL en la nube `us-east-1`, ya configurada y enlazada con IPv4 Pooler).
* **Notificaciones**: Enlaces directos a WhatsApp Web / Móvil (`wa.me`).
* **Impresión**: Tickets térmicos compatibles con impresoras POS estándar (58mm y 80mm).

---

## 2. Pasos para Publicar en Vercel (En 2 Minutos)

### Paso 1: Subir tus Cambios a GitHub
Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
git add .
git commit -m "Sistema Nancy listo para producción - Fases 1 a 6 completadas"
git push origin main
```

### Paso 2: Importar el Proyecto en Vercel
1. Ingresa a [https://vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en el botón **"Add New..."** -> **"Project"**.
3. Selecciona tu repositorio: `sistema-nancy`.

### Paso 3: Configurar la Variable de Entorno
En la pantalla de configuración de Vercel, despliega la sección **"Environment Variables"** y añade:

* **Key / Nombre:**
  ```text
  DATABASE_URL
  ```
* **Value / Valor:**
  ```text
  postgresql://postgres.sbumtnolyedviotebhqr:Nancyprestamos2026@aws-0-us-east-1.pooler.supabase.com:5432/postgres
  ```

### Paso 4: Desplegar
Haz clic en **"Deploy"**. Vercel se encargará automáticamente de:
1. Instalar dependencias (`npm install`).
2. Generar el cliente de base de datos (`prisma generate`).
3. Compilar la aplicación Next.js.
4. Asignarte una URL pública y segura (ejemplo: `https://sistema-nancy.vercel.app`).

---

## 3. Acceso desde Celulares (PWA / App Móvil)

Una vez desplegado en Vercel:
1. Abre la URL en el navegador de tu celular (Chrome o Safari).
2. Toca el menú de opciones del navegador (los 3 puntos o el icono de compartir).
3. Selecciona **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
4. ¡El Sistema Nancy aparecerá como una app en tu pantalla de inicio!

---

## 4. Respaldos Periódicos de la Base de Datos

Tu base de datos en Supabase cuenta con copias de seguridad automáticas:
* Puedes exportar un respaldo manual en cualquier momento desde el panel de Supabase:
  `Database -> Backups -> Download Backup`.
* O descargar todos los datos en formato Excel desde el módulo **Reportes & Excel** (`/reportes`).
