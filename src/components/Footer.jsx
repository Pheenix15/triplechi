import { Link } from 'react-router-dom';
import './Footer.css'


function Footer() {
    return ( 
        <div className="footer">
            <div className="footer-details">
                <div className="details">
                    <div className="chi">
                        <div className="footer-logo">
                        <img src="../img/logo-2.png" alt="triplechi logo" />
                        </div>
                        <h3>Chibythem</h3>
                        <div className="social-links"></div>
                    </div>

                    <div className="useful-links mobile-visible ">
                        <div className="links">
                            <Link to={'/Return-Refund-Policy'} >Return Policy</Link>
                            <Link to={'/Privacy-Policy'} >Privacy Policy</Link>
                        </div>
                        <div className="payment-methods">
                            <img src="../img/logos/mastercard.png" alt="Mastercard Logo" />
                            <img src="../img/logos/Visa.png" alt="Visa Logo" />
                            <img src="../img/logos/Verve.png" alt="Verve Logo" />
                        </div>
                    </div>
                    
                </div>

                <div className="useful-links desktop-visible">
                    <div className="links">
                        <Link to={'/Return-Refund-Policy'} >Return Policy</Link>
                        <Link to={'/Privacy-Policy'} >Privacy Policy</Link>
                    </div>
                    <div className="payment-methods">
                        <img src="../img/logos/mastercard.png" alt="Mastercard Logo" />
                        <img src="../img/logos/Visa.png" alt="Visa Logo" />
                        <img src="../img/logos/Verve.png" alt="Verve Logo" />
                    </div>
                </div>

                
                <div className="contact-details">
                    <p>For assistance, please email our customer service team at:</p>
                    <a href="mailto:info@chibythem.store "> <i className="fa-solid fa-envelope" style={{marginRight:'10px'}} ></i>info@chibythem.store </a>
                </div>
                    
                
            </div>

            <div className="copyright">
                <p className="tiny">&copy;Chibythem.store {new Date().getFullYear()}.</p>
            </div>
        </div>
     );
}

export default Footer;