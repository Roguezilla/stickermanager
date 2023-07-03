const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, Notification } = require('electron')
const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')
const { spawn } = require('node:child_process');

var win = null;
var tray = null;

const createWindow = () => {
    var window = new BrowserWindow({
		icon: 'icon.ico',
		width: 750,
		height: 480,
		titleBarStyle: 'hidden',
		title: 'Sticker Manager',
		backgroundColor: '#293241',
		resizable: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
		}
	})
  
	window.loadFile('index.html')

	return window
}

app.whenReady().then(() => {
	win = createWindow()

	win.webContents.on('did-finish-load', () => {
		win.webContents.send('packs', fs.readdirSync('packs', { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name))
	})
	  
	globalShortcut.register('Alt+X', () => {
		win.show()
		tray.destroy()
	})	
})

ipcMain.on('buttonClick', (event, name) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    if (name == 'hide') {
		win.hide()
		tray = createTray()
	} else if (name == 'close') {
		app.quit()
	}
})

ipcMain.on('python', (_, id) => {
    let py = spawn('python', ['linedl.py', `https://store.line.me/stickershop/product/${id}/ja`])
	py.on('close', () => {
		new Notification({
			title: 'Sticker Manager',
			body: `Sticker pack added.`,
			silent: true
		}).show()
	})
})

chokidar.watch('packs', {persistent: true, awaitWriteFinish: {stabilityThreshold: 500, pollInterval: 100}}).on('all', (event, path) => {
	win.webContents.send('packs', fs.readdirSync('packs', { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name))
});
/*
app.on('window-all-closed', (e) => {
	e.preventDefault()
  	e.returnValue = false
})
*/

const createTray = () => {
    let appIcon = new Tray(path.join(__dirname, "icon.ico"));

    appIcon.on('double-click', function (event) {
        win.show()
		tray.destroy()
    });
    appIcon.setToolTip('Sticker Manager');
    appIcon.setContextMenu(Menu.buildFromTemplate([
        {
            label: 'Show', click: function () {
                win.show()
            }
        },
        {
            label: 'Exit', click: function () {
				tray.destroy()
                app.quit()
            }
        }
    ]));
    return appIcon;
}