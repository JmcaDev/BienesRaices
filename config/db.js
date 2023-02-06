import  {Sequelize}  from "sequelize";
import dotenv from "dotenv";
dotenv.config({path: ".env"})

const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASSWORD,{
    host: process.env.BD_HOST,
    port: 3306,
    dialect: "mysql",
    define: {
        timestamps: true
    },
    pool: { //Conexiones por usuario
        max: 5, //Maximo de conexiones
        min: 0, //Minimo de conexiones
        acquire: 30000, //Maximo de tiempo hasta marcar error
        idle: 10000 //Maximo de tiempo hasta desconectar
    }
})

export default db