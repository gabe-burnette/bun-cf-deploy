# Bun Cloudflare VPS
This is how to setup a single bun server on any VPS with full Cloudflare Protection & Origin Server SSL/TLS. 
- This does not have nginx because it is only hosting one bun server, and it doesn't need a reverse proxy because Cloudflare proxy is enabled. 
- The host provider's firewall (default) or server firewall (fallback) should only accept Cloudflare IPs, forcing all traffic to go through Cloudflare.

> Note: This may become irrelevant, Cloudflare is always changing. Please take this with a grain of salt and do your own research. (1/17/25)

Also, if your using the bun server as an API, you can set the rate limit rules from Cloudflare's WAF (Security -> WAF -> Rate Limiting Rules), so that the API requests never hit your server. You can also use Cloudflare's Turnstile to verify that the request is legit.

# Manual Setup

## Install Bun (linux)
- Make sure unzip is installed
- Make sure you are cd'd on the directory you can bun to install in.
  ```
  sudo apt install unzip
  ```
  ```
  curl -fsSL https://bun.sh/install | bash
  ```

## Firewall Setup (host provider):
  - Enable HTTPS port (443) to ONLY ACCEPT Cloudflare ivp4 IPs only ([cloudflare.com/ivp4](https://www.cloudflare.com/ips-v4/#)).
  - Remove RDP (optional).
  - Disable / Remove ICMP (optional).
  - Set SSH access to your home IP. (or use cf tunnels in conjunction)
  - Beware of any other ports your provider may have opened.

## Firewall Setup (internal):
 - If your hosting provider HAS a firewall, this step is irrevelant, unless you think the firewall is unsecure, or you just want to be safe.
 - If your hosting provider doesn't have a firewall, you can use iptables to only accept Cloudflare Ips on port 443.
 - Depending on your hosting provider, you may have to configure other safety features such as fail2ban and UFW. As well as disabiling the password and only accepting SSH keys. However, this is uncommon as most hosting providers automatically do these steps for you nowadays, such as GCP.

## Cloudflare DNS Setup
  - Add domain to Cloudflare.
  - DNS -> Records: Set your A records to the domain/subdomain w/ the server IP with CLOUDFLARE PROXY ENABLED.
  - SSL/TLS -> Origin Server -> Create Certificate -> Generate private key -> Enter hostnames -> Create -> SAVE the cert to a text file and name it (cert.pem) and the private key to (key.pem)
  - SSL/TLS -> Origin Server -> Authenticated Origin Pulls -> Enabled
  - SSL/TLS -> Edge Certificates -> Always Use HTTPS -> Enabled (optional)
  - SSL/TLS -> Edge Certificates -> Minimum TLS Version -> TLS 1.1
  - SSL/TLS -> Overview -> SSL/TLS encryption -> Configure -> Full Strict
  - SSL/TLS -> Enable HSTS. (optional)

## Download Origin CA cert for Bun (RSA Only)
  - https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/ - Full Article
  - ([Download Link / Pem](https://developers.cloudflare.com/ssl/static/origin_ca_rsa_root.pem)) - save as (ca.pem)

## Cloudflare Certificate Detailed
- SSL/TLS -> Origin Server -> Create Certificate
![step 1](/images/1.PNG)
- Use RSA 2048. Enter in the hostnames / subdomains you want to use for the SSL cert. Create.
![step 2](/images/2.PNG)
- Copy the origin certificate and save it to a text file as (cert.pem) and the private key as (key.pem)
![step 3](/images/3.PNG)
- Download the cloudflare Origin CA RSA cert and save it as (ca.pem)
![step 4](/images/4.PNG)
- SSL/TLS -> Overview -> SSL/TLS encryption -> Configure -> Full Strict
![step 5](/images/5.PNG)

## Bun server - Example - (index.js)
 - The bun server uses port 443.
 - Create a folder for server.
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

## Systemd Setup (for automatic restarts)
>Find the full bun path. (replace $BUN in the service file with this later)
```
which bun
```
>Create the service file.
```
sudo nano /etc/systemd/system/bunserver.service
```
- You will need the working directory of your user /home/user. replace $DIR with this in the service file.
- You will also need the full path to the file of your bun server such as (/home/user/mybunserver/index.js). replace $PATH with this in the service file.
>Editing the service file.
```
[Unit]
Description=Bun Server
After=network.target

[Service]
ExecStart=$BUN $PATH
WorkingDirectory=$DIR
Restart=always
RestartSec=10
User=root
Group=root
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```
>Reload the systemd daemon:
```
sudo systemctl daemon-reload
```
>Start the service:
```
sudo systemctl start bunserver.service
```
>Enable the service to start on boot:
```
sudo systemctl enable bunserver.service
```
>Check the status:
```
sudo systemctl status bunserver.service
```

## Other
- You can use the SetInterval in a running Bun Server (--watch) and the Github API w/ your API key to check the current version of your repo (every 30s), and if the repo is updated, you can make a script which updates your bun server dynamically.
