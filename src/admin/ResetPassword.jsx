import React, {useState} from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../components/firebase";
import './Admin.css'


function ResetPassword({ onClose, setSuccessAlert, setFailAlert }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setFailAlert("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
        console.log(email)
      await sendPasswordResetEmail(auth, email.trim());
      
      setSuccessAlert("Password reset email sent.");
      onClose();
    } catch (error) {
      setFailAlert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-modal">
        <div className="reset-modal-heading">
            <h3>Reset Password</h3>
        </div>

        <div className="reset-modal-content">
            
            
            <form onSubmit={handleReset}>
            <input
                type="email"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <div>
                <button className="button add-button reset-modal-button" type="submit" disabled={loading} style={{marginRight: '15px'}} >
                {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <button className="button logout-button reset-modal-button" type="button" onClick={onClose}>
                Cancel
                </button>
            </div>
            </form>
        </div>
    </div>
  );
}


export default ResetPassword