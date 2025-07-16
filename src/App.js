import{Routes, Route, Navigate} from 'react-router-dom';
import './App.css';
import Home from './components/Home'
import Shop from './components/Shop';
import Details from './components/Details';
import Gallery from './components/Gallery';
import Cart from './components/Cart';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' Component={Home} />
        <Route path='/Shop' Component={Shop} />
        <Route path='/Details/:id' Component={Details} />
        <Route path='/Gallery' Component={Gallery} />
        <Route path='/Cart' Component={Cart} />

        {/* 404 fallback */}
        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
      
    </div>
  );
}

export default App;
