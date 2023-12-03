const nodemailer = require('nodemailer');
require('dotenv').config()
const sendMail =  async(options)=>{
    const  transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mailmogroupltd@gmail.com',
            pass: process.env.PASS_TEST
        }
    });

    let message = {
        from: 'MO Group <info@mogroupltd.com>',
        to: options.email,
        subject: options.subject,
        html: options.html
    }

     const info = await transporter.sendMail(message)
}

/*
sendMail({
    to: "oluafemi07@gmail.com",
    subject: "Testing",
    text: "Hello Chris"
}).then(r => {
    console.log("Worked")
}).catch(e=>{
    console.log(e)
})
*/


module.exports = {
    sendMail
}
