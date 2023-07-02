document.getElementById('hide').addEventListener('click', () => {
    window.api.ipcSend('buttonClick', 'hide')
})

document.getElementById('close').addEventListener('click', () => {
    window.api.ipcSend('buttonClick', 'close')
})

document.getElementById('add').addEventListener('click', () => {
    window.api.ipcSend('python', document.getElementById('stickerid').value)
    document.getElementById('stickerid').value = ''
})

var foldersToDelete = [];
window.api.ipcHandle('packs', (_, folders) => {
    for (let folder of folders) {
        let basePath = 'packs/' + folder + '/'
        let images = window.api.listFiles(basePath).map(img => basePath + img)
        
        let contentDiv = document.getElementById(folder + '-content');
        
        if (contentDiv == null) {
            // for easy removal later
            contentDiv = Object.assign(document.createElement('div'), {id: folder + '-content'});
            document.getElementsByClassName('content')[0].appendChild(contentDiv)
        }

        // if a folder persists, dont delete it later
        if (foldersToDelete.includes(folder)) {
            foldersToDelete.splice(foldersToDelete.indexOf(folder), 1)
        } else {
            // if it's a new folder, add the relevent things to the ui

            // for easy removal later
            let div = Object.assign(document.createElement('div'), {id: folder})

            // sidebar image with link to anchor
            let a = Object.assign(document.createElement('a'), {href: '#' + folder + '-sidebar'})
            let img = Object.assign(document.createElement('img'), {
                src: images[0], 
                title: folder.toUpperCase()
            })
            
            img.addEventListener('contextmenu', () => {
                window.api.removeFolder(`packs/${folder}`)
            })

            a.appendChild(img)

            div.appendChild(a)

            document.getElementsByClassName('sidebar')[0].appendChild(div)

            // title of pack in content panel
            let a2 = Object.assign(document.createElement('a'), {
                id: folder + '-sidebar',
                text: folder.toUpperCase()
            })
        
            contentDiv.appendChild(a2);
        }
    
        // remove images that were deleted
        let content = document.getElementById(folder + '-content')
        if (content) {
            Array.from(content.getElementsByTagName('img')).filter(img => !images.includes(img.id)).forEach(img => {
                img.remove()
            })
        }
        
        // images in content panel
        for (let image of images) {
            if (!document.getElementById(image)) {
                let img = Object.assign(document.createElement('img'), {
                    src: image,
                    id: image
                })
        
                img.addEventListener('click', () => {
                    window.api.writeToClipboard(image)
                })
        
                contentDiv.appendChild(img);
            }
        }
    }

    // nuke the deleted folders
    for (let folder of foldersToDelete) {
        document.getElementById(folder).remove()
        document.getElementById(folder + '-content').remove()
    }

    // assume all folders may be gone next time
    foldersToDelete = [...folders]
})