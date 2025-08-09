import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get, child } from "firebase/database";
import { auth, database } from "../components/firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ResetPassword from "./ResetPassword";

function Admin() {

    const [email, setEmail] = useState(''); //STORES THE EMAIL
    const [password, setPassword] = useState(''); //STORES THE PASSWORD
    // const [admin, setAdmin] = useState(null);
    const [failAlert, setFailAlert] = useState(''); //STATE FOR ERROR ALERTS
    const [successAlert, setSuccessAlert] = useState('') //STATE FOR SUCCESS ALERTS
    const [showPassword, setShowPassword] = useState(false); //STATE TO REVIEAL PASSWORD
    const [showResetPassword, setShowResetPassword] = useState(false);//RESET PASSWORD MODAL

    const navigate = useNavigate();


    // const auth = auth;
    // const database = database;

    //LOGIN FUNCTION
    async function handleLogin(e) {
        e.preventDefault()
        try {
            //GET CREDENTIALS FROM FIREBASE AUTH
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            const user = userCredential.user;

            //REF DATABASE
            const databaseRef = ref(database);

            //GET REF FROM DB
            const adminSnap = await get(child(databaseRef, `Admin/${user.uid}`));

            //IF FIREBASE REF AND AUTH CREDENTIALS MATCH GRANT ACCESS
            if (adminSnap.exists() && adminSnap.val().role === "admin") {
            
                //Access granted
                // setAdmin(user); // state to indicate admin is logged in
                localStorage.setItem("isAdmin", "true"); // store login state
                setSuccessAlert('Welcome Admin');
                setTimeout(() => setSuccessAlert(''), 3000);

                navigate('/Admin-Dashboard')
            } else {

                //NOT ADMIN
                setFailAlert("Wrong email or password");
                setTimeout(() => setFailAlert(''), 3000);
            }
        } catch (error) {
            //AUTH FAILED
            console.log(error)
            setFailAlert("Wrong email or password");
            setTimeout(() => setFailAlert(''), 3000);
        }
    }


    return ( 
        <div className="auth-page login-page">
            {successAlert && (
                <div className="alert success-alert">{successAlert}</div>
            )}

            {failAlert && (
                <div className="alert fail-alert">{failAlert}</div>
            )}
            <div className="auth login">
                <div className="auth-message login-message">
                    <h2>Welcome back!</h2>
                    <p>Login to access your account</p>
                    <img src="../img/chi-logo.png" alt="triplechi Logo" />
                </div>

                <div className="auth-form login-form">
                    
                    <form onSubmit={handleLogin} className='form' >
                        <h2>Login</h2>
                        
                        <input
                            name='Email'
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />

                        <div className="password">
                            <input
                                name='Password'
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                            />

                            <span className='password-eye' onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        <div className="form-button-container">
                            <button type="submit" className='button primary-form-button' >Login</button>
                        </div>
                        
                    </form>

                    <p className="tiny forgot-password" onClick={() => setShowResetPassword(true)} >Forgot your password? </p>
                </div>
                
                {showResetPassword && (
                    <ResetPassword
                        onClose={() => setShowResetPassword(false)}
                        
                        setFailAlert={setFailAlert}
                        setSuccessAlert={setSuccessAlert}
                    />
                )}

            </div>
            
        </div>
    );
}

export default Admin;