import { useState } from "react";
import { ref, push, set } from "firebase/database";
import { database } from "../components/firebase";

function AddGalleryImage({ setOpenImageModal }) {
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const cloudName= process.env.REACT_APP_CLOUD_NAME
  const uploadPreset= process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET // For unsigned uploads


  const handleImageUpload = async () => {
    if (!imageFile) {
      setError("Please select an image");
      return;
    }

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", uploadPreset);
    formData.append("cloud_name", cloudName);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const imageUrl = data.secure_url;

      const galleryRef = ref(database, "Gallery/images");
      const newImageRef = push(galleryRef);
      await set(newImageRef, imageUrl);

      setOpenImageModal(false); // close modal on success
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add Gallery Image</h3>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />

        {error && <p className="error-text">{error}</p>}

        <div className="modal-buttons">
          <button onClick={handleImageUpload} disabled={isUploading} className="button add-button" >
            {isUploading ? "Uploading..." : "Upload Image"}
          </button>
          <button onClick={() => setOpenImageModal(false)} className="button delete-button" >Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default AddGalleryImage;