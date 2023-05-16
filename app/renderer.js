

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newWindowButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');


let filePath = null;
let originalContent = '';


// handling mark-down to HTML conversion:
markdownView.addEventListener('keyup', async (event) => {
    const currentContent = event.target.value;
    const htmlText = await window.electronAPI.markdownToHTML(currentContent);
    htmlView.innerHTML = htmlText;
    // console.log(htmlText)
});

// open-file click handler:
openFileButton.addEventListener('click', async (event) => {
    let content = document.querySelector('#markdown').value;
    if (content) {
        const userChoice = await window.electronAPI.promptUnsaved();
        // console.log(userChoice)
        if (userChoice == 0) {// canceled
            return;
        }
        else if (userChoice == 1) {// save
            window.electronAPI.saveMarkdown(document.querySelector('#markdown').value);

        }
        else if (userChoice == 2) {// don't save
            openLocalFile()
        }

    }
    else {
        openLocalFile()
    }

})

const openLocalFile = async () => {

    try {
        let { localFilePath, fileContent } = await window.electronAPI.openLocalFile();

        if (localFilePath) {
            filePath = localFilePath;
            originalContent = fileContent;

            // console.log(fileContent)
            document.querySelector('#markdown').value = fileContent;
            const htmlText = await window.electronAPI.markdownToHTML(fileContent);
            htmlView.innerHTML = htmlText;
            // console.log(localFilePath, fileContent)
        }
    } catch (error) {
        // console.log(error);
    }
}

// new-window click handler:
newWindowButton.addEventListener('click', async () => {
    window.electronAPI.newWindow();
});

// window.electronAPI.createnewWindow('delt')

saveMarkdownButton.addEventListener('click', () => {
    window.electronAPI.saveMarkdown(document.querySelector('#markdown').value);
})