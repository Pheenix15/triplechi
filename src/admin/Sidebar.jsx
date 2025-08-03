function Sidebar({setSection}) {
    return ( 
        <div className="sidebar">
            <div className="side-bar-top">
                <div className="side-bar-logo">
                    <img src="../img/chi-logo.png" alt="" />
                </div>
            </div>
            
            <div className="sidebar-below">
                {/* switch between sections */}
                <div onClick={() => setSection("Admin")} className="sidebar-options" >
                    <i className="fa-solid fa-user-tie"></i>
                    <p>Admin</p>
                </div>

                <div onClick={() => setSection("Products")} className="sidebar-options" >
                    <i className="fa-solid fa-list"></i>
                    <p>Products</p>
                </div>

                <div onClick={() => setSection("Users")} className="sidebar-options" >
                    <i className="fa-solid fa-users"></i>
                    <p>Users</p>
                </div>

                {/* <div onClick={() => setSection("Shopping Cart")} className="sidebar-options" >
                    Shopping Cart
                </div> */}
            </div>
        </div>
     );
}

export default Sidebar;