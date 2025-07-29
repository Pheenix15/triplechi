import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { database, auth } from './firebase';
import { ref, onValue } from 'firebase/database';
// import { PaystackPop } from "@paystack/inline-js";
import './Checkout.css'

function Checkout () {

    const [cartItems, setCartItems] = useState([]);
    const [tripleChiUser, setTripleChiUser] = useState(null);
    const [userDetails, setUserDetails] = useState({});

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
            if (data) setUserDetails(data);
        });
        } else return;
    }, [tripleChiUser]);

    // RETRIVES CART FROM LOCALSTORAGE
    useEffect(() => {
        const usersCart = localStorage.getItem("tripleChiCart");
        if (usersCart) {
        const parsedUsersCart = JSON.parse(usersCart);
        setCartItems(parsedUsersCart);
        // calculateTotal(parsedUsersCart);
        }
    }, []);

    return ( 
        <div className="checkout">
            {/* Left side: Cart summary */}
            <div className="checkout-cart-summary">
                <h2>Order Summary</h2>
                {cartItems.map((item, index) => (
                <div key={index} className="checkout-cart-item">
                    <div className="checkout-cart-image"><img src={item.image} alt={item.name} /></div>
                    <div className='checkout-cart-details' >
                        <div className="checkout-cart-details-name">
                            <p>{item.name}</p>
                        </div>
                        <div className="checkout-cart-details-specs">
                            <p>{item.size}</p>
                            <p>{item.quantity}</p>
                        </div>
                    </div>
                    <div className="checkout-cart-price"><p>${item.price}</p></div>
                </div>
                ))}
                <hr />
                {/* <h3>Total: ${totalAmount.toFixed(2)}</h3> */}
            </div>

            <form className="user-details-form">
                <h2>Delivery Info</h2>
                <input type="text" placeholder="First Name" defaultValue={userDetails.firstName || ""} />
                <input type="text" placeholder="Last Name" defaultValue={userDetails.lastName || ""} />
                <input type="email" placeholder="Email" defaultValue={userDetails.email || ""} />
                <input type="tel" placeholder="Phone Number" defaultValue={userDetails.phoneNumber || ""} />
                <textarea placeholder="Address" defaultValue={userDetails.address || ""}></textarea>

                <button type="button" className="button checkout-button">
                    Complete Purchase
                </button>
            </form>
        </div>
     );
}

export default Checkout;