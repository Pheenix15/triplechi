// components/CurrencySwitcher.js
import React from 'react';
import { useCurrency } from './CurrencyContext';
import './CurrencySwitcher.css'

const CurrencySwitcher = () => {
    const { currency, toggleCurrency } = useCurrency();

    const handleChange = () => {
        toggleCurrency(currency === "USD" ? "NGN" : "USD");
    };

    return (
        <div className="currency-switcher">
            <label className='switch' >Currency:
                <input type='checkbox' checked={currency === "USD"} onChange={handleChange} />
                <span className="slider"></span>
                <span className="label">{currency}</span>
            </label>
        </div>
    );
};

export default CurrencySwitcher;