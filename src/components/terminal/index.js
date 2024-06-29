
import React from "react";
import './terminal.css';

export default class Terminal extends React.Component {

    state = {
        closed: false,
        minimized: false,
        fullScreen: false
    }

    #closeTerminal = () => {
        this.setState({closed: true});
    }

    #minimizeTerminal = () => {
        this.setState({minimized: true, fullScreen: false});
    }

    #fullScreenTerminal = () => {
        this.setState({fullScreen: !this.state.fullScreen});
    }

    #getClassnames = () => {
        return `terminal${this.state.minimized ? ' minimized': ' notMinimized'}${this.state.fullScreen ? ' maximized': ''}`
    }

    render() {
        return (<div className={this.#getClassnames()} hidden={this.state.closed}>
            <div className="terminal-top">
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
                asdfasdfasdf
                
            </div>
        </div>);
    }

}
