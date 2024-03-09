import nodemailer from 'nodemailer'

export const emailRegistro = async (datos) => {
    const { email, nombre, token } = datos

    // Configuramos el cliente para enviar el email (lo hemos copiado de Mailtrap parte integration with Nodemailer)
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Información del email
    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Confirma tu cuenta",
        text: "Comprueba tu cuenta en UpTask",
        html: `<p>Hola: ${nombre}. Comprueba tu cuenta en UpTask</p>
        <p>Tu cuenta ya está casi lista, sólo debes comprobarla en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a>
        <p>Si tú no creaste esta cuenta, puedes ignorar este mensaje</p>
        `
    })
}

export const emailOlvidePassword = async (datos) => {
    const { email, nombre, token } = datos

    // Configuramos el cliente para enviar el email (lo hemos copiado de Mailtrap parte integration with Nodemailer)
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Información del email
    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Reestablece tu password",
        text: "Reestablece tu password",
        html: `<p>Hola: ${nombre}, has solicitado reestablecer tu password.</p>
        <p>Sigue el siguiente enlace para generar un nuevo password:</p>
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer password</a>
        <p>Si tú no solicitaste esta acción, puedes ignorar este mensaje</p>
        `
    })
}