import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPhone } from 'react-icons/fa';
import { mockContactData } from '../data/mockData';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  department: string;
}

export function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    department: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        department: 'general'
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const {
    contactInfo,
    departments,
    emergencyContacts,
    medicalEmergencyContacts,
    municipalOffices,
    socialLinks
  } = mockContactData;

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gray-900 py-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Get in Touch with Libmanan LGU
            </h1>
            <p className="mt-3 text-sm text-gray-300 sm:text-base">
              The Municipal Government of Libmanan is here to serve you. Contact us for government services, inquiries, and assistance.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.a
                  key={info.title}
                  href={info.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group rounded-xl border border-gray-300 bg-white p-4 transition-all duration-200 hover:border-blue-600 hover:shadow-lg"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="text-base" />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-900">{info.title}</h3>
                  <p className="mt-1.5 text-sm font-medium text-gray-900">{info.value}</p>
                  <p className="mt-1 text-xs text-gray-500">{info.description}</p>
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </section>
      
      {/* Emergency Contacts */}
      <section className="bg-white py-8 sm:py-12 border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 text-center">
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Emergency Hotlines</h2>
              <p className="mt-1.5 text-xs text-gray-600 sm:text-sm">
                For emergencies and urgent inquiries, contact these numbers anytime
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {emergencyContacts.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <motion.a
                    key={contact.name}
                    href={`tel:${contact.number.replace(/\s/g, '')}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white p-3 transition-all duration-200 hover:border-gray-900 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white">
                      <Icon className="text-base" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900">{contact.name}</h3>
                      <p className="text-sm font-medium text-gray-900">{contact.number}</p>
                      <p className="text-xs text-gray-600">{contact.description}</p>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Medical Emergency Hotlines */}
      <section className="bg-blue-50 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 text-center">
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Medical Emergency Hotlines</h2>
              <p className="mt-1.5 text-xs text-gray-600 sm:text-sm">
                For medical emergencies and hospital inquiries
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {medicalEmergencyContacts.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <motion.a
                    key={contact.name}
                    href={`tel:${contact.number.replace(/\s/g, '')}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-3 rounded-xl border border-blue-300 bg-white p-3 transition-all duration-200 hover:border-blue-600 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <Icon className="text-base" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900">{contact.name}</h3>
                      <p className="text-sm font-medium text-blue-600">{contact.number}</p>
                      <p className="text-xs text-gray-600">{contact.description}</p>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Municipal Offices Directory */}
      <section className="bg-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 text-center">
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Municipal Offices Directory</h2>
              <p className="mt-1.5 text-xs text-gray-600 sm:text-sm">
                Direct contact numbers for all municipal offices
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {municipalOffices.map((office, index) => (
                <motion.a
                  key={office.name}
                  href={`tel:${office.number.replace(/\s/g, '')}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (index % 12) * 0.05 }}
                  className="group rounded-lg border border-gray-300 bg-white p-3 transition-all duration-200 hover:border-gray-900 hover:shadow-md"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors group-hover:bg-gray-900 group-hover:text-white">
                      <FaPhone className="text-xs" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-semibold text-gray-900 line-clamp-2">{office.name}</h3>
                      <p className="mt-0.5 text-xs font-medium text-gray-900">{office.number}</p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

ContactPage.displayName = 'ContactPage';

export default ContactPage;
