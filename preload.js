const { contextBridge, ipcRenderer, nativeImage, clipboard } = require('electron')
const fs = require('fs');
const sharp = require('sharp')

async function fromFile(path) {
  let type = await FileType.fromFile(path);
  return type.mime
}

contextBridge.exposeInMainWorld('api', {
  ipcSend: (event, arg) => ipcRenderer.send(event, arg),
  ipcHandle: (event, arg) => ipcRenderer.on(event, arg),
  writeToClipboard: (path) => sharp(path).resize(256).toBuffer().then(data => clipboard.writeImage(nativeImage.createFromBuffer(data))),
  listFolders: (path) => fs.readdirSync(path, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name),
  listFiles: (path) => fs.readdirSync(path),
  readFile: (path) => fs.readFileSync(path),
  removeFolder: (path) => fs.rmSync(path, { recursive: true, force: true })
})