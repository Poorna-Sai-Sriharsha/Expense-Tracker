import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ExpenseContext = createContext();

export const useExpenses = () => useContext(ExpenseContext);

const LOCAL_STORAGE_KEY = 'expenses_data';

export const ExpenseProvider = ({ children }) => {
    const [expenses, setExpenses] = useState(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    const [currency, setCurrency] = useState('INR');
    const [exchangeRates, setExchangeRates] = useState({ USD: 1 });
    const [ratesLoading, setRatesLoading] = useState(false);
    const [ratesError, setRatesError] = useState(null);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
    }, [expenses]);

    const addExpense = (expense) => {
        const newExpense = {
            ...expense,
            id: uuidv4(),
            date: new Date().toISOString()
        };
        setExpenses(prev => [newExpense, ...prev]);
    };

    const deleteExpense = (id) => {
        setExpenses(prev => prev.filter(exp => exp.id !== id));
    };

    const fetchRates = async (base = 'USD') => {
        setRatesLoading(true);
        setRatesError(null);
        try {
            // Using Frankfurter API - Free, no auth required
            const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
            if (!res.ok) throw new Error('Failed to fetch rates');
            const data = await res.json();
            setExchangeRates({ [base]: 1, ...data.rates });
        } catch (err) {
            console.error(err);
            setRatesError('Failed to load live exchange rates.');
            // Fallback rates if API fails
            setExchangeRates(prev => Object.keys(prev).length > 1 ? prev : { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5, AUD: 1.5 });
        } finally {
            setRatesLoading(false);
        }
    };

    useEffect(() => {
        fetchRates('USD');
    }, []);

    const value = {
        expenses,
        addExpense,
        deleteExpense,
        currency,
        setCurrency,
        exchangeRates,
        ratesLoading,
        ratesError
    };

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
};
