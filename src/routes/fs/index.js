import { Component } from "react";
import getFS from "../../filesystem";

export default class FileViewer extends Component{

    #FS = getFS();

    state = {
        reactComponent: null
    }

    #showFile = async () => {
        try{
            const path = window.location.hash.match(/(?<=(\?|&)path=)[^&]*/g)[0];

            const fileContents = await this.#FS.getFile(path.split('/'));

            if(fileContents.length){
                document.getElementById('wrapper').innerHTML = fileContents.map(e => e.line).join('\n');   
            }else if(fileContents.file || fileContents.file === ""){
                document.getElementById('wrapper').innerHTML = fileContents.file;
            }else if(typeof fileContents === "function"){
                this.setState({reactComponent: fileContents.component});
            }

            throw new Error('idk what to do here');
            
        }catch(e){
            document.getElementById('wrapper').innerHTML = "cannot open file";
        }
    }

    componentDidMount = async () => {
        if(!this.state.reactComponent)
            await this.#showFile();
    }

    render(){
        const Comp = this.state.reactComponent;
        if(Comp) return <div id="wrapper"><Comp/></div>
        return <div id="wrapper">loading...</div>;
    }
}