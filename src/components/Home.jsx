import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";
import { Link } from 'react-router-dom';
import './Home.css'

function Home() {
    const [galleryhasContent, setGalleryHasContent] = useState(false); //STATE FOR WHEN GALLERY.JSX HAS CONTENT

    useEffect(() => {
      const galleryRef = ref(database, "Gallery/images");
      const unsubscribe = onValue(galleryRef, (snapshot) => {
        const data = snapshot.val();
        // Show button if there is at least one image
        setGalleryHasContent(!!data && Object.keys(data).length > 0);
      });

      // Cleanup listener
      return () => unsubscribe();
        
  }, []);


    return ( 
        <div className="home">
            <div className="logo">
                <img src="/img/chi-logo.png" alt="" />
            </div>
            <div className= 'buttons'>
                <Link to='/Shop' ><button className="button home-button shop-button">Shop</button></Link>

                {galleryhasContent && (
                    <Link to= '/Gallery' ><button className="button home-button gallery-button fade-in">Gallery</button></Link>
                )}
                
            </div>
        </div>
     );
}

export default Home;