import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFax,
  FaFacebook,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import {
  FaInstagram,
  FaYoutube,
  FaShieldAlt,
  FaHospital,
  FaFire,
  FaBuilding,
  FaExclamationTriangle,
  FaBroadcastTower
} from 'react-icons/fa';
import { ContactData } from '../types/types';

export const mockContactData: ContactData = {
  contactInfo: [
    {
      icon: FaPhone,
      title: 'Phone',
      value: '09000000000',
      href: 'tel:09000000000',
      description: 'Mon-Fri: 8:00 AM - 5:00 PM'
    },
    {
      icon: FaFax,
      title: 'Fax',
      value: '(000) 000-0000',
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
  ],
  departments: [
    { value: 'general', label: 'General Inquiry' },
    { value: 'mayor', label: "Mayor's Office - 09000000000" },
    { value: 'vice-mayor', label: "Vice Mayor's Office - 09000000000" },
    { value: 'treasurer', label: 'Municipal Treasurer - 09000000000' },
    { value: 'assessor', label: 'Municipal Assessor - 09000000000' },
    { value: 'engineering', label: 'Engineering Office - 09000000000' },
    { value: 'health', label: 'Rural Health Unit - 09000000000' },
    { value: 'agriculture', label: 'Agriculture Office - 09000000000' },
    { value: 'social', label: 'MSWDO - 09000000000' },
    { value: 'planning', label: 'Municipal Planning Office - 09000000000' },
    { value: 'business', label: 'Business Permits - 09000000000' },
    { value: 'civil-registrar', label: 'Civil Registrar - 09000000000' },
    { value: 'accounting', label: 'Accounting Office - 09000000000' },
    { value: 'budget', label: 'Budget Office - 09000000000' },
    { value: 'hrmo', label: 'HRMO - 09000000000' },
    { value: 'it', label: 'IT Support - 09000000000' }
  ],
  emergencyContacts: [
    { icon: FaShieldAlt, name: 'PNP Libmanan', number: '09000000000', description: 'Police Emergency' },
    { icon: FaExclamationTriangle, name: 'MDRRMO Libmanan', number: '09000000000', description: 'Disaster Response' },
    { icon: FaHospital, name: 'MSWDO Libmanan', number: '09000000000', description: 'Social Welfare' },
    { icon: FaFire, name: 'BFP Libmanan', number: '09000000000', description: 'Fire Emergency' },
    { icon: FaBuilding, name: 'DILG Libmanan', number: '09000000000', description: 'Local Government' },
    { icon: FaBroadcastTower, name: 'R2TMC', number: '09000000000', description: 'Traffic Management' }
  ],
  medicalEmergencyContacts: [
    { icon: FaHospital, name: 'RHU Libmanan', number: '09000000000', description: 'Rural Health Unit' },
    { icon: FaHospital, name: 'Libmanan District Hospital', number: '09000000000', description: 'District Hospital' },
    { icon: FaHospital, name: 'Red Cross Libmanan', number: '09000000000', description: 'Red Cross Services' }
  ],
  municipalOffices: [
    { name: "Mayor's Office", number: '09000000000' },
    { name: "Vice Mayor's Office", number: '09000000000' },
    { name: 'Sangguniang Bayan', number: '09000000000' },
    { name: 'Municipal Secretary', number: '09000000000' },
    { name: 'Municipal Treasurer', number: '09000000000' },
    { name: 'Municipal Assessor', number: '09000000000' },
    { name: 'Municipal Accountant', number: '09000000000' },
    { name: 'Municipal Budget Officer', number: '09000000000' },
    { name: 'Municipal Planning Officer', number: '09000000000' },
    { name: 'Municipal Engineer', number: '09000000000' },
    { name: 'Municipal Agriculturist', number: '09000000000' },
    { name: 'Municipal Civil Registrar', number: '09000000000' },
    { name: 'Municipal Social Welfare Officer', number: '09000000000' },
    { name: 'Municipal Health Officer', number: '09000000000' },
    { name: 'HRMO', number: '09000000000' },
    { name: 'Business Permits & Licensing', number: '09000000000' }
  ],
  socialLinks: [
    { icon: FaFacebook, name: 'Facebook', href: '#', color: 'hover:text-blue-600' },
    { icon: FaXTwitter, name: 'X', href: '#', color: 'hover:text-gray-900' },
    { icon: FaInstagram, name: 'Instagram', href: '#', color: 'hover:text-pink-600' },
    { icon: FaYoutube, name: 'YouTube', href: '#', color: 'hover:text-red-600' }
  ]
};
