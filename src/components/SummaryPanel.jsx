import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import CurrencyConverter from './CurrencyConverter';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Sector, LineChart, Line } from 'recharts';
import { TrendingUp, Activity, Filter } from 'lucide-react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

// Mobile responsive active shape
const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);

    // Calculate a smaller radius offset for mobile screens
    const isMobile = window.innerWidth < 768;
    const offset = isMobile ? 5 : 10;
    const mx = cx + (outerRadius + offset) * cos;
    const my = cy + (outerRadius + offset) * sin;

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + (isMobile ? 4 : 8)}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + (isMobile ? 6 : 10)}
                outerRadius={outerRadius + (isMobile ? 8 : 12)}
                fill={fill}
            />
        </g>
    );
};

const SummaryPanel = () => {
    const { expenses, filteredExpenses, selectedMonth, setSelectedMonth, currency, exchangeRates } = useExpenses();
    const [activeIndex, setActiveIndex] = useState(0);

    const availableMonths = useMemo(() => {
        const months = new Set(expenses.map(exp => exp.date.substring(0, 7))); // YYYY-MM
        return Array.from(months).sort().reverse();
    }, [expenses]);

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const totalUSD = useMemo(() => {
        return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    }, [filteredExpenses]);

    const convertedTotal = useMemo(() => {
        const rate = exchangeRates[currency] || 1;
        return totalUSD * rate;
    }, [totalUSD, currency, exchangeRates]);

    const categoryData = useMemo(() => {
        const totals = filteredExpenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

        const rate = exchangeRates[currency] || 1;

        return Object.entries(totals)
            .map(([name, value]) => ({
                name,
                value: Number((value * rate).toFixed(2))
            }))
            .sort((a, b) => b.value - a.value);
    }, [filteredExpenses, currency, exchangeRates]);

    const isBroadFilter = ['Annually', 'Half Yearly', 'This Quarter', 'All time', 'All'].includes(selectedMonth);

    const trendData = useMemo(() => {
        if (!isBroadFilter) return [];
        const rate = exchangeRates[currency] || 1;

        // Group by YYYY-MM
        const grouped = filteredExpenses.reduce((acc, exp) => {
            const monthKey = exp.date.substring(0, 7); // YYYY-MM
            acc[monthKey] = (acc[monthKey] || 0) + exp.amount;
            return acc;
        }, {});

        // Sort chronologically and format
        return Object.entries(grouped)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([dateKey, value]) => {
                const [year, month] = dateKey.split('-');
                const dateObj = new Date(year, month - 1);
                return {
                    name: dateObj.toLocaleString('default', { month: 'short', year: '2-digit' }),
                    value: Number((value * rate).toFixed(2))
                }
            });
    }, [filteredExpenses, currency, exchangeRates, isBroadFilter]);

    const currencySymbol = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).formatToParts(1).find(x => x.type === 'currency').value;

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-dark-card border border-slate-700 shadow-xl rounded-lg p-3 text-sm z-50 pointer-events-none"
                >
                    <p className="font-medium text-white mb-1">{payload[0].name}</p>
                    <p className="text-brand-primary font-bold">
                        {currencySymbol}{payload[0].value.toFixed(2)}
                    </p>
                </motion.div>
            );
        }
        return null;
    };

    return (
        <div className="panel p-4 md:p-6 shadow-xl shadow-black/20 border border-slate-800">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 pb-4 border-b border-slate-800 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity size={20} className="text-brand-primary" />
                        Financial Overview
                    </h2>
                    <p className="text-xs md:text-sm text-slate-400 mt-1">Total expenses and category breakdown.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* Date Filter */}
                    <div className="flex flex-col gap-2 w-full max-w-[200px] sm:min-w-[160px]">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                            <Filter size={16} className="text-brand-secondary" />
                            Filter Period
                        </label>
                        <div className="relative group">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-[#27272a] border border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary text-slate-100 font-medium cursor-pointer transition-all"
                                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
                            >
                                <option value="All" className="bg-dark-card">All Time</option>
                                <option value="Today" className="bg-dark-card">Today</option>
                                <option value="This Week" className="bg-dark-card">This Week</option>
                                <option value="This Month" className="bg-dark-card">This Month</option>
                                <option value="This Quarter" className="bg-dark-card">This Quarter</option>
                                <option value="Half Yearly" className="bg-dark-card">Half Yearly</option>
                                <option value="Annually" className="bg-dark-card">Annually</option>
                                <optgroup label="Historical Months" className="bg-dark-card text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                    {availableMonths.map(m => {
                                        const [year, month] = m.split('-');
                                        const dateObj = new Date(year, month - 1);
                                        return <option key={m} value={m} className="bg-dark-card text-slate-100 text-sm normal-case">{dateObj.toLocaleString('default', { month: 'short', year: 'numeric' })}</option>
                                    })}
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    <CurrencyConverter />
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Total Spending Stat - Full width */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="w-full flex flex-col sm:flex-row sm:items-end justify-between bg-dark-bg/50 p-4 md:p-6 rounded-xl border border-slate-800/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                >
                    <div className="overflow-hidden w-full">
                        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-brand-primary mb-2 uppercase tracking-wider">
                            <TrendingUp size={16} /> Filtered Total
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight break-all md:break-words flex items-baseline gap-1">
                            <span>{currencySymbol}</span>
                            <CountUp
                                end={convertedTotal}
                                duration={1.5}
                                decimals={2}
                                separator=","
                                preserveValue
                            />
                        </h1>
                    </div>
                    {currency !== 'USD' && (
                        <p className="text-xs md:text-sm text-slate-500 mt-4 sm:mt-0 font-medium whitespace-nowrap sm:pl-4">
                            Base: ${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                        </p>
                    )}
                </motion.div>

                {/* Charts Layout - Ensuring height constraints for mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 w-full">

                    {/* Pie Chart */}
                    <div className="h-[250px] md:h-[280px] w-full relative flex flex-col items-center">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                    <Pie
                                        activeIndex={activeIndex}
                                        activeShape={renderActiveShape}
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="50%"
                                        outerRadius="75%"
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                        onMouseEnter={onPieEnter}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} cursor={false} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm italic">
                                No data to visualize
                            </div>
                        )}
                        {categoryData.length > 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] md:text-xs text-slate-500 font-medium mt-1">Top</span>
                                <span className="text-xs md:text-sm font-bold text-white max-w-[80px] truncate text-center">
                                    {categoryData[0].name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Bar Chart */}
                    <div className="h-[250px] md:h-[280px] w-full mt-4 md:mt-0">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.3} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        width={75}
                                        tick={{ fill: '#94a3b8', fontSize: window.innerWidth < 768 ? 10 : 12, fontWeight: 500 }}
                                    />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="value"
                                        radius={[0, 4, 4, 0]}
                                        barSize={16}
                                        animationDuration={1500}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`bar-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm italic">
                                Waiting for entries...
                            </div>
                        )}
                    </div>
                </div>

                {/* Trend Line Chart for Broad Filters */}
                {isBroadFilter && trendData.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full mt-6 md:mt-2 h-[220px] md:h-[260px] border-t border-slate-800/80 pt-6"
                    >
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp size={16} className="text-brand-secondary" /> Spending Trend Over Time
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: window.innerWidth < 768 ? 10 : 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: window.innerWidth < 768 ? 10 : 12 }} tickFormatter={(value) => `${currencySymbol}${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`} width={window.innerWidth < 768 ? 50 : 70} />
                                <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#fff', stroke: '#8b5cf6' }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SummaryPanel;
