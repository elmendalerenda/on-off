# Smart Plug Status Dashboard

A minimal, self-hosted web dashboard that shows the real-time on/off state of a smart plug managed by [Home Assistant](https://www.home-assistant.io/).

The page auto-refreshes every 10 seconds and displays a color-coded indicator (green = ON, red = OFF) along with how long ago the state last changed.

---

## How it works

```
Browser  ──►  Node/Express server  ──►  Home Assistant REST API
                  (port 8080)               /api/states/<entity_id>
```

The server acts as a thin proxy: it reads the entity state from Home Assistant and exposes it at `/api/status` so the frontend never needs to store or expose a HA token.

---

## Requirements

- Docker and Docker Compose
- A running Home Assistant instance with:
  - A long-lived access token
  - A switch/plug entity (e.g. `switch.enchufe_1`)

---

## Quick start

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd on-off
   ```

2. **Configure environment variables**

   Create a `.env` file (never commit this file):

   ```env
   HA_URL=http://homeserver:8123
   HA_ENTITY_ID=switch.enchufe_1
   HA_TOKEN=your_long_lived_access_token
   PLUG_NAME=My Smart Plug
   HOST_PORT=2000
   ```

   | Variable       | Default                           | Description                              |
   |----------------|-----------------------------------|------------------------------------------|
   | `HA_URL`       | `http://host.docker.internal:8123`| Base URL of your Home Assistant instance |
   | `HA_ENTITY_ID` | `switch.smart_plug`               | Entity ID of the plug in Home Assistant  |
   | `HA_TOKEN`     | *(empty)*                         | Long-lived access token (**required**)   |
   | `PLUG_NAME`    | `Smart Plug`                      | Display name shown on the dashboard      |
   | `HOST_PORT`    | `2000`                            | Port exposed on the host machine         |

   > **Note on `HA_URL`:** Home Assistant runs on the host machine, not inside the container. The compose file maps your hostname to the host gateway automatically (`extra_hosts`), so you can use `http://homeserver:8123` or `http://host.docker.internal:8123` as-is. Do **not** use `localhost` or `127.0.0.1` — those resolve to the container itself.

3. **Start the service**

   ```bash
   docker compose up -d
   ```

4. **Open the dashboard**

   Navigate to `http://localhost:2000` (or whatever `HOST_PORT` you chose).

---

## Generating a Home Assistant long-lived access token

1. In Home Assistant, go to your **Profile** (bottom-left avatar).
2. Scroll to **Long-Lived Access Tokens** and click **Create Token**.
3. Give it a name (e.g. `plug-dashboard`) and copy the token.
4. Paste it as `HA_TOKEN` in your `.env` file.

---

## Project structure

```
on-off/
├── Dockerfile            # Node 20 Alpine image
├── docker-compose.yml    # Service definition
└── server/
    ├── index.js          # Express server & HA proxy
    ├── package.json
    └── public/
        └── index.html    # Single-page dashboard (vanilla JS)
```

---

## API endpoints

| Method | Path          | Description                        |
|--------|---------------|------------------------------------|
| GET    | `/api/status` | Returns entity state from HA       |
| GET    | `/health`     | Health check (used by Docker)      |

### Example `/api/status` response

```json
{
  "state": "on",
  "name": "My Smart Plug",
  "last_changed": "2026-02-22T08:30:00.000Z",
  "entity_id": "switch.enchufe_1"
}
```

---

## Development (without Docker)

```bash
cd server
npm install
HA_URL=http://homeserver:8123 \
HA_TOKEN=your_token \
HA_ENTITY_ID=switch.enchufe_1 \
node index.js
```

The server listens on port `8080` by default.

---

## License

MIT
