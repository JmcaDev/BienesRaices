import categorias from "./categorias.js";
import precios from "./precios.js";
import db from "../config/db.js";
import {Categoria, Precio} from "../models/index.js"

const importarDatos = async () =>{
    try{
        //Autenticar
        await db.authenticate()

        //Generar Columnas
        await db.sync()

        //Insertamos los datos
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios)
        ])
        console.log("Datos importados correctamente")
        process.exit()

    }catch(error){
        console.log(error)
        process.exit(1)
    }
}

const eliminarDatos = async () =>{
    try{        
        // await Promise.all([
        //     Categoria.destroy({where: {}, truncate: true}),
        //     Precio.destroy({where: {}, truncate: true})
        // ])
        await db.sync({force:true})
        console.log("Datos eliminados correctamente")
        process.exit()
    }catch(error){
        console.log(error)
        process.exit(1)
    }
}

if(process.argv[2] === "-i"){
    importarDatos();
}

if(process.argv[2] === "-e"){
    eliminarDatos()
}