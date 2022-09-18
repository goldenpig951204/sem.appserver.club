const {
    createProxyMiddleware,
    responseInterceptor
} = require('http-proxy-middleware');
const cheerio = require('cheerio');
const config = require('../services/config');
const { semrushLog } = require('../services/logger');

/**
 * Setting proxy to send all the requests that comes from wp site into this nodeapp to www.semrush.com   
 */
const wwwProxy = createProxyMiddleware({
    target: "https://www.semrush.com/",
    selfHandleResponse: true,
    changeOrigin: true,
    onProxyReq: async (proxyReq, req) => {// Subscribe to http-proxy's proxyReq event
        // Intercept proxy request and set UserAgent and cookie of first session
        let { userAgent, cookie } = config.getConfig();
        proxyReq.setHeader('user-agent', userAgent);
        proxyReq.setHeader('Cookie', cookie);
        console.log(proxyReq);
        // Fix the body-parser module
        if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
            let contentType = proxyReq.getHeader('content-type');
            let writeBody = bodyData => {
                proxyReq.setHeader('content-length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
            if (contentType && contentType.includes('application/json')) {
                writeBody(JSON.stringify(req.body));
            }
            if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
                let params = new URLSearchParams(req.body);
                writeBody(params.toString());
            }
        }
    },
    onProxyRes: responseInterceptor(// Subscribe to http-proxy's proxyRes event.
        async (responseBuffer, proxyRes, req, res) => {// Ignore static file
            if (req.url.match(/\.(css|json|js|text|png|jpg|map|ico|svg)/)) return responseBuffer;
            // Log the activity
            
            semrushLog.info(`${req.user.username} ${req.wpSite} ${req.headers['user-agent']} ${req.url} ${proxyRes.statusCode}`)
            if (proxyRes.headers['location']) {// Rewrite the location to the domain of nodeapp
                let locale = "";
                try {
                    let url = new URL(proxyRes.headers.location);
                    target = url.origin;
                    locale = url.hostname.split(".")[0];
                } catch (err) {
                    target = "https://www.semrush.com";
                }
                console.log("location===>", proxyRes.headers["location"], proxyRes.statusCode);
                if (proxyRes.statusCode == 302) {
                    proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}/lang?locale=${locale}`);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}/lang?locale=${locale}`));
                } else {
                    proxyRes.headers['location'].replace(target, process.env.DOMAIN);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, process.env.DOMAIN));
                }
            }
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                let response = responseBuffer.toString('utf-8');
                let $ = cheerio.load(response);   
                $('.srf-header').css('display', 'block');
                $('.srf-header .srf-navbar__right .srf-login-btn, .srf-header .srf-navbar__right .srf-register-btn').remove();
                $('.srf-dropdown.srf-switch-locale-trigger').remove();
                if (req.user.isAdmin) {
                    return $.html();
                } else {// Remove the account information if client is normal user
                    $('.srf-navbar__right').remove();
                    return $.html();
                }
            }
            return responseBuffer;
        }
    ),
    prependPath: true,
    secure: false,
    hostRewrite: true,
    headers: {
        referer: "https://www.semrush.com",
        origin: "https://www.semrush.com"
    },
    autoRewrite: true,
    ws: true
});

const esProxy = createProxyMiddleware({
    target: "https://es.semrush.com/",
    selfHandleResponse: true,
    changeOrigin: true,
    onProxyReq: async (proxyReq, req) => {// Subscribe to http-proxy's proxyReq event
        // Intercept proxy request and set UserAgent and cookie of first session
        let { userAgent, cookie } = config.getConfig();
        proxyReq.setHeader('user-agent', userAgent);
        proxyReq.setHeader('Cookie', cookie);
        // Fix the body-parser module
        if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
            let contentType = proxyReq.getHeader('content-type');
            let writeBody = bodyData => {
                proxyReq.setHeader('content-length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
            if (contentType && contentType.includes('application/json')) {
                writeBody(JSON.stringify(req.body));
            }
            if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
                let params = new URLSearchParams(req.body);
                writeBody(params.toString());
            }
        }
    },
    onProxyRes: responseInterceptor(// Subscribe to http-proxy's proxyRes event.
        async (responseBuffer, proxyRes, req, res) => {// Ignore static file
            if (req.url.match(/\.(css|json|js|text|png|jpg|map|ico|svg)/)) return responseBuffer;
            // Log the activity
            
            semrushLog.info(`${req.user.username} ${req.wpSite} ${req.headers['user-agent']} ${req.url} ${proxyRes.statusCode}`)
            if (proxyRes.headers['location']) {// Rewrite the location to the domain of nodeapp
                let locale = "";
                try {
                    let url = new URL(proxyRes.headers.location);
                    target = url.origin;
                    locale = url.hostname.split(".")[0];
                } catch (err) {
                    target = "https://es.semrush.com";
                }
                console.log("location===>", proxyRes.headers["location"], proxyRes.statusCode);
                if (proxyRes.statusCode == 302) {
                    proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}/lang?locale=${locale}`);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}/lang?locale=${locale}`));
                } else {
                    proxyRes.headers['location'].replace(target, process.env.DOMAIN);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, process.env.DOMAIN));
                }
            }
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                let response = responseBuffer.toString('utf-8');
                let $ = cheerio.load(response);   
                $('.srf-header').css('display', 'block');
                $('.srf-header .srf-navbar__right .srf-login-btn, .srf-header .srf-navbar__right .srf-register-btn').remove();
                $('.srf-dropdown.srf-switch-locale-trigger').remove();
                if (req.user.isAdmin) {
                    return $.html();
                } else {// Remove the account information if client is normal user
                    $('.srf-navbar__right').remove();
                    return $.html();
                }
            }
            return responseBuffer;
        }
    ),
    prependPath: true,
    secure: false,
    hostRewrite: true,
    headers: {
        referer: "https://es.semrush.com",
        origin: "https://es.semrush.com"
    },
    autoRewrite: true,
    ws: true
});

const deProxy = createProxyMiddleware({
    target: "https://de.semrush.com/",
    selfHandleResponse: true,
    changeOrigin: true,
    onProxyReq: async (proxyReq, req) => {// Subscribe to http-proxy's proxyReq event
        // Intercept proxy request and set UserAgent and cookie of first session
        let { userAgent, cookie } = config.getConfig();
        proxyReq.setHeader('user-agent', userAgent);
        proxyReq.setHeader('Cookie', cookie);
        // Fix the body-parser module
        if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
            let contentType = proxyReq.getHeader('content-type');
            let writeBody = bodyData => {
                proxyReq.setHeader('content-length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
            if (contentType && contentType.includes('application/json')) {
                writeBody(JSON.stringify(req.body));
            }
            if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
                let params = new URLSearchParams(req.body);
                writeBody(params.toString());
            }
        }
    },
    onProxyRes: responseInterceptor(// Subscribe to http-proxy's proxyRes event.
        async (responseBuffer, proxyRes, req, res) => {// Ignore static file
            if (req.url.match(/\.(css|json|js|text|png|jpg|map|ico|svg)/)) return responseBuffer;
            // Log the activity
            
            semrushLog.info(`${req.user.username} ${req.wpSite} ${req.headers['user-agent']} ${req.url} ${proxyRes.statusCode}`)
            if (proxyRes.headers['location']) {// Rewrite the location to the domain of nodeapp
                let locale = "";
                try {
                    let url = new URL(proxyRes.headers.location);
                    target = url.origin;
                    locale = url.hostname.split(".")[0];
                } catch (err) {
                    target = "https://de.semrush.com";
                }
                console.log("location===>", proxyRes.headers["location"], proxyRes.statusCode);
                if (proxyRes.statusCode == 302) {
                    proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`));
                } else {
                    proxyRes.headers['location'].replace(target, process.env.DOMAIN);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, process.env.DOMAIN));
                }
            }
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                let response = responseBuffer.toString('utf-8');
                let $ = cheerio.load(response);   
                $('.srf-header').css('display', 'block');
                $('.srf-header .srf-navbar__right .srf-login-btn, .srf-header .srf-navbar__right .srf-register-btn').remove();
                $('.srf-dropdown.srf-switch-locale-trigger').remove();
                if (req.user.isAdmin) {
                    return $.html();
                } else {// Remove the account information if client is normal user
                    $('.srf-navbar__right').remove();
                    return $.html();
                }
            }
            return responseBuffer;
        }
    ),
    prependPath: true,
    secure: false,
    hostRewrite: true,
    headers: {
        referer: "https://de.semrush.com",
        origin: "https://de.semrush.com"
    },
    autoRewrite: true,
    ws: true
});

const frProxy = createProxyMiddleware({
    target: "https://fr.semrush.com/",
    selfHandleResponse: true,
    changeOrigin: true,
    onProxyReq: async (proxyReq, req) => {// Subscribe to http-proxy's proxyReq event
        // Intercept proxy request and set UserAgent and cookie of first session
        let { userAgent, cookie } = config.getConfig();
        proxyReq.setHeader('user-agent', userAgent);
        proxyReq.setHeader('Cookie', cookie);
        // Fix the body-parser module
        if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
            let contentType = proxyReq.getHeader('content-type');
            let writeBody = bodyData => {
                proxyReq.setHeader('content-length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
            if (contentType && contentType.includes('application/json')) {
                writeBody(JSON.stringify(req.body));
            }
            if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
                let params = new URLSearchParams(req.body);
                writeBody(params.toString());
            }
        }
    },
    onProxyRes: responseInterceptor(// Subscribe to http-proxy's proxyRes event.
        async (responseBuffer, proxyRes, req, res) => {// Ignore static file
            if (req.url.match(/\.(css|json|js|text|png|jpg|map|ico|svg)/)) return responseBuffer;
            // Log the activity
            
            semrushLog.info(`${req.user.username} ${req.wpSite} ${req.headers['user-agent']} ${req.url} ${proxyRes.statusCode}`)
            if (proxyRes.headers['location']) {// Rewrite the location to the domain of nodeapp
                let locale = "";
                try {
                    let url = new URL(proxyRes.headers.location);
                    target = url.origin;
                    locale = url.hostname.split(".")[0];
                } catch (err) {
                    target = "https://fr.semrush.com";
                }
                if (proxyRes.statusCode == 302) {
                    proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`));
                } else {
                    proxyRes.headers['location'].replace(target, process.env.DOMAIN);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, process.env.DOMAIN));
                }
            }
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                let response = responseBuffer.toString('utf-8');
                let $ = cheerio.load(response);   
                $('.srf-header').css('display', 'block');
                $('.srf-header .srf-navbar__right .srf-login-btn, .srf-header .srf-navbar__right .srf-register-btn').remove();
                $('.srf-dropdown.srf-switch-locale-trigger').remove();
                if (req.user.isAdmin) {
                    return $.html();
                } else {// Remove the account information if client is normal user
                    $('.srf-navbar__right').remove();
                    return $.html();
                }
            }
            return responseBuffer;
        }
    ),
    prependPath: true,
    secure: false,
    hostRewrite: true,
    headers: {
        referer: "https://fr.semrush.com",
        origin: "https://fr.semrush.com"
    },
    autoRewrite: true,
    ws: true
});

const itProxy = createProxyMiddleware({
    target: "https://it.semrush.com/",
    selfHandleResponse: true,
    changeOrigin: true,
    onProxyReq: async (proxyReq, req) => {// Subscribe to http-proxy's proxyReq event
        // Intercept proxy request and set UserAgent and cookie of first session
        let { userAgent, cookie } = config.getConfig();
        proxyReq.setHeader('user-agent', userAgent);
        proxyReq.setHeader('Cookie', cookie);
        // Fix the body-parser module
        if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
            let contentType = proxyReq.getHeader('content-type');
            let writeBody = bodyData => {
                proxyReq.setHeader('content-length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
            if (contentType && contentType.includes('application/json')) {
                writeBody(JSON.stringify(req.body));
            }
            if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
                let params = new URLSearchParams(req.body);
                writeBody(params.toString());
            }
        }
    },
    onProxyRes: responseInterceptor(// Subscribe to http-proxy's proxyRes event.
        async (responseBuffer, proxyRes, req, res) => {// Ignore static file
            if (req.url.match(/\.(css|json|js|text|png|jpg|map|ico|svg)/)) return responseBuffer;
            // Log the activity
            
            semrushLog.info(`${req.user.username} ${req.wpSite} ${req.headers['user-agent']} ${req.url} ${proxyRes.statusCode}`)
            if (proxyRes.headers['location']) {// Rewrite the location to the domain of nodeapp
                let locale = "";
                try {
                    let url = new URL(proxyRes.headers.location);
                    target = url.origin;
                    locale = url.hostname.split(".")[0];
                } catch (err) {
                    target = "https://it.semrush.com";
                }
                if (proxyRes.statusCode == 302) {
                    proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`));
                } else {
                    proxyRes.headers['location'].replace(target, process.env.DOMAIN);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, process.env.DOMAIN));
                }
            }
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                let response = responseBuffer.toString('utf-8');
                let $ = cheerio.load(response);   
                $('.srf-header').css('display', 'block');
                $('.srf-header .srf-navbar__right .srf-login-btn, .srf-header .srf-navbar__right .srf-register-btn').remove();
                $('.srf-dropdown.srf-switch-locale-trigger').remove();
                if (req.user.isAdmin) {
                    return $.html();
                } else {// Remove the account information if client is normal user
                    $('.srf-navbar__right').remove();
                    return $.html();
                }
            }
            return responseBuffer;
        }
    ),
    prependPath: true,
    secure: false,
    hostRewrite: true,
    headers: {
        referer: "https://it.semrush.com",
        origin: "https://it.semrush.com"
    },
    autoRewrite: true,
    ws: true
});

const ptProxy = createProxyMiddleware({
    target: "https://pt.semrush.com/",
    selfHandleResponse: true,
    changeOrigin: true,
    onProxyReq: async (proxyReq, req) => {// Subscribe to http-proxy's proxyReq event
        // Intercept proxy request and set UserAgent and cookie of first session
        let { userAgent, cookie } = config.getConfig();
        proxyReq.setHeader('user-agent', userAgent);
        proxyReq.setHeader('Cookie', cookie);
        // Fix the body-parser module
        if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
            let contentType = proxyReq.getHeader('content-type');
            let writeBody = bodyData => {
                proxyReq.setHeader('content-length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
            if (contentType && contentType.includes('application/json')) {
                writeBody(JSON.stringify(req.body));
            }
            if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
                let params = new URLSearchParams(req.body);
                writeBody(params.toString());
            }
        }
    },
    onProxyRes: responseInterceptor(// Subscribe to http-proxy's proxyRes event.
        async (responseBuffer, proxyRes, req, res) => {// Ignore static file
            if (req.url.match(/\.(css|json|js|text|png|jpg|map|ico|svg)/)) return responseBuffer;
            // Log the activity
            
            semrushLog.info(`${req.user.username} ${req.wpSite} ${req.headers['user-agent']} ${req.url} ${proxyRes.statusCode}`)
            if (proxyRes.headers['location']) {// Rewrite the location to the domain of nodeapp
                let locale = "";
                try {
                    let url = new URL(proxyRes.headers.location);
                    target = url.origin;
                    locale = url.hostname.split(".")[0];
                } catch (err) {
                    target = "https://pt.semrush.com";
                }
                if (proxyRes.statusCode == 302) {
                    proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`));
                } else {
                    proxyRes.headers['location'].replace(target, process.env.DOMAIN);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, process.env.DOMAIN));
                }
            }
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                let response = responseBuffer.toString('utf-8');
                let $ = cheerio.load(response);   
                $('.srf-header').css('display', 'block');
                $('.srf-header .srf-navbar__right .srf-login-btn, .srf-header .srf-navbar__right .srf-register-btn').remove();
                $('.srf-dropdown.srf-switch-locale-trigger').remove();
                if (req.user.isAdmin) {
                    return $.html();
                } else {// Remove the account information if client is normal user
                    $('.srf-navbar__right').remove();
                    return $.html();
                }
            }
            return responseBuffer;
        }
    ),
    prependPath: true,
    secure: false,
    hostRewrite: true,
    headers: {
        referer: "https://pt.semrush.com",
        origin: "https://pt.semrush.com"
    },
    autoRewrite: true,
    ws: true
});

const viProxy = createProxyMiddleware({
    target: "https://vt.semrush.com/",
    selfHandleResponse: true,
    changeOrigin: true,
    onProxyReq: async (proxyReq, req) => {// Subscribe to http-proxy's proxyReq event
        // Intercept proxy request and set UserAgent and cookie of first session
        let { userAgent, cookie } = config.getConfig();
        proxyReq.setHeader('user-agent', userAgent);
        proxyReq.setHeader('Cookie', cookie);
        // Fix the body-parser module
        if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
            let contentType = proxyReq.getHeader('content-type');
            let writeBody = bodyData => {
                proxyReq.setHeader('content-length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
            if (contentType && contentType.includes('application/json')) {
                writeBody(JSON.stringify(req.body));
            }
            if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
                let params = new URLSearchParams(req.body);
                writeBody(params.toString());
            }
        }
    },
    onProxyRes: responseInterceptor(// Subscribe to http-proxy's proxyRes event.
        async (responseBuffer, proxyRes, req, res) => {// Ignore static file
            if (req.url.match(/\.(css|json|js|text|png|jpg|map|ico|svg)/)) return responseBuffer;
            // Log the activity
            
            semrushLog.info(`${req.user.username} ${req.wpSite} ${req.headers['user-agent']} ${req.url} ${proxyRes.statusCode}`)
            if (proxyRes.headers['location']) {// Rewrite the location to the domain of nodeapp
                let locale = "";
                try {
                    let url = new URL(proxyRes.headers.location);
                    target = url.origin;
                    locale = url.hostname.split(".")[0];
                } catch (err) {
                    target = "https://vi.semrush.com";
                }
                if (proxyRes.statusCode == 302) {
                    proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`));
                } else {
                    proxyRes.headers['location'].replace(target, process.env.DOMAIN);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, process.env.DOMAIN));
                }
            }
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                let response = responseBuffer.toString('utf-8');
                let $ = cheerio.load(response);   
                $('.srf-header').css('display', 'block');
                $('.srf-header .srf-navbar__right .srf-login-btn, .srf-header .srf-navbar__right .srf-register-btn').remove();
                $('.srf-dropdown.srf-switch-locale-trigger').remove();
                if (req.user.isAdmin) {
                    return $.html();
                } else {// Remove the account information if client is normal user
                    $('.srf-navbar__right').remove();
                    return $.html();
                }
            }
            return responseBuffer;
        }
    ),
    prependPath: true,
    secure: false,
    hostRewrite: true,
    headers: {
        referer: "https://vi.semrush.com",
        origin: "https://vi.semrush.com"
    },
    autoRewrite: true,
    ws: true
});

const trProxy = createProxyMiddleware({
    target: "https://tr.semrush.com/",
    selfHandleResponse: true,
    changeOrigin: true,
    onProxyReq: async (proxyReq, req) => {// Subscribe to http-proxy's proxyReq event
        // Intercept proxy request and set UserAgent and cookie of first session
        let { userAgent, cookie } = config.getConfig();
        proxyReq.setHeader('user-agent', userAgent);
        proxyReq.setHeader('Cookie', cookie);
        // Fix the body-parser module
        if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
            let contentType = proxyReq.getHeader('content-type');
            let writeBody = bodyData => {
                proxyReq.setHeader('content-length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
            if (contentType && contentType.includes('application/json')) {
                writeBody(JSON.stringify(req.body));
            }
            if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
                let params = new URLSearchParams(req.body);
                writeBody(params.toString());
            }
        }
    },
    onProxyRes: responseInterceptor(// Subscribe to http-proxy's proxyRes event.
        async (responseBuffer, proxyRes, req, res) => {// Ignore static file
            if (req.url.match(/\.(css|json|js|text|png|jpg|map|ico|svg)/)) return responseBuffer;
            // Log the activity
            
            semrushLog.info(`${req.user.username} ${req.wpSite} ${req.headers['user-agent']} ${req.url} ${proxyRes.statusCode}`)
            if (proxyRes.headers['location']) {// Rewrite the location to the domain of nodeapp
                let locale = "";
                try {
                    let url = new URL(proxyRes.headers.location);
                    target = url.origin;
                    locale = url.hostname.split(".")[0];
                } catch (err) {
                    target = "https://tr.semrush.com";
                }
                if (proxyRes.statusCode == 302) {
                    proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`));
                } else {
                    proxyRes.headers['location'].replace(target, process.env.DOMAIN);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, process.env.DOMAIN));
                }
            }
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                let response = responseBuffer.toString('utf-8');
                let $ = cheerio.load(response);   
                $('.srf-header').css('display', 'block');
                $('.srf-header .srf-navbar__right .srf-login-btn, .srf-header .srf-navbar__right .srf-register-btn').remove();
                $('.srf-dropdown.srf-switch-locale-trigger').remove();
                if (req.user.isAdmin) {
                    return $.html();
                } else {// Remove the account information if client is normal user
                    $('.srf-navbar__right').remove();
                    return $.html();
                }
            }
            return responseBuffer;
        }
    ),
    prependPath: true,
    secure: false,
    hostRewrite: true,
    headers: {
        referer: "https://tr.semrush.com",
        origin: "https://tr.semrush.com"
    },
    autoRewrite: true,
    ws: true
});

const zhProxy = createProxyMiddleware({
    target: "https://zh.semrush.com/",
    selfHandleResponse: true,
    changeOrigin: true,
    onProxyReq: async (proxyReq, req) => {// Subscribe to http-proxy's proxyReq event
        // Intercept proxy request and set UserAgent and cookie of first session
        let { userAgent, cookie } = config.getConfig();
        proxyReq.setHeader('user-agent', userAgent);
        proxyReq.setHeader('Cookie', cookie);
        // Fix the body-parser module
        if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
            let contentType = proxyReq.getHeader('content-type');
            let writeBody = bodyData => {
                proxyReq.setHeader('content-length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
            if (contentType && contentType.includes('application/json')) {
                writeBody(JSON.stringify(req.body));
            }
            if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
                let params = new URLSearchParams(req.body);
                writeBody(params.toString());
            }
        }
    },
    onProxyRes: responseInterceptor(// Subscribe to http-proxy's proxyRes event.
        async (responseBuffer, proxyRes, req, res) => {// Ignore static file
            if (req.url.match(/\.(css|json|js|text|png|jpg|map|ico|svg)/)) return responseBuffer;
            // Log the activity
            
            semrushLog.info(`${req.user.username} ${req.wpSite} ${req.headers['user-agent']} ${req.url} ${proxyRes.statusCode}`)
            if (proxyRes.headers['location']) {// Rewrite the location to the domain of nodeapp
                let locale = "";
                try {
                    let url = new URL(proxyRes.headers.location);
                    target = url.origin;
                    locale = url.hostname.split(".")[0];
                } catch (err) {
                    target = "https://zh.semrush.com";
                }
                if (proxyRes.statusCode == 302) {
                    proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`));
                } else {
                    proxyRes.headers['location'].replace(target, process.env.DOMAIN);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, process.env.DOMAIN));
                }
            }
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                let response = responseBuffer.toString('utf-8');
                let $ = cheerio.load(response);   
                $('.srf-header').css('display', 'block');
                $('.srf-header .srf-navbar__right .srf-login-btn, .srf-header .srf-navbar__right .srf-register-btn').remove();
                $('.srf-dropdown.srf-switch-locale-trigger').remove();
                if (req.user.isAdmin) {
                    return $.html();
                } else {// Remove the account information if client is normal user
                    $('.srf-navbar__right').remove();
                    return $.html();
                }
            }
            return responseBuffer;
        }
    ),
    prependPath: true,
    secure: false,
    hostRewrite: true,
    headers: {
        referer: "https://zh.semrush.com",
        origin: "https://zh.semrush.com"
    },
    autoRewrite: true,
    ws: true
});

const jaProxy = createProxyMiddleware({
    target: "https://ja.semrush.com/",
    selfHandleResponse: true,
    changeOrigin: true,
    onProxyReq: async (proxyReq, req) => {// Subscribe to http-proxy's proxyReq event
        // Intercept proxy request and set UserAgent and cookie of first session
        let { userAgent, cookie } = config.getConfig();
        proxyReq.setHeader('user-agent', userAgent);
        proxyReq.setHeader('Cookie', cookie);
        // Fix the body-parser module
        if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
            let contentType = proxyReq.getHeader('content-type');
            let writeBody = bodyData => {
                proxyReq.setHeader('content-length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
            if (contentType && contentType.includes('application/json')) {
                writeBody(JSON.stringify(req.body));
            }
            if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
                let params = new URLSearchParams(req.body);
                writeBody(params.toString());
            }
        }
    },
    onProxyRes: responseInterceptor(// Subscribe to http-proxy's proxyRes event.
        async (responseBuffer, proxyRes, req, res) => {// Ignore static file
            if (req.url.match(/\.(css|json|js|text|png|jpg|map|ico|svg)/)) return responseBuffer;
            // Log the activity
            
            semrushLog.info(`${req.user.username} ${req.wpSite} ${req.headers['user-agent']} ${req.url} ${proxyRes.statusCode}`)
            if (proxyRes.headers['location']) {// Rewrite the location to the domain of nodeapp
                let locale = "";
                try {
                    let url = new URL(proxyRes.headers.location);
                    target = url.origin;
                    locale = url.hostname.split(".")[0];
                } catch (err) {
                    target = "https://ja.semrush.com";
                }
                if (proxyRes.statusCode == 302) {
                    proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`));
                } else {
                    proxyRes.headers['location'].replace(target, process.env.DOMAIN);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, process.env.DOMAIN));
                }
            }
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                let response = responseBuffer.toString('utf-8');
                let $ = cheerio.load(response);   
                $('.srf-header').css('display', 'block');
                $('.srf-header .srf-navbar__right .srf-login-btn, .srf-header .srf-navbar__right .srf-register-btn').remove();
                $('.srf-dropdown.srf-switch-locale-trigger').remove();
                if (req.user.isAdmin) {
                    return $.html();
                } else {// Remove the account information if client is normal user
                    $('.srf-navbar__right').remove();
                    return $.html();
                }
            }
            return responseBuffer;
        }
    ),
    prependPath: true,
    secure: false,
    hostRewrite: true,
    headers: {
        referer: "https://ja.semrush.com",
        origin: "https://ja.semrush.com"
    },
    autoRewrite: true,
    ws: true
});

const koProxy = createProxyMiddleware({
    target: "https://ko.semrush.com/",
    selfHandleResponse: true,
    changeOrigin: true,
    onProxyReq: async (proxyReq, req) => {// Subscribe to http-proxy's proxyReq event
        // Intercept proxy request and set UserAgent and cookie of first session
        let { userAgent, cookie } = config.getConfig();
        proxyReq.setHeader('user-agent', userAgent);
        proxyReq.setHeader('Cookie', cookie);
        // Fix the body-parser module
        if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
            let contentType = proxyReq.getHeader('content-type');
            let writeBody = bodyData => {
                proxyReq.setHeader('content-length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
            if (contentType && contentType.includes('application/json')) {
                writeBody(JSON.stringify(req.body));
            }
            if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
                let params = new URLSearchParams(req.body);
                writeBody(params.toString());
            }
        }
    },
    onProxyRes: responseInterceptor(// Subscribe to http-proxy's proxyRes event.
        async (responseBuffer, proxyRes, req, res) => {// Ignore static file
            if (req.url.match(/\.(css|json|js|text|png|jpg|map|ico|svg)/)) return responseBuffer;
            // Log the activity
            
            semrushLog.info(`${req.user.username} ${req.wpSite} ${req.headers['user-agent']} ${req.url} ${proxyRes.statusCode}`)
            if (proxyRes.headers['location']) {// Rewrite the location to the domain of nodeapp
                let locale = "";
                try {
                    let url = new URL(proxyRes.headers.location);
                    target = url.origin;
                    locale = url.hostname.split(".")[0];
                } catch (err) {
                    target = "https://ko.semrush.com";
                }
                if (proxyRes.statusCode == 302) {
                    proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, `${process.env.DOMAIN}lang?locale=${locale}`));
                } else {
                    proxyRes.headers['location'].replace(target, process.env.DOMAIN);
                    res.setHeader('location', proxyRes.headers['location'].replace(target, process.env.DOMAIN));
                }
            }
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                let response = responseBuffer.toString('utf-8');
                let $ = cheerio.load(response);   
                $('.srf-header').css('display', 'block');
                $('.srf-header .srf-navbar__right .srf-login-btn, .srf-header .srf-navbar__right .srf-register-btn').remove();
                $('.srf-dropdown.srf-switch-locale-trigger').remove();
                if (req.user.isAdmin) {
                    return $.html();
                } else {// Remove the account information if client is normal user
                    $('.srf-navbar__right').remove();
                    return $.html();
                }
            }
            return responseBuffer;
        }
    ),
    prependPath: true,
    secure: false,
    hostRewrite: true,
    headers: {
        referer: "https://ko.semrush.com",
        origin: "https://ko.semrush.com"
    },
    autoRewrite: true,
    ws: true
});

module.exports = {
    wwwProxy,
    esProxy,
    deProxy,
    frProxy,
    itProxy,
    ptProxy,
    viProxy,
    trProxy,
    zhProxy,
    jaProxy,
    koProxy
}