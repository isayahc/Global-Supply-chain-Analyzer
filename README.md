# Global Supply Chain Analyzer
[![Leveraging AI for Global Supply Chain Analysis](https://img.youtube.com/vi/mos-RCkmlgA/maxresdefault.jpg)](https://youtu.be/mos-RCkmlgA)

### Screenshots
<img width="1166" height="667" alt="image" src="https://github.com/user-attachments/assets/535183d8-5c59-4a37-8bfe-2e51580f89b7" />
<img width="1204" height="776" alt="image" src="https://github.com/user-attachments/assets/ff2f317a-59b3-4ebf-b246-bb637463ca5b" />
<img width="1171" height="722" alt="image" src="https://github.com/user-attachments/assets/9d230bc3-039b-48c2-a3d6-c17cc432c191" />

### Running Locally

#### Getting a Google Gemini Key

go to https://aistudio.google.com/ to get a Google Gemini API Key and place it in `server/.env`

#### Additional Google API Keys

go to https://console.cloud.google.com/

and make sure you have:
- Geocoding API
- Maps JavaScript API
- Places API (New)

all active
then add to

`MAPS_API_KEY` in `server/.env.example`

and
`VITE_MAPS_API_KEY` in `client/.env.example`

### Running in Docker

run 
```
docker-compose up --build
```
