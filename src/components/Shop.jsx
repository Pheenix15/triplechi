import { database } from "./firebase";
import { ref, onValue } from "firebase/database";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import './Shop.css'


function Shop() {

    const [shopProduct, setShopProduct] = useState([]);//PRODUCTS FROM FIREBASE

    useEffect(() => {
        // REF TO FIREBASE REALTIME DATABASE
        const productRef = ref(database, 'Product');

        // RETRIVE DATA FROM DATABASE
        const productInDB = onValue(productRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {

                //CONVERTS FIREBASE OBJECT INTO ARRAY OF [KEY, VALUE] PAIRS
                const productArray = Object.entries(data).map(([id, value]) => ({
                    id,
                    ...value
                }));

                setShopProduct(productArray);
            } else {
                setShopProduct([]);
            }
        });

        // Clean up the listener on unmount
        return () => productInDB();
    }, []);


    return ( 
        <div className="shop">
            <Nav />
            <div className="product-list-container">

                <div className="product-list">
                    {shopProduct.map((product) => (
                        <div className="mapped-product-container" key={product.id} >
                            <div className="product-box" >
                                <div className="product-image">
                                    <img src= {product.image} alt={product.description} />
                                </div>
                                
                                <p className="product-description" >{product.description}</p>
                                <p className="product-price">&#8358;{product.price}</p>
                            </div>
                            

                            {/* ADD TO CART BUTTON */}
                            <Link
                                key={product.id}
                                to={`/Details/${product.id}`}
                                className="add-to-cart-link"
                            >
                                <button className="button add-to-cart-btn">Add to Cart</button>
                            </Link>
                            
                        </div>
                    ))}
                </div>

            </div>
            <Footer />
        </div>
     );
}

export default Shop;