"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

export default function OrgSettingsPage() {
  const toast = useToast();
  const [org, setOrg] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isIndividual, setIsIndividual] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [orgData, userData] = await Promise.all([
          api<{ id: string; name: string }>("/org/me", { silent: true }).catch(() => null),
          api<{ id: string; name: string; email: string }>("/auth/me", { silent: true }).catch(() => null),
        ]);

        if (orgData) {
          setOrg(orgData);
          setName(orgData.name || "");
        }

        if (userData) {
          setUser(userData);
        }

        // Determine if this is an individual user
        if (orgData && userData) {
          const orgName = orgData.name?.toLowerCase() || "";
          const userName = userData.name?.toLowerCase() || "";
          const isIndividualUser = 
            orgName === userName || 
            orgName === "my workspace" || 
            orgName === "personal" ||
            orgName.includes(userName) ||
            !orgName;
          setIsIndividual(isIndividualUser);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    setSaved(false);
    
    const startTime = Date.now();
    const minLoadingTime = 500;

    try {
      await api("/org", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim() }),
      });

      // Ensure minimum loading time
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      setSaving(false);
      setSaved(true);
      
      setTimeout(() => {
        toast.success(`${isIndividual ? "Account" : "Organization"} updated successfully!`, 4000);
      }, 100);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (e: any) {
      const errorMsg = e.message || "Failed to update";
      setSaving(false);
      setSaved(false);
      toast.error(errorMsg, 8000);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!org) return <div className="p-6">Unable to load organization data.</div>;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="page-title">
          {isIndividual ? "Account Settings" : "Organization Settings"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isIndividual
            ? "Manage your account details and workspace name"
            : "Manage your organization details"}
        </p>
      </div>

      <div className="card p-6 grid gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            {isIndividual ? "Workspace Name" : "Organization Name"}
          </label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isIndividual ? "Your workspace name" : "Your organization name"}
          />
          <p className="text-xs text-gray-500 mt-1">
            {isIndividual
              ? "This name appears in your dashboard and can be changed anytime"
              : "This is your organization's display name"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={`btn transition-all duration-200 ${
              saving
                ? "bg-blue-500 text-white cursor-wait"
                : saved
                ? "bg-green-500 text-white cursor-default"
                : ""
            }`}
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

