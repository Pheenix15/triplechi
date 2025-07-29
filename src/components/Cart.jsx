import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, remove, set, get } from 'firebase/database';
import { auth, database } from './firebase';
import { useCurrency } from '../context/CurrencyContext';
import Nav from './Nav';
import Footer from './Footer';
import './Cart.css'
// import { sendCheckoutEmail } from './form';
import { onAuthStateChanged } from 'firebase/auth';
import CurrencySwitcher from '../context/CurrencySwitcher';

function Cart() {
    const [tripleChiUser, setTripleChiUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true); //LOADING STATE
    const [cartItems, setCartItems] = useState([])// CART IS INITIALLY EMPTY
    const [failAlert, setFailAlert] = useState(''); //STATE FOR ERROR ALERTS
    const [successAlert, setSuccessAlert] = useState('')


    //FUNCTION FOR LOCALSTORAGE
    const getCartFromLocalStorage = () => {
        try {
            const cart = localStorage.getItem('tripleChiCart');
            return cart ? JSON.parse(cart) : [];
        } catch (error) {
            console.error('Error parsing cart from localStorage:', error);
            return [];
        }
    };

    const saveCartToLocalStorage = (items) => {
        try {
            localStorage.setItem('tripleChiCart', JSON.stringify(items));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    };

    // SYNC LOCALSTORAGE TO DB
    const syncLocalCartToDatabase = async (items) => {
        if (tripleChiUser) {
            try {
                const cartRef = ref(database, `ShoppingCart/${tripleChiUser.uid}`);
                
                // Simple approach: replace entire cart structure
                if (items.length === 0) {
                    // If cart is empty, remove the entire cart node
                    await remove(cartRef);
                } else {
                    // Create cart object with proper keys
                    const cartObject = {};
                    items.forEach((item, index) => {
                        // Use existing shoppingCartKey or create a new one based on item properties
                        const itemKey = item.shoppingCartKey || `${item.name}_${item.size}_${index}`.replace(/\s+/g, '_');
                        cartObject[itemKey] = {
                            name: item.name,
                            price: item.price,
                            image: item.image,
                            size: item.size,
                            quantity: item.quantity
                        };
                    });
                    
                    // Set the entire cart at once
                    await set(cartRef, cartObject);
                }
            } catch (error) {
                console.error('Error syncing cart to database:', error);
            }
        }
    };

    // const clearLocalStorageCart = () => {
    //     localStorage.removeItem('tripleChiCart');
    // };

    // CHECKS IF USER IS LOGGED IN
    useEffect(() => {
        const UserListner = onAuthStateChanged(auth, (currentUser) => {
            setTripleChiUser(currentUser)
        });
        return () => UserListner //STOP CHECKING FOR USER
    }, [])

    // LOAD CART FROM DATABASE (FOR WHEN LOCALSTORAGE IS EMPTY)
    const loadCartFromDatabase = async () => {
        if (tripleChiUser) {
            try {
                const cartRef = ref(database, `ShoppingCart/${tripleChiUser.uid}`);
                const snapshot = await get(cartRef);

                if (snapshot.exists()) {
                    const cartData = snapshot.val();
                    const items = Object.entries(cartData).map(([key, value]) => ({
                        ...value,
                        shoppingCartKey: key  //KEY FOR EACH CART ITEM
                    }));

                    setCartItems(items);

                    // SAVE TO LOCALSTORAGE FOR FASTER ACCESS
                    saveCartToLocalStorage(items);
                } else {
                    setCartItems([]);
                }
            } catch (error) {
                console.error('Error loading cart from database:', error)
                setFailAlert(`Error loading cart from database: ${error}`)

                setTimeout(() => {
                    setFailAlert('')
                }, 3000);
            }
        } else {
            setCartItems([]);
        }
    }


    // RETRIVES CART FROM LOCALSTORAGE THEN DATABASE(DB) IF LOCALSTORAGE IS EMPTY
    useEffect(() => {
        const loadCart = async () => {
            setIsLoading(true);

            // LOAD FROM LOCALSTORAGE FIRST
            const localCart = getCartFromLocalStorage();

            if(localCart.length > 0) {
                setCartItems(localCart);

                //IF USER LOGS-IN/IS LOGGED-IN, SYNC TO DB AS BACKUP
                if(tripleChiUser) {
                    await syncLocalCartToDatabase(localCart);
                }
            } else if (tripleChiUser && localCart.length === 0) {
                // IF USER LOGGED IN AND LOCALSTORAGE IS EMPTY LOAD FROM DB
                await loadCartFromDatabase();
            } else {
                setCartItems([])
            }

            setIsLoading(false);
        };

        loadCart()
    }, [tripleChiUser, loadCartFromDatabase, syncLocalCartToDatabase]);

    // REMOVE CARTITEMS FROM DATABASE AND UI
    const handleDelete = async (index) => {
        try {
            const updatedItems = cartItems.filter((_, i) => i !== index);
            setCartItems(updatedItems);
            
            // Update localStorage
            saveCartToLocalStorage(updatedItems);
            
            // Update database if user is logged in
            if (tripleChiUser) {
                await syncLocalCartToDatabase(updatedItems);
            }
            
            setSuccessAlert("The item has been removed from your cart")
            setTimeout(() => setSuccessAlert(""), 3000)
        } catch (err) {
            setFailAlert(`Unable to delete item: ${err.message}`);
            setTimeout(() => setFailAlert(""), 3000)
        }
    }


    // CART QUANTITY CHANGE
    const handleCartQuantityChange = async (index, type) => {
        try {
            const updatedItems = cartItems.map((item, i) => {
                if (i === index) {
                    const newQuantity = type === 'increase' ? item.quantity + 1 : Math.max(1, item.quantity - 1);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });

            setCartItems(updatedItems);
            
            // Update localStorage
            saveCartToLocalStorage(updatedItems);
            
            // Update database if user is logged in
            if (tripleChiUser) {
                await syncLocalCartToDatabase(updatedItems);
            }

            setSuccessAlert("Cart updated successfully");
            setTimeout(() => setSuccessAlert(""), 3000);
        } catch (error) {
            console.error("Failed to update quantity:", error);
            setFailAlert("Failed to update quantity");
            setTimeout(() => setFailAlert(""), 3000);
        }
    }


    // CALCULATE CART SUBTOTAL
    const calculateSubtotal = () => {
        return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }
    
    


    //PAYSTACK CHECKOUT
    // const handlePaystackCheckout = () => {
    //     const paystack = new PaystackPop();

    //     const totalAmount = Math.floor(Number(calculateSubtotal()) * 100);
    //     console.log('Paystack amount:', totalAmount, typeof totalAmount);

    //     paystack.newTransaction({
    //         key: process.env.REACT_APP_PAYSTACK_KEY,
    //         email: tripleChiUserDetails.email,
    //         amount: totalAmount,
    //         metadata: {
    //             name: `${tripleChiUserDetails.firstName} ${tripleChiUserDetails.lastName}`,
    //             phone: tripleChiUserDetails.phoneNumber,
    //             address: tripleChiUserDetails.address,
    //         },
    //         onSuccess: (transaction) => {
    //             console.log(`Payment Success: ${transaction}`);
    //             sendCheckoutEmail(tripleChiUserDetails, cartItems, transaction, totalAmount)
    //             //transaction IS CALLED transactionRef IN FORM.JS
    //         },
    //         onCancel: () => {
    //             console.log("Payment Canclled");
    //         }
    //     });
    // };

    // CURRENCY SWITCHING
    const Price = ({ amountInDollars }) => {
        const { currency, exchangeRate } = useCurrency();

        const displayAmount =
            currency === "NGN"
                ? `₦${(amountInDollars * exchangeRate).toLocaleString()}`
                : `$${amountInDollars.toFixed(2)}`;

        return <span>{displayAmount}</span>;
    };

    // LOADING SCREEN
    if (isLoading) {
        return (
            <div className="cart">
                <Nav />
                <div className="loading">Loading cart...</div>
                <Footer />
            </div>
        );
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
            

            <div className="cart-content">
                {/* CURRENCY SWITCHER */}
                <CurrencySwitcher /> 
                <h2 className="cart-heading">Your Cart</h2>
                {cartItems.length === 0 ? (
                    // CART IS EMPTY
                    <div className="empty-cart">
                        <p>Your cart is empty</p>

                        <Link to={'/Shop'} ><button className='button back-to-shop-button'>Back to Shop</button></Link>
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

                                            <button className=" delete-btn" onClick={() => handleDelete(index)} >
                                                <i className="fa-solid fa-trash"></i>
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cart-item-price">
                                        {/* toLocaleString() USES LOCALE SPECIFIC SEPERATORS eg 20,000 */}
                                        <p><Price amountInDollars={item.price * item.quantity}/></p>

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
                                <p><strong><Price amountInDollars={calculateSubtotal()}/></strong> </p>
                                
                            </div>

                            <p className='notice'>Delivery fees not included yet</p>
                            
                            <Link to={'/Checkout'} ><button type='button' className='button checkout-button'>Checkout</button></Link>
                        </div>
                    </div>
                )}
            </div>    
            <Footer />
        </div>
     );
}

export default Cart;