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

    // New Features
    const [editingExpense, setEditingExpense] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('All');

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

    const updateExpense = (id, updatedData) => {
        setExpenses(prev => prev.map(exp => (exp.id === id ? { ...exp, ...updatedData } : exp)));
    };

    const deleteExpense = (id) => {
        setExpenses(prev => prev.filter(exp => exp.id !== id));
        if (editingExpense?.id === id) {
            setEditingExpense(null);
        }
    };

    const filteredExpenses = expenses.filter(exp => {
        if (selectedMonth === 'All') return true;
        
        const expDate = new Date(exp.date);
        const today = new Date();
        
        // Reset times for accurate day comparisons
        const expDateOnly = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (selectedMonth === 'Today') {
            return expDateOnly.getTime() === todayOnly.getTime();
        }
        
        if (selectedMonth === 'This Week') {
            const firstDayOfWeek = new Date(todayOnly);
            firstDayOfWeek.setDate(todayOnly.getDate() - todayOnly.getDay()); // Sunday as first day
            return expDateOnly >= firstDayOfWeek;
        }

        if (selectedMonth === 'This Month') {
            return expDate.getFullYear() === today.getFullYear() && expDate.getMonth() === today.getMonth();
        }

        if (selectedMonth === 'This Quarter') {
            const currentQuarter = Math.floor(today.getMonth() / 3);
            const expQuarter = Math.floor(expDate.getMonth() / 3);
            return expDate.getFullYear() === today.getFullYear() && expQuarter === currentQuarter;
        }

        if (selectedMonth === 'Half Yearly') {
            const currentHalf = Math.floor(today.getMonth() / 6);
            const expHalf = Math.floor(expDate.getMonth() / 6);
            return expDate.getFullYear() === today.getFullYear() && expHalf === currentHalf;
        }

        if (selectedMonth === 'Annually') {
            return expDate.getFullYear() === today.getFullYear();
        }

        // Fallback to the original YYYY-MM precise matching string in case they are looking at history
        return exp.date.startsWith(selectedMonth);
    });

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
        filteredExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        editingExpense,
        setEditingExpense,
        selectedMonth,
        setSelectedMonth,
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
