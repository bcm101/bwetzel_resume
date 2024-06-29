import logo from './logo.svg';
import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './routes/home'

function App() {
  return (
    <div className="App">
      <Routes id="router">
        <Route path='/' element={<Home/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
