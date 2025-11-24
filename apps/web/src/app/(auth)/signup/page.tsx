"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const r = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    orgName: "",
    name: "",
  });
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const res = await api<{ access_token: string }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });
      localStorage.setItem("token", res.access_token);
      // Store email in localStorage as fallback for when /auth/me endpoint is unavailable
      localStorage.setItem("userEmail", form.email.trim());
      r.push("/dashboard");
    } catch (e: any) {
      setErr(e.message || "Signup failed");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3">
        <h1 className="text-2xl font-semibold">Create Cloud PA account</h1>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <input
          className="input"
          placeholder="Organization name"
          value={form.orgName}
          onChange={(e) => setForm({ ...form, orgName: e.target.value })}
          required
        />
        <input
          className="input"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password (min 8 characters)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
          required
          minLength={8}
        />
        <button type="submit" className="btn w-full">
          Sign up
        </button>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

