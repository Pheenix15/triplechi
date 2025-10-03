import React, { useState, useEffect } from "react";
import { set, ref, push } from "firebase/database";
import { database } from "../components/firebase";


function AddProduct({openModal, setOpenModal, editingProduct, setEditingProduct, isUpdating, setIsUpdating}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState(""); // Optional
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [availableSizes, setAvailableSizes] = useState([])
    const [imageUrl, setImageUrl] = useState("");
    const [imageVariants, setImageVariants] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false); //STATE FOR WHEN PRODUCT IS UPDATING
    const [failAlert, setFailAlert] = useState("");
    const [successAlert, setSuccessAlert] = useState("");

    // IF IN UPDATE MODE, FILL THE FORM WITH PRODUCT DETAILS
    useEffect(() => {
        if (isUpdating && editingProduct) {
            setName(editingProduct.name || "");
            setDescription(editingProduct.description || "");
            setPrice(editingProduct.price?.toString() || "");
            setStock(editingProduct.stock?.toString() || "");
            setImageUrl(editingProduct.image || "");
            setImageVariants(editingProduct.imageVariants || []);
            setAvailableSizes(editingProduct.availableSizes || []);
        }
    }, [isUpdating, editingProduct]);

    // CLOUDINARY DATA
    const cloudName= process.env.REACT_APP_CLOUD_NAME
    const uploadPreset= process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET // For unsigned uploads

    

    // HANDLE IMAGE UPLOAD TO CLOUDINARY
    const handleImageUpload = async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", uploadPreset);
        data.append("cloud_name", cloudName);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: data,
            });
            const url = await res.json(); //URL OF UPLOADED IMAGE
            
            // console.log(url.secure_url)
            setImageUrl(url.secure_url);
            return url.secure_url;
        } catch (err) {
            // console.error("Upload failed:", err);

            setFailAlert("Upload failed:", err)
            throw err;
        }
    };

    // PUSH FORM TO DATABASE
    const uploadToDatabase = async (e) => {
        e.preventDefault();

        if (!name || !price || !stock || !imageUrl) {
            setFailAlert("Please fill all required fields and upload a main image.");
            setTimeout(() => setFailAlert(""), 3000)
            return;
        }

        setIsSubmitting(true); // START LODING

        const newProduct = {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            availableSizes: availableSizes || [],
            image: imageUrl,
            imageVariants: imageVariants || [],
        };

        try {
            const productRef = isUpdating
                ? ref(database, `Product/${editingProduct.id}`) // IF isUpdating IS TRUE, UPDATE PATH
                : push(ref(database, "Product")); // ELSE ADD ADD

            await set(productRef, newProduct); // `set()` WILL CREATE OR UPDATE

            // Reset form
            setName("");
            setDescription("");
            setPrice("");
            setStock("");
            setAvailableSizes([]);
            setImageUrl("");
            setImageVariants([]);
            setIsUpdating(false);
            setEditingProduct(null);
            setFailAlert("");

            setSuccessAlert(isUpdating ? "Product updated successfully." : "Product added successfully.");
           
        } catch (err) {
            // console.error("Error pushing product:", err);
            setFailAlert("Failed to add product.", err);
        } finally {
            setIsSubmitting(false) //END LOADING
        }
    };

    // SETTIMEOUT FOR SUCCESS ALERT
    useEffect(() => {
        if (successAlert) {
            const timer = setTimeout(() => setSuccessAlert(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [successAlert]);

    return ( 
        <form className="modal-overlay" onSubmit={uploadToDatabase} >
            {/* SUCCESS ALERT */}
            {successAlert && (
                <div className="alert success-alert">
                    {successAlert}
                </div>
            )}

            {/* ERROR ALERT */}
            {failAlert && <p className="alert fail-alert">{failAlert}</p>}

            <div className="modal-heading">
                <h3>Add New Product</h3>
                <button className="close-modal button" onClick={() => setOpenModal(false)} ><i className="fa-solid fa-xmark"></i></button>
            </div>

            <div className="modal-content">
                {failAlert && <p className="error alert">{failAlert}</p>}
                <div className="modal-form form">
                
                    <input
                    type="text"
                    placeholder="Product Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    />

                    <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    />

                    <div className="number-input">
                        <input
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        />

                        <input
                        type="number"
                        placeholder="Stock"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        />
                    </div>

                    <div className="available-sizes">
                        <label>Available Sizes:</label>
                        <div className="sizes-checkbox-group">
                            {["S", "M", "L", "XL", "XXL"].map((size) => (
                            <label key={size} style={{ marginRight: "1rem" }}>
                                <input
                                type="checkbox"
                                value={size}
                                checked={availableSizes.includes(size)}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    const value = e.target.value;
                                    setAvailableSizes((prevSizes) =>
                                    checked
                                        ? [...prevSizes, value]
                                        : prevSizes.filter((s) => s !== value)
                                    );
                                }}
                                />
                                {size}
                            </label>
                            ))}
                        </div>
                    </div>
                    

                    <div className="image-upload-container">
                        <div className="image-upload main-image">
                            <label>Product Image</label>
                            <input
                                className="image-input"
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const imageUrl = await handleImageUpload(file);
                                    setImageUrl(imageUrl);
                                }
                                }}
                            />
                            {imageUrl && (
                                <div style={{ }}>
                                <img src={imageUrl} alt="Uploaded" style={{ width: "50px" }} />
                                </div>
                            )}
                        </div>
                        

                        {/* Image Variants Upload */}
                        <div className="image-upload secondary-image" >
                            <label>Secondary Image</label>
                            <input
                                className="image-input"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={async (e) => {
                                const files = Array.from(e.target.files);
                                const urls = [];

                                for (let file of files) {
                                    const url = await handleImageUpload(file);
                                    urls.push(url);
                                }

                                setImageVariants(urls);
                                }}
                            />

                            {/* Show uploaded variant previews */}
                            {imageVariants.length > 0 && (
                                <div style={{ display: "flex", gap: "8px" }}>
                                    {imageVariants.map((url, index) => (
                                        <img
                                        key={index}
                                        src={url}
                                        alt={`Variant ${index + 1}`}
                                        style={{ width: "40px", objectFit: "cover" }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-button">
                        <button type="submit" className="submit-button button" disabled={isSubmitting} >
                            {isSubmitting ? "Loading..." : "Push to Database"}
                        </button>
                    </div>
                    
                </div>
            </div>
            
        </form>
        
    );
    
}

export default AddProduct;