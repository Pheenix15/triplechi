import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "../components/firebase";
import { Country } from "country-state-city";

function ShippingModal({ setShowShippingModal }) {
    const [countryList, setCountryList] = useState([]) //LIST OF ALL COUNTRY
    const [selectedCountry, setSelectedCountry] = useState(''); // SELECTED FROM DROPDOWN
    const [rate, setRate] = useState(0); //SHIPPING RATE FROM FIREBASE
    const [newRate, setNewRate] = useState(0); //NEW SHIPPING RATE
    const [loading, setLoading] = useState(false);
    const [successAlert, setSuccessAlert] = useState(false)
    const [failAlert, setFailAlert] = useState(false)

    // List of all countries
    useEffect(() => {
        setCountryList(Country.getAllCountries());
    }, []);

    // Load standard shipping rates from Firebase
    useEffect(() => {
        const ratesRef = ref(database, "ShippingRate/Standard");
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

        // If country and cost is not selected, throw an error
        if (!selectedCountry || !newRate) {
            setFailAlert("Please select a country and enter a valid cost.");
            setTimeout(() => setFailAlert(''), 3000)
            return;
        }

        try {
            if (selectedCountry === "Standard Shipping Cost") {
                // Update the global fallback rate
                await update(ref(database, "ShippingRate"), {
                    Standard: Number(newRate),
                });
                setSuccessAlert(`Standard rate updated to ${newRate}`);
                setTimeout(() => setSuccessAlert(''), 3000)
                setLoading(false)
            } else {
                // Update or add country-specific rate
                await update(ref(database, "ShippingRate"), {
                    [selectedCountry]: Number(newRate),
            });
                setSuccessAlert(
                    `Rate for ${selectedCountry} set to $${newRate}`
                );
                setTimeout(() => setSuccessAlert(''), 3000)
                setLoading(false)
            }
            setNewRate("");
            setSelectedCountry("");
            
        } catch (error) {
            setFailAlert("Error updating rate: " + error.message);
            setTimeout(() => setFailAlert(''), 3000)
        }
    };


    

    return (
        <div className="shipping-modal">
            <div className="shipping-modal-content">
                {/* DISPLAY ALERTS */}
                {successAlert && (
                    <div className="alert success-alert">{successAlert}</div>
                )}

                {failAlert && (
                    <div className="alert fail-alert">{failAlert}</div>
                )}

                <div className="standard">
                    {rate && (
                        <p>Standard Shipping Rate: {rate}</p>
                    )}
                </div>
                
                <h3>Update Shipping Cost</h3>
                
                <form onSubmit={updateRate} className="form" >

                    <select name='Country' 
                        value={selectedCountry} 
                        onChange={(e) => { 
                            setSelectedCountry(e.target.value); 
                            // setSelectedCountryCode(e.target.selectedOptions[0].dataset.code) 
                        }} 
                        required
                    >
                        <option value="">Select Your Country</option>
                        <option value="Standard Shipping Cost">Standard Shipping Cost</option>
                        {countryList.map((country) => (
                            <option key={country.isoCode} value={country.name} data-code={country.isoCode}>
                                {country.name}
                            </option>
                        ))}
                    </select>

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