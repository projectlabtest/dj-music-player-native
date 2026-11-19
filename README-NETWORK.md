# Network setup (native app + web UI)

Ang `.exe` ay nasa bawat device, pero ang interface ay mula sa web server.
Kung hindi maabot ang server, awtomatikong babalik ang app sa lokal na `index.html`.

## 1. I-host ang web UI sa server

Kopyahin ang `index.html` (mula sa `dj-music-player/` o `dj-native/`) sa folder na
iha-host, tapos simulan ang isang web server. Halimbawa:

```
cd C:\path\to\web
python -m http.server 8000
```

Pwede rin ang IIS/nginx/Apache. Ang URL ay magiging:

```
http://<server-ip>:8000/
```

Siguraduhin na bukas ang port 8000 sa Windows Firewall ng server.

## 2. Sabihin sa app ang server URL

Gawan ng file na **`server.json`** sa tabi mismo ng `DJ Music Player.exe`:

```json
{
  "url": "http://192.168.1.10:8000/"
}
```

Pwede ring gamitin ang env var na `DJ_PLAYER_URL` (pinaka-unang sinusuri),
o ilagay ang `server.json` sa `%APPDATA%\DJ Music Player\`.

## 3. Restart ang app

- Kung available ang server → lalabas ang UI mula sa server.
- Kung down/offline ang server → lalabas ang lokal na UI (walang error dialog).

## Importanteng tandaan

- **Sa device pa rin lumalabas ang tunog**, kahit saan nanggaling ang UI.
- Ang **music files** ay lokal pa rin bawat device (Load Files / Load Folder).
- Ang **programs at pad assignments** ay nasa IndexedDB ng browser/profile ng bawat
  device — hindi pa shared sa server.
- Para mag-update ng itsura, i-update lang ang `index.html` sa server; lahat ng
  device kukuha ng bago sa susunod na bukas.
