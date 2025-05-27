import { useState } from 'react';
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import CustomerReport from './CustomerReport';

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-4" aria-label="Tabs">
          {['sales', 'inventory', 'customers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md capitalize`}
            >
              {tab} Report
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'sales' && <SalesReport />}
        {activeTab === 'inventory' && <InventoryReport />}
        {activeTab === 'customers' && <CustomerReport />}
      </div>
    </div>
  );
} 