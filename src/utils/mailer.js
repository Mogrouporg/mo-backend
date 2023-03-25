const nodemailer = require('nodemailer');

const sendMail =  async(options)=>{
    const  transporter = nodemailer.createTransport({
        service: 'smtp.office365.com',
        auth: {
            user: 'info@mogroupltd.com',
            pass: "Blackgold85?"
        }
    });

    let message = {
        from: 'MO Group <info@mogroupltd.com>',
        to: options.email,
        subject: options.subject,
        text: options.text,
        //html: options.html
    }

    const info = await transporter.sendMail(message)
}

sendMail({
    to: "christopheregbaaibon@gmail.com",
    subject: "Testing",
    text: "Hello Chris"
}).then(r => {
    console.log("Worked")
}).catch(e=>{
    console.log(e)
})

/*
module.exports = {
    sendMail
}*/
