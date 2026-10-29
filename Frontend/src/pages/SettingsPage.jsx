import { useState, useEffect } from "react";
import { UserCircle, KeyRound } from "lucide-react";

const emptyPasswords = { currentPassword: "", newPassword: "", confirmPassword: "" };

function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState(emptyPasswords);
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const token = localStorage.getItem("token");
  const jsonHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setProfile(data);
          setName(data.name);
        } else {
          setProfileMsg({ type: "error", text: data.message || "Could not load profile" });
        }
      })
      .catch(() => setProfileMsg({ type: "error", text: "Could not reach the server" }));
  }, []);

  const saveProfile = (e) => {
    e.preventDefault();
    if (savingProfile) return;
    setSavingProfile(true);
    setProfileMsg({ type: "", text: "" });

    fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setProfile(data);
          setName(data.name);
          // Keep the header in sync
          localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email }));
          window.dispatchEvent(new Event("userUpdated"));
          setProfileMsg({ type: "success", text: "Profile updated" });
        } else {
          setProfileMsg({ type: "error", text: data.message || "Could not update profile" });
        }
      })
      .catch(() => setProfileMsg({ type: "error", text: "Could not reach the server" }))
      .finally(() => setSavingProfile(false));
  };

  const changePassword = (e) => {
    e.preventDefault();
    if (savingPassword) return;
    setPasswordMsg({ type: "", text: "" });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" });
      return;
    }

    setSavingPassword(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/change-password`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Password updated") {
          setPasswords(emptyPasswords);
          setPasswordMsg({ type: "success", text: "Password updated" });
        } else {
          setPasswordMsg({ type: "error", text: data.message || "Could not change password" });
        }
      })
      .catch(() => setPasswordMsg({ type: "error", text: "Could not reach the server" }))
      .finally(() => setSavingPassword(false));
  };

  const handlePasswordChange = (e) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm";
  const message = (m) =>
    m.text && (
      <p className={`text-sm ${m.type === "success" ? "text-green-600" : "text-red-500"}`}>{m.text}</p>
    );

  return (
    <div className="space-y-6 max-w-2xl">
      <p className="font-semibold text-gray-800 text-lg">Settings</p>

      <form onSubmit={saveProfile} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center">
            <UserCircle className="text-green-600" size={20} />
          </div>
          <p className="font-semibold text-gray-800">Profile</p>
        </div>

        {message(profileMsg)}

        <div>
          <label className="text-xs text-gray-500">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={60}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Email (cannot be changed)</label>
          <input
            value={profile?.email ?? ""}
            disabled
            className={`${inputClass} bg-gray-100 text-gray-500`}
          />
        </div>

        <button
          type="submit"
          disabled={savingProfile || !profile}
          className="bg-green-600 text-white text-sm px-5 py-2 rounded-lg font-medium disabled:bg-gray-400"
        >
          {savingProfile ? "Saving..." : "Save changes"}
        </button>
      </form>

      <form onSubmit={changePassword} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
            <KeyRound className="text-blue-600" size={20} />
          </div>
          <p className="font-semibold text-gray-800">Change password</p>
        </div>

        {message(passwordMsg)}

        <input
          type="password"
          name="currentPassword"
          placeholder="Current password"
          value={passwords.currentPassword}
          onChange={handlePasswordChange}
          required
          className={inputClass}
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New password (at least 8 characters)"
          value={passwords.newPassword}
          onChange={handlePasswordChange}
          required
          minLength={8}
          className={inputClass}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          value={passwords.confirmPassword}
          onChange={handlePasswordChange}
          required
          className={inputClass}
        />

        <button
          type="submit"
          disabled={savingPassword}
          className="bg-green-600 text-white text-sm px-5 py-2 rounded-lg font-medium disabled:bg-gray-400"
        >
          {savingPassword ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}

export default SettingsPage;