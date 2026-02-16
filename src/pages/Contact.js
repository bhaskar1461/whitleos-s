import React, { useState } from 'react';

function Contact() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', countryCode: '+1', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#121214] text-gray-200 px-6 md:px-10 py-12">
      <div className="flex justify-between items-center mb-8">
        <div className="text-lime-300 font-black text-2xl">ƒ</div>
        <a href="/auth" className="border border-gray-500/60 px-4 py-2 rounded text-sm hover:bg-gray-800">CONTACT US</a>
      </div>

      <div className="max-w-6xl mx-auto bg-[#1c1e1f] rounded-lg border border-gray-700/40 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Map + info */}
          <div className="relative p-8 md:p-10 border-b md:border-b-0 md:border-r border-gray-700/40">
            <div className="bg-[#232526] rounded-lg h-[420px] w-full flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1600&auto=format&fit=crop"
                alt="World map"
                className="w-full h-full object-cover opacity-60"
              />
              {/* Pins (decorative) */}
              <div className="absolute inset-0">
                <span className="absolute left-[38%] top-[32%] w-3 h-3 bg-lime-300 rounded-full shadow" />
                <span className="absolute left-[22%] top-[56%] w-3 h-3 bg-lime-300 rounded-full shadow" />
                <span className="absolute left-[57%] top-[48%] w-3 h-3 bg-lime-300 rounded-full shadow" />
                <span className="absolute left-[63%] top-[66%] w-3 h-3 bg-lime-300 rounded-full shadow" />
                <span className="absolute left-[70%] top-[58%] w-3 h-3 bg-lime-300 rounded-full shadow" />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-400">
              <div>
                <div className="uppercase tracking-widest text-xs">to know more and get the detail</div>
              </div>
              <div className="text-center">+123-456-7890</div>
              <div className="text-right">123 Anywhere St., Any City</div>
            </div>
            <div className="mt-4 text-sm text-gray-400">hello@reallygreatsite.com</div>
          </div>

          {/* Form */}
          <div className="p-8 md:p-10">
            {submitted ? (
              <div className="h-full flex items-center justify-center">
                <div className="bg-[#232526] border border-gray-700/40 rounded-lg p-8 text-center">
                  <div className="text-2xl font-semibold mb-2 text-white">Thanks!</div>
                  <div className="text-gray-400">We received your message and will be in touch.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="bg-[#2a2d2e] border border-gray-700/40 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-300/40"
                    required
                  />
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="bg-[#2a2d2e] border border-gray-700/40 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-300/40"
                    required
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full bg-[#2a2d2e] border border-gray-700/40 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-300/40"
                  required
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    name="countryCode"
                    value={form.countryCode}
                    onChange={handleChange}
                    placeholder="Code"
                    className="bg-[#2a2d2e] border border-gray-700/40 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-300/40"
                  />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                    className="col-span-2 bg-[#2a2d2e] border border-gray-700/40 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-300/40"
                  />
                </div>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Message"
                  rows={6}
                  className="w-full bg-[#2a2d2e] border border-gray-700/40 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-300/40"
                />
                <button type="submit" className="bg-lime-300 text-gray-900 font-semibold rounded px-6 py-3 hover:bg-lime-400">
                  SUBMIT
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact; 