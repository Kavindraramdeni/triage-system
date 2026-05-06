import { DemographicsForm } from "@/components/intake/DemographicsForm";

export const metadata = { title: "Patient Intake — Step 1" };

export default function IntakePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Department Check-In</h1>
          <p className="text-gray-500 mt-1 text-sm">Please complete all fields accurately. This helps us assess your condition quickly.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {["Patient info", "Symptoms", "Confirmation"].map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold
                ${i === 0 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === 0 ? "text-blue-600 font-medium" : "text-gray-400"}`}>{step}</span>
              {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <DemographicsForm />

        <p className="text-center text-xs text-gray-400 mt-6">
          Your information is protected under HIPAA. We only use it for your care.
        </p>
      </div>
    </main>
  );
}
