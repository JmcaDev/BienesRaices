import express from "express"
import { body } from "express-validator"
import { admin, crear, guardar } from "../controllers/propiedadController.js"
const router = express.Router()

//Index
router.get("/mis-propiedades", admin)

//Crear propiedades
router.get("/propiedades/crear", crear)
router.post("/propiedades/crear", 
    body("titulo").notEmpty().withMessage("El titulo del Anuncio es obligatorio."),
    body("descripcion")
        .notEmpty().withMessage("La descripcion del Anuncio es obligatorio.")
        .isLength({max: 200}).withMessage("La descripcion es muy larga."),
    body("categoria").isNumeric().withMessage("Selecciona una categoria"),
    body("precio").isNumeric().withMessage("Selecciona un rango de precio"),
    body("habitaciones").isNumeric().withMessage("Selecciona la cantidad de habitaciones"),
    body("estacionamiento").isNumeric().withMessage("Selecciona la cantidad de estacionamiento"),
    body("wc").isNumeric().withMessage("Selecciona la cantidad de baños"),
    body("lat").notEmpty().withMessage("Ubica la propiedad en el mapa")
    ,guardar
)

export default router