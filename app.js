const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const config = require("./config");
const routes = require("./routes");
const path = require("path");
const staticAsset = require("static-asset");


app.set("view engine", "pug");
app.use(bodyParser.urlencoded({extended : false}));
app.use(staticAsset(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));
app.use(routes);


app.listen(config.PORT, () => console.log(`listening on port ${config.PORT}`));



