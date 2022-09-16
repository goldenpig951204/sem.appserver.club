const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { notFound, errorHandler } = require('./middlewares/permission');
const app = express();
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
app.use('/', semrushRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
