import { FaCalendarCheck, FaClock, FaUserPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';

export function AppointmentSection() {
  const bookingSteps = [
    {
      icon: FaUserPlus,
      label: 'Create Request',
      detail: 'Select the service you need'
    },
    {
      icon: FaCalendarCheck,
      label: 'Choose Schedule',
      detail: 'Pick an available date and time'
    },
    {
      icon: FaClock,
      label: 'Save Time',
      detail: 'Arrive with your reference details ready'
    }
  ];

  return (
    <section className="bg-neutral-100 py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Appointment Booking</p>
                      <p className="text-xs text-neutral-500">BetterLibmanan Portal</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                    Online
                  </span>
                </div>

                <div className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Next Available Slot</p>
                  <div className="mt-2 text-2xl font-bold text-neutral-900">Monday, 9:00 AM</div>
                  <p className="mt-1 text-sm text-neutral-500">Municipal Hall - Frontline Services</p>
                </div>

                <div className="space-y-3">
                  {bookingSteps.map((step) => (
                    <div
                      key={step.label}
                      className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                        <step.icon className="text-sm" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{step.label}</p>
                        <p className="mt-1 text-sm text-neutral-500">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 lg:text-3xl">
                Book Municipal Appointments With Less Waiting
              </h2>
              <p className="mt-3 sm:mt-4 text-sm leading-6 sm:leading-7 text-neutral-500">
                Schedule your visit online for certificates, permits, and other municipal services. The
                platform helps residents choose a convenient time, prepare requirements early, and avoid
                unnecessary queueing at the municipal hall.
              </p>

              <ul className="mb-8 mt-6 space-y-3">
                <li className="flex items-center gap-3 text-sm text-neutral-700">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white">
                    <FaCalendarCheck className="text-[10px]" />
                  </div>
                  Reserve appointments for frontline municipal services
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-700">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white">
                    <FaClock className="text-[10px]" />
                  </div>
                  Choose available schedules that fit your day
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-700">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white">
                    <FaUserPlus className="text-[10px]" />
                  </div>
                  Prepare ahead with clear booking and visit details
                </li>
              </ul>

              <button className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800">
                Schedule an Appointment
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

AppointmentSection.displayName = 'AppointmentSection';

export default AppointmentSection;
