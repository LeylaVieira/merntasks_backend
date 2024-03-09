import Proyecto from "../models/Proyecto.js"
import Usuario from "../models/Usuario.js"

const obtenerProyectos = async (req, res) => {
    const proyectos = await Proyecto.find({
        '$or' : [
            {'colaboradores': { $in: req.usuario }},
            {'creador': { $in: req.usuario }}
        ]
    }).select('-tareas')
    res.json(proyectos)
}

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

const obtenerProyecto = async (req, res) => {
    const { id } = req.params

    // Comprobación adicional, si es más de 24 caracteres, es un id inválido
    if(id.length !== 24) {
        const error = new Error("ID inválido")
        return res.status(400).json({ msg: error.message })
    }

    // Buscamos el proyecto
    // .populate({ path: 'tareas', populate: {path: 'completado'} }) --> Con esto aplicamos también un populate a completado en tareas
    const proyecto = await Proyecto.findById(id.trim())
        .populate({ path: 'tareas', populate: {path: 'completado', select: "nombre" } })
        .populate('colaboradores', "nombre email")

    // Si el proyecto no existe
    if(!proyecto) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ msg: error.message })
    }

    // Comprobamos que el usuario logueado es el mismo creador del proyecto o que es colaborador
    if(proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error("Acción no válida")
        return res.status(401).json({ msg: error.message })
    }

    // Obtener las tareas del Proyecto
    // const tareas = await Tarea.find().where('proyecto').equals(proyecto._id)

    // Devolvemos un objeto reuniendo el Proyecto y las tareas asociadas, así nos evitamos otra llamada para obtener las tareas
    // res.json({
    //     proyecto,
    //     tareas
    // })

    res.json(proyecto)
}

const editarProyecto = async (req, res) => {
    const { id } = req.params

    // Buscamos el proyecto
    const proyecto = await Proyecto.findById(id.trim())

    // Si el proyecto no existe
    if(!proyecto) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ msg: error.message })
    }

    // Comprobamos que el usuario logueado es el mismo creador del proyecto
    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida")
        return res.status(401).json({ msg: error.message })
    }

    // Si el usuario ha hecho un cambio se guarda ese valor, sino mantiene el que ya está en la bd
    proyecto.nombre = req.body.nombre || proyecto.nombre
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente

    try {
        const proyectoAlmacenado = await proyecto.save()
        return res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

const eliminarProyecto = async (req, res) => {
    const { id } = req.params

    // Buscamos el proyecto
    const proyecto = await Proyecto.findById(id.trim())

    // Si el proyecto no existe
    if(!proyecto) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ msg: error.message })
    }

    // Comprobamos que el usuario logueado es el mismo creador del proyecto
    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida")
        return res.status(401).json({ msg: error.message })
    }

    try {
        await proyecto.deleteOne()
        res.json({ msg: "Proyecto eliminado" })
    } catch (error) {
        console.log(error)
    }
}

const buscarColaborador = async (req, res) => {
    const { email } = req.body

    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v')

    if(!usuario) {
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({ msg: error.message })
    }
    res.json(usuario)
}

const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)

    if(!proyecto) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ msg: error.message })
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida")
        return res.status(400).json({ msg: error.message })
    }

    const { email } = req.body
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v')

    if(!usuario) {
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({ msg: error.message })
    }

    // El colaborador no es el admin del proyecto
    if(proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error("El creador del proyecto no puede ser colaborador")
        return res.status(400).json({ msg: error.message })
    }

    // Revisar que no esté ya agregado al proyecto
    if(proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error("El usuario ya pertenece al proyecto")
        return res.status(400).json({ msg: error.message })
    }

    // Esta bien, se puede agregar
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()

    res.json({ msg: "Colaborador agregado correctamente" })
}

const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)

    // Comprobamos que el proyecto existe
    if(!proyecto) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ msg: error.message })
    }

    // Comprobamos que el que elimina es el creador del proyecto
    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida")
        return res.status(400).json({ msg: error.message })
    }

    // Esta bien, se puede eliminar
    proyecto.colaboradores.pull(req.body.id)
    await proyecto.save()

    res.json({ msg: "Colaborador eliminado correctamente" })
}

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador
}