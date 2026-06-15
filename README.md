# Hopper Exit Node
## What is Hopper?
Hopper is an open-source VPN Management solution.

Hopper Exit Node is an edge server, a server that routes the traffic of the clients.
## Deploy `hopper-node`
```
services:
  hopper:
    image: ghcr.io/arktd/hopper-node:latest
    container_name: hopper-node
    restart: unless-stopped
    network_mode: "host"
    environment:
      API_PORT: 8080
      NODE_TOKEN: <Management API token - Required>

  caddy:
    image: caddy:latest
    container_name: caddy
    restart: unless-stopped
    network_mode: "host"
    volumes:
      - caddy_data:/data
      - caddy_config:/config
      
    command: caddy reverse-proxy --from <YOUR DOMAIN>:8443 --to http://127.0.0.1:8080


volumes:
  caddy_data:
  caddy_config:
```
