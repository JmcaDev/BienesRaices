import express from "express"
import csrf from "csurf"
import cookieParser from "cookie-parser"
import usuarioRoutes from "./routes/usuarioRoutes.js"
import propiedadesRoutes from "./routes/propiedadesRoutes.js"
import db from "./config/db.js"

//Crear la api
const app = express()

//Habilitar lectura de datos de formularios
app.use(express.urlencoded({extended: true}))

//Habilitar cookie-parser
app.use(cookieParser())

//Habilitar csrf
app.use (csrf({cookie: true}))

//Conexion base de datos
try {
    await db.authenticate()
    db.sync()
    console.log("Conexion correcta a la base de datos")
} catch (error) {
    console.log(error)
}



//Habilitar pug
app.set("view engine", "pug")
app.set("views", "./views")

//Routing
app.use("/auth", usuarioRoutes)
app.use("/", propiedadesRoutes)

//Carpeta publica: Archivos estaticos css, javascript
app.use(express.static("public"))

//Definir puerto y arrancar proyecto
const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Servidor funcionando en el puerto ${port}`)
})