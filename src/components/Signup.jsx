import React, { useState } from 'react';
import { auth, database } from './firebase';
import {ref, set} from 'firebase/database';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Auth.css'

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [successAlert, setSuccessAlert] = useState('')
    const [failAlert, setFailAlert] = useState('');
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate();
    const location = useLocation();
    const redirectPath = new URLSearchParams(location.search).get('redirect') || '/shop'; //REDIRECT FOR USERS ABOUT TO CHECKOUT
    
    // 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        
        try {
            // CREATE NEW USER
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // SEND VERIFICATION EMAIL
            // await sendEmailVerification(user);

            // SAVE ADDITIONAL DETAILS TO REALTIMEDATABASE
            await set(ref(database, `users/${user.uid}`), {
                firstName,
                lastName,
                address,
                phoneNumber,
                email,
            });


            setSuccessAlert("Signup successful! Please check your email to verify your account.")
            setTimeout(() => setSuccessAlert(""), 5000)

            navigate(redirectPath);
            setIsLoading(false)

        } catch (err) {
            if(err === 400) {
                setFailAlert('Email already in use')
                setTimeout(() => setFailAlert(''), 5000)
            } else {
                setFailAlert(err.message)
                setTimeout(() => setFailAlert(''), 5000)
            }
        }
    };

    return ( 
        <div className="auth-page">

            <div className="auth signup">

                <div className="auth-message signup-message">
                    <h2>Welcome!</h2>
                    <p>Signup to create a new account</p>
                    <img src="../img/chi-logo.png" alt="triplechi Logo" />
                </div>

                <div className="auth-form signup-form">

                    <form onSubmit={handleSubmit} className='form' >
                        <h2>Sign Up</h2>
                        {successAlert && (
                            <div className="alert success-alert">{successAlert}</div>
                        )}
                        {failAlert && <p className='alert fail-alert' >{failAlert}</p>}

                        <input 
                        type="text"
                        placeholder='First Name'
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required 
                        />

                        <input 
                        type="text"
                        placeholder='Last Name'
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required 
                        />

                        <input
                        type="email"
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        />

                        <input
                        type="tel"
                        placeholder='Phone Number'
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required 
                        />

                        <input
                        type="text"
                        placeholder='Delivery Address'
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required 
                        />

                        <input 
                        type="password"
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        />

                        <div className="form-button-container">
                            <button type="submit" className='button primary-form-button' >{isLoading ? 'Authenticating...' : 'Signup'}</button>

                            <Link to='/Login' ><button className="button secondary-form-button">Or Login</button></Link>
                        </div>

                    </form>

                </div>

            </div>

        </div>
     );
}

export default Signup;