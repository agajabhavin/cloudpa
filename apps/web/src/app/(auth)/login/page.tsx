"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const r = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    
    const loginData = {
      email: form.email.trim(),
      password: form.password,
    };
    
    console.log("Attempting login with:", { email: loginData.email, passwordLength: loginData.password.length });
    
    try {
      const res = await api<{ access_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData),
      });
      localStorage.setItem("token", res.access_token);
      // Store email in localStorage as fallback for when /auth/me endpoint is unavailable
      localStorage.setItem("userEmail", loginData.email);
      r.push("/dashboard");
    } catch (e: any) {
      const errorMsg = e.message || "Login failed";
      setErr(errorMsg);
      console.error("Login error:", errorMsg);
      console.error("Full error:", e);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4 md:p-6 safe-top safe-bottom">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Login to Cloud PA</h1>
        {err && <p className="text-red-600 text-sm">{err}</p>}
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
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="current-password"
          required
        />
        <button type="submit" className="btn w-full">
          Login
        </button>
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

