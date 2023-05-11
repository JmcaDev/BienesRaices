import { check, validationResult } from "express-validator"
import {Precio, Categoria, Usuario, Propiedad} from "../models/index.js"


const admin = (req,res) =>{
    res.render("propiedades/admin", {
        pagina: "Mis propiedades"
    })
}

//Vista formulario crear pagina
const crear = async (req, res) =>{
    //Consultar modelo de precios y categorias
    const [categorias, precios ] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render("propiedades/crear",{
        pagina:"Crear propiedad",
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}

const guardar = async (req,res) =>{

    await check("titulo").notEmpty().withMessage("El titulo del anuncio es obligatorio").run(req)
    await check("descripcion").notEmpty().withMessage("La descripcion del Anuncio es obligatorio.").run(req)
    await check("descripcion").isLength({max: 200}).withMessage("La descripcion es muy larga.").run(req)
    await check("categoria").isNumeric().withMessage("Selecciona una categoria").run(req)
    await check("precio").isNumeric().withMessage("Selecciona un rango de precio").run(req)
    await check("habitaciones").isNumeric().withMessage("Selecciona una cantidad de Habitaciones").run(req)
    await check("estacionamiento").isNumeric().withMessage("Selecciona una cantidad de estacionamiento").run(req)
    await check("wc").isNumeric().withMessage("Selecciona una cantidad de wc").run(req)
    await check("lat").notEmpty().withMessage("Ubica la propiedad en el mapa").run(req)

    //Validacion
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        //Consultar modelo de precios y categorias
        const [categorias, precios ] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])
        return res.render("propiedades/crear",{
            pagina: "Crear propiedad",
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    //Crear un registro
    const {titulo, descripcion, precio, categoria, habitaciones, estacionamiento, wc, calle, lat, lng} = req.body

  
    const {id: usuarioId} = req.usuario


    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId: precio,
            categoriaId: categoria,
            usuarioId,
            imagen: ""
        })
        const { id } = propiedadGuardada

        res.redirect(`/propiedades/agregar-imagen/${id}`)
    } catch (error) {
        console.log(error)
        
    }

}

const agregarImagen = async (req,res) =>{

    const {id} = req.params
    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect("/mis-propiedades")
    }

    //Validar que la propiedad no esta publicada
    if(propiedad.publicado){
       return res.redirect("/mis-propiedades")
    }

    //Validar que la propiedad pertenece a quien visita la pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect("/mis-propiedades")
    }

    res.render("propiedades/agregar-imagen", {
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    })
}

const almacenarImagen = async (req,res, next) =>{
    const{id} = req.params
    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect("/mis-propiedades")
    }

    //Validar que la propiedad no esta publicada
    if(propiedad.publicado){
       return res.redirect("/mis-propiedades")
    }

    //Validar que la propiedad pertenece a quien visita la pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect("/mis-propiedades")
    }

    try {
        // console.log(req.file)
        //Almacenar la imagen y publicar propiedad
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1

        await propiedad.save()

        next()
    } catch (error) {
        console.log(error)
    }
}

export{
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen
}