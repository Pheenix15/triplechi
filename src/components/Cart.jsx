import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Cart.css'

function Cart() {
    const [cartItems, setCartItems] = useState([])// CART IS INITIALLY EMPTY

    // RETRIVES CART FROM LOCALSTORAGE
    useEffect(() => {
        const cartData = JSON.parse(localStorage.getItem('cart', )) || [];

        setCartItems(cartData);
    }, [])

    // UPDATE LOCALSTORAGE WHEN CART CHANGES
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems))
    }, [cartItems])

    // CART QUANTITY CHANGE
    const handleCartQuantityChange = (index, type) => {
        // SET setCartItems TO THE CURRENT STATE OF THE CART (prevItems), LOOP THROUGH EACH ITEM TO GET THE item AND ITS INDEX (i)
        setCartItems(prevItems => 
          prevItems.map((item, i) => {
            if (i === index) {
                let newQuantity = type === 'increase' ? item.quantity + 1 : Math.max(1, item.quantity -1); //MAKES SURE QUANTITY DOES NOT GO BELOW 1

                return{ ...item, quantity: newQuantity };
            }
            return item;
          })  
        )
    }

    // CALCULATE CART SUBTOTAL
    const calculateSubtotal = () => {
        return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }

    return ( 
        <div className="cart">
            <h2 className="cart-heading">Your Cart</h2>

            <div className="cart-content">
                {cartItems.length === 0 ? (
                    // CART IS EMPTY
                    <div className="empty-cart">
                        <p>Your cart is empty</p>

                        <Link to={'/Shop'} ><button className='button'>Back to Shop</button></Link>
                    </div>
                    
                ) : (
                    // ITEMS IN CART
                    <div className="items-in-cart-container">
                        <div className="items-in-cart">
                            {cartItems.map((item, index) => (
                                <div key={index} className="cart-item">
                                    <div className="cart-item-holder">
                                        <div className="cart-item-image">
                                            <img src={item.image} alt={item.name} />
                                        </div>

                                        <div className="cart-item-details">
                                            <p className='heading' >{item.name}</p>
                                            <p className='size' >Size: {item.size}</p>
                                        </div>
                                    </div>

                                    <div className="cart-item-price">
                                        {/* toLocaleString() USES LOCALE SPECIFIC SEPERATORS eg 20,000 */}
                                        <p>&#8358;{(item.price * item.quantity).toLocaleString()}</p>

                                        <div className="cart-item-quantity">
                                            <button
                                                style={{
                                                    color: item.quantity === 1 ? 'red' : 'black',
                                                }}
                                                disabled={item.quantity === 1}
                                                onClick={() => handleCartQuantityChange(index, 'decrease') } 
                                             >
                                                <i className="fa-solid fa-square-minus"></i>
                                            </button>

                                            <span>{item.quantity}</span>

                                            <button
                                             onClick={() => handleCartQuantityChange(index, 'increase')} >
                                                <i className="fa-solid fa-square-plus"></i>
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>

                        {/* SIDE BAR */}

                        <div className="side-bar">
                            <h3 className='side-bar-heading' >Cart Summery</h3>
                            <div className="subtotal">
                                <p><strong>Subtotal:</strong></p>
                                <p><strong>&#8358;{calculateSubtotal().toLocaleString()}</strong> </p>
                                
                            </div>

                            <p className='notice'>Delivery fees not included yet</p>
                            <button className='button checkout-button'>Checkout</button>
                        </div>
                    </div>
                )}
            </div>    
            
        </div>
     );
}

export default Cart;