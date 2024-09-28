// Main server function
function server(req) {
 //const url = new URL(req.url);
 //if (req.method === 'POST') {
 //  if (url.pathname === '/new') {
 //    return handleNew(req);
 //  } else if (url.pathname === '/existing') {
 //    return handleExisting(req);
 //  }
 //}

 return new Response('Hello from a bun server. Using Full Scrict enforcement from Cloudflare!');
}

export default {
 port: 443,
 fetch: server,
 tls: {
   cert: file("cert.pem"),
   key: file('key.pem'),
   ca: file("ca.pem"),
 },
};
