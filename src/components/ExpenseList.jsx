import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Trash2, Coffee, Plane, Megaphone, Zap, CreditCard, List, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categoryIcons = {
    'Food': <Coffee size={18} className="text-orange-400" />,
    'Travel': <Plane size={18} className="text-blue-400" />,
    'Marketing': <Megaphone size={18} className="text-purple-400" />,
    'Utilities': <Zap size={18} className="text-yellow-400" />,
    'Other': <CreditCard size={18} className="text-emerald-400" />
};

const categoryColors = {
    'Food': 'bg-orange-950/30 border-orange-500/20 text-orange-400',
    'Travel': 'bg-blue-950/30 border-blue-500/20 text-blue-400',
    'Marketing': 'bg-purple-950/30 border-purple-500/20 text-purple-400',
    'Utilities': 'bg-yellow-950/30 border-yellow-500/20 text-yellow-400',
    'Other': 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400',
};

const ExpenseList = () => {
    const { filteredExpenses, setEditingExpense, deleteExpense, currency, exchangeRates } = useExpenses();

    const getConvertedAmount = (amount) => {
        const rate = exchangeRates[currency] || 1;
        return (amount * rate).toFixed(2);
    };

    const currencySymbol = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).formatToParts(1).find(x => x.type === 'currency').value;

    return (
        <div className="panel flex flex-col h-full border border-slate-800 shadow-xl shadow-black/20">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-dark-card/50">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <List size={20} className="text-brand-primary" />
                    Recent Transactions
                </h2>
                <motion.span
                    key={filteredExpenses.length}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xs font-semibold px-2.5 py-1 bg-slate-800 rounded-md text-slate-300 border border-slate-700"
                >
                    {filteredExpenses.length} Records
                </motion.span>
            </div>

            {filteredExpenses.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 p-8 flex flex-col items-center justify-center text-center min-h-[250px]"
                >
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    >
                        <CreditCard className="text-slate-500" size={24} />
                    </motion.div>
                    <h3 className="text-md font-medium text-white">No transactions found</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-[200px]">No records align with the current filters.</p>
                </motion.div>
            ) : (
                <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[500px] custom-scrollbar overflow-x-hidden">
                    <div className="flex flex-col divide-y divide-slate-800/80">
                        <AnimatePresence>
                            {filteredExpenses.map((expense) => (
                                <motion.div
                                    key={expense.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className="hover:bg-slate-800/50 transition-colors group relative p-4 sm:px-6 flex items-center justify-between gap-2"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                                        <div className={`p-2 rounded-lg border shrink-0 ${categoryColors[expense.category] || categoryColors['Other']}`}>
                                            {categoryIcons[expense.category] || categoryIcons['Other']}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-white group-hover:text-brand-primary transition-colors truncate text-sm md:text-base">{expense.name}</p>
                                            <p className="text-xs text-slate-400 font-medium mt-0.5 group-hover:text-slate-300 transition-colors truncate">
                                                {expense.category} · {new Date(expense.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 md:gap-4 shrink-0">
                                        <div className="text-right flex flex-col items-end justify-center">
                                            <p className="font-bold text-white tracking-wide text-sm md:text-base">
                                                {currencySymbol}{getConvertedAmount(expense.amount)}
                                            </p>
                                            {currency !== 'USD' && (
                                                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
                                                    ${expense.amount.toFixed(2)} USD
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex sm:flex-row justify-end gap-1 md:gap-2 border-l border-slate-700/50 pl-3">
                                            <button
                                                onClick={() => setEditingExpense(expense)}
                                                className="p-1.5 text-slate-400 hover:text-brand-secondary hover:bg-brand-secondary/10 rounded-md transition-all sm:opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none transform"
                                                title="Edit expense"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteExpense(expense.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all sm:opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none hover:rotate-12 transform"
                                                title="Delete expense"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseList;
