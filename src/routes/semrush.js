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
semrushRouter.use('/', memberMiddleware, applyMiddleware);

module.exports = semrushRouter;
