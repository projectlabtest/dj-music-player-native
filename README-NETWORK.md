# Network setup (native app + web UI + shared music)

Ang `.exe` ay nasa bawat device, pero ang interface **at music library** ay mula sa web server.
Kung hindi maabot ang server, awtomatikong babalik ang app sa lokal na `index.html`.

## 1. I-host ang web UI + music sa server

I-extract ang `DJ Player Web Server.zip` (hal. `C:\DJ Player Web Server`) at i-run ang:

```powershell
& "C:\DJ Player Web Server\install-service.ps1"
```

Gagawin nitong background task ang server (auto-start sa boot, hidden, auto-restart).
Laman ng folder:

- `index.html` — UI ng player
- `server.ps1` + `server.js` — HTTP server (may `/api/tracks` at range support)
- `music\` — **dito ilalagay ang mga audio files**
- `start-server.bat` — manual run (para sa testing)
- `install-service.ps1` — i-install ang background task

Endpoint:

```
http://<server-ip>:8000/            -> UI
http://<server-ip>:8000/api/tracks  -> list ng music
http://<server-ip>:8000/music/...   -> audio streaming (may seek support)
```

## 2. Sabihin sa app ang server URL

Gawan ng **`server.json`** sa tabi mismo ng `DJ Music Player.exe`:

```json
{
  "url": "http://192.168.50.80:8000/"
}
```

Pwede ring gamitin ang env var na `DJ_PLAYER_URL` (pinaka-unang sinusuri),
o ilagay ang `server.json` sa `%APPDATA%\DJ Music Player\`.

## 3. Magdagdag ng music

Kopyahin ang `.mp3`, `.wav`, `.ogg`, `.flac`, `.m4a`, `.aac`, `.webm`, o `.opus` files sa:

```
C:\DJ Player Web Server\music\
```

**I-reload lang ang app** (o i-refresh ang browser) — awtomatikong lalabas ang mga tracks sa Library.
Hindi na kailangang mag-load ng file sa bawat device.

## Importanteng tandaan

- **Sa device pa rin lumalabas ang tunog**, kahit nasa server ang music.
- Ang mga server tracks ay **may × delete button** sa app; ide-delete nito ang file mismo sa server (LAN-only endpoint) at mawawala sa lahat ng device.
- Ang **programs at pad assignments** ay nasa IndexedDB pa rin ng bawat device — hindi pa shared.
  Pero ang **track IDs ay pangalan ng file**, kaya stable kahit mag-restart ang server.
- Local file loading (Load Files / Load Folder) ay available pa rin at idinadagdag sa list.
- Para mag-update ng itsura, i-update lang ang `index.html` sa server; lahat ng device kukuha ng bago.
