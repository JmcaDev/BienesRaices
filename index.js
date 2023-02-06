import express from "express"
import usuarioRoutes from "./routes/usuarioRoutes.js"

//Crear la api
const app = express()

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