import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "../components/firebase";


function ShippingModal({ setShowShippingModal, successAlert, setSuccessAlert, failAlert, setFailAlert }) {
    const [newCost, setNewCost] = useState("");
    const [currentCost, setCurrentCost] = useState(null);
    const [loading, setLoading] = useState(false);
    
    
    // FETCH CURRENT SHIPPING COST
    useEffect(() => {
        const costRef = ref(database, "ShippingCost/cost");

        const unsubscribe = onValue(costRef, (snapshot) => {
        const cost = snapshot.val();
        if (cost !== null) {
            setCurrentCost(cost);
            setNewCost(cost); // prefill the form
        }
        });

        return () => unsubscribe();
    }, []);

    // HANDLE SHIPPING COST UPDATE FORM SUBMMIT
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newCost || isNaN(newCost)) {
            setFailAlert("Enter a valid number for shipping cost.");
            return;
        }

        setLoading(true);

        try {
            const costRef = ref(database, "ShippingCost");
            await update(costRef, { cost: parseFloat(newCost) });

            successAlert("Shipping cost updated successfully.");
            setTimeout(() => successAlert(''), 3000)
            setShowShippingModal(false);
        } catch (error) {
            console.error("Error updating shipping cost:", error);
            setFailAlert("Failed to update shipping cost.");
            setTimeout(() => setFailAlert(''), 3000)
        } finally {
            setLoading(false);
        }
    };


    return ( 
        <div className="shipping-modal">
              
            <div className="shipping-modal-content">
                <h3>Update Shipping Cost</h3>

                {currentCost !== null && (
                <p className="current-cost">Current cost: ${currentCost}</p>
                )}

                <form onSubmit={handleSubmit}>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newCost}
                        onChange={(e) => setNewCost(e.target.value)}
                        placeholder="Enter new shipping cost"
                        required
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