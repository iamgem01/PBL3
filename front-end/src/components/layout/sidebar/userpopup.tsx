"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Plus,
  LogOut,
  User,
  Shield,
  Users,
  UserPlus,
  Crown,
} from "lucide-react";
import CreateWorkspaceModal from "@/components/modals/CreateWorkspaceMotal";
import {
  getCurrentUser,
  logout,
  getUserInitials,
  hasRole,
} from "@/utils/authUtils";

interface UserMenuProps {
  collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [menuPosition, setMenuPosition] = useState<"left" | "right">("right");
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get current user from auth utils
  const user = getCurrentUser();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      const menuWidth = 240; // w-60 = 240px
      const spaceRight = window.innerWidth - rect.right;

      // Ưu tiên bên phải, nếu không đủ không gian thì qua bên trái
      setMenuPosition(spaceRight >= menuWidth + 20 ? "right" : "left");
    }
  }, [open, collapsed]);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin User";
      case "moderator":
        return "Moderator";
      case "user":
      default:
        return "User";
    }
  };

  const getPlanInfo = (role: string) => {
    switch (role) {
      case "admin":
        return "Pro Plan · Unlimited members";
      case "moderator":
        return "Pro Plan · 10 members";
      case "user":
      default:
        return "Free Plan · 1 member";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "moderator":
        return "bg-blue-100 text-blue-800";
      case "user":
      default:
        return "bg-green-100 text-green-800";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
          ?
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Not logged in
            </p>
          </div>
        )}
      </div>
    );
  }

  const isAdmin = hasRole("admin");
  const isModerator = hasRole("moderator");

  return (
    <div className="relative font-inter flex items-center gap-2 w-full">
      {/* Avatar */}
      <div
        ref={avatarRef}
        className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center font-bold text-indigo-800 cursor-pointer hover:bg-indigo-300 transition-colors flex-shrink-0"
        onClick={() => setOpen(!open)}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          getUserInitials(user.name)
        )}
      </div>

      {/* User Info - Hidden when collapsed */}
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {user.name}
          </p>
          <div className="flex items-center gap-1">
            <span
              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${getRoleBadgeColor(
                user.role
              )}`}
            >
              {user.role}
            </span>
          </div>
        </div>
      )}

      {/* Menu popup */}
      {open && (
        <div
          ref={menuRef}
          className={`absolute bottom-full mb-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-sm ${
            menuPosition === "right" ? "left-0" : "-left-60"
          }`}
        >
          {/* Header với user info đầy đủ */}
          <div className="mb-3 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center font-bold text-indigo-800">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  getUserInitials(user.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.name}
                  </p>
                  {isAdmin && (
                    <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>

            {/* Role badge */}
            <div className="flex items-center justify-between">
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {getRoleDisplayName(user.role)}
              </span>
              <Settings
                size={16}
                className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                onClick={() => {
                  navigate("/settings");
                  setOpen(false);
                }}
              />
            </div>

            {/* Plan info */}
            <div className="mt-2 text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded">
              {getPlanInfo(user.role)}
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1">
            {/* Admin/Moderator: Invite members */}
            {(isAdmin || isModerator) && (
              <button className="w-full text-left hover:bg-gray-100 rounded px-2 py-2 flex items-center gap-2 transition-colors text-gray-700">
                <Users className="w-4 h-4" />
                <span className="text-sm">Invite members</span>
              </button>
            )}

            {/* Admin: New workspace */}
            {isAdmin && (
              <button
                className="w-full text-left hover:bg-gray-100 rounded px-2 py-2 flex items-center gap-2 transition-colors text-gray-700"
                onClick={() => {
                  setOpenCreate(true);
                  setOpen(false);
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">New workspace</span>
              </button>
            )}

            {/* All users: Add another account */}
            <button className="w-full text-left hover:bg-gray-100 rounded px-2 py-2 flex items-center gap-2 transition-colors text-gray-700">
              <UserPlus className="w-4 h-4" />
              <span className="text-sm">Add another account</span>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Admin: Admin Panel */}
            {isAdmin && (
              <button
                onClick={() => {
                  navigate("/admin");
                  setOpen(false);
                }}
                className="w-full text-left hover:bg-gray-100 rounded px-2 py-2 flex items-center gap-2 transition-colors text-gray-700"
              >
                <Shield className="w-4 h-4" />
                <span className="text-sm">Admin Panel</span>
              </button>
            )}

            {/* Profile */}
            <button
              onClick={() => {
                navigate("/profile");
                setOpen(false);
              }}
              className="w-full text-left hover:bg-gray-100 rounded px-2 py-2 flex items-center gap-2 transition-colors text-gray-700"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">Profile</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                navigate("/settings");
                setOpen(false);
              }}
              className="w-full text-left hover:bg-gray-100 rounded px-2 py-2 flex items-center gap-2 transition-colors text-gray-700"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Settings</span>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full text-left hover:bg-red-50 text-red-600 rounded px-2 py-2 transition-colors font-medium flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Log out</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal cho workspace */}
      <CreateWorkspaceModal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
      />
    </div>
  );
}
