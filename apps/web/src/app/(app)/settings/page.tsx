"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "account" | "team">("profile");
  const [user, setUser] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isIndividual, setIsIndividual] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Org form
  const [orgForm, setOrgForm] = useState({ name: "" });
  const [orgSaving, setOrgSaving] = useState(false);

  // Team form
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, orgData] = await Promise.all([
          api("/auth/me", { silent: true }).catch((err: any) => {
            // Silently handle 404s - endpoint may not exist yet
            if (!err.silent && !err.message?.includes("404") && !err.message?.includes("Cannot GET")) {
            console.error("Failed to load user profile:", err);
            }
            return null;
          }),
          api("/org/me", { silent: true }).catch((err: any) => {
            // Silently handle 404s - endpoint may not exist yet
            if (!err.silent && !err.message?.includes("404") && !err.message?.includes("Cannot GET")) {
            console.error("Failed to load org:", err);
            }
            return null;
          }),
        ]);

        if (userData) {
          console.log("User data loaded:", userData);
          console.log("Full user data object:", JSON.stringify(userData, null, 2));
          setUser(userData);
          // Extract email - check multiple possible field names and nested structures
          const userDataTyped = userData as any;
          const email = userDataTyped.email || 
                         userDataTyped.emailAddress || 
                         userDataTyped.userEmail || 
                         userDataTyped.user?.email ||
                         userDataTyped.profile?.email ||
                         "";
          const name = userDataTyped.name || 
                      userDataTyped.fullName || 
                      userDataTyped.displayName || 
                      userDataTyped.user?.name ||
                      userDataTyped.profile?.name ||
                      "";
          setProfileForm({
            name,
            email,
          });
          setProfileError("");
          // Log if email is missing
          if (!email) {
            console.warn("User email is missing in API response. Available fields:", Object.keys(userData));
            console.warn("Full response structure:", userData);
          } else {
            console.log("Email loaded successfully:", email);
          }
        } else {
          console.warn("No user data received - API call may have failed or endpoint doesn't exist");
          setProfileError("Unable to load your profile. Please verify the API server is running.");
        }

        if (orgData) {
          setOrg(orgData);
          setOrgForm({ name: orgData.name || "" });
          // Determine if this is an individual user (org name matches user name or is generic)
          const orgName = orgData.name?.toLowerCase() || "";
          const userName = userData?.name?.toLowerCase() || "";
          const isIndividualUser = 
            orgName === userName || 
            orgName === "my workspace" || 
            orgName === "personal" ||
            orgName.includes(userName) ||
            !orgName;
          setIsIndividual(isIndividualUser);
        }
      } catch (error) {
        console.error("Error loading settings data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleProfileSave = async () => {
    // Validate form
    if (!profileForm.name?.trim()) {
      setProfileError("Name is required");
      toast.error("Please enter your name");
      return;
    }

    setProfileSaving(true);
    setProfileSaved(false);
    setProfileError("");
    
    // Record start time to ensure minimum "Saving..." visibility
    const startTime = Date.now();
    const minLoadingTime = 500; // Minimum 500ms to show "Saving..." state
    
    try {
      const updatedUser = await api("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: profileForm.name.trim(),
          email: profileForm.email?.trim() || undefined,
        }),
      });
      
      // Ensure minimum loading time for better UX
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      // Update state with response from server
      const updatedName = updatedUser?.name || profileForm.name;
      const updatedEmail = updatedUser?.email || profileForm.email;
      
      setProfileForm({ 
        name: updatedName, 
        email: updatedEmail 
      });
      
      setUser((prev) => ({
        ...(prev || {}),
        name: updatedName,
        email: updatedEmail,
      }));
      
      // Show success state
      setProfileSaving(false);
      setProfileSaved(true);
      
      // Show toast notification (small delay to ensure state updates first)
      setTimeout(() => {
        toast.success("Profile updated successfully!", 4000);
      }, 100);
      
      // Reset saved state after 3 seconds
      setTimeout(() => {
        setProfileSaved(false);
      }, 3000);
    } catch (e: any) {
      // Provide user-friendly error message
      let errorMsg = "Failed to update profile";
      if (e.message) {
        if (e.message.includes("404") || e.message.includes("Cannot")) {
          errorMsg = "API server is not running. Please start the API server and try again.";
        } else {
          errorMsg = e.message;
        }
      }
      console.error("[Settings] Profile save error:", e);
      setProfileError(errorMsg);
      setProfileSaving(false);
      setProfileSaved(false);
      toast.error(errorMsg, 8000);
    }
  };

  // Team management functions
  const loadTeamMembers = async () => {
    try {
      // TODO: Replace with actual team members API endpoint when available
      // const members = await api("/org/team-members", { silent: true });
      // setTeamMembers(members || []);
      setTeamMembers([]); // Placeholder until API is ready
    } catch (error) {
      console.error("Error loading team members:", error);
    }
  };

  const handleTeamInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setInviting(true);
    try {
      // TODO: Replace with actual invite API endpoint when available
      // await api("/org/invite", {
      //   method: "POST",
      //   body: JSON.stringify({ email: inviteEmail.trim() }),
      // });
      
      toast.success(`Invitation sent to ${inviteEmail.trim()}`);
      setInviteEmail("");
      loadTeamMembers();
    } catch (e: any) {
      toast.error(e.message || "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const handlePasswordSave = async () => {
    setPasswordError("");
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setPasswordSaving(true);
    setPasswordError("");
    try {
      await api("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
        silent: true,
      });
      toast.success("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (e: any) {
      const errorMsg = e.message || "Failed to update password";
      setPasswordError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleOrgSave = async () => {
    setOrgSaving(true);
    try {
      await api("/org", {
        method: "PATCH",
        body: JSON.stringify(orgForm),
        silent: true,
      });
      toast.success("Organization updated successfully!");
      // Reload data after a short delay to show the toast
      setTimeout(() => {
      window.location.reload();
      }, 1500);
    } catch (e: any) {
      const errorMsg = e.message || "Failed to update organization";
      toast.error(errorMsg);
    } finally {
      setOrgSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "password"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Password
        </button>
        <button
          onClick={() => setActiveTab("account")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "account"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {isIndividual ? "Account" : "Workspace"}
        </button>
        {!isIndividual && (
          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "team"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Team Management
          </button>
        )}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="card p-6 grid gap-6">
          <div>
            <h2 className="section-title mb-1">Profile Information</h2>
            <p className="text-sm text-gray-500">
              Update your personal information
            </p>
            {profileError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <svg
                  className="w-5 h-5 flex-shrink-0 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{profileError}</span>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="input"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="input"
                value={profileForm.email}
                onChange={(e) => {
                  const newEmail = e.target.value;
                  setProfileForm({ ...profileForm, email: newEmail });
                  // Save to localStorage when user enters email
                  if (newEmail && newEmail.includes("@")) {
                    localStorage.setItem("userEmail", newEmail);
                }
                }}
                placeholder="your@email.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your email is used for login and notifications
              </p>
              {!profileForm.email && !loading && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Email not loaded from server. Please enter your registered email address.
                </p>
              )}
              {loading && (
                <p className="text-xs text-gray-500 mt-1">
                  Loading user data...
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleProfileSave}
              disabled={profileSaving || profileSaved}
              className={`btn transition-all duration-200 ${
                profileSaving
                  ? "bg-blue-500 text-white cursor-wait"
                  : profileSaved
                  ? "bg-green-500 text-white cursor-default"
                  : ""
              }`}
            >
              {profileSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : profileSaved ? (
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
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="card p-6 grid gap-6">
          <div>
            <h2 className="section-title mb-1">Change Password</h2>
            <p className="text-sm text-gray-500">
              Update your password to keep your account secure
            </p>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Password
              </label>
              <input
                type="password"
                className="input"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                className="input"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Enter new password (min 8 characters)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                className="input"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm new password"
              />
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {passwordError}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePasswordSave}
              disabled={passwordSaving}
              className="btn"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      )}

      {/* Account/Organization Tab */}
      {activeTab === "account" && (
        <div className="card p-6 grid gap-6">
          <div>
            <h2 className="section-title mb-1">
              {isIndividual ? "Account Settings" : "Workspace Settings"}
            </h2>
            <p className="text-sm text-gray-500">
              {isIndividual
                ? "Manage your account details and workspace name"
                : "Manage your workspace details"}
            </p>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {isIndividual ? "Workspace Name" : "Organization Name"}
              </label>
              <input
                type="text"
                className="input"
                value={orgForm.name}
                onChange={(e) =>
                  setOrgForm({ ...orgForm, name: e.target.value })
                }
                placeholder={
                  isIndividual
                    ? "Your workspace name"
                    : "Your organization name"
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                {isIndividual
                  ? "This name appears in your dashboard and can be changed anytime"
                  : "This is your organization's display name"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleOrgSave}
              disabled={orgSaving}
              className="btn"
            >
              {orgSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Team Tab */}
      {!isIndividual && activeTab === "team" && (
        <div className="grid gap-6">
          {/* Invite Team Member */}
        <div className="card p-6 grid gap-4">
          <div>
              <h2 className="section-title mb-1">Invite Team Member</h2>
            <p className="text-sm text-gray-500">
                Send an invitation to join your workspace
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                className="input flex-1"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleTeamInvite();
                  }
                }}
              />
              <button
                onClick={handleTeamInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="btn"
              >
                {inviting ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>

          {/* Team Members List */}
          <div className="card p-6 grid gap-4">
            <div>
              <h2 className="section-title mb-1">Team Members</h2>
              <p className="text-sm text-gray-500">
                Manage your team members and their roles
              </p>
            </div>

            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <p className="text-sm">No team members yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Invite team members to get started
                </p>
              </div>
            ) : (
          <div className="grid gap-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                        {member.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "U"}
                      </div>
              <div>
                        <div className="text-sm font-medium">{member.name || member.email}</div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                        {member.role || "Member"}
                      </span>
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        Manage
                      </button>
                    </div>
                </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Banner */}
          <div className="card p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-900">
                <div className="font-medium mb-1">Team Management Features</div>
                <div className="text-blue-700">
                  Team management features are coming soon. You'll be able to invite
                  team members, assign roles, and manage permissions.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

