# Guia Rapida - Crear Usuario Administrador

## Opcion 1: Usando el Script Automatizado (RECOMENDADO)

### Paso 1: Asegurate de que MongoDB este corriendo
```bash
# Verifica que MongoDB este activo
# Si no esta, inicialo con:
mongod
```

### Paso 2: Ejecuta el script de seed
```bash
cd escuela_API
node seed-admin.js
```

### Paso 3: Credenciales creadas
```
Email:    admin@escuela.com
Password: admin123
```

---

## Opcion 2: Crear Usuario Manualmente con MongoDB Shell

### Paso 1: Abre MongoDB Shell
```bash
mongosh
```

### Paso 2: Selecciona la base de datos
```javascript
use escuela_jose_minero
```

### Paso 3: Crea el usuario admin
```javascript
db.users.insertOne({
  name: "Administrador",
  email: "admin@escuela.com",
  password: "$2a$10$XJ5Q3vEYPZx2CvYKGx7jmOYxH7RQ4vEYPZx2CvYKGx7jmOYxH7RQ4e",
  role: "ADMIN",
  active: true,
  createdAt: new Date()
})
```

**NOTA:** El password hasheado arriba corresponde a `admin123`

### Paso 4: Verifica que se creo
```javascript
db.users.find({ email: "admin@escuela.com" })
```

---

## Opcion 3: Crear Usuario con Mongosh (Mas Seguro)

Si prefieres crear con una contraseña diferente:

### Paso 1: Instala bcryptjs globalmente (si no lo tienes)
```bash
npm install -g bcryptjs
```

### Paso 2: Genera el hash de tu contraseña
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('TU_CONTRASEÑA_AQUI', 10).then(console.log);"
```

### Paso 3: Usa el hash generado en MongoDB
```javascript
use escuela_jose_minero

db.users.insertOne({
  name: "Administrador",
  email: "admin@escuela.com",
  password: "HASH_GENERADO_AQUI",
  role: "ADMIN",
  active: true,
  createdAt: new Date()
})
```

---

## Probar el Login

1. Abre http://localhost:3000
2. Ingresa:
   - **Email:** admin@escuela.com
   - **Password:** admin123 (o la que hayas configurado)
3. Deberia redirigir al Dashboard

---

## Comandos Utiles de MongoDB

### Ver todos los usuarios
```javascript
use escuela_jose_minero
db.users.find().pretty()
```

### Eliminar el usuario admin (para volver a crearlo)
```javascript
use escuela_jose_minero
db.users.deleteOne({ email: "admin@escuela.com" })
```

### Cambiar la contraseña de un usuario
```javascript
// Primero genera el nuevo hash (en Node.js)
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('NUEVA_CONTRASEÑA', 10).then(console.log);"

// Luego actualiza en MongoDB
use escuela_jose_minero
db.users.updateOne(
  { email: "admin@escuela.com" },
  { $set: { password: "NUEVO_HASH_AQUI" } }
)
```

### Ver todas las colecciones
```javascript
use escuela_jose_minero
show collections
```

### Vaciar la base de datos (CUIDADO!)
```javascript
use escuela_jose_minero
db.dropDatabase()
```

---

## Solución de Problemas

### Error: "Email ya existe"
El usuario ya esta creado. Usa las credenciales existentes o eliminalo primero.

### Error: "Cannot find module 'bcryptjs'"
Asegurate de estar en la carpeta `escuela_API` y que las dependencias esten instaladas:
```bash
cd escuela_API
npm install
```

### Error: "Could not connect to MongoDB"
Verifica que MongoDB este corriendo:
```bash
# Windows
net start MongoDB
# O manualmente
mongod
```

---

**¡Listo para iniciar sesion!** 🎉
