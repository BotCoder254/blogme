import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const TermsOfService = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Terms of Service
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg max-w-2xl"
          >
            Last updated: January 2023
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center text-primary-600 mb-8 hover:text-primary-700">
              <FiArrowLeft className="mr-2" /> Back to Home
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="prose prose-lg max-w-none"
            >
              <h2>Agreement to Terms</h2>
              <p>
                These Terms of Service constitute a legally binding agreement made between you and BlogMe, concerning your access to and use of the BlogMe website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
              </p>
              <p>
                You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited from using the Site and you must discontinue use immediately.
              </p>

              <h2>User Registration</h2>
              <p>
                You may be required to register with the Site. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
              </p>

              <h2>User Content</h2>
              <p>
                Our Site allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Site, including its legality, reliability, and appropriateness.
              </p>
              <p>
                By posting Content on or through the Site, You represent and warrant that:
              </p>
              <ul>
                <li>The Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms.</li>
                <li>The posting of your Content on or through the Site does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.</li>
              </ul>

              <h2>Content Restrictions</h2>
              <p>
                The following types of content are not allowed on our platform:
              </p>
              <ul>
                <li>Content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, or hateful.</li>
                <li>Content that promotes illegal activities or conduct that is abusive, threatening, obscene, defamatory, or libelous.</li>
                <li>Content that infringes upon or violates any third party's intellectual property or other rights.</li>
                <li>Content that is false, misleading, or promotes illegal activities or conduct.</li>
              </ul>

              <h2>Intellectual Property Rights</h2>
              <p>
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
              </p>

              <h2>Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Site will immediately cease.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
              </p>

              <h2>Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms from time to time at our sole discretion. Therefore, you should review these pages periodically. When we change the Terms in a material manner, we will notify you that material changes have been made to the Terms. Your continued use of the Website after any such change constitutes your acceptance of the new Terms of Service.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> terms@blogme.com<br />
                <strong>Address:</strong> 123 Blog Street, Content City, BL 12345
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService; 