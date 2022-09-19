const express = require('express');
const { memberMiddleware } = require('../middlewares/permission');
const semrushProxy = require('../middlewares/semrushProxy');
const semrushRouter = express.Router();
const config = require('../services/config');
/**
 * Set admin-related routes.
 */
applyMiddleware = (req, res, next) => {
    let locale = config.getConfig()["locale"] ? config.getConfig()["locale"]: "www";
    return semrushProxy(locale)(req, res, next);
}
semrushRouter.use('/', memberMiddleware, async (req, res, next) => {
    let contentType = req.headers['content-type'];
    if (contentType && contentType.includes('application/json')) {
        req.headers["content-type"] = "application/json; charset=UTF-8";
    }
    next();
}, express.json(), async (req, res, next) => {
    next();
}, applyMiddleware);

module.exports = semrushRouter;
