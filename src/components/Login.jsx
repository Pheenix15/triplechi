import { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import './Auth.css'

function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false); //STATE TO REVIEAL PASSWORD
    const navigate = useNavigate();
    const location = useLocation();
    const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';


    const handleSubmit = async (e) => {
        e.preventDefault(); //PREVENTS PAGE FROM RELOADING
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate(redirectPath);
        } catch (err) {
            setError(err.message);
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
                    <form onSubmit={handleSubmit} className='form' >
                        <h2>Login</h2>
                        {error && <p className="error">{error}</p>}
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