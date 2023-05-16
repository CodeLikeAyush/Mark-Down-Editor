

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
        const userResponse = await window.electronAPI.promptUnsaved();
        console.log(userResponse)
        if (userResponse == 0) {
            return;
        }
        else if (userResponse == 1) {
            window.electronAPI.saveMarkdown(document.querySelector('#markdown').value);

        }
        else if (userResponse == 2) {

            openLocalFile()
        }

    }
    else {
        // console.log("inside if")
        openLocalFile()
    }

})

const openLocalFile = async () => {
    let localFileContent;
    try {
        let { localFilePath, fileContent } = await window.electronAPI.openLocalFile();

        if (localFilePath) {
            filePath = localFilePath;
            originalContent = fileContent;

            markdownView.innerText = fileContent;
            // console.log(fileContent)
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
    // console.log(a)
})