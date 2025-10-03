import { useState } from "react";
import { ref, push, set } from "firebase/database";
import { database } from "../components/firebase";

function AddGalleryMusic({ setOpenMusicModal }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const cloudName= process.env.REACT_APP_CLOUD_NAME
  const uploadPreset= process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET // For unsigned uploads

  const handleUpload = async () => {
    if (!selectedFile || !fileName) {
      setError("Please select a file and enter a name.");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    const data = new FormData();
    data.append("file", selectedFile);
    data.append("upload_preset", uploadPreset);
    data.append("cloud_name", cloudName);
    data.append("resource_type", "auto");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const json = await res.json();
      const musicUrl = json.secure_url;

      const musicRef = ref(database, "Gallery/music");
      const newMusicRef = push(musicRef);

      await set(newMusicRef, {
        name: fileName,
        url: musicUrl,
      });

      setSuccess("Music uploaded successfully.");
      setSelectedFile(null);
      setFileName("");
    } catch (err) {
      setError("Upload failed.");
      // console.error(err);
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Upload Music</h3>

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        <input
          type="text"
          placeholder="Enter music file name (e.g., chill-beat.mp3)"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <div className="modal-buttons">
          <button onClick={handleUpload} disabled={isUploading} className="button add-button" >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
          <button onClick={() => setOpenMusicModal(false)} className="button delete-button" >Close</button>
        </div>
      </div>
    </div>
  );
}

export default AddGalleryMusic;