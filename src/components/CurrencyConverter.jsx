import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Globe, RefreshCw, AlertCircle } from 'lucide-react';

const CurrencyConverter = () => {
    const { currency, setCurrency, exchangeRates, ratesLoading, ratesError } = useExpenses();

    const currencies = Object.keys(exchangeRates).sort();

    return (
        <div className="flex flex-col gap-2 w-full max-w-[200px]">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                    <Globe size={16} className="text-brand-primary" />
                    Display Currency
                </label>

                {ratesLoading && (
                    <span className="flex items-center gap-1 text-xs text-brand-secondary animate-pulse">
                        <RefreshCw size={12} className="animate-spin" />
                    </span>
                )}
            </div>

            <div className="relative group">
                <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    disabled={ratesLoading}
                    className="w-full appearance-none pl-4 pr-10 py-2.5 bg-[#27272a] border border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary text-slate-100 font-medium cursor-pointer transition-all disabled:opacity-70"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                    {currencies.map(c => (
                        <option key={c} value={c} className="bg-dark-card">{c}</option>
                    ))}
                </select>
            </div>

            {ratesError && (
                <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} />
                    Fallback rates used.
                </p>
            )}
        </div>
    );
};

export default CurrencyConverter;
