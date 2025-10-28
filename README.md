# love-api

Backend Node.js/Express escrito en TypeScript para acompañar al frontend `love-catalog-front`. Implementa autenticación con JWT, persiste recuerdos en MongoDB y sigue una arquitectura modular por dominios (feature-first).

## 🚀 Stack

- Node.js 18+
- Express 4
- TypeScript 5
- MongoDB + Mongoose
- JWT + bcryptjs
- Zod para validaciones
- Prettier para formateo

## 📁 Estructura principal

```
src/
  app.ts                   # Configuración base de Express
  server.ts                # Punto de entrada
  config/                  # Conexión a env y base de datos
  modules/
    auth/                  # Login + emisión/verificación de tokens
    photos/                # CRUD de fotos
    letters/               # CRUD de cartas
    health/                # Endpoint de salud
  shared/                  # Middlewares, errores y utilidades comunes
scripts/
  seed.ts                  # Carga de datos iniciales
```

Cada módulo agrupa rutas, controladores, servicios, tipos y modelos de dominio.

## ⚙️ Configuración

1. Instala dependencias
   ```bash
   npm install
   ```
2. Duplica `.env.example` como `.env` y ajusta valores:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/love_catalog
   JWT_SECRET=super-secret-change-me
   JWT_EXPIRATION=12h
   ADMIN_EMAIL=amor@example.com
   ADMIN_USERNAME=amor
   ADMIN_PASSWORD=190725
   # ADMIN_PASSWORD_HASH=$2a$10$hash-generado-con-bcrypt
   ```
   > Puedes usar `ADMIN_PASSWORD` en texto plano o `ADMIN_PASSWORD_HASH` ya encriptado con bcrypt. Si defines ambos se prioriza el hash.
3. Asegúrate de tener MongoDB corriendo (`brew services start mongodb-community` en macOS, por ejemplo).
4. Carga los datos de ejemplo (opcional pero recomendado):
   ```bash
   npm run seed
   ```

## 🏃‍♀️ Scripts útiles

- `npm run dev`: servidor con recarga en caliente (`tsx watch src/server.ts`).
- `npm run build`: compila a JavaScript en `dist/`.
- `npm start`: levanta la versión compilada.
- `npm run seed`: importa `data/photos.json` y `data/letters.json` en MongoDB.
- `npm run format` / `npm run format:check`: aplica o valida Prettier.

## 🔐 Autenticación

- `POST /api/auth/login` — body `{ "identifier": "correo o usuario", "password": "..." }`. Devuelve `{ token, expiresIn, user }`.
- `GET /api/auth/me` — requiere header `Authorization: Bearer <token>`.
- `POST /api/users/register` — body `{ "username": "...", "password": "...", "email": "..." }`. Crea el primer usuario admin (solo funciona si aún no existe ninguno).
- `POST /api/users/credentials` — (autenticado) body `{ "username": "nuevoUsuario", "password": "nuevaClave", "email?": "opcional" }`. Actualiza credenciales del admin en MongoDB.

El middleware `authenticate` protege las rutas de escritura (`POST`, `PATCH`, `DELETE` de fotos y cartas) y también el endpoint para cambiar contraseña.

> 📝 Primer uso: si la colección está vacía, realiza `POST /api/users/register` para crear el usuario inicial (correo, usuario y contraseña).  
> 📝 Flujo posterior: inicia sesión y usa `POST /api/users/credentials` (por ejemplo con Postman) para actualizar la contraseña o el username guardados en MongoDB. En adelante, el login usará esos datos; la clave de `.env` queda como respaldo hasta que la elimines.

Pasos en Postman:
1. Si aún no existe usuario admin:  
   `POST http://localhost:3000/api/users/register` con `{ "username": "...", "password": "...", "email": "..." }`. Recibirás `201` y ya podrás iniciar sesión.
2. Para actualizar credenciales existentes:  
   a. `POST http://localhost:3000/api/auth/login` con `{ "identifier": "correo-o-usuario", "password": "clave-actual" }` y copia el `token`.  
   b. Crea una nueva petición `POST http://localhost:3000/api/users/credentials`, en Headers añade `Authorization: Bearer <token>`.  
   c. Body `raw` JSON: `{ "username": "nuevo-usuario", "password": "nueva-clave", "email": "opcional@correo.com" }` y envía. Recibirás un `204 No Content` si el cambio fue exitoso.

## 📸 Endpoints de fotos (`/api/photos`)

- `GET /` — lista paginada. Query opcional: `page`, `limit`, `year`, `tag`, `search`.
- `GET /years` — devuelve `{ years: number[] }` para filtrar por año.
- `GET /recent?count=4` — últimas fotos.
- `GET /:id` — detalle.
- `POST /` — crea (autenticado).
- `PATCH /:id` — actualiza campos puntuales (autenticado).
- `DELETE /:id` — elimina (autenticado).

El payload utiliza los mismos campos que el frontend (`small`, `large`, `description`, `createdAt`, etc.). `legacyId` permite mapear con los IDs numéricos originales del JSON.

## 💌 Endpoints de cartas (`/api/letters`)

- `GET /` — lista paginada con búsqueda (`search`).
- `GET /:id` — detalle.
- `POST /` — crea (autenticado).
- `PATCH /:id` — actualiza (autenticado).
- `DELETE /:id` — elimina (autenticado).

## 🔄 Integración con el frontend Angular

1. Levanta la API (`npm run dev`).
2. Actualiza el frontend para consumir los endpoints (por ejemplo, usando `environment.ts` con `apiUrl = 'http://localhost:3000/api'`).
3. Reemplaza el servicio que lee archivos JSON (`MemoriesService`) por llamadas HTTP al backend usando el token JWT guardado en `localStorage`.

## 🧪 Próximos pasos sugeridos

- Agregar pruebas (p. ej. Jest con supertest) para asegurar endpoints críticos.
- Implementar refresh tokens o expiraciones más cortas según la necesidad.
- Añadir subida de imágenes o integración con un CDN si se quiere almacenar nuevas fotos.

Con esto tienes el backend listo para soportar el catálogo de recuerdos ❤️
