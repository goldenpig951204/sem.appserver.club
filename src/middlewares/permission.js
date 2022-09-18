const base64 = require('base-64');
const crypto = require('node:crypto');
const axios = require('axios');
const Setting = require('../models/setting');
const Site = require('../models/sites');

/**
 * Display 'not-found' error called 404 when a request doesn't match to any routes.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
 const notFound = (req, res, next) => {
    res.status(404);
    const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
    next(error);
}
/**
 * Catch all the unexpected errors.
 * @param { message, status } err 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */ 
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
}
const sessionMapper = new Map();
/**
 * Sign the session with user-agent and ip
 * @param { '2000-01-01 00:00:00' } timeSignedBuffer 
 * @param {*} dataBuffer 
 * @param {*} userAgent 
 * @param { '127.0.0.1' } ip 
 * @returns 
 */
const sign = (timeSignedBuffer, dataBuffer, userAgent, ip) => {
    const signature = crypto
      .createHmac('sha1', process.env.PRIVATE_KEY)
      .update(`${userAgent}\n${ip}`)
      .update(timeSignedBuffer)
      .update(dataBuffer)
      .digest('base64');
    return signature;
}
/**
 * Get the encoded data from session string
 * @param {*} sess 
 * @returns 
 */
const decodeSession = (sess) => {
    let [signature, timeBase64, dataBase64] = sess.split('#');
    let timeBuffer = Buffer.from(timeBase64, 'base64');
    let dataBuffer = Buffer.from(dataBase64, 'base64');
    let data = JSON.parse(base64.decode(dataBase64));
    return {
        signature,
        timeBuffer,
        dataBuffer,
        data
    }
}
/**
 * Check if session is vaild or not with private key
 * @param {*} sess 
 * @param {*} userAgent 
 * @param {*} ipAddr 
 * @returns 
 */
const isValidSession = (sess, userAgent, ipAddr) => {
    let { timeBuffer, dataBuffer, signature } = decodeSession(sess);
    let signedResult = sign(timeBuffer, dataBuffer, userAgent, ipAddr);
    return signedResult === signature;
}
/**
 * Generate session based on encoded data from use-agent and ip
 * @param {*} dataBuffer 
 * @param {*} userAgent 
 * @param {*} ipAddr 
 * @returns 
 */
const generateSession = (dataBuffer, userAgent, ipAddr) => {
    let now = new Date().getTime();
    let timeSignedBuffer = Buffer.alloc(4);
    timeSignedBuffer.writeInt32LE(parseInt(now / 1000), 0);
    let signature = sign(timeSignedBuffer, dataBuffer, userAgent, ipAddr);
    return `${signature}#${timeSignedBuffer.toString('base64')}#${dataBuffer.toString('base64')}`;
} 
/**
 * Check if the user with ID can access or not to the site.
 * @param {*} uid 
 * @param {*} site 
 * @returns 
 */
const isAccessAble = async (uid, site) => {
    let setting = await Setting.findOne();
    let check = false;
    for (let i = 0; i < setting.membershipLids.length; i++) {
        let lid = setting.membershipLids[i];
        let result = await getMembership(uid, lid, site);
        if (result != 0) {
            check = true;
            break;
        }
    }
    return check;
};
/**
 * Check if the user with ID has a certain level of membership or not in the site.
 * @param {*} uid 
 * @param {*} lid 
 * @param {*} site 
 * @returns 
 */
const getMembership = async (uid, lid, site) => {
    const siteInfo = await Site.findOne({ url: site });
    if (!siteInfo || !siteInfo.membershipApiKey) {
        await axios.post(`${process.env.ADMIN_DOMAIN}/logs/server`, {
            log: `Missing config for ${site}.`
        });
        return 0;
    }
    const { data } = await axios.get(
        `${site}/wp-content/plugins/indeed-membership-pro/apigate.php?ihch=${siteInfo.membershipApiKey}&action=verify_user_level&uid=${uid}&lid=${lid}`
    );
    return data.response;
};
/**
 * Check if the user that visit from wp site to this nodeapp logged in the wp site or not 
 * and generate new session and cookie based on the request. 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const authMiddleware = async (req, res, next) => {
    let userAgent = req.headers['user-agent'];
    let ipAddr = process.env.NODE_ENV == 'development' ? '45.126.3.252' : req.headers['x-forwarded-for'];
    let { sess, site } = req.body;
    if (!sess) {
        return res.status(400).end('Bad Request, please try again.');
    }
    if (!isValidSession(sess, userAgent, ipAddr)) {
        return res.status(400).end('Session is invalid.');
    }
    let { dataBuffer, data } = decodeSession(sess);   
    let newSess = generateSession(dataBuffer, userAgent, ipAddr);
    let user = {
        id: data[0],
        isAdmin: Number(data[3]),
        username: data[1].split('=')[1].split('|')[0],
        accessAble: Number(data[3]) ? true : await isAccessAble(data[0], site)
    }
    sessionMapper.set(`${site}-${user.id}`, newSess);
    res.cookie('sess', newSess, {
        path: '/',
        domain: process.env.NODE_ENV === "development" ? undefined : ".appserver.club"
    });
    res.cookie(
        'wpInfo',
        base64.encode(JSON.stringify({user: user, site})),
        {
          path: '/',
          domain: process.env.NODE_ENV === "development" ? undefined : ".appserver.club"
        }
    );
    next();
}
/**
 * Check if the user bought membership to access this site or not.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const memberMiddleware = async (req, res, next) => {
    if (req.url.match(/\.(css|json|js|text|png|jpg|map|ico|svg)/)) return next();

    let { wpInfo, sess } = req.cookies;
    if (!wpInfo || !sess) return res.status(400).end('Access Denined.');
    
    let userAgent = req.headers['user-agent'];
    let ipAddr = process.env.NODE_ENV == 'development' ? '45.126.3.252' : req.headers['x-forwarded-for'];

    if (!isValidSession(sess, userAgent, ipAddr)) return res.status(400).end('Session is invalid.');
    
    let wpInfoDecoded = JSON.parse(base64.decode(wpInfo));
    if (!wpInfoDecoded.user.accessAble) return res.status(400).end('Membership required.');

    if (!sessionMapper.get(`${wpInfoDecoded.site}-${wpInfoDecoded.user.id}`)) sessionMapper.set(`${wpInfoDecoded.site}-${wpInfoDecoded.user.id}`, sess);
    if (sessionMapper.get(`${wpInfoDecoded.site}-${wpInfoDecoded.user.id}`) !== sess) return res.status(400).end('Multiple Browsers is not allowed.');
    req.user = wpInfoDecoded.user;
    req.wpSite = wpInfoDecoded.site;
    next();
}


module.exports = {
    notFound,
    errorHandler,
    authMiddleware,
    memberMiddleware
}