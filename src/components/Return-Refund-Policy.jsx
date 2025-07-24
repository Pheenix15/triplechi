import Footer from './Footer';
import Nav from './Nav';
import './Policy.css'

function ReturnRefundPolicy() {
    return ( 
        <div className="policy-page">
            <Nav />
            <div className="policy return-refund">
                <div className="policy-content">
                    <div className="policy-content-heading">
                        <h2>RETURNS AND REFUND POLICY</h2>
                    </div>
                    <article className='policy-content-article' >

                        <p className="policy-text">
                            At TripleChi, every item is packaged with care. Due to the nature of our products, we do not accept returns, exchanges, or offer refunds for any purchases made through our store.
                        </p>

                        <h3>All Sales Are Final</h3>
                        <p>
                            Please ensure that you review your order carefully before checking out. All sales are considered final once your purchase is confirmed.
                        </p>
                        <h3>Exceptions</h3>
                        <p>
                            Refunds or replacements will only be considered in the rare case that <strong>you recieved the wrong item</strong>.
                            <br />
                            If this happens, you must contact us within 48 hours of receiving your order, with clear photos and a description of the issue. All claims submitted after this window may not be eligible for review.
                        </p>

                    </article>
                </div>
            </div>

            <Footer />
        </div>
     );
}

export default ReturnRefundPolicy;