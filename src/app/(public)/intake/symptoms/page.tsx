import { SymptomChecker } from "@/components/intake/SymptomChecker";

export const metadata = { title: "Symptom Checker — Step 2" };

export default function SymptomsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Describe Your Symptoms</h1>
          <p className="text-gray-500 mt-1 text-sm">Select all that apply. Our AI will use this to prioritise your care.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {["Patient info", "Symptoms", "Confirmation"].map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold
                ${i <= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {i < 1 ? "✓" : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === 1 ? "text-blue-600 font-medium" : i < 1 ? "text-green-600" : "text-gray-400"}`}>{step}</span>
              {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <SymptomChecker />
      </div>
    </main>
  );
}
