const {
    createProxyMiddleware,
    responseInterceptor
} = require('http-proxy-middleware');
const cheerio = require('cheerio');
const axios = require('axios');
const config = require('../services/config');

/**
 * Convert data based on form-submit to query-string
 * @param {*} data 
 * @returns 
 */
 const getFormQueryString = (data) => {
    let items = [];
    Object.keys(data).forEach((key, idx) => {
        if (Array.isArray(data[key])) {
            for(let item of data[key]) {
                items.push(key + "[]" + '=' + encodeURIComponent(item));
            }
        } else {
            items.push(key + '=' + encodeURIComponent(data[key]));
        }
    });
    let dataQuery = items.join('&');
    return dataQuery;
 }
/**
 * Setting proxy to send all the requests that comes from wp site into this nodeapp to www.semrush.com   
 */
 const semrushProxy = (prefix) => {
    return createProxyMiddleware({
        target: `https://${prefix}.semrush.com`,
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
                    let params = getFormQueryString(req.body);
                    proxyReq.setHeader("content-type", "application/x-www-form-urlencoded");
                    writeBody(params);
                }
            }
        },
        onProxyRes: responseInterceptor(// Subscribe to http-proxy's proxyRes event.
            async (responseBuffer, proxyRes, req, res) => {// Ignore static file
                if (req.url.match(/\.(css|json|js|text|png|jpg|map|ico|svg)/)) return responseBuffer;
                // Log the activity
                // axios.post(`${process.env.ADMIN_DOMAIN}/logs/semrush`, {
                //     log: `${req.user.username} ${req.wpSite} ${req.headers['user-agent']} ${req.url} ${proxyRes.statusCode}`
                // }).then((data) => {
                //     console.log(data);
                // });
                if (proxyRes.headers['location']) {// Rewrite the location to the domain of nodeapp
                    let locale = "";
                    try {
                        let url = new URL(proxyRes.headers.location);
                        target = url.origin;
                        locale = url.hostname.split(".")[0];
                    } catch (err) {
                        target = `https://${prefix}.semrush.com`;
                    }
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
            referer: `https://${prefix}.semrush.com`,
            origin: `https://${prefix}.semrush.com`
        },
        autoRewrite: true,
        ws: true
    });
}

module.exports = semrushProxy;