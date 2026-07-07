import { Link } from "react-router-dom";
import { FaDatabase, FaUserShield, FaHandsHelping } from "react-icons/fa";

export function ContributeCTA() {
  return (
    <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-14 px-4">
      <div className="max-w-5xl mx-auto text-center">
        {/* Eyebrow */}
        <p className="text-blue-300 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-3">
          Help Us Keep Libmanan Informed
        </p>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
          This platform runs on community data
          <br className="hidden sm:block" /> and people who care.
        </h2>

        <p className="text-blue-200 text-sm sm:text-base max-w-2xl mx-auto mb-10">
          BetterLibmanan is built by volunteers and powered by open data. You
          can help by contributing government records, verifying existing
          information, or joining as an admin to keep the platform accurate and
          up to date.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
          {/* Contribute Data */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-colors">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <FaDatabase size={16} />
            </div>
            <h3 className="font-semibold text-base mb-1">Contribute Data</h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Submit ordinances, resolutions, budget data, or local records that
              should be publicly visible.
            </p>
          </div>

          {/* Volunteer */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-colors">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <FaHandsHelping size={16} />
            </div>
            <h3 className="font-semibold text-base mb-1">Volunteer With Us</h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Help gather data, verify public records, or build features. Any
              skill — tech or non-tech — is welcome.
            </p>
          </div>

          {/* Admin Access */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-colors">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center mb-4">
              <FaUserShield size={16} />
            </div>
            <h3 className="font-semibold text-base mb-1">
              Register for Admin Access
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Apply for a verified admin account to manage and publish
              information on behalf of your community.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/admin/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-900 font-semibold text-sm rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
          >
            <FaHandsHelping size={14} />
            Volunteer / Contribute Data
          </Link>
        </div>

        <p className="text-blue-400 text-xs mt-6">
          Already contributing?{" "}
          <Link
            to="/about"
            className="underline hover:text-white transition-colors"
          >
            Learn how BetterLibmanan works →
          </Link>
        </p>
      </div>
    </section>
  );
}
