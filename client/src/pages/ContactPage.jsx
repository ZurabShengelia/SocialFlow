import { motion } from 'framer-motion';
import { useState } from 'react';
import { MainLayout } from '../components/MainLayout';
import { useThemeStore } from '../store/themeStore';
import { FiMail, FiMapPin, FiSend } from 'react-icons/fi';
import axios from 'axios';

export const ContactPage = () => {
  const { darkMode } = useThemeStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await axios.post('http://localhost:5000/api/contact', formData);
      setStatus({
        type: 'success',
        message: 'Your message has been sent successfully. We will get back to you as soon as possible.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Something went wrong. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: FiMail,
      title: 'Email',
      detail: 'socialflow0001@gmail.com',
      href: 'mailto:socialflow0001@gmail.com',
    },
    {
      icon: FiMapPin,
      title: 'Location',
      detail: 'Georgia',
      href: '#',
    },
  ];

  return (
    <MainLayout>
      <div className={`min-h-screen py-12 px-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {}
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Get in Touch
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Have a question or feedback? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.a
                  key={index}
                  href={info.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-lg text-center cursor-pointer transition hover:scale-105 ${
                    darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-gray-50'
                  } shadow-sm`}
                >
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-lg ${
                      darkMode ? 'bg-slate-700' : 'bg-primary/10'
                    }`}>
                      <Icon className="text-2xl text-primary" />
                    </div>
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {info.title}
                  </h3>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {info.detail}
                  </p>
                </motion.a>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`p-8 rounded-lg ${
              darkMode ? 'bg-slate-800' : 'bg-white'
            } shadow-sm`}
          >
            <h2 className={`text-2xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Send us a Message
            </h2>

            {status && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-lg ${
                  status.type === 'success'
                    ? darkMode
                      ? 'bg-green-900/30 text-green-300 border border-green-600'
                      : 'bg-green-50 text-green-800 border border-green-200'
                    : darkMode
                    ? 'bg-red-900/30 text-red-300 border border-red-600'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {status.message}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <input
                    id="contact_name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'
                    }`}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  <input
                    id="contact_email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'
                    }`}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Subject
                </label>
                <input
                  id="contact_subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'
                  }`}
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Message
                </label>
                <textarea
                  id="contact_message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'
                  }`}
                  placeholder="Your message here..."
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                  loading
                    ? darkMode
                      ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : `bg-primary hover:bg-primary/90 text-white`
                }`}
              >
                <FiSend />
                {loading ? 'Sending...' : 'Send Message'}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <h3 className={`text-2xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {[
                { q: 'What is the response time?', a: 'We typically respond to inquiries within 24 hours on business days.' },
                { q: 'Do you accept feature requests?', a: 'Yes! We love hearing about features our users want. Please include them in your message.' },
                { q: 'How can I report a bug?', a: 'You can report bugs through this contact form or email us at socialflow0001@gmail.com with as much detail as possible.' },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`p-4 rounded-lg ${
                    darkMode ? 'bg-slate-800' : 'bg-gray-50'
                  }`}
                >
                  <h4 className={`font-semibold mb-2 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {faq.q}
                  </h4>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {faq.a}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </MainLayout>
  );
};
