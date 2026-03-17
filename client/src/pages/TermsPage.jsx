import { motion } from 'framer-motion';
import { MainLayout } from '../components/MainLayout';
import { useThemeStore } from '../store/themeStore';

export const TermsPage = () => {
  const { darkMode } = useThemeStore();

  const sections = [
    {
      title: 'Acceptance of Terms',
      content: 'By accessing and using SocialFlow, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
    },
    {
      title: 'User Accounts',
      content: 'When you create an account on SocialFlow, you are responsible for:\n• Providing accurate and complete information\n• Maintaining the confidentiality of your password and account\n• Accepting responsibility for all activities under your account\n• Notifying us immediately of any unauthorized use\n\nYou agree not to create accounts using false information or impersonating others.',
    },
    {
      title: 'Content Ownership and Rights',
      content: 'You retain all rights to the content you post on SocialFlow. By posting content, you grant SocialFlow a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content on our platform.\n\nYou represent and warrant that you own or have the necessary rights to the content you post and that posting it does not violate any third-party rights.',
    },
    {
      title: 'Prohibited Behavior',
      content: 'You agree not to:\n• Post illegal, defamatory, or harmful content\n• Harass, threaten, or abuse other users\n• Spam or post repetitive content\n• Violate others\' intellectual property rights\n• Engage in phishing, fraud, or unauthorized access\n• Post explicit, violent, or hateful content\n• Attempt to manipulate platform functionality\n\nViolations may result in account suspension or termination.',
    },
    {
      title: 'Intellectual Property Rights',
      content: 'SocialFlow and its contents, features, and functionality (including all information, software, and text) are owned by SocialFlow, its licensors, or other providers of such material and are protected by copyright, trademark, and other intellectual property laws.',
    },
    {
      title: 'Limitation of Liability',
      content: 'TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL SOCIALFLOW, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF THE PLATFORM.',
    },
    {
      title: 'Disclaimer of Warranties',
      content: 'The platform is provided on an "as-is" and "as available" basis. SocialFlow makes no representations or warranties of any kind, express or implied, as to the operation of the platform or the information, content, or materials included on the platform.',
    },
    {
      title: 'Termination',
      content: 'SocialFlow may terminate your account and access to our platform at any time, without notice, for conduct that we believe violates these Terms of Service or is otherwise harmful to our platform, users, or business.',
    },
    {
      title: 'Modifications to Terms',
      content: 'SocialFlow reserves the right to modify these Terms of Service at any time. Your continued use of the platform following any such modification constitutes your acceptance of the new terms.',
    },
    {
      title: 'Governing Law',
      content: 'These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction in which SocialFlow operates, without regard to its conflict of laws principles.',
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
              Terms of Service
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
                transition={{ delay: index * 0.08 }}
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
              <strong>Agreement:</strong> By using SocialFlow, you acknowledge that you have read these Terms of Service and agree to be bound by them. If you do not agree with any part of these terms, please do not use our platform.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

