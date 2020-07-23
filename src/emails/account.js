const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const welcomeEmail = (email, name) => {
      sgMail.send({
          to: email,
          from: 'khemchandrs@gmail.com',
          subject: 'Welcome to Nodejs, ExpressJs and MongoDB restAPI routes website',
          text: `Thanks for trusting my website ${name}. We are happy for your any query`
      })
}


const cancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'khemchandrs@gmail.com',
        subject: 'Good Bye from KCR Group',
        text: `Please fill the feedback ${name}. Give the reason why are you deleted account`
    })
}

module.exports = {
    welcomeEmail,
    cancelEmail
}



