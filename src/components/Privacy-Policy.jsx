import Nav from './Nav';
import Footer from './Footer';
import './Policy.css'

function PrivacyPolicy() {
    return ( 
        <div className="policy-page">
            <Nav />
            <div className="policy return-refund">
                <div className="policy-content">
                    <div className="policy-content-heading">
                        <h2>PRIVACY POLICY</h2>
                    </div>
                    <article className='policy-content-article' >

                        <p className="policy-text">
                            TripleChi ("we", "our", or "us") values your privacy. This Privacy Policy outlines how we collect, use, disclose, and protect your personal information when you visit our website, purchase our products, or otherwise interact with us.
                        </p>

                        <h3>Information We Collect</h3>
                        <p>
                            We may collect the following types of personal information:
                        </p>
                        
                        <ul>
                            <li><strong>Personal Identification Information:</strong> Name, email address, phone number, shipping and billing addresses.</li>

                            <li><strong>Payment Information:</strong>Credit/debit card details or payment method via secure third-party processors (we do not store payment details).</li>

                            <li><strong>Order Details:</strong>Products purchased, order history, preferences.</li>
                        </ul>
                        <h3>How We Use Your Information</h3>
                        <p>
                            We use your information to:
                        </p>

                        <ul>
                            <li>Process and fulfill orders</li>

                            <li>Communicate with you about your orders and customer service inquiries</li>

                            <li>Improve our website, products, and customer experience</li>

                            <li>Comply with legal obligations</li>
                        </ul>

                        <h3>Sharing Your Information</h3>
                        <p>
                            We do not sell your personal data. However, we may share your information with:
                        </p>

                        <ul>
                            <li><strong>Service Providers:</strong>Payment processors, shipping carriers, marketing platforms, and analytics services under strict confidentiality agreements.</li>

                            <li><strong>Legal Authorities:</strong>If required by law or to protect our rights.</li>
                        </ul>

                    </article>
                </div>
            </div>

            <Footer />
        </div>
     );
}

export default PrivacyPolicy;