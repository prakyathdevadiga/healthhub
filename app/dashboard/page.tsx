"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Welcome to HealthHub 🎉</h1>

      <p>You have successfully signed in with Google.</p>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          border: "none",
          borderRadius: "10px",
          background: "#078e91",
          color: "white",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </main>
  );
}