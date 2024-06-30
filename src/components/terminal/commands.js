
import getFS from "../../filesystem";

export default class Commands {

    #FS = getFS();

    #getOptions(args){
        const options = [];
        const paths = [];

        console.log(args)

        for(let i = 1; i < args.length; i++){
            console.log(args[i])
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

        console.log(this.#getOptions(args))

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
    
    async cat(args){

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