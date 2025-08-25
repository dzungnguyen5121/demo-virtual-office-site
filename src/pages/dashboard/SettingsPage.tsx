import { useState } from "react";
import { GeneralSettingsTab } from "./settings/GeneralSettingsTab";
import { PaymentSettingsTab } from "./settings/PaymentSettingsTab";

type Tab = "general" | "payments";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  return (
    <div className="grid gap-6">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "general"
              ? "border-b-2 border-[#0A2647] text-[#0A2647]"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "payments"
              ? "border-b-2 border-[#0A2647] text-[#0A2647]"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Payments
        </button>
      </div>

      <div>
        {activeTab === "general" && <GeneralSettingsTab />}
        {activeTab === "payments" && <PaymentSettingsTab />}
      </div>
    </div>
  );
}
