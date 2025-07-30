import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { database, auth } from './firebase';
import { ref, onValue, remove } from 'firebase/database';
import { useCurrency } from '../context/CurrencyContext';
import PaystackPop from '@paystack/inline-js'
import { sendCheckoutEmail } from './form';
import './Nav'
import './Checkout.css'
import './Auth.css'
import Nav from './Nav';
import Footer from './Footer';

function Checkout () {

    const [cartItems, setCartItems] = useState([]);
    const [tripleChiUser, setTripleChiUser] = useState(null);
    const [tripleChiUserDetails, setTripleChiUserDetails] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);
    // const [currency, setCurrency] = useState("USD");
    // const [shippingCost, setShippingCost] = useState(30)
    const [checkoutFormData, setCheckoutFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: ''
    });


    // SHIPPING COST
    const shippingCost = 30;

    // CHECKS IF USER IS LOGGED IN
    useEffect(() => {
        const UserListner = onAuthStateChanged(auth, (currentUser) => {
            setTripleChiUser(currentUser)
        });
        return () => UserListner //STOP CHECKING FOR USER
    }, [])

    // GET USERS DETAILS FROM DB
    useEffect(() => {
        if (tripleChiUser) {
        const userRef = ref(database, `users/${tripleChiUser.uid}`);
        onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setTripleChiUserDetails(data);
        });
        } else return;
    }, [tripleChiUser]);

    // Calculates total amount from cart items
    const calculateTotal = (items) => {
        const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotalAmount(total);
    };

    // RETRIVES CART FROM LOCALSTORAGE
    useEffect(() => {
        const usersCart = localStorage.getItem("tripleChiCart");
        if (usersCart) {
        const parsedUsersCart = JSON.parse(usersCart);
        setCartItems(parsedUsersCart);
        calculateTotal(parsedUsersCart);
        }
    }, []);

    //FUNCTION TO CLEAR CART FROM LOCALSTORAGE

    const clearCartData = (tripleChiUser) => {
        // If user is logged in, clear both database and localStorage
        if (tripleChiUser) {
            const cartRef = ref(database, `ShoppingCart/${tripleChiUser.uid}`);
            remove(cartRef)
            .then(() => {
                console.log("Cart cleared from database.");
            })
            .catch((error) => {
                console.error("Error clearing cart from database:", error);
            });
        }

        // CLEARS LOCALSTORAGE (whether or not the user is logged in)
        localStorage.removeItem("tripleChiCart");
        setCartItems([]) // CLEARS CART STATE
        console.log("Cart cleared from localStorage.");
    };

    // CURRENCY SWITCHING
    const Price = ({ amountInDollars }) => {
        const { currency, exchangeRate } = useCurrency();

        const displayAmount =
            currency === "NGN"
                ? `₦${(amountInDollars * exchangeRate).toLocaleString()}`
                : `$${amountInDollars.toFixed(2)}`;

        return <span>{displayAmount}</span>;
    };

    // CALCULATE TOTAL AMOUNT PAYABLE
    const amountPayable = totalAmount + shippingCost;

// LOGIC RELATING TO CHECKOUT AND PAYSTACK

    // SET checkoutFormData TO tripleChiUserDetails IF USER IS LOGGED IN
    useEffect(() => {
        if (tripleChiUserDetails) {
            setCheckoutFormData(prev => ({
            ...prev,
            firstName: tripleChiUserDetails.firstName || '',
            lastName: tripleChiUserDetails.lastName || '',
            email: tripleChiUserDetails.email || '',
            phoneNumber: tripleChiUserDetails.phoneNumber || '',
            address: tripleChiUserDetails.address || ''
            }));
        }
    }, [tripleChiUserDetails]);

     //PAYSTACK CHECKOUT
    const handlePaystackCheckout = (e) => {
        e.preventDefault() // PREVENTS PAGE RELOAD WHEN FORM IS SUBMITTED
        const paystack = new PaystackPop();

        const totalAmount = Math.floor(Number(amountPayable) * 100);
        console.log('Paystack amount:', totalAmount, typeof totalAmount);

        paystack.newTransaction({
            key: process.env.REACT_APP_PAYSTACK_KEY,
            email: checkoutFormData.email,
            amount: totalAmount,
            metadata: {
                name: `${tripleChiUserDetails.firstName || checkoutFormData.firstName} ${tripleChiUserDetails.lastName || checkoutFormData.lastName}`,
                phone: tripleChiUserDetails.phoneNumber || checkoutFormData.phoneNumber,
                address: tripleChiUserDetails.address || checkoutFormData.address,
            },
            onSuccess: (transaction) => {
                console.log(`Payment Success: ${transaction}`);
                //transaction IS CALLED transactionRef IN FORM.JS
                sendCheckoutEmail(checkoutFormData, cartItems, transaction, totalAmount)
                // CLEAR CART EVERYWHERE
                clearCartData(tripleChiUser)
            },
            onCancel: () => {
                console.log("Payment Canclled");
            }
        });
    };

    return ( 
        <div className="checkout-page">
            <Nav />
            <div className="checkout">
                {/* Left side: Cart summary */}
                <div className="checkout-cart-summary">
                    <h2>Order Summary</h2>
                    {cartItems.map((item, index) => (
                    <div key={index} className="checkout-cart-item">
                        <div className='checkout-cart-details' >
                            <div className="checkout-cart-image"><img src={item.image} alt={item.name} /></div>

                           
                            <div className="checkout-cart-details-info">
                                <div className="checkout-cart-details-name">
                                    <p>{item.name}</p>
                                </div>

                                <div className="checkout-cart-details-specs">
                                    <p><strong>size:</strong> {item.size}</p>
                                    <p><strong>qty:</strong> {item.quantity}</p>
                                </div>
                                
                            </div>
                        </div>
                        <div className="checkout-cart-price"><p><Price amountInDollars={item.price} /></p></div>
                    </div>
                    ))}
                    <div className="checkout-total-cost">
                        <div className="expense total-amount">
                            <p>Subtotal:</p>
                            <p><Price amountInDollars={totalAmount} /></p>
                        </div>

                        <div className="expense shipping-cost">
                            <p>Shipping: </p>
                            <p><Price amountInDollars={shippingCost} /></p>
                        </div>

                        <div className="expense net-total">
                            <h3>Total:</h3>
                            <h3><Price amountInDollars={totalAmount + shippingCost} /></h3>
                        </div>
                        

                    </div>
                    
                </div>
                
                <div className="auth-form checkout-form ">
                    <form className="form user-details-form" onSubmit={handlePaystackCheckout}>
                        <h2>Delivery Info</h2>
                        <input name='First Name' type="text" placeholder="First Name" defaultValue={tripleChiUserDetails.firstName || checkoutFormData.firstName} onChange={(e) => setCheckoutFormData ({...checkoutFormData, firstName: e.target.value})} />

                        <input name='Last Name' type="text" placeholder="Last Name" defaultValue={tripleChiUserDetails.lastName || checkoutFormData.lastName} onChange={(e) => setCheckoutFormData ({...checkoutFormData, lastName: e.target.value})} />

                        <input name='Email' type="email" placeholder="Email" defaultValue={tripleChiUserDetails.email || checkoutFormData.email} onChange={(e) => setCheckoutFormData ({...checkoutFormData, email: e.target.value})} />

                        <input name='Telephone' type="tel" placeholder="Phone Number" defaultValue={tripleChiUserDetails.phoneNumber || checkoutFormData.phoneNumber} onChange={(e) => setCheckoutFormData ({...checkoutFormData, phoneNumber: e.target.value})} />

                        <textarea name='Address' placeholder="Address" defaultValue={tripleChiUserDetails.address || checkoutFormData.address} onChange={(e) => setCheckoutFormData ({...checkoutFormData, address: e.target.value})} ></textarea>

                        <button type='submit' className="button checkout-button">
                            Complete Purchase
                        </button>
                    </form> 
                </div>
            </div>
            <Footer />
        </div>
     );
}

export default Checkout;