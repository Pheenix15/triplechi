import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, remove, update } from 'firebase/database';
import { auth, database } from './firebase';
import Nav from './Nav';
import Footer from './Footer';
import './Cart.css'
import { onAuthStateChanged } from 'firebase/auth';

function Cart() {
    const [tripleChiUser, setTripleChiUser] = useState(null)
    const [cartItems, setCartItems] = useState([])// CART IS INITIALLY EMPTY
    const [failAlert, setFailAlert] = useState(''); //STATE FOR ERROR ALERTS
    const [successAlert, setSuccessAlert] = useState('')


    // CHECKS IF USER IS LOGGED IN
    useEffect(() => {
        const removeUserListner = onAuthStateChanged(auth, (currentUser) => {
            setTripleChiUser(currentUser)
        });
        return () => removeUserListner //STOP CHECKING FOR USER
    }, [])


    // RETRIVES CART FROM DATABASE
    useEffect(() => {
        if (!tripleChiUser) return;

        const cartRef = ref(database, `ShoppingCart/${tripleChiUser.uid}`);
        
        const removeCartListner = onValue(cartRef, (snapshot) => {
            const cartData = snapshot.val();

            if (cartData) {
                const items = Object.entries(cartData).map(([key, value]) => ({
                    ...value,
                    shoppingCartKey: key, //KEY FOR EACH CARTITEM
                }));
                setCartItems(items);
            } else {
                setCartItems([]); //FOR WHEN CART IS EMPTY
            }
        });

        return () => removeCartListner();
    }, [tripleChiUser]);

    // REMOVE CARTITEMS FROM DATABASE AND UI
    const handleDelete = async (shoppingCartKey) => {

        if(!tripleChiUser) return;
        try {
            await remove(ref(database, `ShoppingCart/${tripleChiUser.uid}/${shoppingCartKey}`));
            setSuccessAlert("The item has been removed from your cart")
            setTimeout(() => setSuccessAlert(""), 3000)
        } catch (err) {
            setFailAlert(`Unable to delete item: ${err.message}`);
            setTimeout(() => setFailAlert(""), 3000)
        }
    }

    // UPDATE LOCALSTORAGE WHEN CART CHANGES
    // useEffect(() => {
    //     localStorage.setItem('cart', JSON.stringify(cartItems))
    // }, [cartItems])

    // CART QUANTITY CHANGE
    const handleCartQuantityChange = (index, type) => {
        // SET setCartItems TO THE CURRENT STATE OF THE CART (prevItems), LOOP THROUGH EACH ITEM TO GET THE item AND ITS INDEX (i)
        setCartItems(prevItems => 
          prevItems.map((item, i) => {
            if (i === index) {
                let newQuantity = type === 'increase' ? item.quantity + 1 : Math.max(1, item.quantity -1); //MAKES SURE QUANTITY DOES NOT GO BELOW 1

                //UPDATE QUANTITY IN DATABASE
                if (tripleChiUser && item.shoppingCartKey) {
                const itemRef = ref(database, `ShoppingCart/${tripleChiUser.uid}/${item.shoppingCartKey}`);
                    update(itemRef, { quantity: newQuantity })
                    .then (() => {
                        setSuccessAlert("Cart updated successfully")

                        setTimeout(() => setSuccessAlert(""), 3000);
                    })
                    .catch((err) => {
                        console.error("Failed to update quantity in DB:", err.message);
                        setFailAlert("Failed to update quantity");

                        setTimeout(() => setFailAlert(""), 3000)
                    });
                }

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
            <Nav />
            {/* DISPLAY ALERTS */}
            {successAlert && (
                <div className="alert success-alert">{successAlert}</div>
            )}

            {failAlert && (
                <div className="alert fail-alert">{failAlert}</div>
            )}

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

                                            <button className=" delete-btn" onClick={() => handleDelete(item.shoppingCartKey)} >
                                                <i className="fa-solid fa-trash"></i>
                                                Remove
                                            </button>
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
            <Footer />
        </div>
     );
}

export default Cart;