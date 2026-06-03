import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFax,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaShieldAlt,
  FaHospital,
  FaFire,
  FaBuilding,
  FaExclamationTriangle,
  FaBroadcastTower
} from 'react-icons/fa';

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

  const contactInfo = [
    {
      icon: FaPhone,
      title: 'Phone',
      value: '0917 595 1931',
      href: 'tel:09175951931',
      description: 'Mon-Fri: 8:00 AM - 5:00 PM'
    },
    {
      icon: FaFax,
      title: 'Fax',
      value: '(054) 871-2345',
      href: '#',
      description: 'Available 24/7'
    },
    {
      icon: FaEnvelope,
      title: 'Email',
      value: 'lgulibmanan@gmail.com',
      href: 'mailto:lgulibmanan@gmail.com',
      description: "We'll respond within 24 hours"
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Address',
      value: 'Municipal Hall, Poblacion, Libmanan, Camarines Sur 4418',
      href: '#',
      description: 'Visit us during office hours'
    }
  ];

  const departments = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'mayor', label: "Mayor's Office - 0917 595 1931" },
    { value: 'vice-mayor', label: "Vice Mayor's Office - 0918 123 4567" },
    { value: 'treasurer', label: 'Municipal Treasurer - 0919 234 5678' },
    { value: 'assessor', label: 'Municipal Assessor - 0920 345 6789' },
    { value: 'engineering', label: 'Engineering Office - 0921 456 7890' },
    { value: 'health', label: 'Rural Health Unit - 0922 567 8901' },
    { value: 'agriculture', label: 'Agriculture Office - 0923 678 9012' },
    { value: 'social', label: 'MSWDO - 0916 284 0885' },
    { value: 'planning', label: 'Municipal Planning Office - 0925 890 1234' },
    { value: 'business', label: 'Business Permits - 0926 901 2345' },
    { value: 'civil-registrar', label: 'Civil Registrar - 0927 012 3456' },
    { value: 'accounting', label: 'Accounting Office - 0928 123 4567' },
    { value: 'budget', label: 'Budget Office - 0929 234 5678' },
    { value: 'hrmo', label: 'HRMO - 0930 345 6789' },
    { value: 'it', label: 'IT Support - 0931 456 7890' }
  ];

  const emergencyContacts = [
    { icon: FaShieldAlt, name: 'PNP Libmanan', number: '0927 400 8033', description: 'Police Emergency' },
    { icon: FaExclamationTriangle, name: 'MDRRMO Libmanan', number: '0926 383 3744', description: 'Disaster Response' },
    { icon: FaHospital, name: 'MSWDO Libmanan', number: '0916 284 0885', description: 'Social Welfare' },
    { icon: FaFire, name: 'BFP Libmanan', number: '0936 062 0305', description: 'Fire Emergency' },
    { icon: FaBuilding, name: 'DILG Libmanan', number: '0906 188 0868', description: 'Local Government' },
    { icon: FaBroadcastTower, name: 'R2TMC', number: '0906 819 5569', description: 'Traffic Management' }
  ];

  const medicalEmergencyContacts = [
    { icon: FaHospital, name: 'RHU Libmanan', number: '0967 910 3054', description: 'Rural Health Unit' },
    { icon: FaHospital, name: 'Libmanan District Hospital', number: '0947 498 1746', description: 'District Hospital' },
    { icon: FaHospital, name: 'Red Cross Libmanan', number: '0917 507 9950', description: 'Red Cross Services' }
  ];

  const municipalOffices = [
    { name: "Mayor's Office", number: '0917 595 1931' },
    { name: "Vice Mayor's Office", number: '0918 123 4567' },
    { name: 'Sangguniang Bayan', number: '0919 234 5678' },
    { name: 'Municipal Secretary', number: '0920 345 6789' },
    { name: 'Municipal Treasurer', number: '0919 234 5678' },
    { name: 'Municipal Assessor', number: '0920 345 6789' },
    { name: 'Municipal Accountant', number: '0928 123 4567' },
    { name: 'Municipal Budget Officer', number: '0929 234 5678' },
    { name: 'Municipal Planning Officer', number: '0925 890 1234' },
    { name: 'Municipal Engineer', number: '0921 456 7890' },
    { name: 'Municipal Agriculturist', number: '0923 678 9012' },
    { name: 'Municipal Civil Registrar', number: '0927 012 3456' },
    { name: 'Municipal Social Welfare Officer', number: '0916 284 0885' },
    { name: 'Municipal Health Officer', number: '0922 567 8901' },
    { name: 'HRMO', number: '0930 345 6789' },
    { name: 'Business Permits & Licensing', number: '0926 901 2345' }
  ];

  const socialLinks = [
    { icon: FaFacebook, name: 'Facebook', href: '#', color: 'hover:text-blue-600' },
    { icon: FaTwitter, name: 'Twitter', href: '#', color: 'hover:text-blue-400' },
    { icon: FaInstagram, name: 'Instagram', href: '#', color: 'hover:text-pink-600' },
    { icon: FaYoutube, name: 'YouTube', href: '#', color: 'hover:text-red-600' }
  ];

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
