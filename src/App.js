import{Routes, Route} from 'react-router-dom';
import './App.css';
import Home from './components/Home'
import Shop from './components/Shop';
import Details from './components/Details';
import Gallery from './components/Gallery';
import Cart from './components/Cart';
import Signup from './components/Signup';
import Login from './components/Login';
import ReturnRefundPolicy from './components/Return-Refund-Policy';
import PrivacyPolicy from './components/Privacy-Policy';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' Component={Home} />
        <Route path='/Shop' Component={Shop} />
        <Route path='/Details/:id' Component={Details} />
        <Route path='/Gallery' Component={Gallery} />
        <Route path='/Cart' Component={Cart} />
        <Route path='/Signup' Component={Signup} />
        <Route path='/Login' Component={Login} />
        <Route path='/Return-Refund-Policy' Component={ReturnRefundPolicy} />
        <Route path='/Privacy-Policy' Component={PrivacyPolicy} />

        {/* 404 fallback */}
        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
      
    </div>
  );
}

export default App;
