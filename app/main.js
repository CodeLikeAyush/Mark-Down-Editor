const { app, BrowserWindow, dialog, Notification, ipcMain } = require('electron');
const fs = require('fs');
const { marked } = require('marked');
const path = require('path');


const windows = new Set();

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


// listen for 'open-local-file' call:
ipcMain.handle('open-local-file', async (event) => {

    const options = {
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

// listen for 'prompt-unsaved' call:
ipcMain.handle('prompt-unsaved', async (event) => {
    const options = {
        type: 'question',
        buttons: ['Cancel', 'Yes, please', 'No, thanks'],
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


// listen for 'save-markdown' call:
ipcMain.handle('save-markdown', async (event, content) => {

    const options = {
        title: 'Save Markdown',
        filters: [
            { name: 'Text Files', extensions: ['txt', 'docx'] },
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



// listen for 'new-window' call :
ipcMain.on('new-window', (event) => {
    createWindow();
})


// function for notification:
function showNotification(NOTIFICATION_TITLE, NOTIFICATION_BODY) {
    new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}