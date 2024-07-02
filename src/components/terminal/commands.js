
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
            console.error(e)
            return null;
        }

        return total;
    }

    async ls(args, piped = null){

        let {options, paths} = await this.#getOptions(args);
        
        const recursivelyListAll = options.includes('R');
        const noSpecifiedDirectories = !paths.length;

        if(noSpecifiedDirectories) paths=[this.#FS.getCurrentPath()];

        let allPaths = [];

        if(recursivelyListAll)
            for(let i = 0; i < paths.length; i++){
                const pathF = noSpecifiedDirectories ? this.#FS.getCurrentPath(): this.#parsePath(paths[i]);
                const allSubPaths = await this.#findAllContained(pathF, recursivelyListAll);
                allPaths = [...allPaths, pathF, ...allSubPaths];
            }
        else if(noSpecifiedDirectories) allPaths = paths;
        else allPaths = paths.map(p => this.#parsePath(p));

        let output = [];
        
        for(let i = 0; i < allPaths.length; i++){
            try{
                const content = (await this.#FS.getFolder(allPaths[i])).folder;
                output = [
                    ...output, 
                    {line: `${allPaths[i].join('/')}: `, className: 'folder', remove_spaces: false},
                    ...(content.map(f => {
                        return {line: `${f.name}: `, className: f.type === 3 || f.type === 5 ? 'folder': 'file', remove_spaces: false}
                    })),
                    {line: " ", className: 'folder', remove_spaces: false}
                ];
                
            }catch(e){
                continue;
            }
        }

        return output;
    }

    async pwd(args, piped = null){

    }
    
    async cd(args){

    }

    async mkdir(args){

    }

    async mv(args){

    }

    async cp(args){

    }

    async rm(args){

    }

    async rm(args){
        
    }

    async touch(args){

    }

    async clear(args){

    }
    
    async cat(args, piped){

        const currentPath = this.#FS.getCurrentPath();

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

            const pathOfFile = this.#parsePath(paths[i]);

            let output;
            try{
                
                output = await this.#FS.getFile(pathOfFile);

                if(output.length) output = [...output];
                if(output.file) output = output.file.split('\n').map(line => {return {line, className: '', remove_spaces: true}});

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
                output = [{line: `${pathOfFile} is not a file or is not found`, remove_spaces: true, className: 'command-output-error'}];
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

    async nano(args){

    }
}