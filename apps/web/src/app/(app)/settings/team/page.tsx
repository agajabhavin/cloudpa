"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";

export default function TeamManagementPage() {
  const toast = useToast();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      // TODO: Replace with actual team members API endpoint when available
      // const members = await api("/org/team-members", { silent: true });
      // setTeamMembers(members || []);
      setTeamMembers([]); // Placeholder until API is ready
    } catch (error) {
      console.error("Error loading team members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
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

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="grid gap-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/settings"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Settings
          </Link>
          <span className="text-sm text-gray-400">/</span>
          <span className="text-sm font-medium text-gray-900">Team Management</span>
        </div>
        <h1 className="page-title">Team Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Invite team members and manage their roles and permissions
        </p>
      </div>

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
                handleInvite();
              }
            }}
          />
          <button
            onClick={handleInvite}
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
  );
}

