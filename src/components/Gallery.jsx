import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from './firebase'; 
import './Gallery.css'

function Gallery() {
    const [images, setImages] = useState([]);
    const [activeImageIndex, setActiveImageIndex] = useState(null);
    // const [sound, setSound] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
            const imagesRef = ref(database, 'Gallery/images');
            const snapshot = await get(imagesRef);
            if (snapshot.exists()) {
                const data = snapshot.val(); 
                const imageUrls = Object.values(data); 
                setImages(imageUrls);
            } else {
                console.log('No images found in database');
            }
            } catch (error) {
            console.error('Error fetching images:', error);
            }
        };

        fetchImages();
    }, []);

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
            // setSound(musicArray[0].url); // or random: musicArray[Math.floor(Math.random() * musicArray.length)].url
            }
        }
        };

        fetchSound();
    }, []);

    return ( 
        <div className="gallery">
            {/* <audio src={sound} autoPlay loop /> */}

            <div className="gallery-grid">
                {images.map((url, index) => (
                    <img
                        key={index}
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        onClick={() => setActiveImageIndex(index)}
                    />
                ))}
            </div>

            {/* IMAGE OVERLAY */}
            <div className={`image-overlay ${activeImageIndex !== null ? 'active' : ''}`} >
                {activeImageIndex !== null && (
                    <div >
                        <button className="close-btn" onClick={() => setActiveImageIndex(null)}>×</button>

                        <button className="nav-btn left" onClick={() => setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length)}>
                        ‹
                        </button>

                        <img src={images[activeImageIndex]} alt='active overlay' className="overlay-image" />

                        <button className="nav-btn right" onClick={() => setActiveImageIndex((activeImageIndex + 1) % images.length)}>
                        ›
                        </button>
                    </div>
                )}
            </div>

        </div>
     );
}

export default Gallery;