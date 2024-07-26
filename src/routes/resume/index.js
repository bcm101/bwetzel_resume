import {Component} from 'react';
import './resume.css';

export default class Resume extends Component {
    render(){

        return (<div className='resume-page'>
            <div className='top'>
                <div>Brandon Matthew Wetzel</div>
            </div>
            <div className='group'>
                <div className='header-of-group'>Experience</div>
                <div className='job-header'>Loomis Sayles</div>
                <div className='sub-job-header'>Front-End Web Development<div className='date'>Summer 2018</div></div>
                <div className='sub-job-description'>
                    <ul>
                        <li>Worked in a team of 3-4 interns</li>
                        <li>Utilizing React.JS and D3.JS, built websites that display financial data passed from the back-end</li>
                        <li>Websites used by financial analysts to help in decision making</li>
                    </ul>
                </div>
                <div className='sub-job-header'>Full Stack Web Development<div className='date'>Summers of 2019-2021</div></div>
                <div className='sub-job-description'>
                    <ul>
                        <li>Lead a team of interns, handled Git branches, delegated work to other interns</li>
                        <li>Utilizing React.JS and D3.JS for front-end, and Elixir, Node.JS, and Java for back-end</li>
                        <li>First team of interns to create an application used in production</li>
                        <li>Applications had a large focus on management of financial data to help financial analysts make decisions</li>
                    </ul>
                </div>
                <div className='job-header'>Univserity of Massachusetts Dartmouth</div>
                <div className='sub-job-header'>Teaching Assistant</div>
                <div className='sub-job-description'>
                    Assisted in teaching, held office hours, answering student's questions, and grading for the courses:
                    <ul>
                        <li>Parallel and Distributed Systems (Graduate course)<div className='date'>Spring 2023</div></li>
                        <li>Theoretical Computer Science (Graduate course)<div className='date'>Fall 2023</div></li>
                        <li>Object-Oriented Programming (Undergraduate course)<div className='date'>Spring 2020</div></li>
                    </ul>
                </div>
            </div>
            <div className='group'>
                <div className='header-of-group'>Education</div>
                <div className='job-header'>B.S. in Computer Science, Minor in Mathematics<div className='date'>Aug 2022</div></div>
                <div className='sub-job-description'>
                    <ul>
                        <li>University of Massachusetts Dartmouth, Dartmouth, MA</li>
                        <li>Summa Cum Laude - 3.98 GPA</li>
                    </ul>
                </div>
                <div className='job-header'>M.S. in Computer Science<div className='date'>Aug 2024</div></div>
                <div className='sub-job-description'>
                    <ul>
                        <li>University of Massachusetts Dartmouth, Dartmouth, MA</li>
                        <li>Thesis topic: <i>Ensuring Trustworthiness in Immutable Predictive Models Using Public Blockchain</i></li>
                        <li>Summa Cum Laude - 4.0 GPA</li>
                    </ul>
                </div>
            </div>
            <div className='group'>
                <div className='header-of-group'>Accomplishments</div>
                <div className='job-header'><a href='https://www.astesj.com/v09/i03/p07/'>Publication in Journal</a><div className='date'>Apr 2024</div></div>
                <div className='sub-job-description'>
                    <ul>
                        <li>Created framework for a public blockchain with smart contracts where smart contracts contain methods for verification of machine learning neural network predictive models.</li>
                        <li>Performed a case study with a simulation of a blockchain environment to demonstrate the effectiveness of this approach. </li>
                        <ul>
                            <li>B. Wetzel and H. Xu, "Deploying Trusted and Immutable Predictive Models on a Public Blockchain Network," Advances in Science, Technology and Engineering Systems Journal, vol. 9, no. 3, pp. 72-83, 2024</li>
                        </ul>
                    </ul>
                </div>
                <div className='job-header'>Computer and Informational Science Faculty Award (M.S.)<div className='date'>May 2024</div></div>
                <div className='sub-job-description'>
                    <ul>
                        <li>
                            This award is given to the student with the highest GPA in the graduating class of the UMass Dartmouth Computer Science M.S. program.
                        </li>
                    </ul>
                </div>
                <div className='job-header'>Computer and Informational Science Faculty Award (B.S.)<div className='date'>May 2022</div></div>
                <div className='sub-job-description'>
                    <ul>
                        <li>
                            This award is given to the student with the highest GPA in the graduating class of the UMass Dartmouth Computer Science B.S. program.
                        </li>
                    </ul>
                </div>
            </div>
            <div className='group'>
                <div className='header-of-group'>Skills</div>
                <div className='sub-job-description'>
                    <ul>
                        <li>Full-Stack Development</li>
                        <li>Object-Oriented Programming</li>
                        <li>Parallel Systems and Computing</li>
                        <li>Familiar with Common Algorithms</li>
                        <li>Data Visualization</li>
                        <li>Languages:</li>
                        <ul>
                            <li>Javascript</li>
                            <li>Python</li>
                            <li>Java</li>
                            <li>C</li>
                        </ul>
                    </ul>
                </div>
            </div>
            
        </div>)
    }
}