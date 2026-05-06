"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SYMPTOM_GROUPS = [
  {
    category: "Cardiovascular",
    selectedCls: "bg-red-200 border-red-400 text-red-900",
    defaultCls: "border-red-200 bg-red-50 hover:bg-red-100 text-red-800",
    symptoms: ["Chest pain", "Chest tightness", "Palpitations", "Irregular heartbeat", "Shortness of breath"],
  },
  {
    category: "Neurological",
    selectedCls: "bg-purple-200 border-purple-400 text-purple-900",
    defaultCls: "border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800",
    symptoms: ["Severe headache", "Dizziness", "Fainting", "Confusion", "Facial drooping", "Weakness on one side", "Vision changes", "Slurred speech"],
  },
  {
    category: "Respiratory",
    selectedCls: "bg-blue-200 border-blue-400 text-blue-900",
    defaultCls: "border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800",
    symptoms: ["Difficulty breathing", "Wheezing", "Coughing blood", "Rapid breathing", "Choking"],
  },
  {
    category: "Gastrointestinal",
    selectedCls: "bg-green-200 border-green-400 text-green-900",
    defaultCls: "border-green-200 bg-green-50 hover:bg-green-100 text-green-800",
    symptoms: ["Severe abdominal pain", "Nausea", "Vomiting", "Vomiting blood", "Diarrhea", "Constipation"],
  },
  {
    category: "Musculoskeletal",
    selectedCls: "bg-orange-200 border-orange-400 text-orange-900",
    defaultCls: "border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800",
    symptoms: ["Severe back pain", "Joint pain", "Limb weakness", "Inability to walk", "Injury / trauma"],
  },
  {
    category: "General",
    selectedCls: "bg-slate-200 border-slate-400 text-slate-900",
    defaultCls: "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800",
    symptoms: ["High fever", "Chills", "Severe fatigue", "Loss of consciousness", "Severe allergic reaction", "Swelling"],
  },
];

const ONSET_OPTIONS = ["sudden", "gradual", "worsening", "intermittent"] as const;
const DURATION_OPTIONS = ["Less than 1 hour", "1–6 hours", "6–24 hours", "1–3 days", "More than 3 days"];
const PAIN_COLORS = ["bg-green-500","bg-green-400","bg-lime-400","bg-yellow-400","bg-yellow-500","bg-orange-400","bg-orange-500","bg-red-400","bg-red-500","bg-red-600","bg-red-700"];

export function SymptomChecker() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [painScale, setPainScale] = useState(0);
  const [onset, setOnset] = useState("");
  const [duration, setDuration] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [vitals, setVitals] = useState({ systolicBp: "", diastolicBp: "", heartRate: "", temperature: "", spo2: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visitId, setVisitId] = useState("");

  useEffect(() => {
    const id = sessionStorage.getItem("triage_visit_id");
    if (!id) { router.push("/intake"); return; }
    setVisitId(id);
  }, [router]);

  function toggle(symptom: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(symptom) ? next.delete(symptom) : next.add(symptom);
      return next;
    });
  }

  async function handleSubmit() {
    if (selected.size === 0) { setError("Please select at least one symptom."); return; }
    if (!onset) { setError("Please select when the symptoms started."); return; }
    if (!duration) { setError("Please select how long you have had these symptoms."); return; }
    setError("");
    setLoading(true);

    const dob = sessionStorage.getItem("triage_dob") ?? "";
    const age = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 30;
    const symptoms = [...selected];
    if (additionalNotes.trim()) symptoms.push(additionalNotes.trim());

    try {
      const payload = {
        visitId,
        symptoms,
        painScale,
        symptomOnset: onset,
        symptomDuration: duration,
        age,
        sex: "unknown",
        chiefComplaint: sessionStorage.getItem("triage_complaint") ?? "",
        vitals: Object.values(vitals).some(Boolean) ? {
          systolicBp: vitals.systolicBp ? parseInt(vitals.systolicBp) : undefined,
          diastolicBp: vitals.diastolicBp ? parseInt(vitals.diastolicBp) : undefined,
          heartRate: vitals.heartRate ? parseInt(vitals.heartRate) : undefined,
          temperature: vitals.temperature ? parseFloat(vitals.temperature) : undefined,
          spo2: vitals.spo2 ? parseInt(vitals.spo2) : undefined,
        } : undefined,
      };

      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to process triage"); return; }
      router.push("/intake/confirmation");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {SYMPTOM_GROUPS.map(group => (
        <div key={group.category} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{group.category}</h3>
          <div className="flex flex-wrap gap-2">
            {group.symptoms.map(symptom => {
              const isSelected = selected.has(symptom);
              return (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggle(symptom)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all cursor-pointer
                    ${isSelected ? group.selectedCls : group.defaultCls}`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {symptom}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Pain level</h3>
        <p className="text-xs text-gray-400 mb-4">0 = no pain, 10 = worst imaginable</p>
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: 11 }, (_, i) => (
            <button key={i} type="button" onClick={() => setPainScale(i)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all border-2
                ${painScale === i ? `${PAIN_COLORS[i]} text-white border-transparent scale-110` : "bg-gray-100 text-gray-600 border-transparent hover:border-gray-300"}`}>
              {i}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Selected: {painScale}/10</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">How did it start?</p>
          {ONSET_OPTIONS.map(o => (
            <label key={o} className="flex items-center gap-2 cursor-pointer mb-2">
              <input type="radio" name="onset" value={o} checked={onset === o} onChange={() => setOnset(o)} className="accent-blue-600" />
              <span className="text-sm text-gray-700 capitalize">{o}</span>
            </label>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">How long have you had this?</p>
          {DURATION_OPTIONS.map(d => (
            <label key={d} className="flex items-center gap-2 cursor-pointer mb-2">
              <input type="radio" name="duration" value={d} checked={duration === d} onChange={() => setDuration(d)} className="accent-blue-600" />
              <span className="text-sm text-gray-700">{d}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Vitals <span className="font-normal text-gray-400">(optional)</span></h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {[
            { key: "systolicBp", label: "Systolic BP", unit: "mmHg", placeholder: "120" },
            { key: "diastolicBp", label: "Diastolic BP", unit: "mmHg", placeholder: "80" },
            { key: "heartRate", label: "Heart rate", unit: "bpm", placeholder: "72" },
            { key: "temperature", label: "Temperature", unit: "°C", placeholder: "37.0" },
            { key: "spo2", label: "SpO₂", unit: "%", placeholder: "98" },
          ].map(({ key, label, unit, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1">{label} <span className="text-gray-400">({unit})</span></label>
              <input type="number" placeholder={placeholder} value={vitals[key as keyof typeof vitals]}
                onChange={e => setVitals(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:border-blue-500 focus:bg-white outline-none" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Anything else? <span className="font-normal text-gray-400">(optional)</span></label>
        <textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} rows={2}
          placeholder="Other symptoms, medications, allergies, relevant history..."
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:border-blue-500 focus:bg-white outline-none resize-none" />
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {selected.size > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-700">
          {selected.size} symptom{selected.size !== 1 ? "s" : ""} selected
        </div>
      )}

      <button type="button" onClick={handleSubmit} disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Analysing with AI...
          </span>
        ) : "Submit — complete triage →"}
      </button>
    </div>
  );
}
