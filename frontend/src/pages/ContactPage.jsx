import React, { useState } from 'react';
import Navbar from '../components/navbar';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Demo: show quick loader then reset
    setTimeout(() => {
      alert('Contact form submitted! (This is a demo - not connected to backend)');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 600);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 pt-4 pb-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <p className="text-gray-600 mb-8">
          Have questions or feedback? We'd love to hear from you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Message
          </button>
        </form>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl mb-2">📧</div>
            <h3 className="font-semibold mb-1">Email</h3>
            <p className="text-gray-600 text-sm">support@garbagereporter.com</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📞</div>
            <h3 className="font-semibold mb-1">Phone</h3>
            <p className="text-gray-600 text-sm">+91 1234567890</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📍</div>
            <h3 className="font-semibold mb-1">Address</h3>
            <p className="text-gray-600 text-sm">Municipal Office, City Center</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ContactPage;