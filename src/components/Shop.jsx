import { database } from "./firebase";
import { ref, onValue } from "firebase/database";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import Nav from "./Nav";
import Footer from "./Footer";
import './Shop.css'
import Loading from "./Loading";


function Shop() {
    const [isLoading, setIsLoading] = useState(true); //LOADING STATE
    const [shopProduct, setShopProduct] = useState([]);//PRODUCTS FROM FIREBASE

    useEffect(() => {
        setIsLoading(true);
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

        setIsLoading(false)

        // Clean up the listener on unmount
        return () => productInDB();
    }, []);

    // CURRENCY CONVERTER
    const Price = ({ amountInDollars }) => {
        const { currency } = useCurrency();

        const convertToNaira = (usd) => usd * 1500; // Use actual conversion API or static rate
        const displayAmount =
            currency === "NGN"
                ? `₦${convertToNaira(amountInDollars).toLocaleString()}`
                : `$${amountInDollars.toFixed(2)}`;

        return <span>{displayAmount}</span>;
    };

    // LOADING SCREEN
    if (isLoading) {
        return (
            <div className="cart">
                <Loading />
            </div>
        );
    }

    return ( 
        <div className="shop">
            <Nav />
            <div className="product-list-container">
                <div className="product-list">
                    {shopProduct.map((product) => (
                        <div className="mapped-product-container" key={product.id} >
                            <Link
                                key={product.id}
                                to={`/Details/${product.id}`}
                                className="add-to-cart-link"
                            >

                                <div className="product-box" >
                                    <div className="product-image">
                                        <img src= {product.image} alt={product.description} />
                                    </div>
                                    
                                    <p className="product-description" >{product.description}</p>
                                    <p className="product-price"><Price amountInDollars={product.price} /></p>
                                </div>
                            
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