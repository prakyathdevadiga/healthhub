"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import {
  LayoutDashboard,
  Building2,
  Pill,
  HeartPulse,
  User,
  LogOut,
  Heart,
} from "lucide-react";
import { auth } from "@/lib/firebase";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Hospitals",
    href: "/dashboard/hospitals",
    icon: Building2,
  },
  {
    name: "Medicines",
    href: "/dashboard/medicines",
    icon: Pill,
  },
  {
    name: "Blood Bank",
    href: "/dashboard/blood-bank",
    icon: Heart,
  },
  {
    name: "Health Guidance",
    href: "/dashboard/health-guidance",
    icon: HeartPulse,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Heart size={22} fill="currentColor" />
        <span>HealthHub</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${active ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        {/* Logout */}
        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

        {/* Save a Life */}
        <div className="save-card">
          <div className="save-icon">
            <Heart size={18} fill="currentColor" />
          </div>

          <div>
            <strong>Save a Life</strong>
            <p>One donation can make a difference.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}