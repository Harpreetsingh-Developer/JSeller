import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DownloadIcon } from '@heroicons/react/outline';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import api from '../../services/api';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${id}`);
      setInvoice(response.data);
    } catch (err) {
      console.error('Error fetching invoice:', err);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add company info
    doc.setFontSize(20);
    doc.text('Jewellery Seller', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Invoice', 105, 30, { align: 'center' });

    // Add invoice details
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.id}`, 20, 40);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 45);
    doc.text(`Customer: ${invoice.contact_name}`, 20, 50);

    // Add items table
    const tableData = invoice.items.map(item => [
      item.item_name,
      item.quantity,
      `₹${item.price_per_unit}`,
      `₹${item.total_price}`
    ]);

    doc.autoTable({
      startY: 60,
      head: [['Item', 'Quantity', 'Price/Unit', 'Total']],
      body: tableData,
    });

    // Add totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Amount: ₹${invoice.total_amount}`, 150, finalY);
    doc.text(`Paid Amount: ₹${invoice.paid_amount}`, 150, finalY + 5);
    doc.text(`Balance: ₹${invoice.total_amount - invoice.paid_amount}`, 150, finalY + 10);

    // Save PDF
    doc.save(`invoice-${invoice.id}.pdf`);
  };

  if (!invoice) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Invoice #{invoice.id}</h2>
        <div className="flex space-x-3">
          <button
            onClick={generatePDF}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <DownloadIcon className="-ml-1 mr-2 h-5 w-5" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Invoice Details
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-8">
            <div>
              <dt className="text-sm font-medium text-gray-500">Customer</dt>
              <dd className="mt-1 text-sm text-gray-900">{invoice.contact_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(invoice.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{invoice.status}</dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-gray-200">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.item_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{item.price_per_unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{item.total_price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-8">
            <div className="col-start-2">
              <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
              <dd className="mt-1 text-sm text-gray-900">₹{invoice.total_amount}</dd>
            </div>
            <div className="col-start-2">
              <dt className="text-sm font-medium text-gray-500">Paid Amount</dt>
              <dd className="mt-1 text-sm text-gray-900">₹{invoice.paid_amount}</dd>
            </div>
            <div className="col-start-2">
              <dt className="text-sm font-medium text-gray-500">Balance</dt>
              <dd className="mt-1 text-sm text-gray-900">
                ₹{invoice.total_amount - invoice.paid_amount}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
} 