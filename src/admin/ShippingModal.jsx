import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "../components/firebase";
import { Country, State } from "country-state-city";

function ShippingModal({ setShowShippingModal, successAlert, failAlert }) {
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [rate, setRate] = useState("");
    const [loading, setLoading] = useState(false);

    const [countryList, setCountryList] = useState([]);
    const [stateList, setStateList] = useState([]);

    // Load all countries once
    useEffect(() => {
        setCountryList(Country.getAllCountries());
    }, []);

    // Load shipping rates from Firebase
    useEffect(() => {
        const ratesRef = ref(database, "ShippingRate");
        const unsubscribe = onValue(ratesRef, (snapshot) => {
            const data = snapshot.val();
            setRate(data || {});
        });
        return () => unsubscribe();
    }, []);

    // Update state list when country changes
    useEffect(() => {
        if (selectedCountry) {
            const states = State.getStatesOfCountry(selectedCountry);
            setStateList(states);
            setSelectedState(""); // Reset state when country changes
        } else {
            setStateList([]);
        }
    }, [selectedCountry]);

    // Submit new rate
    const updateRates = async (e) => {
        e.preventDefault();
        setLoading(true);

        const countryObj = Country.getCountryByCode(selectedCountry);
        const countryName = countryObj?.name || "";

        if (!selectedCountry || !selectedState || !rate || isNaN(rate)) {
            failAlert("Please enter a valid country, state, and rate.");
            setLoading(false);
            return;
        }

        try {
            await update(ref(database, `ShippingRate/${countryName}`), {
                [selectedState]: parseFloat(rate),
            });

            successAlert(`Rate for ${selectedState}, ${countryName} updated.`);
            setShowShippingModal(false);
            setTimeout(() => successAlert(""), 3000);
        } catch (err) {
            console.error("Error updating rate:", err);
            failAlert("Failed to update rate. " + err.message);
            setTimeout(() => failAlert(""), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="shipping-modal">
            <div className="shipping-modal-content">
                <h3>Update Shipping Cost</h3>

                <form onSubmit={updateRates} className="form" >
                    {/* COUNTRY SELECT */}
                    <label>Country:</label>
                    <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                        <option value="">-- Select Country --</option>
                        {countryList.map((country) => (
                            <option key={country.isoCode} value={country.isoCode}>
                                {country.name}
                            </option>
                        ))}
                    </select>

                    {/* STATE SELECT */}
                    <label>State:</label>
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        disabled={!selectedCountry}
                    >
                        <option value="">-- Select State --</option>
                        {stateList.map((state) => (
                            <option key={state.isoCode} value={state.name}>
                                {state.name}
                            </option>
                        ))}
                    </select>

                    {/* SHIPPING RATE INPUT */}
                    <label>Shipping Rate ($):</label>
                    <input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        placeholder="Enter rate"
                        disabled={!selectedState}
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