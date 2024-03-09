import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js"

const agregarTarea = async (req, res) => {
    const { proyecto } = req.body

    const existeProyecto = await Proyecto.findById(proyecto)

    if(!existeProyecto) {
        const error = new Error("El proyecto no existe")
        return res.status(404).json({ msg: error.message })
    }

    if(existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes los permisos para añadir tareas")
        return res.status(404).json({ msg: error.message })
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body)
        // Almacenar el ID en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id)
        await existeProyecto.save()

        // Devolver la nueva tarea
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }
}

const obtenerTarea = async (req, res) => {
    const { id } = req.params

    // Con .populate("proyecto") nos traemos también los datos del proyecto asociado dentro de tarea
    const tarea = await Tarea.findById(id).populate("proyecto")

    if(!tarea) {
        const error = new Error("Tarea no encontrada")
        return res.status(404).json({ msg: error.message })
    }

    // Comprobamos si el id del usuario es el mismo que el creador
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida")
        return res.status(403).json({ msg: error.message })
    }

    res.json(tarea)
}

const actualizarTarea = async (req, res) => {
    const { id } = req.params

    // Con .populate("proyecto") nos traemos también los datos del proyecto asociado dentro de tarea
    const tarea = await Tarea.findById(id).populate("proyecto")

    if(!tarea) {
        const error = new Error("Tarea no encontrada")
        return res.status(404).json({ msg: error.message })
    }

    // Comprobamos si el id del usuario es el mismo que el creador
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida")
        return res.status(403).json({ msg: error.message })
    }

    tarea.nombre = req.body.nombre || tarea.nombre
    tarea.descripcion = req.body.descripcion || tarea.descripcion
    tarea.prioridad = req.body.prioridad || tarea.prioridad
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega

    try {
        const tareaAlmacenada = await tarea.save()
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }
}

const eliminarTarea = async (req, res) => {
    const { id } = req.params

    const tarea = await Tarea.findById(id.trim()).populate("proyecto")

    if(!tarea) {
        const error = new Error("Tarea no encontrada")
        return res.status(404).json({ msg: error.message })
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida")
        return res.status(403).json({ msg: error.message })
    }

    try {
        // Como la referencia de las tareas también aparece en proyectos, debemos obtener el proyecto primero para poder eliminar la tarea
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)

        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])

        res.json({ msg: "La tarea se eliminó" })
    } catch (error) {
        console.log(error)
    }
}

const cambiarEstado = async (req, res) => {
    const { id } = req.params

    const tarea = await Tarea.findById(id.trim()).populate("proyecto")

    if(!tarea) {
        const error = new Error("Tarea no encontrada")
        return res.status(404).json({ msg: error.message })
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error("Acción no válida")
        return res.status(403).json({ msg: error.message })
    }

    tarea.estado = !tarea.estado
    tarea.completado = req.usuario._id
    await tarea.save()

    // Consultamos nuevamente la tarea para traernos el completado
    const tareaAlmacenada = await Tarea.findById(id.trim())
        .populate("proyecto")
        .populate("completado")

    res.json(tareaAlmacenada)
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}