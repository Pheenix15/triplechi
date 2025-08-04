import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../components/firebase";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardContent from "./DashboardContent";
import './Admin.css'


function AdminDashboard() {
    
    // KEEPS TRACK OF THE CURRENT SECTION: PRODUCTS OR USERS
    const [section, setSection] = useState("Products");
    const [openModal, setOpenModal] = useState(false) //OPENS THE MODAL
    const [showShippingModal, setShowShippingModal] = useState(false)// STATE FOR SET SHIPPING COST MODAL
    const [editingProduct, setEditingProduct] = useState(null);//
    const [isUpdating, setIsUpdating] = useState(false);// SWITCHES THE MODAL TO UPDATE MODE
    const [showAdminForm, setShowAdminForm] = useState(false);

    ////LOG ADMIN OUT
    const handleLogout = async () => {
        console.log("Clicked")
        try {
            await signOut(auth);
    
            window.location.href = "/admin"; // REDIRECT TO LOGIN PAGE
        } catch (error) {
            console.error("Logout failed:", error.message);
        }
    };

    return ( 
        <div className="admin-dashboard-page">
            <aside className="dashboard-side-bar">
                <Sidebar setSection={setSection} />
            </aside>

            <div className="dashboard-container">
                <div className="dashboard-header">
                    <DashboardHeader section={section} title={section} setOpenModal={setOpenModal} showAdminForm={showAdminForm} setShowAdminForm={setShowAdminForm} showShippingModal={showShippingModal} setShowShippingModal={setShowShippingModal} handleLogout={handleLogout} />
                </div>

                <div className="dashboard-content-container">
                    <DashboardContent 
                        section={section} 
                        openModal={openModal} 
                        setOpenModal={setOpenModal} 
                        isUpdating={isUpdating}
                        editingProduct={editingProduct}
                        setIsUpdating={setIsUpdating}
                        setEditingProduct={setEditingProduct}
                        showAdminForm={showAdminForm}
                        setShowAdminForm={setShowAdminForm}
                        showShippingModal={showShippingModal}
                        setShowShippingModal={setShowShippingModal}
                    />
                    
                </div>
                
            </div>
            
        </div>
     );
}

export default AdminDashboard;