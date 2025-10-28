# 🚀 Guía de Despliegue en Google App Engine

## 📋 Pre-requisitos

1. Cuenta de Google Cloud con facturación habilitada
2. Google Cloud CLI instalado (`gcloud`)
3. MongoDB en la nube (recomendado: MongoDB Atlas)
4. Bucket de Google Cloud Storage creado

---

## 🌐 Paso 1: Crear y Configurar Proyecto

### 1.1 Autenticarse
```bash
gcloud auth login
```

### 1.2 Crear Proyecto
```bash
# Reemplaza 'love-api-prod' con un ID único
gcloud projects create love-api-prod --name="Love API Production"

# Listar proyectos para verificar
gcloud projects list
```

### 1.3 Establecer Proyecto Activo
```bash
gcloud config set project love-api-prod
```

### 1.4 Habilitar Facturación
```bash
# Listar cuentas de facturación
gcloud beta billing accounts list

# Vincular proyecto con cuenta de facturación
gcloud beta billing projects link love-api-prod --billing-account=TU_BILLING_ACCOUNT_ID
```

---

## 🏗️ Paso 2: Configurar App Engine

### 2.1 Crear App Engine
```bash
# Elegir región (NO SE PUEDE CAMBIAR DESPUÉS)
gcloud app create --region=us-central

# Otras opciones:
# us-east1, us-west1, southamerica-east1, europe-west1
```

### 2.2 Habilitar APIs
```bash
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

---

## 🗄️ Paso 3: Configurar MongoDB Atlas

1. Ir a https://cloud.mongodb.com/
2. Crear cuenta o iniciar sesión
3. Crear nuevo cluster (free tier disponible)
4. Configurar usuario de base de datos
5. Agregar IP de Google Cloud a whitelist: `0.0.0.0/0` (todas las IPs)
6. Obtener connection string:
   ```
   mongodb+srv://usuario:password@cluster.mongodb.net/love_catalog?retryWrites=true&w=majority
   ```

---

## 🪣 Paso 4: Configurar Google Cloud Storage

### 4.1 Crear Bucket
```bash
# Reemplaza con un nombre único global
gsutil mb -p love-api-prod -c STANDARD -l us-central1 gs://love-api-uploads/

# Hacer el bucket público para lectura (opcional)
gsutil iam ch allUsers:objectViewer gs://love-api-uploads/
```

### 4.2 Configurar CORS (si el frontend accede directamente)
```bash
cat > cors.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://love-api-uploads/
```

---

## 🔐 Paso 5: Configurar Variables de Entorno

### Opción A: Usar variables en app.yaml (menos seguro)

Edita `app.yaml` y agrega:
```yaml
env_variables:
  MONGO_URI: "tu-mongo-uri-completo"
  JWT_SECRET: "tu-jwt-secret-super-largo"
  ADMIN_PASSWORD: "tu-password"
  GCS_PROJECT_ID: "love-api-prod"
  GCS_BUCKET_NAME: "love-api-uploads"
```

### Opción B: Usar Secret Manager (MÁS SEGURO - RECOMENDADO)

```bash
# Crear secretos
echo -n "mongodb+srv://..." | gcloud secrets create MONGO_URI --data-file=-
echo -n "super-secret-jwt" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "admin-password" | gcloud secrets create ADMIN_PASSWORD --data-file=-

# Dar permisos a App Engine para acceder a los secretos
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding MONGO_URI \
  --member="serviceAccount:${PROJECT_NUMBER}@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding JWT_SECRET \
  --member="serviceAccount:${PROJECT_NUMBER}@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding ADMIN_PASSWORD \
  --member="serviceAccount:${PROJECT_NUMBER}@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Luego actualiza `app.yaml` con referencias a secretos (NO valores directos):
```yaml
# Esto está más avanzado, pero es opcional
```

---

## 📝 Paso 6: Actualizar app.yaml

Edita `app.yaml` y actualiza:
```yaml
env_variables:
  NODE_ENV: "production"
  PORT: "8080"
  MONGO_URI: "tu-mongo-uri-de-atlas"
  JWT_SECRET: "un-secret-super-largo-y-aleatorio"
  JWT_EXPIRATION: "12h"
  ADMIN_EMAIL: "tu-email@example.com"
  ADMIN_USERNAME: "tu-usuario"
  ADMIN_PASSWORD: "tu-password-seguro"
  GCS_PROJECT_ID: "love-api-prod"  # Tu project ID
  GCS_BUCKET_NAME: "love-api-uploads"  # Tu bucket
  GCS_KEY_FILE: "./src/config/google-service-account.json"
```

---

## 🚀 Paso 7: Desplegar

### 7.1 Compilar el proyecto
```bash
npm run build
```

### 7.2 Desplegar a App Engine
```bash
# Primera vez o despliegue normal
npm run deploy

# O manualmente:
gcloud app deploy

# Para testear sin afectar producción (crea versión nueva sin promover)
npm run deploy:no-promote
```

### 7.3 Obtener tu URL
```bash
# Abrir en navegador
npm run open

# O ver la URL
gcloud app browse
```

Tu URL será algo como:
```
https://love-api-prod.uc.r.appspot.com
```

O si elegiste otra región:
```
https://love-api-prod.appspot.com
```

---

## 📊 Paso 8: Verificar Despliegue

### Ver logs en tiempo real
```bash
npm run logs

# O manualmente:
gcloud app logs tail -s default
```

### Probar endpoints
```bash
# Health check
curl https://tu-proyecto.appspot.com/api/health

# Listar fotos
curl https://tu-proyecto.appspot.com/api/photos

# Listar cartas
curl https://tu-proyecto.appspot.com/api/letters
```

---

## 🔄 Actualizaciones Futuras

### Desplegar nueva versión
```bash
npm run build
npm run deploy
```

### Ver versiones
```bash
gcloud app versions list
```

### Cambiar entre versiones
```bash
gcloud app versions migrate VERSION_ID
```

### Eliminar versión antigua
```bash
gcloud app versions delete VERSION_ID
```

---

## 💰 Costos Estimados

### Free Tier de App Engine incluye:
- 28 horas/día de instancias F1/F2
- 1 GB de egress por día
- 5 GB de Cloud Storage

### Costos adicionales:
- Después del free tier: ~$0.05/hora por instancia F1
- MongoDB Atlas: Free tier disponible (512 MB)
- Cloud Storage: ~$0.02/GB/mes

### Recomendaciones para ahorrar:
1. Usar `min_instances: 0` en app.yaml (se apaga cuando no hay tráfico)
2. Usar MongoDB Atlas free tier
3. Configurar presupuesto en Google Cloud Console

---

## 🐛 Troubleshooting

### Error: "Project not found"
```bash
gcloud config set project love-api-prod
```

### Error: "Billing not enabled"
```bash
gcloud beta billing projects link love-api-prod --billing-account=ACCOUNT_ID
```

### Error: "App Engine not created"
```bash
gcloud app create --region=us-central
```

### Ver logs de error
```bash
gcloud app logs tail -s default
```

### Conectar a MongoDB desde App Engine
Asegúrate de que MongoDB Atlas tenga `0.0.0.0/0` en la whitelist.

---

## 🔒 Seguridad en Producción

### Checklist:
- [ ] CORS configurado correctamente (no usar `*` en producción)
- [ ] Variables sensibles en Secret Manager o .env seguro
- [ ] MongoDB con usuario/password fuerte
- [ ] JWT_SECRET largo y aleatorio (min 32 caracteres)
- [ ] Bucket de GCS con permisos apropiados
- [ ] HTTPS forzado (ya está en app.yaml)
- [ ] Rate limiting configurado (agregar en el futuro)

---

## 📞 Comandos Útiles

```bash
# Ver info del proyecto
gcloud app describe

# Ver servicios
gcloud app services list

# Ver versiones
gcloud app versions list

# SSH a instancia (debugging)
gcloud app instances ssh INSTANCE_ID

# Ver uso y costos
gcloud app describe --format="value(gcrDomain)"
```

---

## 🎉 ¡Listo!

Tu API estará disponible en:
```
https://[TU-PROJECT-ID].appspot.com
```

O con región específica:
```
https://[TU-PROJECT-ID].[REGION-CODE].r.appspot.com
```

Ejemplo final:
```
https://love-api-prod.uc.r.appspot.com/api/health
https://love-api-prod.uc.r.appspot.com/api/photos
https://love-api-prod.uc.r.appspot.com/api/letters
```


