function DashboardHeader({title, section, setOpenModal, showAdminForm, setShowAdminForm, handleLogout}) {
    return ( 
        <div className="dashboard-header-content" >
            <h2>
                {title}
            </h2>

            <div className="header-right">
                {section === 'Products' && (
                    <button className="add-button button" onClick={() => setOpenModal(true)} >+ Add Product</button>
                )}

                {section === 'Admin' && (
                    <div className="admin-header-buttons">
                        <button className="button add-button" onClick={() => setShowAdminForm((prev) => !prev)} >
                            {showAdminForm ? "Close Settings" : "Update Admin Info"}
                        </button>

                        <button className="button logout-button" onClick={handleLogout} >Logout</button>
                    </div>
                )}
            </div>
        </div>
     );
}

export default DashboardHeader;