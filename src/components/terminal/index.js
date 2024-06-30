
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
        currentCommandOutput: []
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
            const pipes = e.target.value.split('|');
            const args = pipes.map(e => e.split(' '));
            const cmd = args[0][0];

            const newHistory = [...this.state.history];
            const commandInputLine = {line: `${this.#pmpt()}${e.target.value}`, className: '', remove_spaces: true};
            newHistory.push(commandInputLine);
            let cmdOutput;

            e.target.value = '';

            try{
                cmdOutput = await this.#commands[cmd](args[0]);
            }catch(e){
                cmdOutput = [
                    {line: "", className: '', remove_spaces: false},
                    {line: "Unrecognized command; type help for a list of commands.", className: 'command-output-error', remove_spaces: true},
                    {line: "", className: '', remove_spaces: false}
                ];
            }

            this.setState({history: newHistory, currentCommandOutput: cmdOutput});
            
        }
    }

    #isCurrentlyTyping = () => {
        return document.getElementsByClassName('is-typing').length > 0;
    }

    #print(line, show_animation=false, speed=100) {
        return <Text
            key={this.#keyProps++}
            purge_multiple_spaces={line.remove_spaces}
            string={line.line}
            className={line.className}
            show_animation={show_animation}
            speed={speed}
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
        console.log("is this runnning 5x a second?")
    }

    render() {

        this.#waitDoneTyping();

        return (<div className={this.#getClassnames()}>
            <div className="terminal-top">
                <div className="cmd-label"><div></div>linux&#32;terminal</div>
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
                    this.state.currentCommandOutput.map((line) => {
                        return this.#print(line, true, 10);
                    })
                }
                {this.state.currentCommandOutput.length===0 && <div>{this.#pmpt()}<input className="cmd-input" autoFocus onKeyDown={this.#enterNewCommand}></input></div>}
            </div>
        </div>);
        
    }

}
