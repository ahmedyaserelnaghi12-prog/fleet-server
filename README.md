# Fleet Tracker

Live map of cranes and trailers. Drivers open /driver.html on their phone; the dispatcher opens / and sees everyone on a real map.

## Run locally (needs Node.js 18+)
    ADMIN_PASSWORD=yourpass DRIVER_CODE=yourcode node server.js
Open http://localhost:3000 (map) and http://localhost:3000/driver.html (driver).

## Make it work from phones
Phone GPS only works over HTTPS. Easiest options:
1. Deploy to Render.com / Railway / Fly.io (upload this folder, start command: `node server.js`, set ADMIN_PASSWORD and DRIVER_CODE). They give you an https:// link.
2. Or run locally and expose with a tunnel: `cloudflared tunnel --url http://localhost:3000`

## Settings
- ADMIN_PASSWORD: password for the map page (default admin123, change it).
- DRIVER_CODE: code drivers type once (default driver123, change it).
- Data is kept in data.json next to server.js.
