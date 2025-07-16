import { Link } from 'react-router-dom';
import './Nav.css'

function Nav() {
    return ( 
        <div className="nav">
            <div className="title-logo">Triplechi</div>
            <nav className="navbar">
                <Link to={'/Cart'} ><button className='cart-btn' ><i className="fa-solid fa-cart-shopping"></i></button></Link>
            </nav>
        </div>
     );
}

export default Nav;