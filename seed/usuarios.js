import bcrypt from "bcrypt"

const usuarios = [
    {
        nombre: "Jose",
        email:"jose@jose.com",
        confirmado: 1,
        password: bcrypt.hashSync("password", 10)
    }
]

export default usuarios