import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    fetch("http://localhost:5000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "User created successfully ✅") {
          setSuccess("Account created! Redirecting to login...");
          setTimeout(() => navigate("/login"), 1500);
        } else {
          setError(data.message);
        }
      });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 w-96 space-y-4">
        <p className="font-semibold text-gray-800 text-xl mb-2">Create your AgriShield account</p>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <input
          type="text"
          name="name"
          placeholder="Full name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />

        <button
          type="submit"
          className="bg-green-600 text-white w-full py-2 rounded-lg text-sm font-medium"
        >
          Sign Up
        </button>

        <p className="text-sm text-gray-500 text-center">
          Already have an account? <a href="/login" className="text-green-600 font-medium">Login</a>
        </p>
      </form>
    </div>
  );
}

export default Signup;