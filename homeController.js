const bodyParser = require("body-parser");
const languages = require("./langs");
const mailService = require("./mailService");

var currentLang = languages.en;

var controller = {
    getMain: function(request, response) { 
            response.render("index", {
                data: currentLang,
                pageTitle: currentLang.home.title,
                imageSource: "images/main.jpg"
            });  
    },

    getContacts: function(request, response) {
        response.render("contacts",{
            pageTitle: currentLang.contacts.title,
            data: currentLang,
            imageSource: "/images/tradesim.jpg"
        });
    },

    getContactsSuccess: function(request, response) {
        response.render("contacts-success",{
            pageTitle: currentLang.contactsSuccess.title,
            data: currentLang,
            imageSource: "/images/tradesim.jpg"
        });
    },

    postContacts: function(request, response) {
        if(!request.body)
            return;
        mailService.sendMail(request.body.username, request.body.email, request.body.message);
        response.redirect("/contacts-success");
    },

    getSim: function(request, response) {
        response.render("sim", {
            pageTitle: currentLang.tradeSim.title, 
            data: currentLang,
            imageSource: "/images/tradesim.jpg"
        });
    },

    getRus: function(request, response) {
        currentLang = languages.ru;
        controller.getMain(request, response);
    },
    getEn: function(request, response) {
        currentLang = languages.en;
        controller.getMain(request, response);
    },

    getAbout: function(request, response) {
        response.render("about", {
            pageTitle: currentLang.about.title,
            data: currentLang,
            imageSource: "/images/tradesim.jpg"
        })
    },

    getTutorial: function(request, response) {
        response.render("tutorial", {
            pageTitle: currentLang.tutorial.title,
            data: currentLang,
            imageSource: "/images/tradesim.jpg"
        })
    },

    getSome: function() {
        alert('get some');
    },

    getRedir: function(request, response) {
        response.redirect("/");
    }
};

module.exports = controller;