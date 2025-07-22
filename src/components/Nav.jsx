import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import './Nav.css'

function Nav() {

    const [user, setUser] = useState(null); //GET USER FROM FIREBASE AUTH
    const [userBox, setUserBox] = useState(false);

    // CHECK IF USER IS LOGGED IN
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        });

        // CLEANUP ON UNMOUNT
        return () => unsubscribe();
    }, []);


    // LOGOUT
    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User logged out");
        } catch (error) {
            console.error("Logout error:", error.message);
        }
    };

    //SEND USER TO LOGIN PAGE


    // TOGGLE THE USER BOX
    const toggleBox = () => {
        if(userBox) {
            setUserBox(false);
        } else {
            setUserBox(true)
        }
        
    }

    return ( 
        <div className="nav">
            <div className="title-logo"><img src="../img/logo-2.png" alt="triplechi Logo" /></div>
            <nav className="navbar">
                {/* SIGNUP/LOGIN */}
                <button className="nav-button auth-btn" onClick={toggleBox} ><i className="fa-solid fa-user"></i></button>
                {/* CART */}
                <Link to={'/Cart'} ><button className='nav-button cart-btn' ><i className="fa-solid fa-cart-shopping"></i></button></Link>
            </nav>
            {userBox && (
                <div className="user-box">
                    <div className="user-box-info">
                        <i className="fa-solid fa-circle-user"></i>
                        <p>{user ? user.email : "Guest"}</p>
                    </div>

                    <button className="button user-box-bottom" onClick={() => {
                        if (user) {
                            handleLogout()
                        } else {
                            window.location.href = "/Login"
                        }
                    }} >{user ? 'Logout' : 'Login'}</button>
                </div>
            )}
        </div>
     );
}

export default Nav;