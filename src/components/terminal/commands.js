
import getFS from "../../filesystem";

export default class Commands {

    #FS = getFS();

    #getOptions(args){
        const options = [];
        const paths = [];

        for(let i = 1; i < args.length; i++){
            if(args[i][0] === '-')
                for(let j = 1; j < args[i].length; j++)
                    options.push(args[i][j]);
            else{
                paths.push(args[i]);
            }
        }

        return {options, paths};
    }

    async ls(args, piped = null){

        const {options, paths} = this.#getOptions(args);
        console.log(options,paths)        


        return [{line: 'hello world', remove_spaces: true, className: ''}];
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

        const opt = this.#getOptions(args);
        let options = opt.options;
        let paths = opt.paths;

        if(paths.includes('*')){
            paths.splice(paths.indexOf('*'), 1);
            const allPaths = await this.#FS.getFolder(currentPath);
            paths = [...allPaths.folder.map(f => f.name)];
        }

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
            })

            if(suppressEmptyLines) piped = piped.filter(li => li.line.trim().length > 0);

            return piped;
        }

        for(let i = 0; i < paths.length; i++){
            const pathOfFile = [...currentPath, paths[i]]

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