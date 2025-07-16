import './Gallery.css'
import sound from '../mp3/sound.mp3'

function Gallery() {
    return ( 
        <div className="gallery">
            <audio src={sound} autoPlay loop />

            <div className="image-grid">
                
                
            </div>
        </div>
     );
}

export default Gallery;