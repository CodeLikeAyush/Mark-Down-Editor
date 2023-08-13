const { contextBridge, ipcRenderer, ipcMain } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    // node: () => process.versions.node,
    // chrome: () => process.versions.chrome,
    // electron: () => process.versions.electron,
    // createFile: (fileName) => ipcRenderer.send('create-file', fileName),
    newWindow: () => { ipcRenderer.send('new-window') },
    markdownToHTML: (markdownContent) => ipcRenderer.invoke('mark-down-to-HTML', markdownContent),
    openLocalFile: () => ipcRenderer.invoke('open-local-file'),
    saveMarkdown: (content) => ipcRenderer.invoke('save-markdown', content),
    promptUnsaved: () => ipcRenderer.invoke('prompt-unsaved'),
    // we can also expose variables, not just functions
})