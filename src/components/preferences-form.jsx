"use client";

import { useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { preferenceOptions } from "@/lib/utils";

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/65">{label}</label>
      <select value={value} onChange={onChange} className="field h-12 w-full">
        {options.map((option) => (
          <option key={option} value={option} className="bg-black text-white">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PreferencesForm({ initialPreferences, onSaved }) {
  const [form, setForm] = useState(initialPreferences);
  const [saving, setSaving] = useState(false);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleBooster(booster) {
    setForm((current) => {
      const exists = current.boosters.includes(booster);
      return {
        ...current,
        boosters: exists
          ? current.boosters.filter((item) => item !== booster)
          : [...current.boosters, booster].slice(0, 4),
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await apiFetch("/api/user/preferences", {
        method: "PUT",
        body: form,
      });

      setForm(response.user.preferences);
      onSaved?.(response.user);
      toast.success("Drink preferences updated.");
    } catch (error) {
      toast.error(error.message || "We couldn't save your preferences.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel-strong space-y-5 p-5">
      <div>
        <div className="eyebrow">Preferred drink settings</div>
        <h3 className="mt-3 font-display text-2xl font-semibold text-white">Customize your default pour.</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="Blend"
          value={form.blend}
          options={preferenceOptions.blend}
          onChange={(event) => updateField("blend", event.target.value)}
        />
        <SelectField
          label="Protein"
          value={form.protein}
          options={preferenceOptions.protein}
          onChange={(event) => updateField("protein", event.target.value)}
        />
        <SelectField
          label="Liquid base"
          value={form.liquidBase}
          options={preferenceOptions.liquidBase}
          onChange={(event) => updateField("liquidBase", event.target.value)}
        />
        <SelectField
          label="Temperature"
          value={form.temperature}
          options={preferenceOptions.temperature}
          onChange={(event) => updateField("temperature", event.target.value)}
        />
        <SelectField
          label="Sweetness"
          value={form.sweetness}
          options={preferenceOptions.sweetness}
          onChange={(event) => updateField("sweetness", event.target.value)}
        />
        <SelectField
          label="Pickup mode"
          value={form.pickupMode}
          options={preferenceOptions.pickupMode}
          onChange={(event) => updateField("pickupMode", event.target.value)}
        />
      </div>

      <div>
        <label className="mb-3 block text-sm text-white/65">Boosters</label>
        <div className="flex flex-wrap gap-3">
          {preferenceOptions.boosters.map((booster) => {
            const active = form.boosters.includes(booster);
            return (
              <button
                key={booster}
                type="button"
                onClick={() => toggleBooster(booster)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? "border-neon/40 bg-neon/15 text-neon"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                }`}
              >
                {booster}
              </button>
            );
          })}
        </div>
      </div>

      <button type="submit" className="neon-button justify-center" disabled={saving}>
        {saving ? "Saving..." : "Save Preferences"}
      </button>
    </form>
  );
}
