import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CustomerReport() {
  const [customerData, setCustomerData] = useState({
    totalCustomers: 0,
    totalDueAmount: 0,
    paymentStats: {
      paid: 0,
      partial: 0,
      pending: 0
    },
    topCustomers: []
  });

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const response = await api.get('/reports/customers');
      // Convert numeric values
      setCustomerData({
        totalCustomers: Number(response.data.totalCustomers || 0),
        totalDueAmount: Number(response.data.totalDueAmount || 0),
        paymentStats: {
          paid: Number(response.data.paymentStats.paid || 0),
          partial: Number(response.data.paymentStats.partial || 0),
          pending: Number(response.data.paymentStats.pending || 0)
        },
        topCustomers: response.data.topCustomers.map(customer => ({
          ...customer,
          totalPurchases: Number(customer.totalPurchases || 0),
          dueAmount: Number(customer.dueAmount || 0)
        }))
      });
    } catch (err) {
      console.error('Error fetching customer data:', err);
    }
  };

  const chartData = {
    labels: ['Paid', 'Partial', 'Pending'],
    datasets: [
      {
        data: [
          customerData.paymentStats.paid,
          customerData.paymentStats.partial,
          customerData.paymentStats.pending
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(234, 179, 8, 0.5)',
          'rgba(239, 68, 68, 0.5)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Customer Report</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {customerData.totalCustomers}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Due Amount</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              ₹{Number(customerData.totalDueAmount).toFixed(2)}
            </dd>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status Distribution</h3>
          <div className="h-64">
            <Pie data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Customers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Purchases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerData.topCustomers.map((customer, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{Number(customer.totalPurchases).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{Number(customer.dueAmount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 