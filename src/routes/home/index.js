import {Component} from 'react';
import Terminal from '../../components/terminal';
import './home.css';

export default class Home extends Component {

    state = {
        terminalMinimized: false,
        terminalOpen: true
    }

    #openTerminal = () => {
        this.setState({terminalOpen: true, terminalMinimized: false})
    }

    #terminalClosed = () => {
        this.setState({terminalOpen: false})
    }

    #terminalMinimized = () => {
        this.setState({terminalMinimized: true})
    }

    render(){
        return (<div id='home'>
            {this.state.terminalOpen && 
                <Terminal 
                    terminalClosedCallback={this.#terminalClosed} 
                    terminalMinimizedCallback={this.#terminalMinimized}
                    minimized={this.state.terminalMinimized}
                />
            }
            <div id='terminal-icon' onClick={this.#openTerminal}></div>
        </div>);
    }

}

