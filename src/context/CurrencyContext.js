import React, { createContext, useState, useContext, useEffect } from "react";

const CurrencyContext = createContext();

const EXCHANGE_API_URL = "https://v6.exchangerate-api.com/v6/6c8435e80c529cc62841f8af/latest/USD";
const FALLBACK_RATE = 1528; // Hardcoded fallback rate

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState("USD");
    const [exchangeRate, setExchangeRate] = useState(FALLBACK_RATE);

    // Fetch exchange rate on mount
    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                const response = await fetch(EXCHANGE_API_URL);
                const data = await response.json();

                if (data && data.conversion_rates && data.conversion_rates.NGN) {
                    setExchangeRate(data.conversion_rates.NGN);
                } else {
                    console.warn("NGN rate not found in API, using fallback.");
                }
            } catch (error) {
                console.error("Exchange rate API failed, using fallback.", error);
            }
        };

        fetchExchangeRate();
    }, []);

    const toggleCurrency = (newCurrency) => {
        setCurrency(newCurrency);
    };

    return (
        <CurrencyContext.Provider value={{ currency, toggleCurrency, exchangeRate }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
