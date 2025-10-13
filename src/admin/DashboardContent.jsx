import React, { useEffect, useState } from "react";
import { ref, onValue, remove, update, get } from "firebase/database";
import { database, auth } from "../components/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail, updatePassword } from "firebase/auth";
import AddProduct from "./AddProduct";
import AddGalleryImage from './AddGalleryImage'
import AddGalleryMusic from "./AddGalleryMusic";
import { onAuthStateChanged } from "firebase/auth";
import ShippingModal from "./ShippingModal";



function DashboardContent({section, openModal, setOpenModal,editingProduct, setEditingProduct, isUpdating, setIsUpdating, showAdminForm, setShowAdminForm, showShippingModal, setShowShippingModal, openImageModal, setOpenImageModal, openMusicModal, setOpenMusicModal}) {

    const [data, setData] = useState([]); //SET THE DATA OF THE DASHBOARD
    const [successAlert, setSuccessAlert] = useState('') //STATE FOR SUCCESS ALERTS
    const [failAlert, setFailAlert] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [galleryType, setGalleryType] = useState('Image')//THIS SETS THE GALLERY CONTENT TO IMAGES OF MUSIC
    const [galleryImages, setGalleryImages] = useState([]); //FOR WHEN galleryType === Images
    const [imageToDelete, setImageToDelete] = useState(null); // HOLDS IMAGE ID WHEN DELETE IS REQUESTED
    const [showCart, setShowCart] = useState(false) //SHOW USER CART MODAL WHEN section === Order
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null) //SETS WHICH OREDE DETAILS WAS SELECTED


    useEffect(() => {
        // PRODUCTS LIST
        if (section === "Products") {
            const productsRef = ref(database, "Product");

            const productListner = onValue(productsRef, (snapshot) => {
                const productsData = snapshot.val();
                if (!productsData) {
                setData([]);
                return;
                }

                const productsList = Object.entries(productsData).map(
                ([id, product]) => ({
                    id,
                    ...product,
                })
                );

                setData(productsList);
            });

            return () => {
                productListner();
                setData([])
            }
        }

        // USERS LIST
        if (section === "Users") {
            const usersRef = ref(database, "users");

            const userListner = onValue(usersRef, (snapshot) => {
                const usersData = snapshot.val();
                if (!usersData) {
                setData([]);
                return;
                }

                const usersList = Object.entries(usersData).map(([uid, user]) => ({
                uid,
                ...user,
                }));

                setData(usersList);
            });

            return () => {
                userListner();
                setData([]);
            }
        }

        //ORDER
        // ORDERS LIST
        if (section === "Orders") {
            const ordersRef = ref(database, "Orders");
            
            const unsubscribe = onValue(ordersRef, (snapshot) => {
                const data = snapshot.val();
                if (!data) {
                    setData([]);
                    return;
                }

                const ordersList = Object.entries(data).map(([orderId, order]) => ({
                    orderId,
                    ...order,
                }));

                setData(ordersList);
            });

            return () => unsubscribe();
                
        }
            

    }, [section]);

//////FETCHES IMAGES FROM Gallery DATABASE
    useEffect(() => {
        if (section === "Gallery" && galleryType === "Images") {
            const imagesRef = ref(database, "Gallery/images");

            const unsubscribe = onValue(imagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const imageList = Object.entries(data).map(([id, url]) => ({
                id,
                url,
                }));
                setGalleryImages(imageList);
            } else {
                setGalleryImages([]);
            }
            });

            return () => unsubscribe();
        }  
    }, [section, galleryType]);

    //DELETES IMAGE FROM DB
    const confirmImageDelete = async (id) => {
        try {
            const imageRef = ref(database, `Gallery/images/${id}`);
            await remove(imageRef);
            setImageToDelete(null);

            setSuccessAlert("Image deleted successfully.")
            setTimeout(() => setSuccessAlert(''), 3000)
        } catch (error) {
            console.error("Error deleting image:", error.message);
            setFailAlert("Failed to delete Image:" + error.message)
            setTimeout(() => setFailAlert(''), 3000)
        }
    };

////////FETCHES MUSIC FROM GALLERY
    useEffect(() => {
        if (section === "Gallery" && galleryType === "Music") {
            const musicRef = ref(database, "Gallery/music");

            const unsubscribe = onValue(musicRef, (snapshot) => {
            const musicData = snapshot.val();
            if (!musicData) {
                setData([]); // you likely already have `data` as state
                return;
            }

            const musicList = Object.entries(musicData).map(([id, item]) => ({
                id,
                name: item.name,
                url: item.url,
            }));

            setData(musicList);
            });

            return () => unsubscribe();
        }
    }, [section, galleryType]);

    // DELETES MUSIC
    const handleDeleteMusic = async (id) => {
        const confirmDelete = window.confirm("Delete this music file?");
        if (!confirmDelete) return;

        try {
            await remove(ref(database, `Gallery/music/${id}`));
            setSuccessAlert("Music deleted successfully.");
            setTimeout(() => setSuccessAlert(""), 3000);
        } catch (err) {
            // console.error("Error deleting music:", err);
            setFailAlert("Failed to delete music.");
            setTimeout(() => setFailAlert(""), 3000);
        }
    };
////////////////////////

///// DELETES PRODUCTS FROM DATABASE
    const handleDelete = async (productId) => {
        try {
            const productRef = ref(database, `Product/${productId}`);
            await remove(productRef);

            console.log("Product deleted successfully.");
            setSuccessAlert("Product deleted successfully.")
            setTimeout(() => setSuccessAlert(''), 3000)

        } catch (err) {
            console.error("Failed to delete product:", err);
            setFailAlert("Failed to delete product:", err)
            setTimeout(() => setFailAlert(''), 3000)
        }
    };

///// OPEN MODAL WHEN UPDATE BUTTON IS CLICKED
    const handleUpdateClick = (productId) => {
        const productToEdit = data.find((item) => item.id === productId);

        setEditingProduct(productToEdit);    // PASS THE product THAT WILL BE UPDATED TO THE MODAL
        setIsUpdating(true);           // SWITCH MODAL TO "update mode"
        setOpenModal(true);           // OPENS THE MODAL
    }
    

///// REMOVES USER DATABASE
    const removeUser = async (uid) => {
        try {
            const userRef = ref(database, `users/${uid}`);
            await remove(userRef);

            console.log("User removed successfully.");
            setSuccessAlert("User removed successfully.")
            setTimeout(() => setSuccessAlert(''), 3000)

        } catch (err) {
            console.error("Failed to remove user:", err);
            setFailAlert("Failed to remove user:", err.message)
            setTimeout(() => setFailAlert(''), 3000)
        }
    };

//// UPDATE ADMIN CREDENTIALS
    const updateAdminCredentials = async (e) => {
        e.preventDefault(); //STOPS FORM FROM RELOADING PAGE

        const currentUser = auth.currentUser;
        const uid = currentUser?.uid;

        if (!uid) {
            setFailAlert("You must be logged in as an admin to update details.");
            setTimeout(() => setFailAlert(""), 3000);
            return;
        }

        try {
            // Ask for current password to reauthenticate
            const currentPassword = prompt("Please enter your current password:");
            


            if (!currentPassword) {
                setFailAlert("Password confirmation is required.");
                setTimeout(() => setFailAlert(""), 3000);
                return;
            }

             // Create credentials and reauthenticate
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);

            // UPDATE EMAIL
            if (newEmail.trim()) {
            await verifyBeforeUpdateEmail(currentUser, newEmail.trim());

            setSuccessAlert("A verification link has been sent to the new email. Please confirm it to complete the update.")
            setTimeout(() => setSuccessAlert(""), 3000)
            }

            // Update password
            if (newPassword.trim()) {
            await updatePassword(currentUser, newPassword.trim());
            }

            // Clear fields and close form
            setNewEmail("");
            setNewPassword("");
            setShowAdminForm(false);

        } catch (err) {
            console.error("Update failed:", err);
            setFailAlert("Update failed: " + err.message);
            setTimeout(() => setFailAlert(""), 3000);
        }

    }

    //LISTEN FOR EMAIL CHANGE AND UPDATE DATABASE
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user || !user.emailVerified) return;

                const uid = user.uid;
                const adminRef = ref(database, `Admin/${uid}`);

            try {
                // Get the current email from Realtime Database
                const snapshot = await get(adminRef);
                const adminData = snapshot.val();

            if (adminData?.email !== user.email) {
                // Email has changed — update it
                await update(adminRef, { email: user.email });

                setSuccessAlert("Admin email updated after verification.");
                setTimeout(() => setSuccessAlert(""), 3000);
            }
            } catch (error) {
                console.error("Error checking/updating admin email:", error);
            }
        });

        return () => unsubscribe();
    }, []);



    return ( 
        <div className="dashboard-content">
            {/* DISPLAY ALERTS */}
            {successAlert && (
                <div className="alert success-alert">{successAlert}</div>
            )}

            {failAlert && (
                <div className="alert fail-alert">{failAlert}</div>
            )}

            {/* ADMIN */}
            {section === "Admin" && 
                <div className="admin-content">
                    <h3>Admin Settings</h3>

                    {showAdminForm && (
                        <form className="form admin-form" onSubmit={updateAdminCredentials} >
                            <div className="form-heading">
                                <h4>Change Admin Credentials</h4>
                            </div>

                            <input
                                type="email"
                                placeholder="New email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                            />

                            <input
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            
                            <div className="admin-form-button">
                                <button type="submit" className="button">Update Credentials</button>
                            </div>
                            

                        </form>
                    )}

                    {/* UPDATE SHIPPING COST MODAL */}
                    {showShippingModal && (
                        <ShippingModal 
                            setShowShippingModal={setShowShippingModal}
                            successAlert={setSuccessAlert}
                            failAlert={setFailAlert}
                        />
                    )}


                </div>
            }

            {/* PRODUCTS */}
            {section === "Products" &&
            (data.length === 0 ? (
                <p>No products available.</p>
            ) : (
                <div className="dashboard-table-wrapper">
                    <table className="dashboard-table-container">
                        <thead className="table-heading">
                        <tr>
                            <th>Image</th>
                            <th className="mobile-hidden" >Name</th>
                            <th>Price ($)</th>
                            <th>Stock</th>
                            <th>Sizes</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody className="table-body">
                        {data.map((item) => (
                            <tr key={item.id} className="table-row">
                            <td className="dashboard-product-image table-data">
                                <img
                                    src={item.image}
                                    alt={item.name || "Product"}
                                />
                            </td>
                            <td className=" mobile-hidden table-data">{item.name}</td>
                            <td className="table-data">{item.price}</td>
                            <td className="table-data">{item.stock}</td>
                            <td className="table-data">
                                {item.availableSizes?.length
                                ? item.availableSizes.join(", ")
                                : "—"}
                            </td>
                            <td className="action-buttons table-data">
                                <button
                                onClick={() => handleUpdateClick(item.id)}
                                className="update-button button"
                                >
                                Update
                                </button>

                                <button
                                onClick={() => handleDelete(item.id)}
                                className="delete-button button"
                                >
                                Delete
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ))}

            {/* USERS */}
            {section === "Users" &&
                (data.length === 0 ? (
                    <p>No users available.</p>
                ) : (
                    <table className="dashboard-table-container">
                        <thead className="table-heading">
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone Number</th>
                                <th>Address</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody className="table-body">
                            {data.map((user) => (
                                <tr key={user.uid} className="table-row card">
                                    <td className="table-data">{user.lastName} {user.firstName}</td>
                                    <td className="table-data">{user.email}</td>
                                    <td className="table-data" >{user.phoneNumber}</td>
                                    <td className="table-data">{user.address}</td>
                                    <td className="table-data">{user.role || "User"}</td>

                                    <td className="action-buttons table-data">
                                        <button onClick={() => removeUser(user.uid)} className="delete-button button">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ))
            }

            {/* GALLERY */}
            {section === "Gallery" && (
                <div className="gallery-dashboard">

                    {openImageModal && (
                    <AddGalleryImage setOpenImageModal={setOpenImageModal} />
                    )}

                    {openMusicModal && ( 
                    
                        <AddGalleryMusic setOpenMusicModal={setOpenMusicModal} />
                    )}
                    <div className="gallery-header">
                    <button
                        className={`button logout-button ${galleryType === "Images" ? "active" : ""}`}
                        onClick={() => setGalleryType("Images")}
                    >
                        Images
                    </button>
                    <button
                        className={`button add-button ${galleryType === "Music" ? "active" : ""}`}
                        onClick={() => setGalleryType("Music")}
                    >
                        Music
                    </button>
                    </div>

                    <div className="gallery-content">
                    {galleryType === "Images" ? (
                        // DISPLAY IMAGES
                        <div className="gallery-thumbnails">
                            {galleryImages.map((img) => (
                            <div key={img.id} className="thumbnail-wrapper">
                                <div className="thumbnail" onClick={() => setImageToDelete(img.id)} title="Click to delete" >
                                    <img src={img.url} alt={`Gallery ${img.id}`} />
                                </div>

                                {/* // IMAGE TO DELETE POPUP */}
                                {imageToDelete === img.id && (
                                    <div className="delete-popup">
                                        <p>Delete this image?</p>
                                        <div className="popup-buttons">
                                            <button onClick={() => confirmImageDelete(img.id)} className="button delete-button" >Yes</button>
                                            <button onClick={() => setImageToDelete(null)} className="button update-button" >Cancel</button>
                                        </div>
                                    </div>
                                )}

                            </div>

                            ))}
                        </div>
                    ) : (
                        // MUSIC DISPLAY
                        <div className="music-list">
                            {data.length === 0 ? (
                            <p>No music uploaded.</p>
                            ) : (
                                data.map((track) => (
                                    <div key={track.id} className="music-item">
                                    <p>{track.name}</p>
                                    <audio controls src={track.url} />
                                    <button
                                        className="delete-button button"
                                        onClick={() => handleDeleteMusic(track.id)}
                                    >
                                        Delete
                                    </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    </div>
                </div>
            )}

            {/* ORDERS */}
            {section === "Orders" && (
                (data.length === 0 ? (
                    <p>You currently have no orders</p>
                ) : (
                    <div className="orders-section">
                        <h3>All Orders</h3>
                        <table className="order-user-details dashboard-table-container" >
                            <thead className="order-header table-heading" >
                                <tr>
                                    <th>Order Reference</th>
                                    <th>Date</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Address</th>
                                    <th>Country</th>
                                    <th>Currency</th>
                                    <th>Total Amount</th>
                                    <th>Show Cart</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((order, index) => (
                                    <tr key={index} className="order-details-row" >
                                        <td className="table-data" >{order.transactionReference}</td>
                                        <td className="table-data" >{order.date}</td>
                                        <td className="table-data" >{order.userDetails?.firstName} {order.userDetails?.lastName}</td>
                                        <td className="table-data" >{order.userDetails?.email}</td>
                                        <td className="table-data" >{order.userDetails?.address}, {order.userDetails?.state}</td>
                                        <td className="table-data" >{order.userDetails?.country}</td>
                                        <td className="table-data" >{order.currency}</td>
                                        <td className="table-data" >{order.totalAmount}</td>
                                        <td className="table-data" ><button className="update-button button" onClick={() => {
                                            setSelectedOrderDetails(order);
                                            setShowCart(true)
                                        }} >Show Cart</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {showCart && selectedOrderDetails && (
                            <div className="modal-overlay">
                                <div className="modal-content show-cart-modal-content ">
                                    <div className="modal-header show-cart-modal-header">
                                        <h4>Order Cart — {selectedOrderDetails.transactionReference}</h4>

                                        <button onClick={() => setShowCart(false)}>Close</button>
                                    </div>
                                
                                    {selectedOrderDetails.cartItems?.length > 0 ? (
                                        <table className="dashboard-cart-item dashboard-table-container">
                                            <thead className="dashboard-cart-header table-heading">
                                                <tr>
                                                    <th>Image</th>
                                                    <th>Product</th>
                                                    <th>Size</th>
                                                    <th>Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody className="show-cart-tbody" >
                                                {selectedOrderDetails.cartItems.map((item, i) => (
                                                <tr key={i}>
                                                    <td className=" dashboard-product-image table-data" ><img src={item.image} alt={item.name} /></td>
                                                    <td className="table-data" >{item.name}</td>
                                                    <td className="table-data" >{item.size}</td>
                                                    <td className="table-data" >{item.quantity}</td>
                                                </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p>No items in cart</p>
                                    )}
                                
                                </div>
                            </div>
                        )}

                    </div>
                ))
            )}

            {/* ADD NEW PRODUCT MODAL */}
            {openModal && section === 'Products' && (
                <AddProduct
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    isUpdating={isUpdating}
                    editingProduct={editingProduct}
                    setIsUpdating={setIsUpdating}
                    setEditingProduct={setEditingProduct}
                    successAlert={successAlert}
                    failAlert={failAlert}
                />
            )}

        </div>
     );
}

export default DashboardContent;