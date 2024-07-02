
import React from "react";
import './terminal.css';
import getFS from "../../filesystem";
import Text from "./text";
import Commands from "./commands";

export default class Terminal extends React.Component {

    state = {
        closed: false,
        fullScreen: false,
        history: [],
        currentCommandOutput: [],
        initialCommand: this.props.initialCommand
    }

    #commands = new Commands();

    #keyProps = 0;

    #closeTerminal = () => {
        if(this.props.terminalClosedCallback) this.props.terminalClosedCallback();
    }

    #minimizeTerminal = () => {
        this.setState({fullScreen: false});
        if(this.props.terminalMinimizedCallback) this.props.terminalMinimizedCallback();
    }

    #fullScreenTerminal = () => {
        this.setState({fullScreen: !this.state.fullScreen});
    }

    #getClassnames = () => {
        return `terminal${this.props.minimized ? ' minimized': ' notMinimized'}${this.state.fullScreen ? ' maximized': ''}`
    }

    #pmpt = () => {
        return `BMW@Sedna: /${getFS().getCurrentPath().join('/')}$ `;
    }

    #enterNewCommand = async (e) => {
        if(e.key === "Enter"){
            this.#parseAndHandleCmd(e.target.value);
            e.target.value = '';
        }
    }

    #parseAndHandleCmd = async (str) => {
        const args = str
            .split('&&')  // splits along the 'and' operator
            .map(e => e.split('|') // splits along the 'pipe' operator
                .map(i => i
                    .split(' ') // splits along all spaces
                    .filter(j => j !== '') // removes empty arguments
        ))

        
        const newHistory = [...this.state.history];
        const commandInputLine = {line: `${this.#pmpt()}${str}`, className: '', remove_spaces: true};
        newHistory.push(commandInputLine);
        
        let cmd = args[0][0][0];
        let cmdOutput = [];

        if(str.trim().length > 0){
            try{
                for(let i = 0; i < args.length; i++){

                    const pipeGroup = args[i];
                    let out = null;
                    cmd = args[i][0][0];

                    for(let j = 0; j < pipeGroup.length; j++){
                        out = await this.#commands[cmd](args[i][j], out)
                    }

                    cmdOutput = [...cmdOutput, ...out];
                }
            }catch(e){
                console.error(e); //remove when done testing
                cmdOutput = [
                    {line: "", className: '', remove_spaces: false},
                    {line: `Unrecognized command '${cmd}'; type help for a list of commands.`, className: 'command-output-error', remove_spaces: true},
                    {line: "", className: '', remove_spaces: false}
                ];
            }
        }

        if(!cmdOutput) cmdOutput=[{line: "terribly sorry, but that command hasn't been implemented yet... its on the docket !", className: 'command-output-error', remove_spaces: true},]

        this.setState({history: newHistory, currentCommandOutput: cmdOutput, initialCommand: false});
    }

    #isCurrentlyTyping = () => {
        return document.getElementsByClassName('is-typing').length > 0;
    }

    #print(line, show_animation=false, speed=100, callback=()=>{}) {
        return <Text
            key={this.#keyProps++}
            purge_multiple_spaces={line.remove_spaces}
            string={line.line}
            className={line.className}
            show_animation={show_animation}
            speed={speed}
            before_string={`${line.before_string ? line.before_string: ''}`}
            link={line.link}
            time_before_typing={line.time_before_typing}
            show_cursor={line.show_cursor}
            time_after_typing={line.time_after_typing}
            callback={callback}
        />
    }

    #waitDoneTyping = () => {
        if(this.#isCurrentlyTyping() || this.state.currentCommandOutput.length > 0)
            window.setTimeout(() => {
                if(this.#isCurrentlyTyping()) this.#waitDoneTyping();
                else this.setState({
                    currentCommandOutput: [],
                    history: [...this.state.history, ...this.state.currentCommandOutput]
                })
            }, 200
        )
    }

    #doneWithInitialCommand = () => {
        this.#parseAndHandleCmd(this.state.initialCommand);
    }

    render() {

        this.#waitDoneTyping();

        return (<div className={this.#getClassnames()}>
            <div className="terminal-top">
                <div className="cmd-label"><div className="icon"></div><div className="terminal-name">linux&#32;terminal</div></div>
                <div className="bar-button close" onClick={this.#closeTerminal}>
                    <div>x</div>
                </div>
                <div className="bar-button change-size" onClick={this.#fullScreenTerminal}>
                    {this.state.fullScreen ? <div>&#10697;</div>: <div>&#9633;</div>}
                </div>
                <div className="bar-button change-size" onClick={this.#minimizeTerminal}>
                    <div>-</div>
                </div>
            </div>
            <div className="main-terminal">
                {this.state.history.map(line => {
                    return this.#print(line);
                })}
                {this.state.currentCommandOutput.length > 0 &&
                    this.state.currentCommandOutput.map((line, index) => {
                        const toPrint = line;
                        toPrint.time_before_typing = 50*index;
                        return this.#print(toPrint, true, 10);
                    })
                }
                {this.state.currentCommandOutput.length===0 && !this.state.initialCommand && <div>{this.#pmpt()}<input className="cmd-input" autoFocus onKeyDown={this.#enterNewCommand}></input></div>}
                {this.state.initialCommand && this.#print({
                    line: this.state.initialCommand,
                    remove_spaces: true,
                    className: '',
                    before_string: this.#pmpt(),
                    show_cursor: true,
                    time_after_typing: 500,
                    time_before_typing: 500
                }, true, 100, this.#doneWithInitialCommand)}
            </div>
        </div>);
        
    }

}
