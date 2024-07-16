import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './routes/home'
import Resume from './routes/resume';
import FileViewer from './routes/fs';

function App() {
  return (
    <div className="App">
      <Routes id="router">
        <Route path='/' element={<Home/>}></Route>
        <Route path='/resume' element={<Resume/>}></Route>
        <Route path='/fs' element={<FileViewer/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
