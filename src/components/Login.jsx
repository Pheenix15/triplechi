import { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import './Auth.css'

function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [failAlert, setFailAlert] = useState(''); //STATE FOR ERROR ALERTS
    const [successAlert, setSuccessAlert] = useState('') //STATE FOR SUCCESS ALERTS
    const [showPassword, setShowPassword] = useState(false); //STATE TO REVIEAL PASSWORD
    const navigate = useNavigate();
    const location = useLocation();
    const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';


    const handleSubmit = async (e) => {
        e.preventDefault(); //PREVENTS PAGE FROM RELOADING
        
        try {
            await signInWithEmailAndPassword(auth, email, password);

            setSuccessAlert("Login successful, Redirecting...")
            setTimeout(() => setSuccessAlert(''), 3000);
            navigate(redirectPath);
        } catch (err) {
            setFailAlert("Wrong email and/or password")
            setTimeout(() => setFailAlert(''), 3000);
            // setError(err.message); OLD ERROR ALERT
        }
    };

    return (
        <div className="auth-page login-page">
            <div className="auth login">
                <div className="auth-message login-message">
                    <h2>Welcome back!</h2>
                    <p>Login to access your account</p>
                    <img src="../img/chi-logo.png" alt="triplechi Logo" />
                </div>

                <div className="auth-form login-form">
                    {/* FAIL AND SUCCESS ALERTS */}
                    {successAlert && (
                        <div className="alert success-alert">{successAlert}</div>
                    )}

                    {failAlert && (
                        <div className="alert fail-alert">{failAlert}</div>
                    )}
                    <form onSubmit={handleSubmit} className='form' >
                        <h2>Login</h2>

                        
                        {/* LOGIN FORM */}
                        <input
                            name='Email'
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                        <div className='password'>
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

                            <Link to='/Signup' ><button className="button secondary-form-button">Or Signup</button></Link>
                        </div>
                        
                    </form>

                    <p className="tiny">Forgot your password? <span className="signup-link"><Link to='/Signup' >Click here</Link></span> </p>
                </div>
                
            </div>
            
        </div>
        
        
    );
}

export default Login;