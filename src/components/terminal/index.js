
import React from "react";
import './terminal.css';

export default class Terminal extends React.Component {

    state = {
        closed: false,
        fullScreen: false
    }

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

    componentDidMount(){
        console.log('terminal mounted')
    }

    render() {
            
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
                asdfasdfasdf
                
            </div>
        </div>);
        
    }

}
