import React, { useState } from 'react';

function Contact() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page-shell pt-4">
      <div className="site-shell space-y-6">
        <section className="glass-panel-strong rounded-[32px] p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div>
              <div className="pill">Contact</div>
              <h1 className="mt-4 font-['Space_Grotesk'] text-3xl font-bold text-white md:text-4xl">Keep the support experience as clear as the product.</h1>
              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                This page now works cleanly on desktop and mobile, with the contact details and form stacked
                intelligently instead of leaving large dead areas.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="stat-card">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Response path</div>
                <div className="mt-2 text-lg font-bold text-white">Email first</div>
                <div className="mt-2 text-sm text-slate-400">Fastest route for product issues and setup help.</div>
              </div>
              <div className="stat-card">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Location</div>
                <div className="mt-2 text-lg font-bold text-white">Global</div>
                <div className="mt-2 text-sm text-slate-400">Built to support users from anywhere.</div>
              </div>
              <div className="stat-card">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Use case</div>
                <div className="mt-2 text-lg font-bold text-white">Feedback</div>
                <div className="mt-2 text-sm text-slate-400">Share ideas, bugs, and improvement requests.</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="glass-panel rounded-[28px] p-5 md:p-6">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="relative overflow-hidden rounded-[20px]">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1600&auto=format&fit=crop"
                  alt="World map"
                  className="h-[280px] w-full object-cover opacity-70 md:h-[360px]"
                />
                <div className="absolute inset-0">
                  <span className="absolute left-[38%] top-[32%] h-3 w-3 rounded-full bg-sky-300 shadow" />
                  <span className="absolute left-[22%] top-[56%] h-3 w-3 rounded-full bg-sky-300 shadow" />
                  <span className="absolute left-[57%] top-[48%] h-3 w-3 rounded-full bg-sky-300 shadow" />
                  <span className="absolute left-[63%] top-[66%] h-3 w-3 rounded-full bg-sky-300 shadow" />
                  <span className="absolute left-[70%] top-[58%] h-3 w-3 rounded-full bg-sky-300 shadow" />
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Phone</div>
                <div className="mt-2 text-lg font-semibold text-white">+123-456-7890</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Email</div>
                <div className="mt-2 break-all text-lg font-semibold text-white">hello@reallygreatsite.com</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Address</div>
                <div className="mt-2 text-lg font-semibold text-white">123 Anywhere St., Any City</div>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-[28px] p-5 md:p-6">
            {submitted ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="rounded-[26px] border border-white/10 bg-white/5 p-8 text-center">
                  <div className="text-2xl font-semibold text-white">Thanks.</div>
                  <div className="mt-3 max-w-md text-sm leading-7 text-slate-300">
                    Your message was captured. This screen now stays compact on mobile instead of stretching into empty
                    unused space.
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white">Send a message</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" className="field" required />
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" className="field" required />
                </div>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="field" required />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <input name="countryCode" value={form.countryCode} onChange={handleChange} placeholder="Code" className="field" />
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="field sm:col-span-2" />
                </div>
                <textarea name="message" value={form.message} onChange={handleChange} placeholder="Message" rows={6} className="field min-h-[180px] resize-y" />
                <button type="submit" className="btn-primary w-full justify-center">
                  Submit
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Contact;
