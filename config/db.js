import mongoose from "mongoose"

const conectarDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI)

        const url = `${connection.connection.host}:${connection.connection.port}`
        console.info(`MongoDB conectado en: ${url}`)
    } catch (error) {
        console.info(`Error: ${error.message}`)
        process.exit(1) // para forzar que el proceso termine
    }
}

export default conectarDB