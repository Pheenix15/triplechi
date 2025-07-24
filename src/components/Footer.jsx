import { Link } from 'react-router-dom';
import './Footer.css'


function Footer() {
    return ( 
        <div className="footer">
            <div className="footer-details">
                <div className="details">
                    <div className="footer-logo">
                        <img src="../img/logo-2.png" alt="triplechi logo" />
                    </div>
                    <h3>Triplechi</h3>
                    <div className="social-links"></div>
                </div>

                <div className="useful-links">
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

            <div className="copyright">
                <p className="tiny">&copy;Triplechi.store {new Date().getFullYear()}.</p>
            </div>
        </div>
     );
}

export default Footer;