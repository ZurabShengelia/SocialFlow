import { motion } from 'framer-motion';
import { MainLayout } from '../components/MainLayout';
import { useThemeStore } from '../store/themeStore';

export const PrivacyPage = () => {
  const { darkMode } = useThemeStore();

  const sections = [
    {
      title: 'Introduction',
      content: 'At SocialFlow, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform.',
    },
    {
      title: 'Information We Collect',
      content: 'We collect information you provide directly, such as when you create an account, edit your profile, post content, or contact us. This includes:\n• Account credentials (email, username, password)\n• Profile information (name, bio, avatar, location)\n• Content you create (posts, comments, messages)\n• Usage data and device information\n• Communication preferences',
    },
    {
      title: 'How We Use Your Information',
      content: 'We use the information we collect to:\n• Provide, maintain, and improve our services\n• Personalize your experience\n• Send transactional and promotional emails\n• Monitor and analyze trends, usage, and activities\n• Prevent fraudulent transactions and other illegal activities\n• Comply with legal obligations',
    },
    {
      title: 'Cookies and Tracking',
      content: 'We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.',
    },
    {
      title: 'Data Security',
      content: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is completely secure.',
    },
    {
      title: 'Your Privacy Rights',
      content: 'Depending on your location, you may have certain rights regarding your information, including:\n• The right to access your personal information\n• The right to correct inaccurate data\n• The right to request deletion of your information\n• The right to opt-out of marketing communications\n• The right to data portability',
    },
    {
      title: 'Third-Party Links',
      content: 'Our platform may contain links to third-party websites and services that are not operated by us. This Privacy Policy does not apply to third-party websites, and we are not responsible for their privacy practices.',
    },
    {
      title: 'Contact Us',
      content: 'If you have questions about this Privacy Policy or our privacy practices, please contact us at socialflow0001@gmail.com or use our contact form.',
    },
  ];

  return (
    <MainLayout>
      <div className={`min-h-screen py-12 px-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {}
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Privacy Policy
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Last updated: March 2026
            </p>
          </div>

          {}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.section
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-lg ${
                  darkMode ? 'bg-slate-800' : 'bg-white'
                } shadow-sm`}
              >
                <h2 className={`text-2xl font-semibold mb-3 flex items-center gap-2 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  <span className="text-primary">#</span>
                  {section.title}
                </h2>
                <p className={`leading-relaxed whitespace-pre-line ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {section.content}
                </p>
              </motion.section>
            ))}
          </div>

          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={`mt-12 p-6 rounded-lg border-l-4 ${
              darkMode
                ? 'bg-slate-800 border-primary text-gray-300'
                : 'bg-blue-50 border-primary text-gray-700'
            }`}
          >
            <p className="text-sm">
              <strong>Note:</strong> We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date above.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

