const { app, BrowserWindow, dialog, Notification, ipcMain, Menu } = require('electron');
const fs = require('fs');
const { marked } = require('marked');
const path = require('path');


const windows = new Set();

const isMac = process.platform === 'darwin'

//====================   Menu Template===========================
const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
        label: app.name,
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    }] : []),
    // { role: 'fileMenu' }
    {
        label: 'App',
        submenu: [
            isMac ? { label: 'Quit All', role: 'close' } : { label: 'Quit All', role: 'quit' }, {
                label: 'Quit Window', click: () => { BrowserWindow.getFocusedWindow().close(); }

            }
        ]
    },
    // { role: 'editMenu' }
    // {
    //     label: 'Edit',
    //     submenu: [
    //         { role: 'undo' },
    //         { role: 'redo' },
    //         { type: 'separator' },
    //         { role: 'cut' },
    //         { role: 'copy' },
    //         { role: 'paste' },
    //         ...(isMac ? [
    //             { role: 'pasteAndMatchStyle' },
    //             { role: 'delete' },
    //             { role: 'selectAll' },
    //             { type: 'separator' },
    //             {
    //                 label: 'Speech',
    //                 submenu: [
    //                     { role: 'startSpeaking' },
    //                     { role: 'stopSpeaking' }
    //                 ]
    //             }
    //         ] : [
    //             { role: 'delete' },
    //             { type: 'separator' },
    //             { role: 'selectAll' }
    //         ])
    //     ]
    // },
    // { role: 'viewMenu' }
    // {
    //     label: 'View',
    //     submenu: [
    //         { role: 'reload' },
    //         { role: 'forceReload' },
    //         { role: 'toggleDevTools' },
    //         { type: 'separator' },
    //         { role: 'resetZoom' },
    //         { role: 'zoomIn' },
    //         { role: 'zoomOut' },
    //         { type: 'separator' },
    //         { role: 'togglefullscreen' }
    //     ]
    // },
    // { role: 'windowMenu' }
    // {
    //     label: 'Window',
    //     submenu: [
    //         { role: 'minimize' },
    //         { role: 'zoom' },
    //         ...(isMac ? [
    //             { type: 'separator' },
    //             { role: 'front' },
    //             { type: 'separator' },
    //             { role: 'window' }
    //         ] : [
    //             { role: 'close' }
    //         ])
    //     ]
    // },
    {
        role: 'help',
        submenu: [
            {
                label: 'View Project On GitHub',
                click: async () => {
                    const { shell } = require('electron')
                    await shell.openExternal('https://github.com/CodeLikeAyush/Mark-Down-Editor')
                }
            },
            {
                label: 'My Portfolio',
                click: async () => {
                    const { shell } = require('electron')
                    await shell.openExternal('https://codelikeayush.github.io/Ayush-Portfolio/')
                }
            }
        ]
    },

]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
//=======================================================================



app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform === 'darwin') {
        return false;
    }
    app.quit();
});

app.on('activate', (event, hasVisibleWindows) => {
    if (!hasVisibleWindows) { createWindow(); }
});

const createWindow = () => {
    let x, y;

    const currentWindow = BrowserWindow.getFocusedWindow();

    if (currentWindow) {
        const [currentWindowX, currentWindowY] = currentWindow.getPosition();
        x = currentWindowX + 50;
        y = currentWindowY + 50;
    }

    let newWindow = new BrowserWindow({
        x, y, show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '/preload.js')
        }

    });

    newWindow.webContents.openDevTools();


    newWindow.loadURL(`file://${__dirname}/index.html`);

    newWindow.once('ready-to-show', () => {
        newWindow.show();
    });

    windows.add(newWindow);

    newWindow.on('closed', () => {
        windows.delete(newWindow);
        newWindow = null;
    });
    return newWindow;
};


// // listen for 'create-file' call:
// ipcMain.on('create-file', (event, fileName) => {
//     const webContents = event.sender
//     var createStream = fs.createWriteStream(fileName + ".txt");
//     createStream.end();
// })


// listen for 'mark-down-to-HTML' call:
ipcMain.handle('mark-down-to-HTML', async (event, markdownContent) => {

    const htmlText = await renderMarkdownToHtml(markdownContent);
    return htmlText

})

// function to convert mark-down into HTML:
const renderMarkdownToHtml = (markdown) => {

    return marked.parse(markdown)


};

// listen for 'prompt-unsaved' call:
ipcMain.handle('prompt-unsaved', async (event) => {
    const options = {
        type: 'question',
        buttons: ['Cancel', 'Yes, save', `No, don't save`],
        defaultId: 0,
        title: 'Unsaved Changes*',
        message: 'Save changes?',
        detail: 'Markdown you edited is not saved',
        // checkboxLabel: 'Remember my choice',
        // checkboxChecked: true,
    };

    const { response, checkboxChecked } = await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), options);
    console.log(response);
    return response

})

// listen for 'open-local-file' call:
ipcMain.handle('open-local-file', async (event) => {

    const options = {
        title: 'Open File',
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'Markdown Files', extensions: ['md', 'markdown'] }
        ]
    };

    const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), options);
    let fileContent = '';
    localFilePath = filePaths[0];
    console.log(localFilePath)
    if (canceled) { return ({ localFilePath, fileContent }) }

    if (filePaths) {
        fileContent = fs.readFileSync(localFilePath).toString();

    }
    console.log((fileContent))
    return { localFilePath, fileContent };

})


// listen for 'new-window' call :
ipcMain.on('new-window', (event) => {
    createWindow();
})


// listen for 'save-markdown' call:
ipcMain.handle('save-markdown', async (event, content) => {

    const options = {
        title: 'Save Markdown',
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'Markdown Files', extensions: ['md', 'markdown'] }
            // { name: 'All Files', extensions: ['*'] }
        ]
    };
    const { canceled, filePath } = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), options);
    if (!canceled) {
        fs.writeFile(filePath.toString(), content, function (err) {
            if (err) throw err;
            console.log('File is created successfully.');
            showNotification("Saved", `File saved to: ${filePath}`)

        });
    }

})



// function for notification:
function showNotification(NOTIFICATION_TITLE, NOTIFICATION_BODY) {
    new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}


