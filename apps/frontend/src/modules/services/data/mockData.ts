import {
  FaFileAlt,
  FaBriefcase,
  FaMoneyBill,
  FaUsers,
  FaHeartbeat,
  FaSeedling,
  FaRoad,
  FaGraduationCap,
  FaShieldAlt,
  FaLeaf,
  FaStore,
  FaHeart,
  FaSmile,
  FaWallet,
  FaIdCard,
  FaAccessibleIcon,
  FaHammer,
  FaQuestionCircle,
} from 'react-icons/fa';
import { ServicesData } from '../types/types';

export const mockServicesData: ServicesData = {
  categories: [
    {
      id: 'certificates',
      title: 'Certificates',
      slug: 'certificates',
      description: 'Birth, marriage, death, and other civil registry certificates',
      icon: FaFileAlt,
      services: [
        {
          id: 'birth-certificate',
          title: 'Birth Certificate',
          description: 'Get a certified copy of a birth certificate',
          requirements: [
            'Valid ID',
            'Proof of relationship (if requesting for someone else)'
          ],
          steps: [
            'Visit the Municipal Civil Registrar',
            'Fill out request form',
            'Submit requirements and pay fee',
            'Wait for processing',
            'Claim certificate'
          ],
          fee: 'Php 150',
          processingTime: '3-5 working days',
          categorySlug: 'certificates'
        },
        {
          id: 'marriage-certificate',
          title: 'Marriage Certificate',
          description: 'Obtain a copy of a marriage certificate',
          requirements: [
            'Valid ID',
            'Proof of relationship'
          ],
          steps: [
            'Visit the Municipal Civil Registrar',
            'Fill out request form',
            'Submit requirements and pay fee',
            'Wait for processing',
            'Claim certificate'
          ],
          fee: 'Php 150',
          processingTime: '3-5 working days',
          categorySlug: 'certificates'
        },
        {
          id: 'death-certificate',
          title: 'Death Certificate',
          description: 'Request a certified copy of a death certificate',
          requirements: [
            'Valid ID',
            'Proof of relationship'
          ],
          steps: [
            'Visit the Municipal Civil Registrar',
            'Fill out request form',
            'Submit requirements and pay fee',
            'Wait for processing',
            'Claim certificate'
          ],
          fee: 'Php 150',
          processingTime: '3-5 working days',
          categorySlug: 'certificates'
        }
      ]
    },
    {
      id: 'business',
      title: 'Business Permits',
      slug: 'business',
      description: 'New business permits, renewals, and closures',
      icon: FaBriefcase,
      services: [
        {
          id: 'new-business-permit',
          title: 'New Business Permit',
          description: 'Apply for a new business permit',
          requirements: [
            'Barangay Clearance',
            'DTI Registration',
            'Community Tax Certificate',
            'Proof of Address'
          ],
          steps: [
            'Secure barangay clearance',
            'Register business name at DTI',
            'Submit application to BPLO',
            'Pay required fees',
            'Receive business permit'
          ],
          fee: 'Varies by business type',
          processingTime: '5-7 working days',
          categorySlug: 'business'
        },
        {
          id: 'business-permit-renewal',
          title: 'Business Permit Renewal',
          description: 'Renew your existing business permit',
          requirements: [
            'Previous business permit',
            'Barangay Clearance',
            'Community Tax Certificate',
            'Financial statements'
          ],
          steps: [
            'Submit renewal application',
            'Pay renewal fees',
            'Receive renewed permit'
          ],
          fee: 'Varies by business type',
          processingTime: '2-3 working days',
          categorySlug: 'business'
        }
      ]
    },
    {
      id: 'tax-payments',
      title: 'Tax Payments',
      slug: 'tax-payments',
      description: 'Property tax, business tax, and other municipal tax payments',
      icon: FaMoneyBill,
      services: [
        {
          id: 'real-property-tax',
          title: 'Real Property Tax',
          description: 'Pay your real property tax',
          requirements: [
            'Tax Declaration',
            'Previous OR (if applicable)'
          ],
          steps: [
            'Visit Municipal Treasurer\'s Office',
            'Present tax declaration',
            'Pay tax due',
            'Get official receipt'
          ],
          fee: 'Based on property assessment',
          processingTime: 'Same day',
          categorySlug: 'tax-payments'
        },
        {
          id: 'business-tax',
          title: 'Business Tax',
          description: 'Settle your annual business tax',
          requirements: [
            'Business permit',
            'Previous year\'s OR'
          ],
          steps: [
            'Submit business tax declaration',
            'Pay tax due',
            'Receive official receipt'
          ],
          fee: 'Based on business gross receipts',
          processingTime: 'Same day',
          categorySlug: 'tax-payments'
        }
      ]
    },
    {
      id: 'social-services',
      title: 'Social Services',
      slug: 'social-services',
      description: 'Senior citizen, PWD, and other social welfare services',
      icon: FaUsers,
      services: [
        {
          id: 'senior-citizen-id',
          title: 'Senior Citizen ID',
          description: 'Apply for a senior citizen identification card',
          requirements: [
            'Birth Certificate',
            'Barangay Clearance',
            '2 pcs 1x1 ID photo'
          ],
          steps: [
            'Visit MSWDO',
            'Submit requirements',
            'Fill out application form',
            'Claim ID'
          ],
          fee: 'Free',
          processingTime: '3-5 working days',
          categorySlug: 'social-services'
        },
        {
          id: 'pwd-id',
          title: 'PWD ID',
          description: 'Get a Person with Disability ID',
          requirements: [
            'Medical Certificate',
            'Barangay Clearance',
            '2 pcs 1x1 ID photo'
          ],
          steps: [
            'Visit MSWDO',
            'Submit requirements',
            'Fill out application form',
            'Claim ID'
          ],
          fee: 'Free',
          processingTime: '3-5 working days',
          categorySlug: 'social-services'
        }
      ]
    },
    {
      id: 'health',
      title: 'Health Services',
      slug: 'health',
      description: 'Medical assistance, health programs, and hospital services',
      icon: FaHeartbeat,
      services: [
        {
          id: 'medical-assistance',
          title: 'Medical Assistance',
          description: 'Apply for financial medical assistance',
          requirements: [
            'Medical Certificate',
            'Barangay Indigency',
            'Valid ID'
          ],
          steps: [
            'Visit Municipal Health Office',
            'Submit requirements',
            'Wait for approval',
            'Claim assistance'
          ],
          fee: 'Subject to approval',
          processingTime: '5-7 working days',
          categorySlug: 'health'
        }
      ]
    },
    {
      id: 'agriculture',
      title: 'Agriculture',
      slug: 'agriculture',
      description: 'Agricultural programs, seeds, and farming assistance',
      icon: FaSeedling,
      services: [
        {
          id: 'seed-distribution',
          title: 'Seed Distribution',
          description: 'Get quality seeds for your farm',
          requirements: [
            'Barangay Clearance',
            'Proof of farming'
          ],
          steps: [
            'Visit Municipal Agriculture Office',
            'Submit requirements',
            'Receive seeds'
          ],
          fee: 'Free (subject to availability)',
          processingTime: 'Same day',
          categorySlug: 'agriculture'
        }
      ]
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure',
      slug: 'infrastructure',
      description: 'Building permits, construction, and public works',
      icon: FaRoad,
      services: [
        {
          id: 'building-permit',
          title: 'Building Permit',
          description: 'Apply for a building permit',
          requirements: [
            'Lot Plan',
            'Building Plan',
            'Barangay Clearance'
          ],
          steps: [
            'Submit plans to Engineering Office',
            'Wait for evaluation',
            'Pay fees',
            'Claim permit'
          ],
          fee: 'Varies by project size',
          processingTime: '7-10 working days',
          categorySlug: 'infrastructure'
        }
      ]
    },
    {
      id: 'education',
      title: 'Education',
      slug: 'education',
      description: 'Scholarships and educational assistance',
      icon: FaGraduationCap,
      services: [
        {
          id: 'scholarship-programs',
          title: 'Scholarship Programs',
          description: 'Apply for municipal scholarship grants',
          requirements: [
            'Report Card',
            'Barangay Clearance',
            'Income Tax Return'
          ],
          steps: [
            'Check scholarship openings',
            'Submit application',
            'Wait for screening',
            'Receive result'
          ],
          fee: 'Free',
          processingTime: '15-30 working days',
          categorySlug: 'education'
        }
      ]
    },
    {
      id: 'public-safety',
      title: 'Public Safety',
      slug: 'public-safety',
      description: 'Police, fire, and emergency services',
      icon: FaShieldAlt,
      services: [
        {
          id: 'police-clearance',
          title: 'Police Clearance',
          description: 'Request a police clearance certificate',
          requirements: [
            'Valid ID',
            'Barangay Clearance'
          ],
          steps: [
            'Visit PNP Station',
            'Submit requirements',
            'Have photo and fingerprints taken',
            'Claim clearance'
          ],
          fee: 'Php 150',
          processingTime: 'Same day',
          categorySlug: 'public-safety'
        }
      ]
    },
    {
      id: 'environment',
      title: 'Environment',
      slug: 'environment',
      description: 'Environmental programs and permits',
      icon: FaLeaf,
      services: [
        {
          id: 'environmental-clearance',
          title: 'Environmental Clearance',
          description: 'Secure an environmental clearance for your project',
          requirements: [
            'Project Description',
            'Location Map',
            'Barangay Clearance'
          ],
          steps: [
            'Submit application to Environment Office',
            'Wait for site inspection',
            'Pay fees',
            'Claim clearance'
          ],
          fee: 'Varies by project',
          processingTime: '7-10 working days',
          categorySlug: 'environment'
        }
      ]
    }
  ],
  lifeEvents: [
    {
      id: 'starting-business',
      title: 'Starting a Business',
      icon: FaStore,
      services: ['new-business-permit', 'business-permit-renewal', 'business-tax', 'environmental-clearance']
    },
    {
      id: 'getting-married',
      title: 'Getting Married',
      icon: FaHeart,
      services: ['marriage-certificate', 'birth-certificate']
    },
    {
      id: 'having-baby',
      title: 'Having a Baby',
      icon: FaSmile,
      services: ['birth-certificate', 'medical-assistance']
    },
    {
      id: 'need-financial-help',
      title: 'Need Financial Help',
      icon: FaWallet,
      services: ['medical-assistance', 'senior-citizen-id', 'pwd-id']
    },
    {
      id: 'senior-citizen',
      title: 'Senior Citizen Services',
      icon: FaIdCard,
      services: ['senior-citizen-id', 'birth-certificate']
    },
    {
      id: 'person-with-disability',
      title: 'Person with Disability',
      icon: FaAccessibleIcon,
      services: ['pwd-id', 'medical-assistance']
    },
    {
      id: 'building-home',
      title: 'Building/Home Improvement',
      icon: FaHammer,
      services: ['building-permit', 'environmental-clearance', 'real-property-tax']
    },
    {
      id: 'got-in-trouble',
      title: 'Got in Trouble',
      icon: FaQuestionCircle,
      services: ['police-clearance']
    }
  ]
};
