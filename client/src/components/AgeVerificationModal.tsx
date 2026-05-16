import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useAgeVerification } from "@/contexts/AgeVerificationContext";

export default function AgeVerificationModal() {
  const { isAgeVerified, verifyAge } = useAgeVerification();
  const [selectedYear, setSelectedYear] = useState("");
  const [error, setError] = useState("");

  if (isAgeVerified) return null;

  const handleVerify = () => {
    if (!selectedYear) {
      setError("Please select your birth year");
      return;
    }

    const birthYear = parseInt(selectedYear);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    if (age < 18) {
      setError("You must be 18 years or older to access adult content");
      return;
    }

    verifyAge();
  };

  const handleReject = () => {
    window.location.href = "https://www.google.com";
  };

  // Generate year options (from 1924 to current year - 18)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1924 + 1 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <div className="w-full max-w-md mx-auto p-8 bg-gradient-to-b from-slate-900 to-slate-950 border border-red-500/50 rounded-2xl shadow-2xl">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/20 rounded-full">
            <AlertCircle size={48} className="text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Age Verification
        </h1>
        <p className="text-center text-white/60 text-sm mb-6">
          This platform contains content for mature audiences (18+). Please verify your age to continue.
        </p>

        {/* Warning Message */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-sm">
            ⚠️ By confirming, you certify that you are at least 18 years old and agree to our terms.
          </p>
        </div>

        {/* Birth Year Selector */}
        <div className="mb-6">
          <label className="block text-white/80 text-sm font-semibold mb-3">
            Select Your Birth Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setError("");
            }}
            className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          >
            <option value="">-- Select Year --</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors duration-200"
          >
            Decline
          </button>
          <button
            onClick={handleVerify}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg"
          >
            I'm 18+
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          Your age verification is stored locally and will not be shared.
        </p>
      </div>
    </div>
  );
}
