const fileSystem = require("fs");
const path = require("path");
const config = JSON.parse(fileSystem.readFileSync("mail-config.json"));
const nodemailer = require("nodemailer");

const mailTransport = nodemailer.createTransport({
    service: "Yandex",
    secure: false,
    port: 25,
    auth: {
        user: config.user,
        pass: config.pass
    },
    tls: {
        rejectUnauthorized: false
    }
});


module.exports = {
    sendMail: function(user, email, message) {
        var helperOptions =  {   
            from: `Trade-Simulator.com mail Service <${config.user}>`,
            to: "ethereal_alpha@hotmail.com",
            subject: "New Message from Trade-Simulator.com user",
            text: `user: ${user},\nemail: ${email},\nmessage: ${message}`  
        };
        mailTransport.sendMail(helperOptions, (error, info) => {
            if(error) {
                console.log(error);
            }
            else {
                console.log("message sent successfully");
                console.log(info);
            }
        });
    }
}
