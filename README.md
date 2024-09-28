# Quick Bun Cloudflare VPS
This is a tutorial on how to setup a bun server on any VPS with full Cloudflare Protection / Origin Server. This does not have nginx because it is only hosting one bun server, and it doesn't need a reverse proxy because Cloudflare proxy is enabled. The host provider's firewall (default) or server firewall (fallback) only accepts Cloudflare IPs, forcing all traffic to go through Cloudflare, preventing possible DDoS attacks through port 443 if your server's IP was leaked. Script comming soon.

# Manual Setup

## Install Bun (linux)
- Make sure unzip is installed
  ```
  sudo apt install unzip
  ```
  ```
  curl -fsSL https://bun.sh/install | bash
  ```


## Firewall Setup (host provider):
  - Enable HTTPS port (443) to ONLY ACCEPT Cloudflare ivp4 IPs only ([cloudflare.com/ivp4](https://www.cloudflare.com/ips-v4/#)).
  - Remove RDP.
  - Disable / Remove ICMP (optional).
  - Set SSH access to your home IP. (or use cf tunnels in conjunction)
  - Beware of any other ports your provider may have opened.

## Firewall Setup (internal):
 - If your hosting provider doesn't have a firewall, you can use iptables to only accept Cloudflare Ips on port 443.
 - Beware, if your hosting provider doesn't have a firewall, make sure to configure your other ports.
 - Depending on your hosting provider, you may have to configure other safety features such as fail2ban and UFW. As well as disabiling the password and only accepting SSH keys. However, this is uncommon as most hosting providers automatically do these steps for you nowadays, such as GCP.

## Cloudflare DNS Setup
  - Add domain to Cloudflare.
  - DNS -> Records: Set your A records to the domain/subdomain w/ the server IP with CLOUDFLARE PROXY ENABLED.
  - SSL/TLS -> Origin Server -> Create Certificate -> Generate private key -> Enter hostnames -> Create -> SAVE the cert to a text file and name it (cert.pem) and the private key to (key.pem)
  - SSL/TLS -> Origin Server -> Authenticated Origin Pulls -> Enabled
  - SSL/TLS -> Edge Certificates -> Always Use HTTPS -> Enabled (optional)
  - SSL/TLS -> Edge Certificates -> Minimum TLS Version -> TLS 1.1
  - SSL/TLS -> Overview -> SSL/TLS encryption -> Configure -> Strict (SSL-Only Origin Pull)
  - SSL/TLS -> Enable HSTS. (optional)

## Download Origin CA cert for Bun (RSA Only)
  - https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/ - Full Article
  - ([Download Link / Pem](https://developers.cloudflare.com/ssl/static/origin_ca_rsa_root.pem)) - save as (ca.pem)

## Bun server - Example - (index.js)
 - Put the cert.pem, key.pem, ca.pem at the ROOT of your bun server.
 ```
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
```

## System.md Setup

## Other
