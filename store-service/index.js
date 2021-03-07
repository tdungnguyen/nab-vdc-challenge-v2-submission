"use strict";

const config = require("./config");

// const Redis_Instance = require("./src/lib/redis");
// const redis_instance = new Redis_Instance(Object.assign(config.APP, config.REDIS));

const express = require("express");
const Swagger_Ui = require("swagger-ui-express");
const Api_Specs = require("./swagger/swagger.json");

const express_request_id = require("express-request-id")();
const app = express();

app.set("trust proxy", true);

app.use( express.json( { verify: ( req, res, buffer ) => { req.rawBody = buffer; } } ) );
app.use(express_request_id);

let router = express.Router();
app.use("/v1", router);

app.use(config.APP.SWAGGER_PATH, Swagger_Ui.serve, Swagger_Ui.setup(Api_Specs));

router.use((req, res, next) => {
    next();
});

const fn_list_stores = require("./src/router/get_stores");
app.get("/stores", fn_list_stores);

app.listen(config.PORT, () => console.log(`store-service started on port ${config.PORT}.`) );
