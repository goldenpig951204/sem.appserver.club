const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { notFound, errorHandler } = require('./middlewares/permission');
const app = express();
const config = require('./services/config');
const {
    authorizeRouter,
    semrushRouter
} = require('./routes');
/**
 * Set global middleware
 */
app.use(morgan('dev'));
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/authorize', authorizeRouter);
app.get('/lang', (req, res) => {
    let { locale } = req.query;
    locale = locale.split("/")[0];
    let conf = config.getConfig();
    config.setConfig({
        membershipLids: conf.membershipLids,
        membershipApiKey: conf.membershipApiKey,
        domainOverviewLimit: conf.domainOverviewLimit,
        keywordOverviewLimit: conf.keywordOverviewLimit, 
        userAgent: conf.userAgent,
        cookie: conf.cookie,
        locale: locale
    });
    res.redirect("/");
});
app.use('/', semrushRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
