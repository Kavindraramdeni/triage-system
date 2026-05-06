import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Clinician Login — TriageAI" };

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Clinician Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Emergency Department — TriageAI</p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-slate-500 mt-6">
          Authorised personnel only. All actions are logged.
        </p>
      </div>
    </main>
  );
}
