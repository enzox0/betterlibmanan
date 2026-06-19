export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: "History" | "Geography" | "Culture" | "Government" | "Nature";
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "In what province is Libmanan located?",
    options: ["Albay", "Camarines Norte", "Camarines Sur", "Sorsogon"],
    correctIndex: 2,
    explanation:
      "Libmanan is a first-class municipality situated in the province of Camarines Sur in the Bicol Region (Region V) of the Philippines.",
    category: "Geography",
  },
  {
    id: 2,
    question: "What is the income classification of Libmanan?",
    options: [
      "3rd Class Municipality",
      "2nd Class Municipality",
      "1st Class Municipality",
      "Component City",
    ],
    correctIndex: 2,
    explanation:
      "Libmanan is classified as a 1st class municipality, reflecting its strong economic activity and revenue generation within Camarines Sur.",
    category: "Government",
  },
  {
    id: 3,
    question:
      "Which famous natural attraction in Libmanan features dramatic stalactite formations?",
    options: [
      "Sipocot Cave",
      "Libmanan Cave",
      "Palestina Cavern",
      "Bicol Underground Cave",
    ],
    correctIndex: 1,
    explanation:
      "The Libmanan Cave in Barangay Palestina is one of the most visited natural attractions in Camarines Sur, known for its impressive stalactite and stalagmite formations.",
    category: "Nature",
  },
  {
    id: 4,
    question: "What region does Libmanan belong to?",
    options: [
      "Region IV-A (CALABARZON)",
      "Region VIII (Eastern Visayas)",
      "Region V (Bicol)",
      "Region VI (Western Visayas)",
    ],
    correctIndex: 2,
    explanation:
      "Libmanan is part of Region V, commonly known as the Bicol Region, which covers the southeastern tip of Luzon island.",
    category: "Geography",
  },
  {
    id: 5,
    question:
      "What is the famous Spanish colonial church in Libmanan dedicated to?",
    options: [
      "San Isidro Labrador",
      "Santo Niño",
      "San Pedro Apostol",
      "Santa Rosa de Lima",
    ],
    correctIndex: 2,
    explanation:
      "The San Pedro Apostol Parish Church is a centuries-old Spanish colonial church in Libmanan's town proper and is one of its most important heritage landmarks.",
    category: "History",
  },
  {
    id: 6,
    question:
      "Which iconic Bicolano dish is made of taro leaves wrapped around pork or fish in coconut cream?",
    options: ["Laing", "Pinangat", "Bicol Express", "Kinuwa"],
    correctIndex: 1,
    explanation:
      "Pinangat is a signature Bicol dish where taro leaves are wrapped around pork or fish fillings and simmered in coconut cream with spicy chilies. It originates from Camarines Sur.",
    category: "Culture",
  },
  {
    id: 7,
    question: "Approximately how many barangays does Libmanan have?",
    options: ["32", "55", "75", "90"],
    correctIndex: 2,
    explanation:
      "Libmanan has 75 barangays, making it one of the municipalities with the most administrative subdivisions in Camarines Sur.",
    category: "Government",
  },
  {
    id: 8,
    question:
      "What type of nut is a prized agricultural product and popular pasalubong from Camarines Sur?",
    options: ["Macadamia", "Cashew", "Pili", "Almonds"],
    correctIndex: 2,
    explanation:
      "The pili nut (Canarium ovatum) is native to the Philippines and is especially abundant in the Bicol Region. It is used in candies, brittles, and pastries and is a celebrated product of Camarines Sur.",
    category: "Culture",
  },
  {
    id: 9,
    question: "What is the approximate total land area of Libmanan?",
    options: ["148.54 km²", "248.54 km²", "348.54 km²", "448.54 km²"],
    correctIndex: 2,
    explanation:
      "Libmanan has a total land area of approximately 348.54 km², making it one of the larger municipalities in Camarines Sur.",
    category: "Geography",
  },
  {
    id: 10,
    question:
      "What is the primary local language spoken in Libmanan alongside Filipino and English?",
    options: ["Waray", "Bikolano (Bikol)", "Ilokano", "Cebuano"],
    correctIndex: 1,
    explanation:
      "Bikolano (Bikol) is the regional language of the Bicol Region and is widely spoken in Libmanan alongside Filipino and English.",
    category: "Culture",
  },
];

export const CATEGORY_COLORS: Record<QuizQuestion["category"], string> = {
  History: "bg-amber-100 text-amber-700 border-amber-200",
  Geography: "bg-blue-100 text-blue-700 border-blue-200",
  Culture: "bg-purple-100 text-purple-700 border-purple-200",
  Government: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Nature: "bg-teal-100 text-teal-700 border-teal-200",
};
