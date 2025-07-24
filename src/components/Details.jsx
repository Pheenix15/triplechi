import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth, database } from './firebase';
import { getDatabase, ref, get, push, set } from 'firebase/database';
import Nav from './Nav';
import Footer from './Footer';
import './Details.css';


function Details() {
    const { id } = useParams(); // GETS THE PRODUCT ID FROM SHOP
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]); // SIMILAR PRODUCT
    const [displayedImage, setDisplayedImage] = useState(null); //SET DISPLAYED IMAGE TO THE CLICKED PRODUCT
    const [size, setSize] = useState(null);
    const [failAlert, setFailAlert] = useState(''); //STATE FOR ERROR ALERTS
    const [successAlert, setSuccessAlert] = useState('') //STATE FOR SUCCESS ALERTS

    const variations = ['S', 'M', 'L', 'XL', 'XXL'];


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

    // GETTING SIMILAR PRODUCTS FROM THE DATABASE

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
        return <p>Loading...</p>
    } else if (!product && failAlert) {
        return <p>{failAlert}</p>
    }

    

    // CHECKS THE VALUE OF STOCK IN DATABASE
    function getStockStatus(stock) {
        if (stock > 10) return "In stock";
        if (stock > 0) return "Few quantities left";
        return "Out of stock"
    }

    //ADD TO CART

    const handleAddToCart = async () => {
        const tripleChiUser = auth.currentUser

        // CLEARS ANY PREVIOUS ALERTS
        setSuccessAlert("");
        setFailAlert("");

        // CHECKS THAT USER IS LOGGED IN
        if (!tripleChiUser) {
            setFailAlert("you must be logged in to add items to your cart.")
            setTimeout(() => setFailAlert(''), 3000)
            return;
        }


        // GETS REF TO USERS CART LOCATION IN THE DATABASE
        const userCartRef = ref(database, `ShoppingCart/${tripleChiUser.uid}`);

        try {
            const snapshot = await get(userCartRef);
            const userCartData = snapshot.val();

            // RUNS THROUGH USERCARTDATA AND CHECKS FOR DUPLICATE (LIKE A FOR LOOP)
            const isDuplicate = userCartData ? Object.values(userCartData).some(item => item.id === id && item.size === size) : false;

            if(isDuplicate) {
                setFailAlert("Item already in cart")
                setTimeout(() => setFailAlert(""), 3000)
                return;
            }

            //DETAILS TO BE ADDED TO CART
            const cartItem = {
                id,
                name: product.name,
                price: product.price,
                size,
                image: displayedImage,
                quantity: 1,
                unixTimestamp: Date.now(),
                addedAt: new Date().toLocaleString(),
            }

            // PUSH ITEMS TO SHOPPINGCART DATABASE
            const newUserCartRef = push(userCartRef);
            await set(newUserCartRef, cartItem);

            setSuccessAlert("Item added to cart");
            setTimeout(() => setSuccessAlert(""), 3000)
        } catch (err) {
            setFailAlert("Failed to add item: " + err.message);
            setTimeout(() => setFailAlert(""), 3000);
        }


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
                            <p className="product-detail-description">{product.name}</p>
                            <p className="product-detail-price">&#8358;{product.price}</p>
                            <p className={product.stock === 0 ? "outOfStock" : "inStock"}>
                                {getStockStatus(product.stock)}
                            </p>
                        </div>

                        <div className="product-size">
                            <p className='variation-text'>VARIATIONS:</p>
                            <div className="variations">
                                {variations.map((value) => (
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
                                    <p className="similar-product-card-description" >{similarProduct.description}</p>

                                    <p className="similar-product-card-price">&#8358;{similarProduct.price}</p>
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