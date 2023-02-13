import nodemailer from "nodemailer"

const emailRegistro = async (datos) =>{
    const transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD
        }
      });

      const {email, nombre, token} = datos

      //Enviar el email
      await transport.sendMail({
        from: "BienesRaices.com",
        to: email,
        subject: "Confirme su cuenta en Bienes Raices",
        text: "Confirme su cuenta en Bienes Raices",
        html: `
            <p>Hola ${nombre}, confirma tu cuenta en bienesraices.com</p>
            <p>Ya esta casi lista tu cuenta, solo falta confirmarla en el siguiente enlace:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar tu cuenta</a></p>
            <p>Si tu no creaste esta cuenta, ignora este mensaje</p>
        `
      })
}

export {
    emailRegistro
}