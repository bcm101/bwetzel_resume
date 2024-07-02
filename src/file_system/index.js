import built_in_files from "./built_in_files";

export default class FileSystem {
    /*
    TODO:
    - connect to indexedDB
        - use guide: https://blog.logrocket.com/using-indexeddb-complete-guide/
    - build methods to access database, utilize promises to fullest extent
    - build error handling for when database is unable to connect due to
    - errors are handled HERE. nothing is needed for handling outside of this class

    */
    #database; // store the database object from indexedDB

    // types that can be stored in starterDB
    #TYPES = {
        FILE: 1,
        APP: 2,
        FOLDER: 3,
        BUILT_IN_FILE: 4,
        BUILT_IN_FOLDER: 5
    }

    // DB structure for when first initialized, and for when DB cannot be accessed/used
    #starterDB = [
        {path: [], data: [
            {name: "~", type:this.#TYPES.BUILT_IN_FOLDER}
        ]},
        {path: ['~'], data: [
            {name: "Projects", type: this.#TYPES.BUILT_IN_FOLDER},
            {name: "Apps", type: this.#TYPES.BUILT_IN_FOLDER},
            {name: "Academia", type: this.#TYPES.BUILT_IN_FOLDER},
            {name: "BMW_Resume.txt", type: this.#TYPES.BUILT_IN_FILE}
        ]},
        {path: ['~', 'Projects'], data: [
            {name: "resume_site.txt", type: this.#TYPES.BUILT_IN_FILE},
            {name: "VR_submarine.txt", type: this.#TYPES.BUILT_IN_FILE},
            {name: "map_of_crimes_in_Chicago.txt", type: this.#TYPES.BUILT_IN_FILE},
            {name: "discord_TTS_bot.txt", type: this.#TYPES.BUILT_IN_FILE}
        ]},
        {path: ['~', 'Apps'], data: [
            {name: "maze_maker.html", type: this.#TYPES.APP},
            {name: "word_search_maker.html", type: this.#TYPES.APP},
            {name: "word_randomizer.html", type: this.#TYPES.APP},
            {name: "README.md", type: this.#TYPES.BUILT_IN_FILE}
        ]},
        {path: ['~', 'Academia'], data: [
            {name: "thesis_info.txt", type: this.#TYPES.BUILT_IN_FILE},
            {name: "MLP_research.txt", type: this.#TYPES.BUILT_IN_FILE}
        ]},
    ];
    #currentPath = ['~'];

    constructor(onDoneLoading = (_db) => {}) {
        try{
            const openDB = this.#initializeDB();
        
            openDB.then(db => {
                console.log("opened database successfully");
                onDoneLoading(this);
            });

            openDB.catch((error) => {
                throw new Error(error);
            });
        }catch(error){
            console.error(error);
            this.#database = false;
        }
        

        
    }

    #flattenStarterDB() {
        const fileSystem = [];
        this.#starterDB.forEach((obj) => {
            const locationPath = obj.path;
            const getFolderContents = (path) => {
                const pathStr = path.join('/');
                for(let i = 0; i < this.#starterDB.length; i++){
                    if(this.#starterDB[i].path.join('/') === pathStr){
                        return this.#starterDB[i].data;
                    }
                }
            }
            obj.data.forEach((f) => {
                const path = [...locationPath, f.name];
                const builtIn = true;
                const file = (f.type === this.#TYPES.BUILT_IN_FILE) ? "[built in app/file]": false;
                const folder = (f.type === this.#TYPES.BUILT_IN_FOLDER) ? getFolderContents(path): false;

                fileSystem.push({path, builtIn, file, folder})
            });
        })
        return fileSystem;
    }

    #initializeDB() {

        return new Promise((resolve, reject)=>{

            const requestOpen = window.indexedDB.open('filesystem', 1);

            requestOpen.onerror = (event) => {
                reject('error opening database');
            };

            requestOpen.onsuccess = (event) => {
                this.#database = event.target.result;
                resolve(event.target.result);
            }

            requestOpen.onblocked = (event) => {
                reject('database blocked');
            }

            requestOpen.onupgradeneeded = (event) => {
                console.log("upgrade needed; updating/creating database");

                this.#database = event.target.result;

                this.#database.onerror = () => {
                    reject('Error loading database.');
                };

                const table = this.#database.createObjectStore('filesorfolders', { keyPath: 'path'});

                this.#addPathDB(this.#flattenStarterDB(), event.target.transaction)
                .catch(error => {console.error(error)})
                .then(e => {
                    if(e) console.log("successfully added all starter paths to database");
                })
            }

        })
    }

    #addPathDB(filesToAdd = [], txn = null) {
        return new Promise((resolve, reject) => {
            
            console.log("opening transaction");

            const transaction = txn ? txn: this.#database.transaction(['filesorfolders'], 'readwrite');
            const objectStore = transaction.objectStore('filesorfolders');

            const promises = Promise.all(filesToAdd.map(f => {
                return new Promise((resolve, reject) => {
                    if(((f.file && f.folder) || (!f.file && !f.folder)) && !f.builtIn){
                        reject(`error in transaction: ${f.path.join('/')} must be one of either a file or folder`);
                    }

                    const query = objectStore.add(f);

                    query.addEventListener('success', () => {
                        console.log("successfully added at ", f.path.join('/'));
                    });
                    query.addEventListener('complete', () => {
                        resolve(f);
                    });
                    query.addEventListener('error', () => {
                        reject(`error in transaction: adding ${f.path.join('/')}`);
                    });
                })
            })).catch(error => {
                reject(error);
            }).then(d => {
                if(d) resolve(d);
            })
        })
    }

    #viewObjByPathDB(path){
        return new Promise((resolve, reject) => {
            const txn = this.#database.transaction(['filesorfolders'], 'readonly');
            const store = txn.objectStore('filesorfolders');
            const request = store.get(path);

            request.addEventListener('error', (error) => reject(error));
            request.addEventListener('success', e => {
                if(e.target.result && e.target.result.file && e.target.result.builtIn){
                    resolve(built_in_files(path.join('/')));
                }else
                    resolve(e.target.result);
            });
        })
    }

    #deleteObjByPathDB(path, subPaths=false){
        return new Promise((resolve, reject) => {
            const txn = this.#database.transaction(['filesorfolders'], 'readwrite');
            const store = txn.objectStore('filesorfolders');

            if(!subPaths){
                const request = store.delete(path);
                request.addEventListener('error', (error) => reject(error));
                request.addEventListener('success', e => resolve(e.target.result));
            }else{

                const isSubPath = (currentPath) => {
                    for(let i = 0; i < path.length; i++){
                        if(currentPath[i] !== path[i]) return false;
                    }
                    return true;
                }

                const request = store.openCursor();
                request.addEventListener('error', error => reject(error));
                request.addEventListener('success', event => {
                    const cursor = event.target.result;
                    if(cursor){
                        if(isSubPath(cursor.value.path)){
                            const deleteRequest = store.delete(cursor.value.path);
                            deleteRequest.addEventListener('error', error => console.error(`failed to delete: ${cursor.value.path.join('/')}`));
                        }
                        cursor.continue();
                    }
                })

            }
        })
    }

    #addPathLocal(filesToAdd=[]){
        filesToAdd.forEach(f => {
            if(((f.file && f.folder) || (!f.file && !f.folder))){
                console.error(`error in transaction: ${f.path.join('/')} must be one of either a file or folder`)
            }

            const path = f.path;
            const pathStr = path.join('/');
            const name = path.pop();

            let addedSuccessfully = false;

            for(let i = 0; i < this.#starterDB.length; i++){
                if(this.#starterDB[i].path.join('/') === pathStr){
                    this.#starterDB[i].data.push({
                        name: name, 
                        type: (f.file) ? this.#TYPES.FILE: this.#TYPES.FOLDER,
                        data: f.file
                    })
                    addedSuccessfully = true;
                }
            }

            if(f.folder && addedSuccessfully){
                this.#starterDB.push({path: f.path, data: []});
            }

            return addedSuccessfully;            

        })
    }

    #viewObjByPathLocal(path){
        const locationPath = [...path];
        const name = locationPath.pop();

        const locationPathStr = locationPath.join('/');

        for(let i = 0; i < this.#starterDB.length; i++){
            const currentFolder = this.#starterDB[i];
            if(currentFolder.path.join('/') === locationPathStr){
                for(let j = 0; j < currentFolder.data.length; j++){
                    const currentFile = currentFolder.data[j];
                    if(currentFile.name === name) {
                        if(currentFile.type === this.#TYPES.BUILT_IN_FILE || currentFile.type === this.#TYPES.APP){
                            return built_in_files(path.join('/'));
                        }
                        
                        const file = {
                            path, 
                            file: (currentFile.data) ? currentFile.data: false,
                            folder: (currentFile.data) ? false: true
                        }

                        return file;
                    }
                }
            }
        }

        return null;

    }

    #deleteOBJByPathLocal(path, subPaths=true){
        const locationPath = [...path];
        const name = locationPath.pop();

        const locationPathStr = locationPath.join('/');
        const pathStr = path.join('/');

        let foundFolder = false;
        let foundFile = false;
        let isFolder = false;

        for(let i = 0; i < this.#starterDB.length; i++){
            const currentFolder = this.#starterDB[i];
            if(!foundFile && currentFolder.path.join('/') === locationPathStr){
                for(let j = 0; j < currentFolder.data.length; j++){
                    const currentFile = currentFolder.data[j];
                    if(currentFile.name === name) {
                        isFolder = currentFile.type === this.#TYPES.BUILT_IN_FOLDER || currentFile.type === this.#TYPES.FOLDER
                        this.#starterDB[i].data.splice(j,1);
                        foundFile = true;
                    }
                }
            }
            if(subPaths && !foundFolder && currentFolder.path.join('/') === pathStr){
                foundFolder = true;
                this.#starterDB.splice(i,1);
            }
            if(foundFile && foundFolder) return true;
        }
        return foundFile && (!isFolder || foundFolder);

    }

    getFile(path){
        return new Promise((resolve, reject) => {
            if(this.#database){ // if the database exists, 
                this.#viewObjByPathDB(path).catch(error => {
                    const f = this.#viewObjByPathLocal(path);
                    if(f && (f.file || f.length > 0)){
                        resolve(f);
                    }else{
                        reject(`Error: ${path.join('/')} is not a file`);
                    }
                }).then(f => {
                    if(f && (f.file || f.length > 0))
                        resolve(f);
                    else{
                        reject(`Error: ${path.join('/')} is not a file`);
                    }
                })
            }else{
                const f = this.#viewObjByPathLocal(path);
                if(f && (f.file || f.length > 0)){
                    resolve(f);
                }else{
                    reject(`Error: ${path.join('/')} is not a file`);
                }
            }
        });
    }

    getFolder(path){

        return new Promise((resolve, reject) => {
            if(this.#database){ // if the database exists, 
                this.#viewObjByPathDB(path).catch(error => {
                    const f = this.#viewObjByPathLocal(path);
                    if(f && f.folder){
                        resolve(f);
                    }else{
                        reject(`Error: ${path.join('/')} is not a folder`);
                    }
                }).then(f => {
                    if(f && f.folder)
                        resolve(f);
                    else{
                        reject(`Error: ${path.join('/')} is not a folder`);
                    }
                })
            }else{
                const f = this.#viewObjByPathLocal(path);
                if(f && f.folder){
                    resolve(f);
                }else{
                    reject(`Error: ${path.join('/')} is not a folder`);
                }
            }
        });
    }

    deleteFile(path){
        return new Promise((resolve, reject) => {
            if(this.#database){ // if the database exists, 
                this.#viewObjByPathDB(path).catch(error => {
                    const f = this.#viewObjByPathLocal(path);
                    if(f && f.file){
                        this.#deleteOBJByPathLocal(path);
                        resolve('Deleted locally');
                    }else{
                        reject(`Error: ${path.join('/')} is not a file`);
                    }
                }).then(f => {
                    if(f && f.file)
                        this.#deleteObjByPathDB(path, false).catch(error => {
                            reject('Error: could not delete file in DB');
                        }).then(f => {
                            resolve('Deleted in database');
                        })
                    else{
                        reject(`Error: ${path.join('/')} is not a file`);
                    }
                })
            }else{
                const f = this.#viewObjByPathLocal(path);
                if(f && f.file){
                    this.#deleteOBJByPathLocal(path);
                    resolve('Deleted locally');
                }else{
                    reject(`Error: ${path.join('/')} is not a file`);
                }
            }
        });
    }

    deleteFolder(path, recursive=false){
        return new Promise((resolve, reject) => {
            console.log(this.#database);
            if(this.#database){ // if the database exists, 
                this.#viewObjByPathDB(path).catch(error => {
                    const f = this.#viewObjByPathLocal(path);
                    if(f && f.folder){
                        if(f.folder.length === 0 || recursive){
                            this.#deleteOBJByPathLocal(path, true);
                            resolve('Deleted locally');
                        }else{
                            reject(`Error: folder at ${path.join('/')} is not empty; use -r to recursively delete`);
                        }
                    }else{
                        reject(`Error: ${path.join('/')} is not a folder`);
                    }
                }).then(f => {
                    if(f && f.folder)
                        if(f.folder === 0 || recursive){
                            this.#deleteObjByPathDB(path, recursive).catch(error => {
                                reject('Error: could not delete file in DB');
                            }).then(f => {
                                resolve('Deleted in database');
                            })
                        }else{
                            reject(`Error: folder at ${path.join('/')} is not empty; use -r to recursively delete`);
                        }
                    else{
                        reject(`Error: ${path.join('/')} is not a folder`);
                    }
                })
            }else{
                const f = this.#viewObjByPathLocal(path);
                if(f && f.folder){
                    this.#deleteOBJByPathLocal(path);
                    resolve('Deleted locally');
                }else{
                    reject(`Error: ${path.join('/')} is not a folder`);
                }
            }
        });
    }

    addFile(path, file){
        return new Promise((resolve, reject) => {
            if(this.#database){
                this.#addPathDB([{path, file, folder:false, builtIn: false}]).catch(error => {
                    if(this.#addPathLocal([{path, file, folder:false, builtIn: false}])) reject('Error: could not find path');
                    else resolve('added locally');
                }).then(e => {
                    if(e) resolve('successfully added');
                })
            }else{
                if(this.#addPathLocal([{path, file, folder:false, builtIn: false}])) reject('Error: could not find path');
                else resolve('added locally');
            }
        })
    }

    addFolder(path){
        return new Promise((resolve, reject) => {
            if(this.#database){
                this.#addPathDB([{path, file:false, folder:[], builtIn: false}]).catch(error => {
                    if(this.#addPathLocal([{path, file:false, folder:[], builtIn: false}])) reject('Error: could not find path');
                    else resolve('added locally');
                }).then(e => {
                    if(e) resolve('successfully added');
                })
            }else{
                if(this.#addPathLocal([{path, file:false, folder:[], builtIn: false}])) reject('Error: could not find path');
                else resolve('added locally');
            }
        })
    }

    changeLocation(path){
        return new Promise((resolve, reject) => {
            if(this.#database)
                this.#viewObjByPathDB(path).catch(error => {
                    reject('location not found');
                }).then(e => {
                    if(e && e.folder){
                        this.#currentPath = path;
                        resolve('moved to path');
                    }
                    else{
                        reject('not folder');
                    }
                })
            else{
                let f = this.#viewObjByPathLocal(path);
                if(f && f.folder) resolve('moved to path locally');
                else reject('not folder or not found');
            }
                
        })
        
    }

    getCurrentPath(){
        return this.#currentPath;
    }

}
