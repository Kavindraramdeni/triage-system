"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((d) => new Date(d) < new Date(), "Date of birth must be in the past"),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,15}$/, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  chiefComplaint: z
    .string()
    .min(5, "Describe your main concern (at least 5 characters)")
    .max(500),
});

type Field = keyof z.infer<typeof schema>;

export function DemographicsForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "", lastName: "", dateOfBirth: "",
    phone: "", email: "", chiefComplaint: "",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  function update(field: Field, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    const result = schema.safeParse(form);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0]])));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Clear any stale triage session data from previous visits
      ["triage_visit_id", "triage_token", "triage_mrn", "triage_complaint", "triage_dob"]
        .forEach((k) => sessionStorage.removeItem(k));

      // Store fresh session data for subsequent steps
      sessionStorage.setItem("triage_visit_id", data.visitId);
      sessionStorage.setItem("triage_token", data.accessToken);
      sessionStorage.setItem("triage_mrn", data.mrn);
      sessionStorage.setItem("triage_complaint", form.chiefComplaint);
      sessionStorage.setItem("triage_dob", form.dateOfBirth);

      router.push("/intake/symptoms");
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const inp = (err?: string) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm transition-colors outline-none
     ${err
       ? "border-red-300 bg-red-50 focus:border-red-500"
       : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
     }`;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FieldWrap label="First name" error={errors.firstName}>
          <input
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            className={inp(errors.firstName)}
            placeholder="Jane"
            autoComplete="given-name"
          />
        </FieldWrap>
        <FieldWrap label="Last name" error={errors.lastName}>
          <input
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            className={inp(errors.lastName)}
            placeholder="Smith"
            autoComplete="family-name"
          />
        </FieldWrap>
      </div>

      <FieldWrap label="Date of birth" error={errors.dateOfBirth}>
        <input
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => update("dateOfBirth", e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          min="1900-01-01"
          className={inp(errors.dateOfBirth)}
          autoComplete="bday"
        />
      </FieldWrap>

      <FieldWrap label="Phone number" error={errors.phone}>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className={inp(errors.phone)}
          placeholder="+91 98765 43210"
          autoComplete="tel"
        />
      </FieldWrap>

      <FieldWrap label="Email (optional)" error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className={inp(errors.email)}
          placeholder="jane@example.com"
          autoComplete="email"
        />
      </FieldWrap>

      <FieldWrap label="What brought you in today?" error={errors.chiefComplaint}>
        <textarea
          value={form.chiefComplaint}
          onChange={(e) => update("chiefComplaint", e.target.value)}
          className={`${inp(errors.chiefComplaint)} resize-none`}
          rows={3}
          placeholder="Describe your main symptom or concern in your own words..."
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {form.chiefComplaint.length}/500
        </p>
      </FieldWrap>

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Registering...
          </span>
        ) : (
          "Continue to symptoms →"
        )}
      </button>
    </form>
  );
}

function FieldWrap({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
