const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const LOCAL_FILE = path.join(__dirname, 'index.html');
const CONFIG_NAME = 'server.json';

function readConfigFile(file){
  try{
    if(!fs.existsSync(file)) return null;
    const raw=fs.readFileSync(file,'utf8').trim();
    if(!raw) return null;
    const data=JSON.parse(raw);
    const url=String((data && (data.url || data.serverUrl)) || '').trim();
    return /^https?:\/\//i.test(url) ? url : null;
  }catch(err){
    console.warn('[DJ Player] Invalid config '+file+': '+err.message);
    return null;
  }
}

// URL ng web server. Pipiliin sa order: env var → tabi ng .exe → userData → app folder.
function getServerUrl(){
  const env=String(process.env.DJ_PLAYER_URL||'').trim();
  if(/^https?:\/\//i.test(env)) return env;
  const candidates=[
    path.join(path.dirname(app.getPath('exe')),CONFIG_NAME),
    path.join(app.getPath('userData'),CONFIG_NAME),
    path.join(__dirname,CONFIG_NAME)
  ];
  for(const file of candidates){
    const url=readConfigFile(file);
    if(url) return url;
  }
  return null;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'DJ Music Player',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const serverUrl=getServerUrl();

  // Walang server → diretso sa lokal na index.html (dating behavior).
  if(!serverUrl){
    win.loadFile(LOCAL_FILE);
    console.log('[DJ Player] No server configured - loaded local UI.');
    return;
  }

  let loaded=false, fellBack=false, timer=null;

  const loadLocal=()=>{
    if(fellBack || loaded) return;
    fellBack=true;
    if(timer) clearTimeout(timer);
    console.log('[DJ Player] Server unreachable ('+serverUrl+') - loading local UI.');
    win.loadFile(LOCAL_FILE);
  };

  // Kung hindi mag-load ang server within 8s, gamitin ang local copy.
  timer=setTimeout(loadLocal,8000);

  win.webContents.once('did-finish-load',()=>{
    if(fellBack) return; // ito ay galing sa local fallback, hindi sa server
    loaded=true;
    if(timer) clearTimeout(timer);
    console.log('[DJ Player] Loaded UI from '+serverUrl);
  });

  win.webContents.on('did-fail-load',(event,errorCode,errorDescription,validatedURL,isMainFrame)=>{
    if(isMainFrame && !loaded) loadLocal();
  });

  win.loadURL(serverUrl);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
