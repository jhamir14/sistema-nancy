# 👟 Sistema Nancy - Préstamos y Créditos de Zapatillas

Sistema integral de gestión de **Préstamos en Efectivo**, **Créditos de Calzado Deportivo (Zapatillas)**, **Inventario por Tallas** y **Control de Cobranzas y Flujo de Caja**.

---

## 🚀 Características Principales

1. **Dashboard Financiero en Tiempo Real (Home)**:
   - **Dinero Total Invertido**: Desglose automático de capital en stock de zapatillas, capital colocado en préstamos activos y costo de pares entregados a crédito.
   - **Cartera por Cobrar**: Dinero en la calle pendiente de recaudación.
   - **Recaudación de Cobranza**: Total cobrado hoy, este mes e histórico.
   - **Semáforo de Morosidad**: Alertas de cuotas vencidas y capital en riesgo.
   - **Agenda de Cobros**: Vencimientos de hoy y de los próximos 7 días con enlace directo a WhatsApp.
   - **Movimientos de Caja**: Registro de entradas y salidas en vivo.

2. **Módulo de Clientes**:
   - Registro de datos personales, DNI/Identificación, teléfonos, dirección y referencias para cobranza domiciliaria.
   - Registro de garantes o fiadores.
   - Semáforo de calificación crediticia (*Excelente, Bueno, Regular, Moroso*).
   - Historial consolidado de deuda activa.

3. **Catálogo e Inventario de Zapatillas**:
   - Marcas (Nike, Jordan, Adidas, etc.), modelos, colores y categorías.
   - Control de stock físico por tallas (ej. 38, 39, 40, 41, 42).
   - Costo de compra (inversión base), precio de venta al contado y precio a crédito.

4. **Créditos de Zapatillas**:
   - Modalidad autorizada: **Cuotas Semanales o Mensuales**.
   - Cobro de enganche/inicial con ingreso directo a caja.
   - Descuento automático del inventario en almacén.
   - Generación del cronograma de pagos.

5. **Préstamos en Efectivo**:
   - Modalidad autorizada: **Cuotas Semanales o Mensuales**.
   - Desembolso de capital con registro de salida de caja.
   - Tasa de interés pactada (%) y cálculo de amortización automática.
   - Registro opcional de prendas o garantías físicas.

6. **Módulo de Cobranzas, Caja y Recibos**:
   - Cobro rápido de cuotas totales o parciales.
   - Medios de pago: Efectivo, Billetera Digital (Yape / Plin), Transferencia, Tarjeta.
   - Emisión de comprobante/ticket con número de recibo correlativo único (`REC-2026-XXXXX`).
   - Botón directo para enviar el comprobante de pago por **WhatsApp** al cliente en un clic.

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19, TypeScript, App Router).
- **Estilos y UI**: [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/).
- **Base de Datos & ORM**: [Prisma ORM](https://www.prisma.io/) con SQLite local (listo para migrar a PostgreSQL en producción con Supabase/Neon).

---

## 💻 Instrucciones de Instalación y Ejecución Local

### 1. Clonar e Instalar Dependencias
```bash
git clone https://github.com/tu-usuario/sistema-nancy.git
cd sistema-nancy
npm install
```

### 2. Base de Datos y Sembrado de Datos Iniciales
El proyecto ya incluye un script con datos de demostración (clientes, modelos de zapatillas, préstamos y créditos activos):
```bash
# Sincronizar esquema de base de datos
npx prisma db push

# Cargar datos de prueba
npm run seed
```

### 3. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Guía de Despliegue a Producción (Paso a Paso)

### Opción Recomendada (100% Gratis para iniciar):
1. **Subir a GitHub**:
   ```bash
   git add .
   git commit -m "feat: implementacion completa del Sistema Nancy"
   git push origin main
   ```
2. **Crear Base de Datos PostgreSQL**:
   - Regístrate en [Supabase](https://supabase.com/) o [Neon](https://neon.tech/) (ambos gratuitos).
   - Copia la URL de conexión PostgreSQL (`postgresql://...`).
3. **Conectar en Vercel**:
   - Conecta tu repositorio de GitHub en [Vercel](https://vercel.com/).
   - En las variables de entorno de Vercel añade:
     - `DATABASE_URL` = (Tu URL de PostgreSQL de Supabase o Neon).
   - En `prisma/schema.prisma`, cambia `provider = "sqlite"` por `provider = "postgresql"`.
   - Vercel compilará y desplegará la aplicación con dominio seguro HTTPS automáticamente.
