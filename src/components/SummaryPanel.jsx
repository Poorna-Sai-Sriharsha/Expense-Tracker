import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import CurrencyConverter from './CurrencyConverter';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Sector } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
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
            <text x={cx} y={cy} dy={4} textAnchor="middle" fill="#fff" className="font-bold text-xs md:text-sm">
                {payload.name}
            </text>
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
    const { expenses, currency, exchangeRates } = useExpenses();
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const totalUSD = useMemo(() => {
        return expenses.reduce((sum, exp) => sum + exp.amount, 0);
    }, [expenses]);

    const convertedTotal = useMemo(() => {
        const rate = exchangeRates[currency] || 1;
        return totalUSD * rate;
    }, [totalUSD, currency, exchangeRates]);

    const categoryData = useMemo(() => {
        const totals = expenses.reduce((acc, exp) => {
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
    }, [expenses, currency, exchangeRates]);

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-800 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity size={20} className="text-brand-primary" />
                        Financial Overview
                    </h2>
                    <p className="text-xs md:text-sm text-slate-400 mt-1">Total expenses and category breakdown.</p>
                </div>
                <CurrencyConverter />
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
                            <TrendingUp size={16} /> Total Spent
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
            </div>
        </div>
    );
};

export default SummaryPanel;
