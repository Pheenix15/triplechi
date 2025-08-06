import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "../components/firebase";


function ShippingModal({ setShowShippingModal, successAlert, setSuccessAlert, failAlert, setFailAlert }) {
    const [shippingRates, setShippingRates] = useState({});
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [rate, setRate] = useState("");
    const [loading, setLoading] = useState(false);

    const [newCountry, setNewCountry] = useState("");
    const [newState, setNewState] = useState("");
    
    // REFRENCE TO SHIPPING RATE DB
    useEffect(() => {
        const ratesRef = ref(database, "ShippingRate");

        const unsubscribe = onValue(ratesRef, (snapshot) => {
        const data = snapshot.val();
            setShippingRates(data || {});
        });

        return () => unsubscribe();
    }, []);

    // UPDATE SHIPPING RATE
    const updateRates = async (e) => {
        e.preventDefault();

        setLoading(true)
        const country = newCountry || selectedCountry;
        const state = newState || selectedState;

        if (!country || !state || !rate || isNaN(rate)) {
        failAlert("Please enter valid country, state, and rate.");
        return;
        }

        try {
            // const updateRef = ref(database, `ShippingRate/${country}/${state}`);
            await update(ref(database, `ShippingRate/${country}`), {
                [state]: parseFloat(rate)
            });

            setLoading(false)
            successAlert(`Rate for ${state}, ${country} updated.`);
            setShowShippingModal(false);
            setTimeout(() => successAlert(""), 3000)
        } catch (err) {
            console.error("Error updating rate:", err);
            failAlert("Failed to update rate." + err);
            setTimeout(() => failAlert(""), 3000)
        }
    };

    const countryOptions = Object.keys(shippingRates || {});
    const stateOptions = selectedCountry ? Object.keys(shippingRates[selectedCountry] || {}) : [];


    // HANDLE SHIPPING COST UPDATE FORM SUBMMIT
    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     if (!newCost || isNaN(newCost)) {
    //         setFailAlert("Enter a valid number for shipping cost.");
    //         return;
    //     }

    //     setLoading(true);

    //     try {
    //         const costRef = ref(database, "ShippingCost");
    //         await update(costRef, { cost: parseFloat(newCost) });

    //         successAlert("Shipping cost updated successfully.");
    //         setTimeout(() => successAlert(''), 3000)
    //         setShowShippingModal(false);
    //     } catch (error) {
    //         console.error("Error updating shipping cost:", error);
    //         setFailAlert("Failed to update shipping cost.");
    //         setTimeout(() => setFailAlert(''), 3000)
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    return ( 
        <div className="shipping-modal">
              
            <div className="shipping-modal-content">
                <h3>Update Shipping Cost</h3>

                

                <form onSubmit={updateRates}>
                    {/* COUNTRY SELECTION */}
                    <label>Country:</label>
                    <select
                        value={selectedCountry}
                        onChange={(e) => {
                        setSelectedCountry(e.target.value);
                        setSelectedState("");
                        }}
                    >
                        <option value="">-- Select Country --</option>
                        {countryOptions.map((country) => (
                        <option key={country} value={country}>{country}</option>
                        ))}
                    </select>

                    <p>Or add a new country:</p>
                    <input
                        type="text"
                        placeholder="New country"
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                    />

                    {/* STATE SELECTION */}
                    <label>State:</label>
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        disabled={!selectedCountry}
                    >
                        <option value="">-- Select State --</option>
                        {stateOptions.map((state) => (
                        <option key={state} value={state}>{state}</option>
                        ))}
                    </select>

                    <p>Or add a new state:</p>
                    <input
                        type="text"
                        placeholder="New state"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                    />

                    {/* RATE */}
                    <label>Shipping Rate ($):</label>
                    <input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
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