const core = require('@actions/core');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path')

const makeSureFoldersAreCreated = filename => {
    const folders = filename.split(path.sep).slice(0, -1)
    if (folders.length) {
        folders.reduce((last, folder) => {
            const folderPath = last ? last + path.sep + folder : folder
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath)
                console.log(`created folder: ${folderPath}`);
            }
            return folderPath
        },'');
    }
}

try{
    const url = core.getInput('url');
    const file = core.getInput('file');

    console.log(`Fetch data started with`, `url: ${url}`, `file: ${file}`);
    if(!url){
        core.setFailed('url required');
    }
    fetch(url, {
        headers: {
            'content-type': 'application/json'
        },
    })
    .then(response => {
            if(response.ok){
                return response.json();
            } else {
                core.setFailed(`fetch to ${url} failed with status: ${response.status}`);
                return;
            }
        })
        .then(data => {
            makeSureFoldersAreCreated(file);

            fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8', function (err) {
                if (err) {
                    core.setFailed(err.message)
                    return console.log(err);
                }

                console.log(`successfully saved data from ${url} to ${file}`);
            }); 
        })
        .catch(error => core.setFailed(error.message));
}catch(error){
    core.setFailed(error.message);
}