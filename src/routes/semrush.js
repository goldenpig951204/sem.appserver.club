const express = require('express');
const { memberMiddleware } = require('../middlewares/permission');
const {wwwProxy, esProxy, deProxy, frProxy, itProxy, ptProxy, viProxy, trProxy, zhProxy, jaProxy, koProxy } = require('../middlewares/semrushProxy');
const semrushRouter = express.Router();
const config = require('../services/config');
/**
 * Set admin-related routes.
 */

applyMiddleware = (req, res, next) => {
    let locale = config.getConfig()["locale"] ? config.getConfig()["locale"]: "www";
    if (locale == "www") return wwwProxy(req, res, next);
    else if (locale == "es") return esProxy(req, res, next);
    else if (locale == "de") return deProxy(req, res, next);
    else if (locale == "fr") return frProxy(req, res, next);
    else if (locale == "it") return itProxy(req, res, next);
    else if (locale == "pt") return ptProxy(req, res, next);
    else if (locale == "vi") return viProxy(req, res, next);
    else if (locale == "tr") return trProxy(req, res, next);
    else if (locale == "zh") return zhProxy(req, res, next);
    else if (locale == "ja") return jaProxy(req, res, next);
    else if (locale == "ko") return koProxy(req, res, next);
    else return wwwProxy(req, res, next);
}
semrushRouter.use('/', memberMiddleware, applyMiddleware);

module.exports = semrushRouter;
