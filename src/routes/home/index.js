import {Component} from 'react';
import Terminal from '../../components/terminal';
import './home.css';

export default class Home extends Component {

    state = {
        terminalMinimized: false,
        terminalOpen: true,
        firstClicked: false,
        playingClickingAnimation: false
    }

    #mounted = false;
    #initialCommand = 'cat BMW_Resume.txt && ls -3 *';

    #openTerminal = () => {
        this.setState({terminalOpen: true, terminalMinimized: false, playingClickingAnimation: false})
    }

    #terminalClosed = () => {
        this.setState({terminalOpen: false, firstClicked: false})
    }

    #terminalMinimized = () => {
        this.setState({terminalMinimized: true})
    }

    render(){

        if(this.state.playingClickingAnimation) window.setTimeout(() => {
            if(this.state.playingClickingAnimation)
                this.setState({playingClickingAnimation: false, terminalOpen: true})
        }, 3000)

        return (<div id='home'>
            {this.state.firstClicked && this.state.terminalOpen &&
                <Terminal 
                    terminalClosedCallback={this.#terminalClosed} 
                    terminalMinimizedCallback={this.#terminalMinimized}
                    minimized={this.state.terminalMinimized}
                    initialCommand={this.#initialCommand}
                />
            }
            {!this.state.firstClicked && this.state.terminalOpen &&
                <Terminal 
                    terminalClosedCallback={this.#terminalClosed} 
                    terminalMinimizedCallback={this.#terminalMinimized}
                    minimized={this.state.terminalMinimized}
                />
            }
            <div id='terminal-icon' onClick={this.#openTerminal}></div>
            {this.state.playingClickingAnimation && <div id='mouse-pointer'></div>}
        </div>);
    }

}

