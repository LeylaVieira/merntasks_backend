// const express = require('express') --> Forma CommonJS
import express from 'express' // Forma ESM
import dotenv from 'dotenv'
import cors from 'cors'
import conectarDB from './config/db.js'
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareaRoutes from './routes/tareaRoutes.js'

const app = express()
app.use(express.json())

dotenv.config()

conectarDB()

// Configurar CORS
const whitelist = [process.env.FRONTEND_URL]

const corsOptions = {
    origin: function(origin, callback) {
        // console.log(origin)
        if(whitelist.includes(origin)) {
            // Puede consultar la API
            callback(null, true)
        } else {
            // No está permitido
            callback(new Error('Error de Cors'))
        }
    }
}

app.use(cors(corsOptions))

// Routing
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/proyectos', proyectoRoutes)
app.use('/api/tareas', tareaRoutes)


// La variable de entorno se creará en el servidor de producción automáticamente, todos lo soportan.
// En caso contrario(como ahora que estamos en local), usará el puerto 4000
const PORT = process.env.PORT || 4000

const servidor = app.listen(PORT, () => {
    console.info(`Servidor corriendo en el puerto ${PORT}`)
})

// Socket.io
import { Server } from 'socket.io'

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
})

io.on('connection', (socket) => {
    console.log('Conectado a Socket.io')

    // Definir los eventos de Socket.io
    socket.on('abrir proyecto', (proyecto) => {
        console.log("Se ha unido a --> ", proyecto)
        socket.join(proyecto) // Le pasamos el id del proyecto para que cada usuario que entre se conecte a un socket diferente (room)
    })

    socket.on('nueva tarea', (tarea) => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada', tarea)
    })

    socket.on('eliminar tarea', (tarea) => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea)
    })

    socket.on('actualizar tarea', (tarea) => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('tarea actualizada', tarea)
    })

    socket.on('cambiar estado', (tarea) => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('nuevo estado', tarea)
    })
})