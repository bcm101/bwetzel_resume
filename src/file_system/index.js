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
            {name: "Experience", type: this.#TYPES.BUILT_IN_FOLDER},
            {name: "Research", type: this.#TYPES.BUILT_IN_FOLDER},
            {name: "Skills", type: this.#TYPES.BUILT_IN_FOLDER},
            {name: "Projects", type: this.#TYPES.BUILT_IN_FOLDER},
            {name: "Awards", type: this.#TYPES.BUILT_IN_FOLDER},
            {name: "BMW_Resume.txt", type: this.#TYPES.BUILT_IN_FILE}
        ]},
        {path: ['~', 'Experience'], data: [
            {name: "front-end-web-developer", type: this.#TYPES.BUILT_IN_FILE},
            {name: "full-stack-developer", type: this.#TYPES.BUILT_IN_FILE},
            {name: "teaching-assistant", type: this.#TYPES.BUILT_IN_FILE}
        ]},
        {path: ['~', 'Research'], data: [
            {name: "image-classification", type: this.#TYPES.BUILT_IN_FILE},
            {name: "machine-learning-blockchain", type: this.#TYPES.BUILT_IN_FILE}
        ]},
        {path: ['~', 'Skills'], data: [
            {name: "languages", type: this.#TYPES.BUILT_IN_FILE},
            {name: "algorithms", type: this.#TYPES.BUILT_IN_FILE},
            {name: "data-visualization", type: this.#TYPES.BUILT_IN_FILE},
            {name: "object-oriented-programming", type: this.#TYPES.BUILT_IN_FILE}
        ]},
        {path: ['~', 'Awards'], data: [
            {name: "faculty-award(B.S.)", type: this.#TYPES.BUILT_IN_FILE},
            {name: "faculty-award(M.S.)", type: this.#TYPES.BUILT_IN_FILE}
        ]},
        {path: ['~', 'Projects'], data: [
            {name: "maze_maker.html", type: this.#TYPES.APP},
            {name: "word_search_maker.html", type: this.#TYPES.APP},
            {name: "daily_sudoku.html", type: this.#TYPES.APP},
            {name: "AWS-TTS-bot", type: this.#TYPES.BUILT_IN_FILE},
            {name: 'Resume-website', type: this.#TYPES.BUILT_IN_FILE}
        ]}
    ];
    #currentPath = ['~'];

    constructor(onDoneLoading = (_fs) => {}) {
        try{
            const openDB = this.#initializeDB();
        
            openDB.then(db => {
                console.log("opened database successfully");
                onDoneLoading(this);
                // this.#database = false;
            });

            openDB.catch((error) => {
                console.error(error);
                this.#database = false;
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

                this.#addPathDB(this.#flattenStarterDB(), event.target.transaction, true)
                .catch(error => {console.error(error)})
                .then(e => {
                    if(e) console.log("successfully added all starter paths to database");
                })
            }

        })
    }

    #addPathDB(filesToAdd = [], txn = null, addingBuiltIn=false) {
        return new Promise((resolve, reject) => {
            
            console.log("opening transaction");

            const transaction = txn ? txn: this.#database.transaction(['filesorfolders'], 'readwrite');
            const objectStore = transaction.objectStore('filesorfolders');

            const promises = Promise.all(filesToAdd.map(f => {
                return new Promise((resolve, reject) => {
                    if((((f.file || f.file==="") && f.folder) || (!(f.file || f.file==="") && !f.folder)) && !f.builtIn){
                        reject(`error in transaction: ${f.path.join('/')} must be one of either a file or folder`);
                    }

                    const query1 = objectStore.put(f);
                    
                    query1.addEventListener('success', () => {
                        console.log("successfully added at ", f.path.join('/'));
                        if(!addingBuiltIn){
                            const query2 = objectStore.get(f.path.slice(0,f.path.length-1));

                            query2.addEventListener('success', (e) => {
                                const result = e.target.result;
                                const doesAlreadyExist = () => {
                                    for(let i = 0; i < result.folder.length; i++)
                                        if(result.folder[i].name === f.path[f.path.length-1])
                                            return true;
                                    return false;
                                }
                                if(result && result.folder && !doesAlreadyExist()){
                                    result.folder = [...result.folder, {
                                        name: f.path[f.path.length-1], 
                                        type: f.file || f.file==="" ? this.#TYPES.FILE: this.#TYPES.FOLDER
                                    }];

                                    const query3 = objectStore.put(result);
        
                                    query3.addEventListener('success', (e) => {
                                        console.log(`parent folder updated`);
                                        resolve(e);
                                    });
                                    query3.addEventListener('error', () => {
                                        console.error(`could not update parent directory`);
                                        reject('could not update parent directory');
                                    });
        
                                }else reject('parent is not folder');
                            });

                            query2.addEventListener('error', () => {
                                console.error('could not retrieve parent folder');
                                reject('could not retrieve parent folder');
                            });
                        }else resolve('added built in');
                    });
                    query1.addEventListener('error', () => {
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
                const f = e.target.result
                if(f && (f.file || f.file === "" || (!f.file && !f.folder)) && f.builtIn){
                    resolve(built_in_files(path.join('/')));
                }else
                    resolve(f);
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

                const locationPath = [...path];
                const name = locationPath.pop();

                const gettingLocation = store.get(locationPath);

                gettingLocation.addEventListener('error', (error) => reject(error));
                gettingLocation.addEventListener('success', e => {

                    const locationFolder = e.target.result;

                    const newLocationFolder = {...locationFolder}
                    newLocationFolder.folder = newLocationFolder.folder.filter((f) => f.name !== name);

                    const updatingLocation = store.put(newLocationFolder);

                    updatingLocation.addEventListener('error', (error) => reject(error));
                    updatingLocation.addEventListener('success', e => resolve(e));
                });

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
                    }else{
                        const locationPath = [...path];
                        const name = locationPath.pop();

                        const gettingLocation = store.get(locationPath);

                        gettingLocation.addEventListener('error', (error) => reject(error));
                        gettingLocation.addEventListener('success', e => {

                            const locationFolder = e.target.result;

                            const newLocationFolder = {...locationFolder}
                            newLocationFolder.folder = newLocationFolder.folder.filter((f) => f.name !== name);

                            const updatingLocation = store.put(newLocationFolder);

                            updatingLocation.addEventListener('error', (error) => reject(error));
                            updatingLocation.addEventListener('success', e => resolve(e));
                        });
                    }
                })

            }
        })
    }

    #addPathLocal(filesToAdd=[]){
        filesToAdd.forEach(f => {
            if((((f.file || f.file==="") && f.folder) || (!(f.file || f.file==="") && !f.folder))){
                console.error(`error in transaction: ${f.path.join('/')} must be one of either a file or folder`)
            }

            const path = [...f.path];
            const name = path.pop();
            const locationStr = path.join('/');

            const alreadyExists = this.#pathExistsLocal(f.path);

            let addedSuccessfully = false;

            for(let i = 0; i < this.#starterDB.length; i++){
                if(this.#starterDB[i].path.join('/') === locationStr){

                    if(alreadyExists){
                        for(let j = 0; j < this.#starterDB[i].data.length; j++){
                            if(this.#starterDB[i].data[j].name === f.name)
                                this.#starterDB[i].data[j].data = f.file;
                        }
                    }else{
                        this.#starterDB[i].data.push({
                            name: name, 
                            type: (f.file || f.file==="") ? this.#TYPES.FILE: this.#TYPES.FOLDER,
                            data: f.file
                        })
                        addedSuccessfully = true;
                    }

                    
                }
            }

            if(f.folder && addedSuccessfully){
                this.#starterDB.push({path: f.path, data: []});
            }

            return addedSuccessfully || alreadyExists;            

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
                        
                        if(currentFile.data || currentFile.data === ""){
                            return {
                                path, 
                                file: currentFile.data,
                                folder: false
                            }
                        }else{
                            const pathStr = path.join('/');
                            for(let k = 0; k < this.#starterDB.length; k++){
                                if(this.#starterDB[k].path.join('/') === pathStr){
                                    return {
                                        path,
                                        file: false,
                                        folder: this.#starterDB[k].data
                                    }
                                }
                            }
                        }
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
                    if(f && (f.file || f.file==="" || f.length > 0 || typeof f === "function")){
                        resolve(f);
                    }else{
                        reject(`Error: ${path.join('/')} is not a file`);
                    }
                }).then(f => {
                    if(f && (f.file || f.file==="" || f.length > 0 || typeof f === "function"))
                        resolve(f);
                    else{
                        reject(`Error: ${path.join('/')} is not a file`);
                    }
                })
            }else if(this.#database === false){
                const f = this.#viewObjByPathLocal(path);
                if(f && (f.file || f.file==="" || f.length > 0 || typeof f === "function")){
                    resolve(f);
                }else{
                    reject(`Error: ${path.join('/')} is not a file`);
                }
            }else{
                window.setTimeout(async () => {
                    try{
                        const file = await this.getFile(path);
                        resolve(file);
                    }catch(e){
                        reject(e);
                    }
                }, 500)
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
                    if(f && (f.file || f.file==="" || f.length || typeof f === "function")){
                        this.#deleteOBJByPathLocal(path);
                        resolve('Deleted locally');
                    }else{
                        reject(`Error: ${path.join('/')} is not a file`);
                    }
                }).then(f => {
                    if(f && (f.file || f.file==="" || f.length || typeof f === "function"))
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
                if(f && (f.file || f.file==="" || f.length || typeof f === "function")){
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
                    if(f && f.folder){
                        if(f.folder.length === 0 || recursive){
                            this.#deleteObjByPathDB(path, recursive).catch(error => {
                                reject('Error: could not delete file in DB');
                            }).then(f => {
                                resolve('Deleted in database');
                            })
                        }else{
                            reject(`Error: folder at ${path.join('/')} is not empty; use -r to recursively delete`);
                        }
                    }else{
                        reject(`Error: ${path.join('/')} is not a folder`);
                    }
                })
            }else{
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
            }
        });
    }

    addFile(path, file){
        return new Promise((resolve, reject) => {
            if(this.#database){
                this.#addPathDB([{path, file, folder:false, builtIn: false}]).catch(error => {
                    if(this.#addPathLocal([{path, file, folder:false, builtIn: false}])){ 
                        reject('Error: could not find path');
                    }
                    else resolve('added locally');
                }).then(e => {
                    if(e) resolve('successfully added');
                    else reject('not added');
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
                    let f = this.#viewObjByPathLocal(path);
                    if(f && f.folder){
                        this.#currentPath = path;
                        resolve('moved to path locally');
                    }
                    else reject('not folder or not found');
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
                if(f && f.folder){
                    this.#currentPath = path;
                    resolve('moved to path locally');
                }
                else reject('not folder or not found');
            }
                
        })
        
    }

    getCurrentPath(){
        return this.#currentPath;
    }

    #pathExistsDB(path){
        return new Promise((resolve, reject) => {
            this.#viewObjByPathDB(path).catch(e => {
                reject(false);
                return null;
            }).then(e => {
                if(e) resolve(true);
                else resolve(false);
            })
        })
    }

    #pathExistsLocal(path){
        const f = this.#viewObjByPathLocal(path);
        if(f) return true;
        else return false;
    }

    pathExists(path){
        return new Promise( async (resolve, reject) => {
            const locallyExists = this.#pathExistsLocal(path);
            let errorRaised = false;
            let pathExistsDB = false;
            try{
                pathExistsDB = await this.#pathExistsDB(path);
            }catch(e){
                errorRaised = true;
                pathExistsDB = false;
            }

            if(!this.#database || errorRaised) resolve(locallyExists);
            else resolve(pathExistsDB);
        })
    }

    DELETE_DB(){

        return new Promise((resolve, reject) => {
            const DBDeleteRequest = window.indexedDB.deleteDatabase("filesystem");

            DBDeleteRequest.addEventListener("error", () => {
                console.error("Error deleting database.");
                reject("Error deleting database.");
            }) 
            
            DBDeleteRequest.addEventListener("success", () => {
                console.log("Database deleted successfully");
                resolve("Database deleted successfully");
            }) 

        });
        
    }

}
