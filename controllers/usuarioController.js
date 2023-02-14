import { check, validationResult } from "express-validator"
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js"
import { generarId, generarJWT } from "../helpers/tokens.js" 
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js"

const formularioLogin = (req,res) =>{
    res.render("auth/login", {
        pagina: "Iniciar Sesión",
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req, res) =>{
    //Validacion en autenticar
    await check("email").isEmail().withMessage("El email es obligatorio").run(req)
    await check("password").notEmpty().withMessage("El password es obligatorio").run(req)

    let resultado = validationResult(req)

    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //Errores
        return res.render("auth/login", {
            pagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    const {email, password} = req.body

    //Comprobar si el usuario existe
    const usuario = await Usuario.findOne({where: {email}})

    if(!usuario){
        return res.render("auth/login", {
            pagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{msg: "El usuario no existe"}]
        })
    }

    //Comprobar si el usuario este confirmado
    if(!usuario.confirmado){
        return res.render("auth/login", {
            pagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{msg: "Debe confirmar su cuenta para continuar"}]
        })
    }

    //Revisar el password
    if(!usuario.verificarPassword(password)){
        return res.render("auth/login", {
            pagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{msg: "El password es incorrecto"}]
        })
    }

    //Autenticar al usuario
    const token = generarJWT({id : usuario.id, nombre : usuario.nombre})
    
    //Almacenar en un cookie
    return res.cookie("_token", token, {
        httpOnly: true,
        // secure: true
    }).redirect("/mis-propiedades")
}

const formularioRegistro = (req,res) =>{

    res.render("auth/registro", {
        pagina: "Crear Cuenta",
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req,res) =>{
    //Validacion
    await check("nombre").notEmpty().withMessage("El Nombre es obligatorio").run(req)
    await check("email").isEmail().withMessage("Eso no es un email valido").run(req)
    await check("password").isLength({min: 8}).withMessage("La contraseña debe ser minimo 8 caracteres").run(req)
    await check("repetir_password").equals(req.body.password).withMessage("Las contraseñas no son iguales").run(req)

    let resultado = validationResult(req)

    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //Errores
        return res.render("auth/registro", {
            pagina: "Crear Cuenta",
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    //Extraer datos del usuario
    const {nombre, email, password} = req.body

    //Verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({where : {email}})

    if(existeUsuario){
        return res.render("auth/registro", {
            pagina: "Crear Cuenta",
            csrfToken: req.csrfToken(),
            errores: [{msg: "El correo ya fue registrado"}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    //Almacenar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    //Envia email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })


    //Mostrar mensaje de confirmacion
    res.render("templates/mensaje",{
        pagina: "Cuenta creada correctamente",
        mensaje: "Hemos enviado un Email de confirmacion, por favor verifique su cuenta"
    })
}

//Funcion que confirma una cuenta
const confirmar = async (req, res) =>{
    const { token } = req.params
    
    //Verificar si el token es valido
    const usuario = await Usuario.findOne({where: {token}})

    if(!usuario){
        return res.render("auth/confirmar-cuenta", {
            pagina: "Error al confirmar tu cuenta",
            mensaje: "Hubo un error al confirmar tu cuenta, intenta de nuevo",
            error: true
        })
    }
    //Confirmar la cuenta
    usuario.token = null
    usuario.confirmado = true
    await usuario.save()
    
    return res.render("auth/confirmar-cuenta", {
        pagina: "Cuenta confirmada",
        mensaje: "Cuenta confirmada exitosamente"
    })
}

const formularioOlvidePassword = (req,res) => {
    res.render("auth/olvide-password", {
        pagina: "Recuperar Cuenta",
        csrfToken: req.csrfToken(),
    })
}

const resetPassword = async (req, res) => {
    
    //Validacion
    await check("email").isEmail().withMessage("Eso no es un email valido").run(req)

    let resultado = validationResult(req)

    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //Errores
        return res.render("auth/olvide-password", {
            pagina: "Recuperar Cuenta",
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }

    //Buscar el usuario
    const {email} = req.body

    const usuario = await Usuario.findOne({where: {email}})

    //Validar si existe el usuario
    if(!usuario){
        return res.render("auth/olvide-password", {
            pagina: "Recuperar Cuenta",
            csrfToken: req.csrfToken(),
            errores: [{msg: "El email no pertenece a ningun usuario"}],
        })
    }

    //Generar un token
    usuario.token = generarId()
    await usuario.save()

    //Enviar un email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    //Renderizar un mensaje
    res.render("templates/mensaje",{
        pagina: "Reestablece tu password",
        mensaje: "Hemos enviado un Email con las instrucciones"
    })
}

const comprobarToken = async (req,res) => {
    const {token} = req.params

    const usuario = await Usuario.findOne({where: {token}})
    if(!usuario){
        return res.render("auth/confirmar-cuenta", {
            pagina: "Reestablece tu password",
            mensaje: "Hubo un error al validar tu informacion, intenta de nuevo",
            error: true
        })
    }
    
    //Mostrar formulario para modificar el password
    res.render("auth/reset-password",{
        pagina: "Reestablezca su contraseña",
        csrfToken: req.csrfToken()
    })

}

const nuevoPassword = async (req,res) => {
    //Validar el password
    await check("password").isLength({min: 8}).withMessage("La contraseña debe ser minimo 8 caracteres").run(req)

    let resultado = validationResult(req)

    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //Errores
        return res.render("auth/reset-password", {
            pagina: "Reestablezca su contraseña",
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }

    //Identificar quien lo esta cambiando
    const {token} = req.params
    const {password} = req.body
    const usuario = await Usuario.findOne({where: {token}})

    //Hashear password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)
    usuario.token = null
    await usuario.save()

    return res.render("auth/confirmar-cuenta",{
        pagina: "Password restablecido",
        mensaje: "El password se guardo correctamente"
    })

}

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    nuevoPassword,
    comprobarToken
}