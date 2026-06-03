import { LegislativeData } from '../types/types';

export const mockLegislativeData: LegislativeData = {
  main: {
    ordinanceLink: '/legislative/ordinances',
    ordinanceDescription: 'Municipal ordinances enacted by the Sangguniang Bayan — local laws that govern the municipality and its residents.',
    resolutionLink: '/legislative/resolutions',
    resolutionDescription: 'Resolutions passed by the Sangguniang Bayan expressing the will or opinion of the legislative body on various matters.',
    ordinanceSteps: [
      { step: 1, title: 'File Proposed Ordinance', description: 'Submit the proposed ordinance to the Sangguniang Bayan for consideration' },
      { step: 2, title: 'First Reading / Referral to Committee', description: 'Initial reading and assignment to the relevant committee for review' },
      { step: 3, title: 'Public Hearing / Committee Action', description: 'Committee conducts public hearing and deliberates on the proposed ordinance' },
      { step: 4, title: 'Committee Report', description: 'Committee submits findings and recommendations to the Sangguniang Bayan' },
      { step: 5, title: 'Second Reading', description: 'Detailed discussion and debate on the proposed ordinance' },
      { step: 6, title: 'Third and Final Reading', description: 'Final voting on the proposed ordinance by the Sangguniang Bayan' },
      { step: 7, title: '10-Day Mayor\'s Approval', description: 'Mayor reviews and approves the enacted ordinance within 10 days' },
      { step: 8, title: '3-Day Submission to SP', description: 'Submit approved ordinance to Sangguniang Panlalawigan for review within 3 days' },
      { step: 9, title: 'SP Review Period', description: '60-day review for appropriation ordinances; 30-day review for others' },
      { step: 10, title: 'Posting / Publication', description: 'Public posting and publication of the approved ordinance' },
      { step: 11, title: 'Implementation', description: 'Ordinance takes effect and is enforced within the municipality' }
    ],
    resolutionSteps: [
      { step: 1, title: 'File Proposed Resolution', description: 'Submit the proposed resolution to the Sangguniang Bayan' },
      { step: 2, title: 'Inclusion in Session Agenda', description: 'Resolution is scheduled for inclusion in the Sangguniang Bayan session' },
      { step: 3, title: 'Committee Meeting / Approval', description: 'Committee reviews and approves the proposed resolution' },
      { step: 4, title: 'Final Draft Printing', description: 'Legislative staff prepares and prints the final draft of the resolution' },
      { step: 5, title: 'Official Signing', description: 'Secretary to the Sanggunian and Presiding Officer sign the resolution' },
      { step: 6, title: 'Posting / Transmittal', description: 'Resolution is posted publicly and transmitted to concerned parties' }
    ],
    about: {
      title: 'Understanding Local Legislation',
      description: 'Learn about the legislative process of the Sangguniang Bayan',
      points: [
        { title: 'Ordinances', description: 'Local laws with permanent and general application that require compliance from residents and businesses within the municipality.' },
        { title: 'Resolutions', description: 'Expressions of the legislative body\'s will or opinion on specific matters, often used for commendations, requests, or policy positions.' },
        { title: 'Public Participation', description: 'Citizens can attend Sangguniang Bayan sessions and participate in public hearings for proposed ordinances.' },
        { title: 'Transparency', description: 'All enacted ordinances and resolutions are made available to the public as part of our commitment to open governance.' }
      ]
    }
  },
  ordinance: {
    definition: 'A municipal ordinance is a local law enacted by the Sangguniang Bayan (Municipal Council) that governs the municipality and its residents. Ordinances have the force and effect of law within the territorial jurisdiction of the municipality. Ordinances may cover various subjects including but not limited to: taxation, business regulations, public safety, environmental protection, traffic management, and zoning.',
    categories: ['Revenue & Taxation', 'Business & Trade', 'Public Safety', 'Environment', 'Traffic & Transportation', 'Zoning & Land Use'],
    documents: [
      { number: '2025-05-11', title: 'An Ordinance Creating the Film Development Council of the Municipality of Libmanan, Camarines Sur, Providing for Its Powers and Functions, and for Other Purposes', sessionDate: 'April 21, 2025' },
      { number: '2025-04-11', title: 'An Ordinance Prohibiting the Entry of Nuisance Contraband Inside the Libmanan District Jail in the Municipality of Libmanan, Camarines Sur, and Providing Penalties for Violation Thereof', sessionDate: 'April 21, 2025' },
      { number: '2025-03-11', title: 'An Ordinance Creating the Libmanan Municipal Housing Board, Defining Its Powers and Functions, and for Other Purposes', sessionDate: 'March 3, 2025' },
      { number: '2025-02-11', title: 'An Ordinance Requiring All Households in the Municipality of Libmanan, Camarines Sur to Comply with Zero Open Defecation (ZOD), Providing for Its Guidelines and Penalties for Violation and Appropriating Funds Therefor', sessionDate: 'February 25, 2025' },
      { number: '2025-01-11', title: 'An Ordinance Revising the Gender and Development Code of the Municipality of Libmanan, Camarines Sur and for Other Purposes, Subject to All Laws and Existing Rules and Regulations', sessionDate: 'February 25, 2025' }
    ],
    externalLink: 'https://sangguniangbayan.libmanan.gov.ph/'
  },
  resolution: {
    definition: 'A resolution is a formal expression of the opinion or will of the Sangguniang Bayan. Unlike ordinances, resolutions do not have the force and effect of law but serve as official statements of the legislative body. Resolutions are commonly used for: commendations, requests to higher government agencies, expressions of support or opposition, and administrative matters of the Sangguniang Bayan.',
    types: ['Commendation', 'Request/Appeal', 'Support/Endorsement', 'Condolence', 'Authorization', 'Appropriation'],
    documents: [
      { number: '248-2025-11', title: 'A Resolution Authorizing Municipal Mayor to Sign the Application Forms for the Building Permit for the Installation of Solar Poles Project', sessionDate: 'June 23, 2025' },
      { number: '247-2025-11', title: 'A Resolution Adopting Republic Act No. 8976, Otherwise Known as the Food Fortification Law, as Part of the Local Nutrition Program Implementation', sessionDate: 'June 23, 2025' },
      { number: '246-2025-11', title: 'A Resolution Adopting Republic Act No. 8172, Otherwise Known as the Act of Salt Iodization Nationwide (ASIN)', sessionDate: 'June 23, 2025' },
      { number: '245-2025-11', title: 'A Resolution Adopting Republic Act No. 10028, Otherwise Known as the Expanded Breastfeeding Promotion Act of 2009', sessionDate: 'June 23, 2025' },
      { number: '244-2025-11', title: 'A Resolution Adopting Executive Order No. 51, Otherwise Known as the National Code of Marketing of Breastmilk Substitute', sessionDate: 'June 23, 2025' }
    ],
    externalLink: 'https://sangguniangbayan.libmanan.gov.ph/'
  }
};
