'use strict';

var app = require('app');
var ipc = require('electron').ipcMain;
var BrowserWindow = require('electron').BrowserWindow;

var mainWindow = null;

ipc.on('devTools', function (event, arg) {
    mainWindow.openDevTools();
});

app.on('window-all-closed', function () {
    // force app termination on OSX when mainWindow has been closed
    //if (process.platform == 'darwin') {
        app.quit();
    //}
});

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    
    // mainWindow.openDevTools();
    
    mainWindow.loadURL('file://' + __dirname + '/../browser/index.html');
    mainWindow.webContents.on('did-finish-load', function () {
        // mainWindow.setTitle(app.getName());
        mainWindow.setTitle("GHSTS PoC");
    });
    mainWindow.show();
});