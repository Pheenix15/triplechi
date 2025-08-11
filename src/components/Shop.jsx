import { database } from "./firebase";
import { ref, onValue, get } from "firebase/database";
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import Nav from "./Nav";
import Footer from "./Footer";
import './Shop.css'
import Loading from "./Loading";


function Shop() {
    const [isLoading, setIsLoading] = useState(true); //LOADING STATE
    const [shopProduct, setShopProduct] = useState([]);//PRODUCTS FROM FIREBASE
    const [sound, setSound] = useState(null);//STATE FOR BACKGROUND MUCIC
    const soundRef = useRef(null)

    //GET MUCIC FROM DATABASE
    useEffect(() => {
        const fetchSound = async () => {
            const musicRef = ref(database, 'Gallery/music');
            const snapshot = await get(musicRef);

            if (snapshot.exists()) {
                const musicData = snapshot.val();
                const musicArray = Object.values(musicData);
                
                // Pick the first one (or random if preferred)
                if (musicArray.length > 0) {
                    setSound(musicArray[0].url); // or random: musicArray[Math.floor(Math.random() * musicArray.length)].url
                }
            }
        };

        fetchSound();
    }, []);

    //MUSIC CONTROLS
    useEffect(() => {
        if(soundRef.current) {
            soundRef.current.volume = 0.1
            console.log(soundRef.current.volume);
        }
    }, [sound])

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

        setTimeout(() => setIsLoading(false), 6000);
        

        // Clean up the listener on unmount
        return () => productInDB();
    }, []);

    // CURRENCY CONVERTER
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
                <Loading />
            </div>
        );
    }

    return ( 
        <div className="shop">
            <Nav />
            <div className="product-list-container">
                {sound && (
                    <audio ref={soundRef} src={sound} autoPlay loop />
                )}
                
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
                                    
                                    <p className="product-description" >{product.name}</p>
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