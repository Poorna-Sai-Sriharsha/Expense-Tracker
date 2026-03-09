import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Food', 'Travel', 'Marketing', 'Utilities', 'Other'];

const EditTransactionModal = () => {
    const { updateExpense, editingExpense, setEditingExpense, currency, exchangeRates } = useExpenses();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (editingExpense) {
            setName(editingExpense.name);
            const rate = exchangeRates[currency] || 1;
            setAmount((editingExpense.amount * rate).toFixed(2));
            setCategory(editingExpense.category);
            setError('');
        }
    }, [editingExpense, currency, exchangeRates]);

    if (!editingExpense) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !amount) {
            setError('Please fill in all fields');
            return;
        }
        if (isNaN(amount) || Number(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        const rate = exchangeRates[currency] || 1;
        const amountInBase = parseFloat(amount) / rate;

        updateExpense(editingExpense.id, { name, amount: amountInBase, category });
        setEditingExpense(null);
    };

    const closeModal = () => {
        setEditingExpense(null);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={closeModal}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 20, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md panel border-t-[3px] border-t-brand-secondary h-auto flex flex-col shadow-2xl relative overflow-hidden group bg-dark-card"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-brand-secondary/10"></div>

                    <div className="p-6 border-b border-slate-800 flex justify-between items-center relative z-10 bg-dark-bg/30">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Edit2 className="text-brand-secondary" size={20} />
                            Edit Transaction
                        </h2>
                        <button type="button" onClick={closeModal} className="p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md transition-colors" title="Cancel Edit">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border-l-2 border-red-500 text-red-400 p-3 mb-5 rounded-md text-sm font-medium relative"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col relative z-10">
                            <div>
                                <label className="label-text group-hover:text-white transition-colors">Expense Description</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field group-hover:border-slate-600 focus:border-brand-secondary focus:ring-brand-secondary/50"
                                    placeholder="e.g. Monthly Server Hosting"
                                />
                            </div>

                            <div>
                                <label className="label-text group-hover:text-white transition-colors">Amount ({currency})</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="input-field group-hover:border-slate-600 focus:border-brand-secondary focus:ring-brand-secondary/50"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label-text group-hover:text-white transition-colors">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="input-field cursor-pointer appearance-none group-hover:border-slate-600 focus:border-brand-secondary focus:ring-brand-secondary/50"
                                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat} className="bg-dark-card text-slate-100">{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="px-4 py-2 pt-2.5 pb-2.5 w-full text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm text-sm border outline-none bg-brand-secondary hover:bg-brand-secondary/90 border-purple-500/50 hover:border-purple-400 shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.23)] mt-2"
                            >
                                Update Expense
                            </motion.button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EditTransactionModal;
