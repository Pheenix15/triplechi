function DashboardHeader({title, section, setOpenModal, showAdminForm, setShowAdminForm, setShowShippingModal, handleLogout, setOpenImageModal, setOpenMusicModal}) {
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

                        <button className="button add-button update-shipping-button" onClick={() => setShowShippingModal(true)}>
                            Update Shipping Cost
                        </button>

                        <button className="button logout-button" onClick={handleLogout} >Logout</button>
                    </div>
                )}

                {section === 'Gallery' && (
                    <div className="gallery-header-buttons">
                        <button onClick={() =>setOpenImageModal(true)} className="button add-button" style={{marginRight: '10px'}} >Add Image</button>

                        <button onClick={() =>setOpenMusicModal(true)} className="button add-button" >Add Music</button>
                    </div>
                    

                )}
            </div>
        </div>
     );
}

export default DashboardHeader;