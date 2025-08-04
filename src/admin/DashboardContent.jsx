import React, { useEffect, useState } from "react";
import { ref, onValue, remove, update, get } from "firebase/database";
import { database, auth } from "../components/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail, updatePassword } from "firebase/auth";
import AddProduct from "./AddProduct";
import { onAuthStateChanged } from "firebase/auth";
import ShippingModal from "./ShippingModal";



function DashboardContent({section, openModal, setOpenModal,editingProduct, setEditingProduct, isUpdating, setIsUpdating, showAdminForm, setShowAdminForm, showShippingModal, setShowShippingModal}) {

    const [data, setData] = useState([]); //SET THE DATA OF THE DASHBOARD
    const [successAlert, setSuccessAlert] = useState('') //STATE FOR SUCCESS ALERTS
    const [failAlert, setFailAlert] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')

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

        // SHOOPING CART
        // if (section === "Shopping Cart") {
        //     const cartRef = ref(database, "ShoppingCart");

        //     const cartListner = onValue(cartRef, (snapshot) => {
        //         const cartData = snapshot.val();
        //         const cartItems = [];

        //         console.log(cartData)

        //         if (!cartData) {
        //         setData([]);
        //         return;
        //         }

        //         // Loop through each userUid
        //         Object.entries(cartData).forEach(([userUid, usersEmail]) => {
        //         Object.entries(usersEmail).forEach(([email, products]) => {
        //             Object.entries(products).forEach(([productId, product]) => {
        //             cartItems.push({
        //                 ...product,
        //                 userUid,
        //                 email,
        //                 productId,
        //             });
        //             });
        //         });
        //         });

        //         console.log(cartItems)
        //         setData(cartItems);
        //     });

        //     return () => cartListner();
        // }

    }, [section]);

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

            {/* SHOPPING CART */}
            {/* {section === "Shopping Cart" &&
                (data.length === 0 ? (
                <p>No shopping cart items.</p>
                ) : (
                data.map((item, index) => (
                    <div key={index} className="card">
                        <div>User Email: {item.email}</div>   
                        <strong>{item.uid}</strong>
                        <div>Size: {item.size}</div>
                        <div>Quantity: {item.quantity}</div>
                        <div>Price: ₦{item.price}</div>
                    </div>
                ))
            ))} */}

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