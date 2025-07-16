import { Link } from 'react-router-dom';
import './Home.css'

function Home() {
    return ( 
        <div className="home">
            <div className="logo">
                <img src="/img/chi-logo.png" alt="" />
            </div>
            <div className="buttons">
                <Link to='/Shop' ><button className="button home-button shop-button">Shop</button></Link>
                <Link to= '/Gallery' ><button className="button home-button gallery-button">Gallery</button></Link>
            </div>
        </div>
     );
}

export default Home;