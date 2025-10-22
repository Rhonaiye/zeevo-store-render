"use client";

import { useState } from "react";

export default function SettingsManagement() {
  const [tab, setTab] = useState("account");

  const [twoFA, setTwoFA] = useState(true);
  const [autoApproval, setAutoApproval] = useState(false);
  const [commission, setCommission] = useState("5");
  const [currency, setCurrency] = useState("NGN");
  const [logo, setLogo] = useState(null);
  const [chatbot, setChatbot] = useState(false);

  const handleLogoChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogo(url as any);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Admin Settings
          </h1>
          <p className="text-sm text-gray-600">
            Manage your platform preferences and configurations.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-6 inline-flex gap-2">
          {["account", "platform", "support"].map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 md:px-6 py-2 text-sm font-medium capitalize transition-all rounded-xl ${
                tab === key
                  ? "bg-gray-900 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* CONTENT SECTIONS */}
        <div className="space-y-6">
          {/* PLATFORM SETTINGS */}
          {tab === "platform" && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Platform Settings
              </h2>

              <div className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Platform Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {logo ? (
                      <div className="relative group">
                        <img
                          src={logo}
                          alt="Platform Logo"
                          className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all"></div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                        Logo
                      </div>
                    )}
                    <label className="cursor-pointer bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    placeholder="Zeevo Shop"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://zeevo.shop"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>

                <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium mt-4 transition-all shadow-sm hover:shadow-md">
                  Save Platform Settings
                </button>
              </div>
            </div>
          )}

          {/* ACCOUNT SETTINGS */}
          {tab === "account" && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Account Settings
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="admin@zeevo.shop"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-1">
                      Two-Factor Authentication
                    </label>
                    <p className="text-xs text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={twoFA}
                      onChange={() => setTwoFA(!twoFA)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* SUPPORT SETTINGS */}
          {tab === "support" && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Support Settings
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    placeholder="support@zeevo.shop"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://wa.me/234XXXXXXXXXX"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-1">
                      Enable Chatbot
                    </label>
                    <p className="text-xs text-gray-500">
                      Provide automated support to your users
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chatbot}
                      onChange={() => setChatbot(!chatbot)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md">
                  Save Support Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}