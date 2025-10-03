import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth, database } from './firebase';
import { getDatabase, ref, get, update, remove } from 'firebase/database';
import { useCurrency } from '../context/CurrencyContext';
import Nav from './Nav';
import Footer from './Footer';
import './Details.css';
import Loading from './Loading';


function Details() {
    const { id } = useParams(); // GETS THE PRODUCT ID FROM SHOP
    const [product, setProduct] = useState(null); //CLICKED PRODUCT FROM SHOP
    const [quantity, setQuantity] = useState(1) //SET QUANTITY OF THE PRODUCT
    const [similarProducts, setSimilarProducts] = useState([]); // SIMILAR PRODUCT
    const [displayedImage, setDisplayedImage] = useState(null); //SET DISPLAYED IMAGE TO THE CLICKED PRODUCT
    const [size, setSize] = useState(null);
    const [failAlert, setFailAlert] = useState(''); //STATE FOR ERROR ALERTS
    const [successAlert, setSuccessAlert] = useState('') //STATE FOR SUCCESS ALERTS


    // GETS THE CLICKED ITEM
    useEffect(() => {
        const db = getDatabase();
        const productRef = ref(db, `Product/${id}`); //REF TO DATABASE PRODUCT ID

        get(productRef)
            .then(snapshot => {
                if (snapshot.exists()) {
                    setProduct(snapshot.val());
                } else {
                    console.log('ITEM NOT FOUND')
                }
            })
        .catch(err => setFailAlert(err));
        setTimeout(() => setFailAlert(''), 3000);

    }, [id]);

    // GETS SIMILAR PRODUCTS FROM THE DATABASE
    useEffect(() => {
        const db = getDatabase();
        const productRef = ref(db, 'Product');

        get(productRef)
            .then(snapshot => {
                if (snapshot.exists()) {

                    const allProduct = snapshot.val(); //GETS ALL PRODUCT FROM DB
                    const arrayOfAllProduct = Object.entries(allProduct).map(([key, value]) => ({
                        id: key,
                        ...value
                    })); //CONVERTS THE RETRIVED PRODUCT TO ARRAY

                    //FILTER OUT ID OF PRODUCT SELECTED IN SHOP
                    const filtered = arrayOfAllProduct.filter(p => p.id !== id);

                    //SELECT RANDOM 4
                    const randomProduct = filtered.sort(() => 0.5 - Math.random());
                    const randomFour = randomProduct.slice(0, 4);

                    setSimilarProducts(randomFour);
                }
            })
            .catch(err => setFailAlert(err));
            setTimeout(() => setFailAlert(''), 3000)
    }, [id])

    // FOR CHANGING THE DISPLAYED IMAGE
    useEffect(() => {
        // PREVENTS PRODUCT.IMAGE FROM BEING ACCESED WHEN IT IS STILL NULL
        if (product) {
            setDisplayedImage(product.image)
        }
    }, [product]);


    if (!product) {
        return <Loading />
    } else if (!product && failAlert) {
        return <p>{failAlert}</p>
    }

    

    // CHECKS THE VALUE OF STOCK IN DATABASE
    function getStockStatus(stock) {
        if (stock > 10) return "In stock";
        if (stock > 0) return "Few quantities left";
        return "Out of stock"
    }

///////ADD TO CART

    const handleAddToCart = async () => {
        const tripleChiUser = auth.currentUser

        // CLEARS ANY PREVIOUS ALERTS
        setSuccessAlert("");
        setFailAlert("");

        // SAVE CART TO LOCALSTORAGE
        const getCartFromLocalStorage = () => {
            try {
                const cart = localStorage.getItem('tripleChiCart');
                return cart ? JSON.parse(cart) : [];
            } catch (error) {
                // console.error('Error parsing cart from localStorage:', error);
                return [];
            }
        };

        const saveCartToLocalStorage = (items) => {
            try {
                localStorage.setItem('tripleChiCart', JSON.stringify(items));
            } catch (error) {
                // console.error('Error saving cart to localStorage:', error);
            }
        };

        // SYNC LOCAL CART TO DATABASE (for logged-in users)
        const syncCartToDatabase = async (cartItems) => {
            if (tripleChiUser) {
                try {
                    // email@provider.com NOT SUPPORTED FOR KEYS, SO CONVERT TO email@provider_com
                    const userEmail = tripleChiUser.email.replace(/\./g, "_");

                    // if (!userEmail) {
                    //     console.log("Email is missing, can't save cart under email path.");
                    // } else {console.log(userEmail)}

                    //SET USER UID AND USER EMAIL AS KEYS FOR CART (NOTE: ShoppingCart DOES NOT EXIST IN DB UNTIL A LOGGEDIN USER ADDS ITEM TO THEIR CART)
                    const cartRef = ref(database, `ShoppingCart/${tripleChiUser.uid}/${userEmail}`);
                    
                    if (cartItems.length === 0) {
                        await remove(cartRef);
                    } else {
                        const cartObject = {};
                        cartItems.forEach((item, index) => {
                            const itemKey = item.shoppingCartKey || `${item.name}_${item.size}_${index}`.replace(/\s+/g, '_');
                            cartObject[itemKey] = {
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                size: item.size,
                                image: item.image,
                                quantity: item.quantity,
                                unixTimestamp: item.unixTimestamp || Date.now(),
                                addedAt: item.addedAt || new Date().toLocaleString(),
                            };
                        });
                        await update(cartRef, cartObject);
                    }
                } catch (error) {
                    // console.error('Error syncing cart to database:', error);

                }
            }
        };

        try {
            // GET CURRENT CART FROM LOCALSTORAGE
            const currentCart = getCartFromLocalStorage();

            // CHECK FOR DUPLICATE ITEMS (same id and size)
            const isDuplicate = currentCart.some(item => item.id === id && item.size === size);

            if (isDuplicate) {
                setFailAlert("Item already in cart");
                setTimeout(() => setFailAlert(""), 3000);
                return;
            }

            const cartItem = {
                id,
                name: product.name,
                price: product.price,
                size,
                image: displayedImage,
                quantity: quantity,
                unixTimestamp: Date.now(),
                addedAt: new Date().toLocaleString(),
                // Don't add shoppingCartKey here - it will be added when syncing to database
            };

            // ADD ITEM TO CART ARRAY
            const updatedCart = [...currentCart, cartItem];

            // SAVE TO LOCALSTORAGE
            saveCartToLocalStorage(updatedCart);

            // SYNC TO DATABASE IF USER IS LOGGED IN
            if (tripleChiUser) {
                await syncCartToDatabase(updatedCart);
            }

            // UPDATE PRODUCT STOCK IN DATABASE
            const updatedStock = product.stock - quantity;
            const productRef = ref(database, `Product/${id}`);
            await update(productRef, { stock: updatedStock });

            // SUCCESS MESSAGE
            
            setSuccessAlert("Item added to cart");
            
            setTimeout(() => setSuccessAlert(""), 3000);

        } catch (err) {
            setFailAlert("Failed to add item: " + err.message);
            setTimeout(() => setFailAlert(""), 3000);
        }

    };
////////

    // CURRENCY SWITCHING
    const Price = ({ amountInDollars }) => {
        const { currency, exchangeRate } = useCurrency();

        const displayAmount =
            currency === "NGN"
                ? `₦${(amountInDollars * exchangeRate).toLocaleString()}`
                : `$${amountInDollars.toFixed(2)}`;

        return <span>{displayAmount}</span>;
    };

    return ( 
        <div className="product-detail-page">
            <Nav />

            {/* DISPLAY ALERTS */}
            {successAlert && (
                <div className="alert success-alert">{successAlert}</div>
            )}

            {failAlert && (
                <div className="alert fail-alert">{failAlert}</div>
            )}

            <div className="product-detail-container">
                <div className="product-detail">
                    <div className="product-detail-image-container">
                        <div className="product-detail-image">
                            <img src={displayedImage} alt={product.description} />
                        </div>

                        <div className="image-variation">
                            {product.imageVariants.map((imageVariant, index) => (
                                <div
                                    key={index} 
                                    className="image-thumbnails"
                                    onClick={() => setDisplayedImage(imageVariant)}
                                    >
                                        <img src={imageVariant} alt={`Thumbnail ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="details-section">
                        <div className="product-detail-details">
                            <p className="product-detail-name">{product.name}</p>
                            <p className="product-detail-description">{product.description}</p>
                            {/* SET QUANTITY */}
                            <div className="update-quantity">
                                <p>Quantity:</p>
                                <input
                                type="number"
                                min="1"
                                max={product.stock} // optional: prevent selecting more than in stock
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                />
                            </div>
                            
                            <p className="product-detail-price"><Price amountInDollars={product.price * quantity}/></p>
                            <p className={product.stock === 0 ? "outOfStock" : "inStock"}>
                                {getStockStatus(product.stock)}
                            </p>
                        </div>

                        <div className="product-size">
                            <p className='variation-text'>VARIATIONS:</p>
                            <div className="variations">
                                {product.availableSizes.map((value) => (
                                    <div
                                        key={value}
                                        onClick={() => setSize(value)}
                                        style={{
                                            margin: '0 5px',
                                            padding: '10px 20px',
                                            backgroundColor: size === value ? 'black' : 'white',
                                            color: size === value ? 'white' : 'black',
                                            boxShadow: size === value ? 'none' : '0px 0px 2px 0px purple',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {value}
                                    </div>
                                ))}
                            </div>
                            
                        </div>

                        <div className="cart-btn-section">
                            <button className="button add-to-cart-btn" onClick={handleAddToCart} disabled={product.stock === 0} style={{
                                backgroundColor: product.stock === 0 ? 'Red' : 'black',
                                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                            }} >
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>

                    
                    
                </div>
                

                {/* SIMILAR PRODUCTS */}
                <div className="similar-product">
                    <h3>Similar Product</h3>

                    <div className="similar-product-list">
                        {similarProducts.map((similarProduct) => (
                            <div key={similarProduct.id} className="similar-product-card">
                                <Link to={`/Details/${similarProduct.id}`}>
                                <div className="similar-product-card-image">
                                    <img src={similarProduct.image} alt={similarProduct.description} />
                                </div>

                                <div className="similar-product-card-details">
                                    <p className="similar-product-card-description" >{similarProduct.name}</p>

                                    <p className="similar-product-card-price"><Price amountInDollars={similarProduct.price}/></p>
                                </div>
                                
                                </Link>

                            </div>
                        ))}
                    </div>
                </div>
            </div>
        
            <Footer />
        </div>
     );
}

export default Details;