import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
const CATEGORIES = ['Food', 'Travel', 'Marketing', 'Utilities', 'Other'];

const ExpenseForm = () => {
    const { addExpense, currency, exchangeRates } = useExpenses();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [error, setError] = useState('');

    const currencySymbol = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).formatToParts(1).find(x => x.type === 'currency').value;

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

        addExpense({
            name,
            amount: amountInBase,
            category
        });

        // Fire tiny confetti burst to celebrate tracking effectively!
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#3b82f6', '#8b5cf6', '#10b981'],
            disableForReducedMotion: true
        });

        setName('');
        setAmount('');
        setError('');
    };

    return (
        <div className="panel p-6 border-t-[3px] border-t-brand-primary h-auto flex flex-col shadow-xl shadow-black/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-colors duration-500 pointer-events-none"></div>

            <h2 className="text-lg font-bold mb-6 text-white flex items-center gap-2 relative">
                <Plus className="text-brand-primary" size={20} />
                New Transaction
            </h2>

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
                        className="input-field group-hover:border-slate-600 focus:border-brand-primary"
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
                            className="input-field group-hover:border-slate-600 focus:border-brand-primary"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <label className="label-text group-hover:text-white transition-colors">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-field cursor-pointer appearance-none group-hover:border-slate-600 focus:border-brand-primary"
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
                    className="btn-primary w-full mt-auto pt-2.5 pb-2.5 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)]"
                >
                    Add Expense
                </motion.button>
            </form>
        </div>
    );
};

export default ExpenseForm;
