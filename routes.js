const express = require("express");
const hController = require("./homeController");
const router = express.Router();
const pug = require("pug");
const path = require("path");


router.route("/").get(hController.getMain);
router.route("/about").get(hController.getAbout);
router.route("/contacts").get(hController.getContacts);
router.route("/contacts").post(hController.postContacts);
router.route("/contacts-success").get(hController.getContactsSuccess);
router.route("/tutorial").get(hController.getTutorial);
router.route("/sim").get(hController.getSim);
router.route("/en").get(hController.getEn);
router.route("/ru").get(hController.getRus);
router.route("/*").get(hController.getRedir);

module.exports = router;