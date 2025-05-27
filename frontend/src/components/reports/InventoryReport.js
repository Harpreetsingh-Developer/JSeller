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

export default function InventoryReport() {
  const [inventoryData, setInventoryData] = useState({
    totalValue: 0,
    totalItems: 0,
    categoryBreakdown: [],
    lowStockItems: []
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const response = await api.get('/reports/inventory');
      // Convert numeric values
      setInventoryData({
        totalValue: Number(response.data.totalValue || 0),
        totalItems: Number(response.data.totalItems || 0),
        categoryBreakdown: response.data.categoryBreakdown.map(item => ({
          ...item,
          value: Number(item.value || 0)
        })),
        lowStockItems: response.data.lowStockItems.map(item => ({
          ...item,
          quantity: Number(item.quantity || 0),
          price_per_unit: Number(item.price_per_unit || 0)
        }))
      });
    } catch (err) {
      console.error('Error fetching inventory data:', err);
    }
  };

  const chartData = {
    labels: inventoryData.categoryBreakdown.map(item => item.category),
    datasets: [
      {
        data: inventoryData.categoryBreakdown.map(item => item.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Inventory Report</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Inventory Value</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              ₹{Number(inventoryData.totalValue).toFixed(2)}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {inventoryData.totalItems}
            </dd>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h3>
          <div className="h-64">
            <Pie data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Low Stock Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price/Unit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryData.lowStockItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity} {item.weight_unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{Number(item.price_per_unit).toFixed(2)}
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