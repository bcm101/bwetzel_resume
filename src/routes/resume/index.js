import {Component} from 'react';

export default class Resume extends Component {
    render(){
        return (<div className='resume-page'>
            <div className='header'>
                <div>Brandon Matthew Wetzel</div>
                <div>Marshfield, MA</div>
            </div>
            <div className='experience'>
                <div className='job-header'>Loomis Sayles Internship</div>
                <div className='sub-job-header'>2018</div>
                <div className='sub-job-description'></div>
            </div>

        </div>)
    }
}