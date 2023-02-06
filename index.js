import express from "express"
import usuarioRoutes from "./routes/usuarioRoutes.js"
import db from "./config/db.js"

//Crear la api
const app = express()

//Conexion base de datos
try {
    await db.authenticate()
    db.sync()
    console.log("Conexion correcta a la base de datos")
} catch (error) {
    console.log(error)
}

//Habilitar lectura de datos de formularios
app.use(express.urlencoded({extended: true}))

//Habilitar pug
app.set("view engine", "pug")
app.set("views", "./views")

//Routing
app.use("/auth", usuarioRoutes)

//Carpeta publica: Archivos estaticos css, javascript
app.use(express.static("public"))

//Definir puerto y arrancar proyecto
const port = 3000

app.listen(port, () => {
    console.log(`Servidor funcionando en el puerto ${port}`)
})