import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            About BlogMe
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg max-w-2xl"
          >
            Learn more about our platform, mission, and the team behind BlogMe.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-dark-500 mb-6">
                At BlogMe, our mission is to create a platform where writers and readers can connect, share ideas, and engage
                in meaningful conversations. We believe in the power of storytelling and its ability to inspire, educate,
                and bring people together.
              </p>
              <p className="text-dark-500">
                We've built a modern, user-friendly platform that makes it easy for anyone to start blogging,
                regardless of their technical expertise. Our goal is to remove the barriers to entry and provide
                tools that help writers focus on what they do best: creating compelling content.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-dark-500 mb-6">
                BlogMe was founded in 2023 by a group of passionate writers and developers who saw a need for a
                more intuitive and beautiful blogging platform. After years of using various blogging tools that
                were either too complex or too limited, we decided to create something that combined powerful
                features with simplicity.
              </p>
              <p className="text-dark-500">
                Since our launch, we've been growing steadily, attracting writers from various backgrounds and
                disciplines. We're proud of the diverse community we've built and the quality of content being
                shared on our platform.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card p-6">
                  <h3 className="text-xl font-bold mb-3 text-primary-600">Accessibility</h3>
                  <p className="text-dark-500">
                    We believe that everyone should have the ability to share their voice. Our platform is
                    designed to be accessible to all, regardless of technical skill or background.
                  </p>
                </div>
                <div className="card p-6">
                  <h3 className="text-xl font-bold mb-3 text-primary-600">Quality</h3>
                  <p className="text-dark-500">
                    We encourage high-quality content that adds value to readers. Our features are designed
                    to help writers create and present their best work.
                  </p>
                </div>
                <div className="card p-6">
                  <h3 className="text-xl font-bold mb-3 text-primary-600">Community</h3>
                  <p className="text-dark-500">
                    We foster a supportive community where writers can connect, collaborate, and learn from
                    each other.
                  </p>
                </div>
                <div className="card p-6">
                  <h3 className="text-xl font-bold mb-3 text-primary-600">Innovation</h3>
                  <p className="text-dark-500">
                    We're constantly evolving and improving our platform based on user feedback and emerging
                    technologies.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-dark-500">
            Start sharing your stories with our growing community of writers and readers.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/blogs" className="btn btn-outline flex items-center">
              Explore Blogs <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 