
import getFS from "../../filesystem";

export default class Commands {

    #FS = getFS();

    async #getOptions(args){
        let options = [];
        let paths = [];

        for(let i = 1; i < args.length; i++){
            if(args[i][0] === '-')
                for(let j = 1; j < args[i].length; j++)
                    options.push(args[i][j]);
            else{
                paths.push(args[i]);
            }
        }

        if(paths.includes('*')){
            const currentPath = this.#FS.getCurrentPath();
            paths.splice(paths.indexOf('*'), 1);
            const allPaths = await this.#FS.getFolder(currentPath);
            paths = [...paths, ...allPaths.folder.map(f => f.name)];
        }

        return {options, paths};
    }

    #parsePath(pathStr){
        const currentPath = this.#FS.getCurrentPath();

        const appendPath = pathStr
            .split('/')
            .filter(d => d !== '')

        const pathOfFile = [...currentPath, ...appendPath];

        for(let j = pathOfFile.length -1; j >= 0; j--)
            if(pathOfFile[j] === '..')
                pathOfFile.splice(j-1, 2);

        return pathOfFile;
    }

    #isAbsolutePath (path){
        return path[0] === '/';
    }

    async #findAllContained(path, recursive = true, total=[]){
        try{
            const allContentsAtPath = (await this.#FS.getFolder(path)).folder;
            allContentsAtPath
                .map(f => [...path, f.name])
                .forEach(p => total.push(p));
                
            for(let i = 0; i < allContentsAtPath.length; i++){
                const f = allContentsAtPath[i];
                if((f.type === 5 || f.type === 3) && recursive)
                    await this.#findAllContained([...path, f.name], true, total);
            }

        }
        catch(e){
            return null;
        }

        return total;
    }

    async ls(args, piped = null){

        if(!args) return [
            {line: "ls [OPTIONS] [PATHS TO DIRECTORIES]", className: 'folder', remove_spaces: true},
            {line: "displays the contents of all listed directories", className: 'opened-file', remove_spaces: true},
            {line: "   options:", className: 'opened-file', remove_spaces: false},
            {line: "      [-R]: recursively search through to find all subdirectories", className: 'opened-file', remove_spaces: false},
        ]

        let {options, paths} = await this.#getOptions(args);
        
        const recursivelyListAll = options.includes('R');
        const noSpecifiedDirectories = !paths.length;

        if(noSpecifiedDirectories) paths=[this.#FS.getCurrentPath()];

        let allPaths = [];

        if(recursivelyListAll)
            for(let i = 0; i < paths.length; i++){
                let pathF;
                if(noSpecifiedDirectories){
                    pathF = this.#FS.getCurrentPath();
                }else
                    pathF = this.#isAbsolutePath(paths[i]) ? paths[0].slice(1).split('/'): this.#parsePath(paths[i]);
                const allSubPaths = await this.#findAllContained(pathF, recursivelyListAll);
                allPaths = [...allPaths, pathF, ...allSubPaths];
            }
        else if(noSpecifiedDirectories) allPaths = paths;
        else allPaths = paths.map(p => this.#isAbsolutePath(p) ? paths[0].slice(1).split('/'): this.#parsePath(p));

        let output = [];
        
        for(let i = 0; i < allPaths.length; i++){
            try{
                const content = (await this.#FS.getFolder(allPaths[i])).folder;
                output = [
                    ...output, 
                    {line: `${allPaths[i].join('/')}: `, className: 'folder', remove_spaces: false, runCommand: `cd /${allPaths[i].join('/')} && ls`},
                    ...(content.map(f => {
                        const isFolder = f.type === 3 || f.type === 5;
                        const pathToF = [...allPaths[i], f.name];
                        const command = `${isFolder ? 'cd': 'cat'} /${pathToF.join('/')}${isFolder ? ' && ls': ''}`;
                        return {line: 
                            `   ${f.name}`, 
                            className: isFolder ? 'folder': 'file', 
                            remove_spaces: false, 
                            runCommand: command
                        }
                    })),
                    {line: " ", className: '', remove_spaces: false}
                ];
                
            }catch(e){
                continue;
            }
        }

        return output;
    }

    async pwd(args, piped = null){

        if(!args) return [
            {line: "pwd", className: 'folder', remove_spaces: true},
            {line: "displays the current working directory", className: 'opened-file', remove_spaces: true},
        ]

        return [{line: this.#FS.getCurrentPath().join('/'), className: 'folder', remove_spaces: false}];
    }
    
    async cd(args){

        if(!args) return [
            {line: "cd [PATH TO DIRECTORY]", className: 'folder', remove_spaces: true},
            {line: "changes the working directory to the path given", className: 'opened-file', remove_spaces: true}
        ]

        const {_opt, paths} = await this.#getOptions(args);

        const path = this.#isAbsolutePath(paths[0]) ? paths[0].slice(1).split('/'): this.#parsePath(paths[0]);

        try{
            await this.#FS.changeLocation(path);
            return [{line: " ", className: 'folder', remove_spaces: false}];
        }catch(e){
            return [{line: "Error in syntax or not a directory", className: 'command-output-error', remove_spaces: false}];
        }
    }

    async mkdir(args){

        if(!args) return [
            {line: "mkdir [OPTIONS] [PATHS TO DIRECTORIES]", className: 'folder', remove_spaces: true},
            {line: "creates a directory at the given paths", className: 'opened-file', remove_spaces: true},
            {line: "   options:", className: 'opened-file', remove_spaces: false},
            {line: "      [-v]: shows a message for every directory created", className: 'opened-file', remove_spaces: false},
            {line: "      [-p]: creates a parent directory, as needed", className: 'opened-file', remove_spaces: false}
        ]

        const {options, paths} = await this.#getOptions(args);

        const verbose = options.includes('v');
        const createParent = options.includes('p');

        const output = [];

        for(let i = 0; i < paths.length; i++){
            const pathArr = this.#isAbsolutePath(paths[i]) ? paths[0].slice(1).split('/'): this.#parsePath(paths[i]);
            const pathAlreadyExists = await this.#FS.pathExists(pathArr);

            if(pathAlreadyExists) return [{line: `cannot create folder ${pathArr.join('/')}`, className: 'command-output-error', remove_spaces: true}];

            for(let j = 1; j < pathArr.length; j++){
                const parentFolder = pathArr.slice(0, j);
                try{
                    await this.#FS.getFolder(parentFolder);
                }catch(e){
                    if(createParent){
                        try{
                            await this.#FS.addFolder(parentFolder);
                            if(verbose) 
                                output.push({line: `created folder ${parentFolder.join('/')}`, className: 'folder', remove_spaces: true});
                        }catch(e){
                            return [{line: `cannot create parent folder ${parentFolder.join('/')}`, className: 'command-output-error', remove_spaces: true}];
                        }
                    }else{
                        return [{line: `cannot create parent folder ${parentFolder.join('/')}; try using [-p]`, className: 'command-output-error', remove_spaces: true}];
                    }
                }
            } //only gets here if all exists/was created with no errors
            try{
                await this.#FS.addFolder(pathArr);
                if(verbose)
                    output.push({line: `created folder ${pathArr.join('/')}`, className: 'folder', remove_spaces: true});
            }catch(e){
                return [{line: `cannot create folder ${pathArr.join('/')}`, className: 'command-output-error', remove_spaces: true}];
            }
            
        }

        if(!verbose) return [{line: " ", remove_spaces: false, className: ' '}];

        return output;
    }

    async mv(args){

    }

    async cp(args){

    }

    async rm(args){
        if(!args) return [
            {line: "rm [OPTIONS] [NAMES]", className: 'folder', remove_spaces: true},
            {line: "removes a directory or file", className: 'opened-file', remove_spaces: true},
            {line: "   options:", className: 'opened-file', remove_spaces: false},
            {line: "      [-d]: remove a directory", className: 'opened-file', remove_spaces: false},
            {line: "      [-r]: recursively remove a directory and all its contents", className: 'opened-file', remove_spaces: false}
        ]

        let {options, paths} = await this.#getOptions(args);

        const directory = options.includes('r') || options.includes('d');
        const recursive = options.includes('r');

        for(let i = 0; i < paths.length; i++){
            const path = this.#isAbsolutePath(paths[i]) ? paths[0].slice(1).split('/'): this.#parsePath(paths[i]);
            const pathExists = await this.#FS.pathExists(path);

            if(!pathExists) return [{line: `${path.join('/')} does not exist`, remove_spaces: true, className: 'command-output-error'}];
            
            let isFolder;
            try{
                await this.#FS.getFolder(path);
                if(!directory) return [{line: `${path.join('/')} is a directory; try using -d`, remove_spaces: true, className: 'command-output-error'}];
                isFolder = true;
            }catch(e){
                isFolder = false;
            }

            try{
                if(isFolder){
                    await this.#FS.deleteFolder(path, recursive)
                }else{
                    await this.#FS.deleteFile(path);
                }
            }catch(e){
                return [{line: `${e}`, className: 'command-output-error', remove_spaces: true}];
            }

        }

        return [];
    }

    async touch(args){
        if(!args) return [
            {line: "touch [PATHS TO FILES]", className: 'folder', remove_spaces: true},
            {line: "creates a directory at the given paths", className: 'opened-file', remove_spaces: true}
        ]

        const {_, paths} = await this.#getOptions(args);

        for(let i = 0; i < paths.length; i++){
            const path = this.#isAbsolutePath(paths[i]) ? paths[0].slice(1).split('/'): this.#parsePath(paths[i]);
            const locationPath = path.slice(0, path.length-1);
            const pathAlreadyExists = await this.#FS.pathExists(path);

            if(pathAlreadyExists) return [{line: "error: cannot create file at path specified", className: "command-output-error", remove_spaces:true}];

            try{
                await this.#FS.getFolder(locationPath);
                await this.#FS.addFile(path, "");
            }catch(e){
                return [{line: "error: cannot create file at path specified", className: "command-output-error", remove_spaces:true}];
            }
        }

        return [];

    }

    async clear(args){

    }
    
    async cat(args, piped){

        if(!args) return [
            {line: "cat [OPTIONS] [PATHS TO FILES]", className: 'folder', remove_spaces: true},
            {line: "Returns the contents of a particular file or set of files", className: 'opened-file', remove_spaces: true},
            {line: "   options:", className: 'opened-file', remove_spaces: false},
            {line: "      [-n]: display line numbers for each line", className: 'opened-file', remove_spaces: false},
            {line: "      [-s]: do not return empty lines", className: 'opened-file', remove_spaces: false},
            {line: "      [-b]: omit empty lines from having numbers with -n", className: 'opened-file', remove_spaces: false},
        ]

        let {options, paths} = await this.#getOptions(args);

        const displayLineNumber = options.includes('n');
        const suppressEmptyLines = options.includes('s');
        const omitLineNumbersFromEmpty = options.includes('b');
        const multipleFilesOpening = paths.length > 1;

        let totalOutput = [];

        if(piped){

            if(displayLineNumber) piped = piped.map((li, i) => {
                const ret = {...li};
                if(omitLineNumbersFromEmpty && ret.line.trim().length === 0) return ret;
                ret.line = `${i+1}. ${ret.line}`;

                return ret;
            });

            if(suppressEmptyLines) piped = piped.filter(li => li.line.trim().length > 0);

            return piped;
        }

        for(let i = 0; i < paths.length; i++){
            const pathOfFile = this.#isAbsolutePath(paths[i]) ? paths[0].slice(1).split('/'): this.#parsePath(paths[i]);

            let output;
            try{
                
                output = await this.#FS.getFile(pathOfFile);

                if(output.length) output = [...output];
                else if(output.file || output.file === "") output = output.file.split('\n').map(line => {return {line, className: 'opened-file', remove_spaces: false}});
                else if(typeof output === "function") output = output();

                if(displayLineNumber) output = output.map((li, i) => {
                    const ret = {...li};
                    if(omitLineNumbersFromEmpty && ret.line.trim().length === 0) return ret;
                    ret.line = `${i+1}. ${ret.line}`;

                    return ret;
                })

                if(suppressEmptyLines) output = output.filter(li => li.line.trim().length > 0);

                if(multipleFilesOpening) output = [
                    {line: '', remove_spaces:false, className: ''},
                    {line: pathOfFile.join('/'), remove_spaces: true, className: 'folder'}
                    , ...output
                ];
            }catch(e){
                output = [{line: `${pathOfFile.join('/')} is not a file or is not found`, remove_spaces: true, className: 'command-output-error'}];
            }

            totalOutput = [...totalOutput, ...output];
        }

        return totalOutput;

    }

    async echo(args){

    }

    async less(args){

    }

    async man(args){

    }

    async whoami(args){

    }

    async grep(args){

    }

    async head(args){

    }

    async tail(args){

    }

    async nano(args, _piped, nano_terminal){

        if(!args) return [
            {line: "nano [PATH TO FILE]", className: 'folder', remove_spaces: true},
            {line: "opens the file given to be edited in the terminal", className: 'opened-file', remove_spaces: true},
        ]

        if(args.length !== 2) return [{line: 'only accepts one argument of a file', className: 'command-output-error', remove_spaces: true}]

        const {_o, paths} = await this.#getOptions(args);

        const path = this.#isAbsolutePath(paths[0]) ? paths[0].slice(1).split('/'): this.#parsePath(paths[0]);

        let file = {};
        try{
            const f = await this.#FS.getFile(path);
            if(f.length) file.content = f.map(e => e.line).join('\n');
            else file.content = f.file;
            file.name = path.join('/');
        }catch(e){
            file = {
                name: path.join('/'),
                content: ""
            }
        }

        await nano_terminal(async (text) => {
            this.#FS.addFile(path, text);
        }, file);
        return [];
    }

    async help(args){

        if(!args) return [
            {line: "help [COMMANDS]", className: 'folder', remove_spaces: true},
            {line: "gives a description of all commands, or only the commands named", className: 'opened-file', remove_spaces: true},
        ]

        let output = [];

        const {_, paths} = await this.#getOptions(args);

        for(let i = 0; i < paths.length; i++){
            try{
                output = [...output, ...(await this[paths[i]]())];
            }catch(e){
                return [{line: `unrecognized command ${paths[i]}`, className: 'command-output-error', remove_spaces:true}]
            }
        }
        
        if(paths.length) return output;
        
        const allCommands = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        allCommands.splice(allCommands.indexOf("constructor"), 1);

        for(let i = 0; i < allCommands.length; i++){
            const cmd = allCommands[i];
            const cmdDesc = await this[cmd]();
            if(cmdDesc) output = [...output, ...cmdDesc, {line: ' ', remove_spaces: false}];
        }
        
        output = [...output, 
            {line: "for full details and examples, please follow the README.md file on my github linked below", remove_spaces: true, className: 'opened-file'}, 
            {line: "github", link: "https://github.com/bcm101/bwetzel_resume"},
            {line: ' ', remove_spaces: false}
        ]

        return output;
    }

    async DELETE_DB(args) {
        if(args && args.length === 1){
            try{
                await this.#FS.DELETE_DB();
                return [{line: 'deleted database successfully', className: 'folder'}];
            }catch(e){
                return [];
            }
        }else{
            return [];
        }
    }
}

