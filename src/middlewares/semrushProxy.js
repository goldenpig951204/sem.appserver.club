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
const semrushProxy = createProxyMiddleware({
    target: 'https://www.semrush.com/',
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
                proxyRes.headers['location'], proxyRes.headers['location'].replace('https://www.semrush.com', process.env.DOMAIN);
                res.setHeader('location', proxyRes.headers['location'].replace('https://www.semrush.com', process.env.DOMAIN));
            }
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                let response = responseBuffer.toString('utf-8');
                let $ = cheerio.load(response);   
                $('.srf-header').css('display', 'block');
                $('.srf-header .srf-navbar__right .srf-login-btn, .srf-header .srf-navbar__right .srf-register-btn').remove();
                
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
        referer: 'https://www.semrush.com',
        origin: 'http://www.semrush.com'
    },
    autoRewrite: true,
    ws: true
});

module.exports = semrushProxy;