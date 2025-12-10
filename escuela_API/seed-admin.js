/**
 * Script de inicializacion de base de datos
 * Crea un usuario administrador por defecto
 * Si ya existe uno, lo elimina y crea uno nuevo
 * 
 * EJECUTAR: node seed-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configuracion de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/escuela_jose_minero';

// Schema de Usuario (debe coincidir con el modelo real)
const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'DIRECTION', 'TEACHER'], default: 'TEACHER' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function seedAdmin() {
    try {
        console.log('Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('OK Conectado a MongoDB');

        // Verificar si ya existe un admin
        const existingAdmin = await User.findOne({ email: 'admin@escuela.com' });

        if (existingAdmin) {
            console.log('\nAVISO Ya existe un usuario admin con email: admin@escuela.com');
            console.log('Eliminando usuario existente...');

            await User.deleteOne({ email: 'admin@escuela.com' });
            console.log('OK Usuario anterior eliminado');
        }

        // Crear usuario administrador
        console.log('\nCreando usuario administrador...');

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = new User({
            fullName: 'Administrador Principal',
            email: 'admin@escuela.com',
            passwordHash: hashedPassword,
            role: 'ADMIN',
            isActive: true
        });

        await adminUser.save();

        console.log('\nOK Usuario administrador creado exitosamente!');
        console.log('\n========================================================');
        console.log('   CREDENCIALES DE ACCESO');
        console.log('========================================================');
        console.log('Email:     admin@escuela.com');
        console.log('Password:  admin123');
        console.log('Rol:       ADMIN');
        console.log('========================================================\n');
        console.log('IMPORTANTE: Cambia esta contrasena despues del primer login\n');

        await mongoose.connection.close();
        console.log('OK Conexion cerrada');

    } catch (error) {
        console.error('\nERROR:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

// Ejecutar seed
seedAdmin();
