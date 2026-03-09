import React from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import SummaryPanel from './components/SummaryPanel';
import EditTransactionModal from './components/EditTransactionModal';
import { LayoutDashboard, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col font-sans selection:bg-brand-primary/30 text-slate-100 relative overflow-hidden">

      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-secondary/10 blur-[120px] pointer-events-none"></div>

      {/* Top Navigation */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-dark-card/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-primary text-white p-2 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-500/30">
              <DollarSign size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Expense <span className="text-slate-400 font-medium">Tracker</span>
            </span>
          </div>
        </div>
      </motion.nav>

      {/* Main Layout Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 border-b border-slate-800 pb-4"
        >
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard size={24} className="text-brand-primary" />
            Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">Overview of your personal finances and recent transactions.</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left Column: Form */}
          <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-8 w-full">
            <ExpenseForm />
          </motion.div>

          {/* Right Column: Summary Panel and Recent Transactions */}
          <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-8 w-full">
            <SummaryPanel />
            <ExpenseList />
          </motion.div>
        </motion.div>
      </main>

      {/* Global Modals */}
      <EditTransactionModal />
    </div>
  );
}

export default App;
