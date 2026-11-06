# 🌵 Tatacoa Code · Reservas del Observatorio

Sistema de reservas, facturación y pagos para los tours del **Observatorio del Desierto de la Tatacoa** (Huila, Colombia).

Backend en **NestJS** con **TypeORM** y **PostgreSQL** (en Docker), autenticación con **JWT**, contraseñas cifradas con **bcrypt** y acceso por **roles**. Incluye un panel web propio para usar todo desde el navegador.

> Proyecto académico · Programación Avanzada · Ingeniería Mecatrónica · CORHUILA
>
> **Realizado por:** Maria Paula Osorio · Johan Cárdenas · Erick Puentes

---

## ✨ Funcionalidades

- **Registro de visitantes**: cualquier persona crea su cuenta y solicita reservas.
- **Inicio de sesión con roles**: cada empleado entra con su propia clave y solo puede hacer lo que su rol permite.
- **Reservas** con los 7 decoradores HTTP de NestJS: `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`, `@Options` y `@Head`.
- **Facturación**: genera la factura de una reserva confirmada (tarifa × personas + IVA 19 %).
- **Pagos**: abonos parciales; cuando el saldo llega a $0 la factura pasa sola a *pagada*.
- **Validación con DTO** (`class-validator`): los datos inválidos se rechazan antes de llegar a la base de datos.
- **Panel web** con animaciones, descarga de comprobantes y facturas en PNG, y una pestaña **En vivo** que muestra las 4 tablas de PostgreSQL actualizándose solas.

## 👥 Roles

| Rol | Puede |
|---|---|
| `cliente` | Registrarse solo · solicitar y cancelar **sus** reservas · ver **sus** facturas |
| `reservas` | Crear, modificar, confirmar y borrar reservas |
| `facturacion` | Emitir y anular facturas · ver pagos |
| `pagos` | Registrar pagos · ver facturas |
| `admin` | Todo, incluida la gestión de usuarios y el monitor en vivo |

Si un rol intenta algo que no le corresponde, la API responde **403 Forbidden**.

## 🔗 Modelo de datos

```
usuarios ──1:N──► reservas   (clienteId: el visitante que pidió la reserva)
reservas ──1:1──► facturas   (reservaId: cada reserva confirmada tiene una factura)
facturas ──1:N──► pagos      (facturaId: una factura se paga en uno o varios abonos)
usuarios ──1:N──► facturas   (emitidaPorId: quién la emitió)
usuarios ──1:N──► pagos      (registradoPorId: quién lo registró)
```

## 🧱 Tecnologías

- [NestJS](https://nestjs.com) + TypeScript
- [TypeORM](https://typeorm.io) con PostgreSQL 16
- Docker Desktop (contenedor de PostgreSQL)
- `@nestjs/jwt` + `bcryptjs` para autenticación
- `class-validator` + `class-transformer` para los DTO
- HTML, CSS y JavaScript para el panel (sin frameworks)

---

## 🚀 Cómo ejecutarlo

### Requisitos
- [Node.js](https://nodejs.org) (versión LTS)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 1. Clonar e instalar dependencias
```bash
git clone https://github.com/mposorio-2024b-afk/TATACOA-CODE-.git
cd TATACOA-CODE-
npm install
```

### 2. Crear la base de datos en Docker
```bash
docker run --name tatacoa-db -e POSTGRES_USER=tatacoa -e POSTGRES_PASSWORD=tatacoa123 -e POSTGRES_DB=tatacoa -p 5432:5432 -d postgres:16
```
Si el contenedor ya existe y está apagado: `docker start tatacoa-db`.

### 3. Arrancar el servidor
```bash
npm run start:dev
```
TypeORM crea las tablas automáticamente (`synchronize: true`) y la primera vez se crean las cuentas de prueba.

### 4. Abrir el panel
Entra a **http://localhost:3000**.

### Cuentas de prueba

| Rol | Correo | Clave |
|---|---|---|
| admin | admin@tatacoa.co | Admin123* |
| reservas | reservas@tatacoa.co | Reservas123* |
| facturacion | facturacion@tatacoa.co | Factura123* |
| pagos | pagos@tatacoa.co | Pagos123* |

Para el rol **cliente**, usa *"Regístrate aquí"* en la pantalla de inicio de sesión.

> ⚠️ Estas claves y la de la base de datos son **solo para desarrollo**. En un despliegue real deben ir en variables de entorno.

---

## 📡 API

Todas las rutas (excepto registro y login) requieren el encabezado `Authorization: Bearer <token>`.

| Método | Ruta | Rol |
|---|---|---|
| POST | `/auth/registro` | público |
| POST | `/auth/login` | público |
| GET | `/auth/perfil` | cualquiera con sesión |
| GET · HEAD · OPTIONS | `/reservas`, `/reservas/:id` | cualquiera con sesión (el cliente solo ve las suyas) |
| POST | `/reservas` | reservas, cliente |
| PUT · PATCH · DELETE | `/reservas/:id` | reservas |
| PATCH | `/reservas/:id/cancelar` | cliente (su reserva pendiente), reservas |
| GET | `/facturas`, `/facturas/:id` | facturacion, pagos |
| GET | `/facturas/mias` | cliente |
| POST | `/facturas` | facturacion |
| PATCH | `/facturas/:id/anular` | facturacion |
| GET | `/pagos` | pagos, facturacion |
| POST | `/pagos` | pagos |
| DELETE | `/pagos/:id` | admin |
| GET · POST · PATCH · DELETE | `/users`, `/users/:id` | admin |

El archivo [`pruebas-proyecto-final.http`](pruebas-proyecto-final.http) tiene todas las peticiones listas para probar con la extensión **REST Client** de VS Code.

## 🗄️ Ver las tablas en vivo desde Docker

En Docker Desktop → `tatacoa-db` → **Exec**:
```
psql -U tatacoa -d tatacoa
\pset footer off
SELECT id, nombre, correo, rol, activo FROM usuarios ORDER BY id \; SELECT id, visitante, tour, personas, estado, "clienteId" FROM reservas ORDER BY id \; SELECT numero, "reservaId", total, estado, "emitidaPorId" FROM facturas ORDER BY id \; SELECT id, "facturaId", monto, metodo, "registradoPorId" FROM pagos ORDER BY id \watch 3
```
Se detiene con `Ctrl + C`.

## 📁 Estructura

```
src/
├── auth/        # login, registro, JWT, guardias y decoradores de roles
├── users/       # usuarios con clave cifrada y rol
├── reservas/    # reservas con los 7 decoradores HTTP
├── facturas/    # emisión y anulación de facturas
├── pagos/       # abonos y cálculo de saldo
├── app.module.ts
└── main.ts      # ValidationPipe global y panel estático
public/
└── index.html   # panel web
```

---

## 👩‍💻 Autores

- **Maria Paula Osorio**
- **Johan Cárdenas**
- **Erick Puentes**

Ingeniería Mecatrónica · Corporación Universitaria del Huila (CORHUILA) · Neiva, 2026