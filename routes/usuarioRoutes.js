import express from 'express'
import {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil
} from '../controllers/usuarioController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

// ======================================================
// Autenticación, registro y confirmación de Usuarios
// ======================================================
router.post('/', registrar) // Crea un nuevo usuario
router.post('/login', autenticar)
router.get('/confirmar/:token', confirmar) // :token es la variable que express generará dinámicamente (podemos usar cualquier nombre)
router.post('/olvide-password', olvidePassword)

// Estas dos líneas, se pueden simplificar en una sola:
// router.get('/olvide-password/:token', comprobarToken)
// router.post('/olvide-password/:token', nuevoPassword)
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword)

// Entra primero al endpoint definido en '/perfil', ejecuta el middleware checkAuth y luego ejecuta el perfil
// checkAuth tendrá el código para proteger el endpoint, comprobar que el json web token es válido, que el usuario sea válido, no esté expirado
router.get('/perfil', checkAuth, perfil)

export default router