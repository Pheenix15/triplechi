import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "../components/firebase";

function ShippingModal({ setShowShippingModal }) {
    
    const [rate, setRate] = useState(0); //SHIPPING RATE FROM FIREBASE
    const [newRate, setNewRate] = useState(0); //NEW SHIPPING RATE
    const [loading, setLoading] = useState(false);


    // Load shipping rates from Firebase
    useEffect(() => {
        const ratesRef = ref(database, "ShippingRate");
        const unsubscribe = onValue(ratesRef, (snapshot) => {
            const data = snapshot.val();
            setRate(data || {});
        });
        return () => unsubscribe();
    }, []);

    // Update Shipping rate
    const updateRate = async (e) => {
        e.preventDefault();          // stop form from reloading
        setLoading(true);

        try {
        const rateRef = ref(database, "ShippingRate");
        await update(rateRef, { cost: Number(newRate) }); 
        
        setNewRate("");
        setLoading(false)
        } catch (err) {
        console.error("Error updating rate:", err);
        }
    };


    

    return (
        <div className="shipping-modal">
            <div className="shipping-modal-content">
                <h3>Update Shipping Cost</h3>

                {/* DISPLAY THE CURRENT SHIPPING RATE */}
                {rate?.cost &&
                    <p>Current Rate: {rate.cost}</p>
                }

                <form onSubmit={updateRate} className="form" >

                    {/* SHIPPING RATE INPUT */}
                    <label>Shipping Rate ($):</label>
                    <input
                        type="number"
                        value={newRate}
                        onChange={(e) => setNewRate(e.target.value)}
                        placeholder="Enter rate"
                    />

                    <div className="modal-buttons">
                        <button type="submit" className="add-button button">
                            {loading ? "Updating..." : "Update"}
                        </button>
                        <button
                            type="button"
                            className="button logout-button"
                            onClick={() => setShowShippingModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ShippingModal;