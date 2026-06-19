import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { Skeleton, SkeletonCard } from "@/shared/ui";

export function ContactSection({ isLoading = false }: { isLoading?: boolean }) {
  const contactInfo = [
    {
      icon: FaPhone,
      title: "Phone",
      value: "(054) 123-4567",
      href: "tel:(054)123-4567",
      description: "Mon-Fri: 8:00 AM - 5:00 PM",
    },
    {
      icon: FaEnvelope,
      title: "Email",
      value: "lgulibmanan@gmail.com",
      href: "mailto:lgulibmanan@gmail.com",
      description: "We'll respond within 24 hours",
    },
    {
      icon: FaMapMarkerAlt,
      title: "Address",
      value: "Municipal Hall, Libmanan, Camarines Sur 4418",
      href: "#",
      description: "Visit us during office hours",
    },
  ];

  return (
    <section className="bg-neutral-100 py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            {isLoading ? (
              <>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-72" />
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">
                  Contact Information
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-neutral-500">
                  Get in touch with us for inquiries, concerns, or assistance
                </p>
              </>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonCard key={index}>
                    <Skeleton className="h-11 w-11 rounded-xl mb-4" />
                    <Skeleton className="h-5 w-24 mb-3" />
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-52" />
                  </SkeletonCard>
                ))
              : contactInfo.map((info) => {
                  const Icon = info.icon;
                  return (
                    <a
                      key={info.title}
                      href={info.href}
                      className="rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                        <Icon className="text-sm" />
                      </div>

                      <h3 className="text-base font-semibold text-neutral-900">
                        {info.title}
                      </h3>
                      <p className="mt-3 text-sm font-medium text-neutral-900">
                        {info.value}
                      </p>
                      <p className="mt-2 text-sm text-neutral-500">
                        {info.description}
                      </p>
                    </a>
                  );
                })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

ContactSection.displayName = "ContactSection";

export default ContactSection;
