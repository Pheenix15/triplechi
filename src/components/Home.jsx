import React, { useEffect, useState } from "react";
import { ref, get, child } from "firebase/database";
import { database } from "./firebase";
import { Link } from 'react-router-dom';
import './Home.css'

function Home() {
    const [galleryhasContent, setGalleryHasContent] = useState(false); //STATE FOR WHEN GALLERY.JSX HAS CONTENT
    const [showButtons, setShowButtons] = useState(false)

    useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, "Gallery/images"));

        if (snapshot.exists()) {
          const images = snapshot.val();
          // Check if there's at least one image
          setGalleryHasContent(Object.keys(images).length > 0);
        } else {
          setGalleryHasContent(false);
        }
      } catch (error) {
        console.error("Error fetching gallery data:", error);
        setGalleryHasContent(false);
      } finally {
        setTimeout(() => {setShowButtons(true)}, 1000)
      }
    };

    fetchGalleryData();
  }, []);


    return ( 
        <div className="home">
            <div className="logo">
                <img src="/img/chi-logo.png" alt="" />
            </div>
            <div className={`buttons ${showButtons ? "fade-in" : ""}`}>
                <Link to='/Shop' ><button className="button home-button shop-button">Shop</button></Link>

                {galleryhasContent && (
                    <Link to= '/Gallery' ><button className="button home-button gallery-button">Gallery</button></Link>
                )}
                
            </div>
        </div>
     );
}

export default Home;