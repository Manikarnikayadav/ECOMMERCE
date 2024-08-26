const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host:process.env.SMTP_HOST,
        port:process.env.SMTP_PORT,
        secure: true,
        service: process.env.SMTP_SERVICE,  
        auth: {
            user: process.env.SMTP_MAIL,  
            pass: process.env.SMTP_PASSWORD 
        }
    });

    const mailOptions = {
        from: process.env.SMTP_MAIL, 
        to: options.email,
        subject: options.subject, 
        text: options.message
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Re-throw the error to handle it in the calling code
    }
};

module.exports = sendEmail;


// mail testing services like mailtrap are used for development but they dont snd mail