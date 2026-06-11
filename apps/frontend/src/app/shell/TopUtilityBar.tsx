import {
  FaShieldAlt,
  FaHospital,
  FaFire,
  FaBuilding,
  FaExclamationTriangle,
  FaBroadcastTower
} from 'react-icons/fa';

export function TopUtilityBar() {
  const emergencyContacts = [
    { icon: FaShieldAlt, name: 'Police', number: '0900 000 0000' },
    { icon: FaHospital, name: 'MSWDO', number: '0900 000 0000' },
    { icon: FaFire, name: 'Fire', number: '0900 000 0000' },
    { icon: FaBuilding, name: 'DILG', number: '0900 000 0000' },
    { icon: FaExclamationTriangle, name: 'MDRRMO', number: '0900 000 0000' },
    { icon: FaBroadcastTower, name: 'R2TMC', number: '0900 000 0000' }
  ];

  return (
    <div className="bg-red-900 text-white py-2 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {/* Duplicate contacts for infinite scroll effect */}
        {[...emergencyContacts, ...emergencyContacts].map((contact, index) => {
          const Icon = contact.icon;
          return (
            <a
              key={`${contact.name}-${index}`}
              href={`tel:${contact.number.replace(/\s/g, '')}`}
              className="flex items-center gap-2 mx-6 sm:mx-12 hover:text-yellow-300 transition-colors text-[11px] sm:text-xs font-medium"
            >
              <Icon size={12} className="shrink-0" />
              <span>{contact.name}: {contact.number}</span>
            </a>
          );
        })}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
