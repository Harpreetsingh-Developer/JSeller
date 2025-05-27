import { useState, useEffect } from 'react';
import { DownloadIcon } from '@heroicons/react/outline';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SalesReport() {
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    totalInvoices: 0,
    averageInvoiceValue: 0,
    pendingPayments: 0,
    dailySales: []
  });
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchSalesData();
  }, [timeRange]);

  const fetchSalesData = async () => {
    try {
      const response = await api.get(`/reports/sales?range=${timeRange}`);
      // Convert numeric values
      setSalesData({
        totalSales: Number(response.data.totalSales || 0),
        totalInvoices: Number(response.data.totalInvoices || 0),
        averageInvoiceValue: Number(response.data.averageInvoiceValue || 0),
        pendingPayments: Number(response.data.pendingPayments || 0),
        dailySales: response.data.dailySales.map(sale => ({
          ...sale,
          amount: Number(sale.amount || 0)
        }))
      });
    } catch (err) {
      console.error('Error fetching sales data:', err);
    }
  };

  const chartData = {
    labels: salesData.dailySales.map(sale => new Date(sale.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Sales',
        data: salesData.dailySales.map(sale => sale.amount),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Sales Trend'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const exportReport = () => {
    // Implementation for exporting report to Excel/CSV
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Sales Report</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              ₹{Number(salesData.totalSales).toFixed(2)}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {salesData.totalInvoices}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Average Invoice Value</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              ₹{Number(salesData.averageInvoiceValue).toFixed(2)}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Payments</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              ₹{Number(salesData.pendingPayments).toFixed(2)}
            </dd>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h3>
        <div className="h-80">
          <Line data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={exportReport}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <DownloadIcon className="-ml-1 mr-2 h-5 w-5" />
          Export Report
        </button>
      </div>
    </div>
  );
} 