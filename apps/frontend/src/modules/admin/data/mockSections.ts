import type { ContentRecord, SectionSchema } from '../types/admin.types';

export const mockSections: SectionSchema[] = [
  {
    key: 'hero',
    displayName: 'Hero',
    supportsPreview: true,
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea', required: false },
      { key: 'ctaLabel', label: 'CTA Label', type: 'text', required: false },
      { key: 'ctaUrl', label: 'CTA URL', type: 'url', required: false },
      { key: 'backgroundImage', label: 'Background Image', type: 'image', required: false },
    ],
  },
  {
    key: 'leadership',
    displayName: 'Leadership',
    supportsPreview: true,
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'position', label: 'Position', type: 'text', required: false },
      { key: 'email', label: 'Email', type: 'text', required: false },
      { key: 'phone', label: 'Phone', type: 'text', required: false },
      { key: 'avatar', label: 'Avatar', type: 'image', required: false },
    ],
  },
  {
    key: 'latest-updates',
    displayName: 'Latest Updates',
    supportsPreview: true,
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'date', label: 'Date', type: 'date', required: false },
      { key: 'summary', label: 'Summary', type: 'textarea', required: false },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        required: false,
        options: ['published', 'draft'],
      },
    ],
  },
  {
    key: 'popular-services',
    displayName: 'Popular Services',
    supportsPreview: true,
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'icon', label: 'Icon', type: 'image', required: false },
      { key: 'description', label: 'Description', type: 'textarea', required: false },
    ],
  },
  {
    key: 'history',
    displayName: 'History',
    supportsPreview: false,
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'content', label: 'Content', type: 'textarea', required: false },
      { key: 'year', label: 'Year', type: 'text', required: false },
    ],
  },
  {
    key: 'at-a-glance',
    displayName: 'At a Glance',
    supportsPreview: false,
    fields: [
      { key: 'label', label: 'Label', type: 'text', required: true },
      { key: 'value', label: 'Value', type: 'text', required: true },
      { key: 'icon', label: 'Icon', type: 'text', required: false },
    ],
  },
  {
    key: 'weather-map',
    displayName: 'Weather & Map',
    supportsPreview: false,
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'embedUrl', label: 'Embed URL', type: 'url', required: false },
      { key: 'description', label: 'Description', type: 'textarea', required: false },
    ],
  },
  {
    key: 'contact',
    displayName: 'Contact',
    supportsPreview: false,
    fields: [
      { key: 'label', label: 'Label', type: 'text', required: true },
      { key: 'value', label: 'Value', type: 'text', required: true },
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        required: false,
        options: ['phone', 'email', 'address', 'fax'],
      },
    ],
  },
  {
    key: 'quiz',
    displayName: 'Quiz',
    supportsPreview: false,
    fields: [
      { key: 'question', label: 'Question', type: 'text', required: true },
      { key: 'answer', label: 'Answer', type: 'textarea', required: true },
      { key: 'category', label: 'Category', type: 'text', required: false },
    ],
  },
  {
    key: 'partner-logos',
    displayName: 'Partner Logos',
    supportsPreview: true,
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'logo', label: 'Logo', type: 'image', required: false },
      { key: 'websiteUrl', label: 'Website URL', type: 'url', required: false },
    ],
  },
  {
    key: 'emergency-contacts',
    displayName: 'Emergency Contacts',
    supportsPreview: false,
    fields: [
      { key: 'name', label: 'Agency Name', type: 'text', required: true },
      { key: 'number', label: 'Contact Number', type: 'text', required: true },
      {
        key: 'icon',
        label: 'Icon',
        type: 'select',
        required: false,
        options: ['shield', 'hospital', 'fire', 'building', 'warning', 'broadcast'],
      },
    ],
  },
  {
    // Freedom Wall is special — its data lives in its own MongoDB collection
    // and is fetched live (not via the ContentRecord store). Admins can only
    // delete notes; there is no create/edit form.
    key: 'freedom-wall',
    displayName: 'Freedom Wall',
    supportsPreview: false,
    fields: [],
  },
];

export const mockRecords: Record<string, ContentRecord[]> = {
  hero: [
    {
      id: 'hero-001',
      sectionKey: 'hero',
      title: 'Welcome to BetterLibmanan',
      status: 'published',
      fields: {
        title: 'Welcome to BetterLibmanan',
        subtitle: 'Your trusted gateway to local government services and information.',
        ctaLabel: 'Explore Services',
        ctaUrl: 'https://betterlibmanan.gov.ph/services',
        backgroundImage: '',
      },
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2024-03-15T10:30:00.000Z',
    },
    {
      id: 'hero-002',
      sectionKey: 'hero',
      title: 'Bagong Pilipinas — Libmanan Leads the Way',
      status: 'draft',
      fields: {
        title: 'Bagong Pilipinas — Libmanan Leads the Way',
        subtitle: 'Transparent governance and efficient services for every citizen.',
        ctaLabel: 'Learn More',
        ctaUrl: 'https://betterlibmanan.gov.ph/about',
        backgroundImage: '',
      },
      createdAt: '2024-04-01T09:00:00.000Z',
      updatedAt: '2024-04-01T09:00:00.000Z',
    },
  ],

  leadership: [
    {
      id: 'leadership-001',
      sectionKey: 'leadership',
      title: 'Hon. Maria Santos',
      status: 'published',
      fields: {
        name: 'Hon. Maria Santos',
        position: 'Municipal Mayor',
        email: 'mayor@libmanan.gov.ph',
        phone: '+63 54 123 4567',
        avatar: '',
      },
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2024-02-20T11:00:00.000Z',
    },
    {
      id: 'leadership-002',
      sectionKey: 'leadership',
      title: 'Hon. Jose Reyes',
      status: 'published',
      fields: {
        name: 'Hon. Jose Reyes',
        position: 'Municipal Vice Mayor',
        email: 'vmmayor@libmanan.gov.ph',
        phone: '+63 54 123 4568',
        avatar: '',
      },
      createdAt: '2024-01-10T08:05:00.000Z',
      updatedAt: '2024-02-20T11:05:00.000Z',
    },
    {
      id: 'leadership-003',
      sectionKey: 'leadership',
      title: 'Atty. Luz dela Cruz',
      status: 'draft',
      fields: {
        name: 'Atty. Luz dela Cruz',
        position: 'Municipal Administrator',
        email: 'admin@libmanan.gov.ph',
        phone: '+63 54 123 4569',
        avatar: '',
      },
      createdAt: '2024-03-05T10:00:00.000Z',
      updatedAt: '2024-03-05T10:00:00.000Z',
    },
  ],

  'latest-updates': [
    {
      id: 'updates-001',
      sectionKey: 'latest-updates',
      title: 'Municipal Budget 2024 Approved',
      status: 'published',
      fields: {
        title: 'Municipal Budget 2024 Approved',
        date: '2024-01-15',
        summary:
          'The Sangguniang Bayan unanimously approved the annual budget of ₱120 million for fiscal year 2024, prioritizing infrastructure, health, and education.',
        status: 'published',
      },
      createdAt: '2024-01-15T14:00:00.000Z',
      updatedAt: '2024-01-16T09:00:00.000Z',
    },
    {
      id: 'updates-002',
      sectionKey: 'latest-updates',
      title: 'Free Medical Mission — March 2024',
      status: 'published',
      fields: {
        title: 'Free Medical Mission — March 2024',
        date: '2024-03-20',
        summary:
          'The Municipal Health Office will conduct a free medical and dental mission at the Libmanan Public Plaza on March 20, 2024 from 8:00 AM to 5:00 PM.',
        status: 'published',
      },
      createdAt: '2024-03-10T08:00:00.000Z',
      updatedAt: '2024-03-12T10:00:00.000Z',
    },
    {
      id: 'updates-003',
      sectionKey: 'latest-updates',
      title: 'Road Rehabilitation Project — Phase 2',
      status: 'draft',
      fields: {
        title: 'Road Rehabilitation Project — Phase 2',
        date: '2024-05-01',
        summary:
          'Phase 2 of the national road rehabilitation covering barangays Pagsangahan to Loba-loba is scheduled to commence in May 2024.',
        status: 'draft',
      },
      createdAt: '2024-04-05T07:30:00.000Z',
      updatedAt: '2024-04-05T07:30:00.000Z',
    },
  ],

  'popular-services': [
    {
      id: 'services-001',
      sectionKey: 'popular-services',
      title: 'Business Permit Application',
      status: 'published',
      fields: {
        name: 'Business Permit Application',
        icon: '',
        description:
          'Apply for a new or renewal of business permit at the Municipal Business Permit and Licensing Office (BPLO). Processing takes 3–5 working days.',
      },
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2024-01-10T08:00:00.000Z',
    },
    {
      id: 'services-002',
      sectionKey: 'popular-services',
      title: 'Birth Certificate Request',
      status: 'published',
      fields: {
        name: 'Birth Certificate Request',
        icon: '',
        description:
          'Request a certified true copy of your birth certificate from the Municipal Civil Registrar. Available for same-day release.',
      },
      createdAt: '2024-01-10T08:10:00.000Z',
      updatedAt: '2024-01-10T08:10:00.000Z',
    },
    {
      id: 'services-003',
      sectionKey: 'popular-services',
      title: 'Senior Citizen ID',
      status: 'draft',
      fields: {
        name: 'Senior Citizen ID',
        icon: '',
        description:
          'Register for the Libmanan Senior Citizen ID to avail of government discounts and privileges. Bring a valid ID and 1x1 photo.',
      },
      createdAt: '2024-02-14T09:00:00.000Z',
      updatedAt: '2024-02-14T09:00:00.000Z',
    },
  ],

  history: [
    {
      id: 'history-001',
      sectionKey: 'history',
      title: 'Founding of Libmanan',
      status: 'published',
      fields: {
        title: 'Founding of Libmanan',
        content:
          'Libmanan was established as a municipality in 1573 during the Spanish colonial period. It is one of the oldest settlements in the province of Camarines Sur, founded by Augustinian missionaries.',
        year: '1573',
      },
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2024-01-10T08:00:00.000Z',
    },
    {
      id: 'history-002',
      sectionKey: 'history',
      title: 'Post-War Reconstruction',
      status: 'published',
      fields: {
        title: 'Post-War Reconstruction',
        content:
          'Following the end of World War II, Libmanan underwent significant reconstruction. Community-driven programs helped restore public buildings, schools, and infrastructure damaged during the occupation.',
        year: '1945',
      },
      createdAt: '2024-01-10T08:15:00.000Z',
      updatedAt: '2024-02-01T12:00:00.000Z',
    },
    {
      id: 'history-003',
      sectionKey: 'history',
      title: 'Centennial Celebration',
      status: 'draft',
      fields: {
        title: 'Centennial Celebration',
        content:
          'Draft content for the upcoming centennial section highlighting 100 years of municipal governance milestones and key achievements.',
        year: '2024',
      },
      createdAt: '2024-03-20T10:00:00.000Z',
      updatedAt: '2024-03-20T10:00:00.000Z',
    },
  ],

  'at-a-glance': [
    {
      id: 'glance-001',
      sectionKey: 'at-a-glance',
      title: 'Total Population',
      status: 'published',
      fields: {
        label: 'Total Population',
        value: '85,420',
        icon: 'users',
      },
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2024-03-01T09:00:00.000Z',
    },
    {
      id: 'glance-002',
      sectionKey: 'at-a-glance',
      title: 'Total Barangays',
      status: 'published',
      fields: {
        label: 'Total Barangays',
        value: '75',
        icon: 'map-pin',
      },
      createdAt: '2024-01-10T08:05:00.000Z',
      updatedAt: '2024-01-10T08:05:00.000Z',
    },
    {
      id: 'glance-003',
      sectionKey: 'at-a-glance',
      title: 'Land Area',
      status: 'draft',
      fields: {
        label: 'Land Area',
        value: '475.30 km²',
        icon: 'layers',
      },
      createdAt: '2024-04-01T11:00:00.000Z',
      updatedAt: '2024-04-01T11:00:00.000Z',
    },
  ],

  'weather-map': [
    {
      id: 'weather-001',
      sectionKey: 'weather-map',
      title: 'Current Weather — Libmanan',
      status: 'published',
      fields: {
        title: 'Current Weather — Libmanan',
        embedUrl: 'https://embed.windy.com/embed2.html?lat=13.7&lon=123.07&zoom=10',
        description: 'Live weather conditions for Libmanan and surrounding areas of Camarines Sur.',
      },
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2024-02-10T10:00:00.000Z',
    },
    {
      id: 'weather-002',
      sectionKey: 'weather-map',
      title: 'Interactive Municipal Map',
      status: 'draft',
      fields: {
        title: 'Interactive Municipal Map',
        embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.0',
        description: 'Interactive map showing barangay boundaries, roads, and key landmarks in Libmanan.',
      },
      createdAt: '2024-04-10T09:00:00.000Z',
      updatedAt: '2024-04-10T09:00:00.000Z',
    },
  ],

  contact: [
    {
      id: 'contact-001',
      sectionKey: 'contact',
      title: 'Main Office Phone',
      status: 'published',
      fields: {
        label: 'Main Office Phone',
        value: '(054) 871-1234',
        type: 'phone',
      },
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2024-01-10T08:00:00.000Z',
    },
    {
      id: 'contact-002',
      sectionKey: 'contact',
      title: 'Official Email',
      status: 'published',
      fields: {
        label: 'Official Email',
        value: 'info@libmanan.gov.ph',
        type: 'email',
      },
      createdAt: '2024-01-10T08:05:00.000Z',
      updatedAt: '2024-01-10T08:05:00.000Z',
    },
    {
      id: 'contact-003',
      sectionKey: 'contact',
      title: 'Municipal Hall Address',
      status: 'published',
      fields: {
        label: 'Municipal Hall Address',
        value: 'Municipal Hall, Poblacion, Libmanan, Camarines Sur 4407',
        type: 'address',
      },
      createdAt: '2024-01-10T08:10:00.000Z',
      updatedAt: '2024-01-10T08:10:00.000Z',
    },
    {
      id: 'contact-004',
      sectionKey: 'contact',
      title: 'Fax Line',
      status: 'draft',
      fields: {
        label: 'Fax Line',
        value: '(054) 871-5678',
        type: 'fax',
      },
      createdAt: '2024-04-01T08:00:00.000Z',
      updatedAt: '2024-04-01T08:00:00.000Z',
    },
  ],

  quiz: [
    {
      id: 'quiz-001',
      sectionKey: 'quiz',
      title: 'What year was Libmanan founded?',
      status: 'published',
      fields: {
        question: 'What year was Libmanan founded?',
        answer:
          'Libmanan was founded in 1573 by Spanish missionaries during the colonial period, making it one of the oldest municipalities in Camarines Sur.',
        category: 'History',
      },
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2024-01-10T08:00:00.000Z',
    },
    {
      id: 'quiz-002',
      sectionKey: 'quiz',
      title: 'How many barangays does Libmanan have?',
      status: 'published',
      fields: {
        question: 'How many barangays does Libmanan have?',
        answer:
          'Libmanan is composed of 75 barangays spread across its 475.30 km² land area in the province of Camarines Sur.',
        category: 'General Knowledge',
      },
      createdAt: '2024-01-10T08:10:00.000Z',
      updatedAt: '2024-01-10T08:10:00.000Z',
    },
    {
      id: 'quiz-003',
      sectionKey: 'quiz',
      title: 'What province is Libmanan located in?',
      status: 'draft',
      fields: {
        question: 'What province is Libmanan located in?',
        answer:
          'Libmanan is a municipality located in the province of Camarines Sur in the Bicol Region (Region V) of the Philippines.',
        category: 'Geography',
      },
      createdAt: '2024-03-15T10:00:00.000Z',
      updatedAt: '2024-03-15T10:00:00.000Z',
    },
  ],

  'emergency-contacts': [
    {
      id: 'emergency-001',
      sectionKey: 'emergency-contacts',
      title: 'Police',
      status: 'published',
      fields: { name: 'Police', number: '0900 000 0000', icon: 'shield' },
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2024-01-10T08:00:00.000Z',
    },
    {
      id: 'emergency-002',
      sectionKey: 'emergency-contacts',
      title: 'MSWDO',
      status: 'published',
      fields: { name: 'MSWDO', number: '0900 000 0000', icon: 'hospital' },
      createdAt: '2024-01-10T08:01:00.000Z',
      updatedAt: '2024-01-10T08:01:00.000Z',
    },
    {
      id: 'emergency-003',
      sectionKey: 'emergency-contacts',
      title: 'Fire',
      status: 'published',
      fields: { name: 'Fire', number: '0900 000 0000', icon: 'fire' },
      createdAt: '2024-01-10T08:02:00.000Z',
      updatedAt: '2024-01-10T08:02:00.000Z',
    },
    {
      id: 'emergency-004',
      sectionKey: 'emergency-contacts',
      title: 'DILG',
      status: 'published',
      fields: { name: 'DILG', number: '0900 000 0000', icon: 'building' },
      createdAt: '2024-01-10T08:03:00.000Z',
      updatedAt: '2024-01-10T08:03:00.000Z',
    },
    {
      id: 'emergency-005',
      sectionKey: 'emergency-contacts',
      title: 'MDRRMO',
      status: 'published',
      fields: { name: 'MDRRMO', number: '0900 000 0000', icon: 'warning' },
      createdAt: '2024-01-10T08:04:00.000Z',
      updatedAt: '2024-01-10T08:04:00.000Z',
    },
    {
      id: 'emergency-006',
      sectionKey: 'emergency-contacts',
      title: 'R2TMC',
      status: 'published',
      fields: { name: 'R2TMC', number: '0900 000 0000', icon: 'broadcast' },
      createdAt: '2024-01-10T08:05:00.000Z',
      updatedAt: '2024-01-10T08:05:00.000Z',
    },
  ],

  'partner-logos': [
    {
      id: 'partners-001',
      sectionKey: 'partner-logos',
      title: 'Department of Interior and Local Government',
      status: 'published',
      fields: {
        name: 'Department of Interior and Local Government',
        logo: '',
        websiteUrl: 'https://www.dilg.gov.ph',
      },
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2024-01-10T08:00:00.000Z',
    },
    {
      id: 'partners-002',
      sectionKey: 'partner-logos',
      title: 'Department of Public Works and Highways',
      status: 'published',
      fields: {
        name: 'Department of Public Works and Highways',
        logo: '',
        websiteUrl: 'https://www.dpwh.gov.ph',
      },
      createdAt: '2024-01-10T08:05:00.000Z',
      updatedAt: '2024-01-10T08:05:00.000Z',
    },
    {
      id: 'partners-003',
      sectionKey: 'partner-logos',
      title: 'Provincial Government of Camarines Sur',
      status: 'draft',
      fields: {
        name: 'Provincial Government of Camarines Sur',
        logo: '',
        websiteUrl: 'https://www.camarinessur.gov.ph',
      },
      createdAt: '2024-02-20T09:00:00.000Z',
      updatedAt: '2024-02-20T09:00:00.000Z',
    },
  ],
};

export default mockSections;
