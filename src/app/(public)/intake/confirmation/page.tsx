import { ConfirmationView } from "@/components/intake/ConfirmationView";

export const metadata = { title: "You're checked in — TriageAI" };

export default function ConfirmationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          {["Patient info", "Symptoms", "Confirmation"].map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold bg-blue-600 text-white">✓</div>
              <span className={`text-xs hidden sm:block ${i === 2 ? "text-blue-600 font-medium" : "text-green-600"}`}>{step}</span>
              {i < 2 && <div className="flex-1 h-px bg-blue-200" />}
            </div>
          ))}
        </div>
        <ConfirmationView />
      </div>
    </main>
  );
}
