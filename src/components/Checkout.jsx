import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { database, auth } from './firebase';
import { ref, onValue, remove } from 'firebase/database';
import { useCurrency } from '../context/CurrencyContext';
import { Country, State } from "country-state-city";
import PaystackPop from '@paystack/inline-js';
// import { sendCheckoutEmail } from './form';/////////
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
    const [isLoading, setIsLoading] = useState(false)
    const [shippingCost, setShippingCost] = useState(0) //SHIPPING COST
    const [countryList, setCountryList] = useState([]); //COUNTRY LIST FROM API
    const [stateList, setStateList] = useState([]); //STATE LIST FROM API
    const [isCountrySelected, setIsCountrySelected] = useState(false) //CHECKS IF A COUNTRY IS SELECTED
    const [selectedCountry, setSelectedCountry] = useState(''); // SELECTED FROM DROPDOWN
    const [selectedCountryCode, setSelectedCountryCode] = useState('') //COUNTRY CODE OF SELECTED COUNTRY
    const [selectedState, setSelectedState] = useState(''); // SELECTED FROM DROPDOWN
    const [checkoutFormData, setCheckoutFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        country: '',
        state: '',
        address: ''
    });
    

///////CURRENCY
    const { currency, exchangeRate } = useCurrency()



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
                // console.log("Cart cleared from database."); DEBUGING
            })
            .catch((error) => {
                // console.error("Error clearing cart from database:", error);
            });
        }

        // CLEARS LOCALSTORAGE (whether or not the user is logged in)
        localStorage.removeItem("tripleChiCart");
        setCartItems([]) // CLEARS CART STATE
        // console.log("Cart cleared from localStorage.");
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

    

// LOGIC RELATING TO CHECKOUT AND PAYSTACK /////////    
    
    //WHEN A COUNTRY IS SELECTED GET ITS STATES
    useEffect(() => {
        setCountryList(Country.getAllCountries());
    }, []);

    // Update state list when country changes
    useEffect(() => {
        if (selectedCountry) {
            const states = State.getStatesOfCountry(selectedCountryCode);

            setIsCountrySelected(true)
            setStateList(states);
            setSelectedState(""); // Reset state when country changes
        } else {
            setStateList([]);
        }
    }, [selectedCountry, selectedCountryCode]);


    ////////// SHIPPING RATES
    useEffect(() => {
        if (!selectedCountry) return;

        const shippingRef = ref(database, "ShippingRate");
        onValue(shippingRef, (snapshot) => {
            const data = snapshot.val();

            if (data) {
            // Check if the selected country exists in ShippingRate
            if (data[selectedCountry]) {
                setShippingCost(data[selectedCountry]); // Use country-specific rate
            } else {
                setShippingCost(data.Standard); // Fallback to standard rate
            }
            }
        });
    }, [selectedCountry]);

    //WHEN A  IS SELECTED GET ITS SHIPPING COST
    

    // CALCULATE TOTAL AMOUNT PAYABLE
    const amountPayable = totalAmount + shippingCost;
    // CONVERT BASED ON SELECTED CURRENCY
    const convertedAmount = currency === "USD" ? amountPayable : amountPayable * exchangeRate;

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

    // KEEPS selectedCountry and selectedState IN SYNC WITH THE FORM
    useEffect(() => {
        setCheckoutFormData(prev => ({
            ...prev,
            country: selectedCountry,
            state: selectedState
        }));
    }, [selectedCountry, selectedState]);


     //PAYSTACK CHECKOUT
    const handlePaystackCheckout = (e) => {
        if (checkoutFormData.honeypot) {
            // console.warn('Bot detected - aborting submission');
            return;
        }
        e.preventDefault() // PREVENTS PAGE RELOAD WHEN FORM IS SUBMITTED
        setIsLoading(true)

        const paystack = new PaystackPop();

        const totalAmount = Math.floor(Number(convertedAmount) * 100);

        paystack.newTransaction({
            key: process.env.REACT_APP_PAYSTACK_KEY,
            email: checkoutFormData.email,
            amount: totalAmount,
            currency: currency,
            metadata: {
                name: `${tripleChiUserDetails.firstName || checkoutFormData.firstName} ${tripleChiUserDetails.lastName || checkoutFormData.lastName}`,
                phone: tripleChiUserDetails.phoneNumber || checkoutFormData.phoneNumber,
                address: tripleChiUserDetails.address || checkoutFormData.address,
            },
            onSuccess: async (transaction) => {
                // console.log('Payment Success:', transaction); DEBUGGING
                //transaction IS CALLED transactionRef IN FORM.JS
                
                // OBJECTS THAT WILL BE SENT TO THE BACKEND
                const emailPayload = {
                    userDetails: {
                        firstName: checkoutFormData.firstName,
                        lastName: checkoutFormData.lastName,
                        email: checkoutFormData.email,
                        phoneNumber: checkoutFormData.phoneNumber,
                        country: checkoutFormData.country,  
                        state: checkoutFormData.state, 
                        address: checkoutFormData.address
                    },
                    cartItems: cartItems, // Already stored in state
                    transactionReference: transaction.reference,
                    totalAmount: currency === "USD"
                        ? `$${(amountPayable).toFixed(2)}`
                        : `₦${(amountPayable * exchangeRate).toLocaleString()}`
                };
                // http://localhost:5000/send-checkout-email(FOR DEV), https://triplechi-store.onrender.com/send-checkout-email(FOR PRODUCTION)
                try {
                    const response = await fetch('https://triplechi-store.onrender.com/send-checkout-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(emailPayload)
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // console.log('Email sent successfully:', data); DEBUGGING
                    } else {
                        console.error('Email failed to send:', data);
                    }
                } catch (error) {
                    console.error('Error sending email:', error);
                }
                
                // CLEAR CART EVERYWHERE
                clearCartData(tripleChiUser)

                setIsLoading(false)

                // RELOAD TO SHOP
                window.location.href = "/shop";
            },
            onCancel: () => {
                setIsLoading(false)
                console.log("Payment Canclled");
            }
        });
    };



    // CHECKS IF FORM IS COMPLETE
    const isFormComplete =
        checkoutFormData.firstName.trim() &&
        checkoutFormData.lastName.trim() &&
        checkoutFormData.email.trim() &&
        checkoutFormData.phoneNumber.trim() &&
        checkoutFormData.address.trim() &&
        selectedCountry &&
        selectedState;

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
                    <form className="form user-details-form"  /**onSubmit={handlePaystackCheckout}**/>
                        <h2>Check/Update Your Shipping Info</h2>
                        <input required name='First Name' type="text" placeholder="First Name" defaultValue={tripleChiUserDetails.firstName || checkoutFormData.firstName} onChange={(e) => setCheckoutFormData ({...checkoutFormData, firstName: e.target.value})} />

                        <input required name='Last Name' type="text" placeholder="Last Name" defaultValue={tripleChiUserDetails.lastName || checkoutFormData.lastName} onChange={(e) => setCheckoutFormData ({...checkoutFormData, lastName: e.target.value})} />

                        <input required name='Email' type="email" placeholder="Email" defaultValue={tripleChiUserDetails.email || checkoutFormData.email} onChange={(e) => setCheckoutFormData ({...checkoutFormData, email: e.target.value})} />

                        <input required name='Telephone' type="tel" placeholder="Phone Number" defaultValue={tripleChiUserDetails.phoneNumber || checkoutFormData.phoneNumber} onChange={(e) => setCheckoutFormData ({...checkoutFormData, phoneNumber: e.target.value})} />

                        {/* HONEYPOT */}
                        <input
                            type="text"
                            name="website" // A name that bots are likely to fill
                            style={{ display: 'none' }}
                            tabIndex="-1"
                            autoComplete="off"
                            value={checkoutFormData.honeypot || ''}
                            onChange={(e) =>
                                setCheckoutFormData({ ...checkoutFormData, honeypot: e.target.value })
                            }
                        />

                        <div className="location-select">
                            <select name='Country' 
                                value={selectedCountry} 
                                onChange={(e) => { 
                                    setSelectedCountry(e.target.value); 
                                    setSelectedCountryCode(e.target.selectedOptions[0].dataset.code) 
                                }} 
                                required
                            >
                                <option value="">Select Your Country</option>
                                {countryList.map((country) => (
                                    <option key={country.isoCode} value={country.name} data-code={country.isoCode}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>

                            <select name='State' value={selectedState} onChange={(e) => setSelectedState(e.target.value)} required>
                                <option value="">Select Your State</option>
                                {stateList.map((state) => (
                                    <option key={state.isoCode} value={state.name}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>

                        </div>
                        
                        {isCountrySelected && (
                            <p className="tiny"style={{
                                margin: 0,
                                fontWeight: "bold"
                            }}>Shipping cost has been updated!</p>
                        )}

                        <textarea required name='Address' placeholder="Address" defaultValue={tripleChiUserDetails.address || checkoutFormData.address} onChange={(e) => setCheckoutFormData ({...checkoutFormData, address: e.target.value})} ></textarea>

                        <button type='submit' className="button checkout-button" disabled={!isFormComplete} onClick={handlePaystackCheckout} >
                            {isLoading ? 'Processing...' : 'Complete Purchase'}
                        </button>
                    </form> 
                </div>
            </div>
            <Footer />
        </div>
     );
}

export default Checkout;