import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './routes/home'
import Resume from './routes/resume';

function App() {
  return (
    <div className="App">
      <Routes id="router">
        <Route path='/' element={<Home/>}></Route>
        <Route path='/resume' element={<Resume/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
