import { check, validationResult } from "express-validator"
import Usuario from "../models/Usuario.js"
import { generarId } from "../helpers/tokens.js" 
import { emailRegistro } from "../helpers/emails.js"

const formularioLogin = (req,res) =>{
    res.render("auth/login", {
        pagina: "Iniciar Sesión"
    })
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
        pagina: "Recuperar Cuenta"
    })
}

export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar
}