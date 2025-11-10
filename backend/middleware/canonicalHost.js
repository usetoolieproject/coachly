// Force canonical host and https
// - Redirect www.usecoachly.com -> usecoachly.com
// - Redirect www.<sub>.usecoachly.com -> <sub>.usecoachly.com
// - Redirect http -> https (honors x-forwarded-proto)

export default function canonicalHost(req, res, next) {
  try {
    const hostHeader = String(req.headers['x-forwarded-host'] || req.headers.host || '');
    const proto = String(req.headers['x-forwarded-proto'] || req.protocol || '').toLowerCase();
    const hostname = hostHeader.split(':')[0].toLowerCase();

    const labels = hostname.split('.');
    let targetHost = hostname;

    if (labels[0] === 'www') {
      // Drop leading www
      labels.shift();
      targetHost = labels.join('.');
    }

    // If we changed the host or need to force https, do a 301
    const needHttps = proto === 'http';
    const hostChanged = targetHost !== hostname;
    if (hostChanged || needHttps) {
      const qp = req.originalUrl || req.url || '/';
      const location = `https://${targetHost}${qp}`;
      return res.redirect(301, location);
    }
    return next();
  } catch (e) {
    return next();
  }
}


