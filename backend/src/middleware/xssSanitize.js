/**
 * Custom XSS Sanitization Middleware
 * Recursively escapes HTML tags in req.body, req.query, and req.params strings.
 * Mutates objects in-place to avoid re-assigning req.query (fixing Express 5 compatibility).
 */
const escapeHTML = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;');
};

const sanitize = (obj) => {
  if (obj instanceof Object) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = escapeHTML(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  }
};

const xssSanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
};

module.exports = xssSanitizeMiddleware;
