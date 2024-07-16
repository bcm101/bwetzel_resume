import { Component } from "react";
import getFS from "../../filesystem";

export default class FileViewer extends Component{

    #FS = getFS();

    #path = window.location.hash.match(/(?<=path=)[^&]*/g)[0];

    #getFile = async () => {
        try{
            const fileContents = await this.#FS.getFile(this.#path.split('/'));

            if(fileContents.length){
                return fileContents.map(e => e.line).join('\n');
            }

            if(fileContents.file || fileContents.file === ""){
                return fileContents.file;
            }

            throw new Error('idk what to do here');
            
        }catch(e){
            return ["cannot open file"];
        }
    }

    componentDidMount = async () => {
        const file = await this.#getFile();
        document.getElementById('wrapper').innerHTML = file;
    }

    render(){
        return <div id="wrapper">loading...</div>;
    }
}