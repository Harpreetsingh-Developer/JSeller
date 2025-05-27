import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon } from '@heroicons/react/outline';
import api from '../../services/api';

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    contact_id: '',
    items: [{ inventory_id: '', quantity: '', price_per_unit: '', total_price: 0 }],
    total_amount: 0,
    paid_amount: 0
  });

  useEffect(() => {
    fetchContacts();
    fetchInventory();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/contacts');
      setContacts(response.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'inventory_id') {
      const selectedItem = inventory.find(item => item.id === parseInt(value));
      if (selectedItem) {
        newItems[index].price_per_unit = selectedItem.price_per_unit;
        newItems[index].total_price = selectedItem.price_per_unit * (newItems[index].quantity || 0);
      }
    }

    if (field === 'quantity') {
      newItems[index].total_price = newItems[index].price_per_unit * parseFloat(value || 0);
    }

    const total_amount = newItems.reduce((sum, item) => sum + (item.total_price || 0), 0);

    setFormData(prev => ({
      ...prev,
      items: newItems,
      total_amount
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { inventory_id: '', quantity: '', price_per_unit: '', total_price: 0 }]
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const total_amount = newItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    setFormData(prev => ({
      ...prev,
      items: newItems,
      total_amount
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/invoices', formData);
      navigate('/invoices');
    } catch (err) {
      console.error('Error creating invoice:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Invoice</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Customer
          </label>
          <select
            value={formData.contact_id}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_id: e.target.value }))}
            required
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          >
            <option value="">Select Customer</option>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Item
            </button>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <select
                  value={item.inventory_id}
                  onChange={(e) => handleItemChange(index, 'inventory_id', e.target.value)}
                  required
                  className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select Item</option>
                  {inventory.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} - ₹{inv.price_per_unit}/unit
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  placeholder="Qty"
                  required
                  step="0.001"
                  className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  value={item.price_per_unit}
                  readOnly
                  className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  value={item.total_price}
                  readOnly
                  className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-900"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <div className="w-64 space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Total Amount:</span>
              <span>₹{formData.total_amount.toFixed(2)}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Paid Amount
              </label>
              <input
                type="number"
                value={formData.paid_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, paid_amount: parseFloat(e.target.value || 0) }))}
                max={formData.total_amount}
                step="0.01"
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
} 