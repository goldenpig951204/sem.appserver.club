const express = require('express');
const { memberMiddleware } = require('../middlewares/permission');
const semrushProxy = require('../middlewares/semrushProxy');
const semrushRouter = express.Router();
/**
 * Set admin-related routes.
 */
semrushRouter.use('/', memberMiddleware, semrushProxy);

module.exports = semrushRouter;
