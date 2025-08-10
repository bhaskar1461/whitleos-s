import React from 'react';

function Workout() {
  return (
    <div className="min-h-screen bg-[#121214] text-gray-200">
      {/* Header like navbar variant */}
      <nav className="flex justify-between items-center px-6 md:px-10 py-6">
        <div className="text-lime-300 font-black text-2xl">ƒ</div>
        <div className="hidden md:flex gap-8 text-gray-300">
          <a href="#program" className="hover:text-white">PROGRAM</a>
          <a href="#trainer" className="hover:text-white">TRAINER</a>
          <a href="#promo" className="hover:text-white">PROMO</a>
          <a href="#about" className="hover:text-white">ABOUT</a>
        </div>
        <a href="/contact" className="border border-gray-500/60 px-4 py-2 rounded text-sm hover:bg-gray-800">CONTACT US</a>
      </nav>

      {/* Program section */}
      <section className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left: visual panel */}
          <div className="relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1600&auto=format&fit=crop"
              alt="Toned body"
              className="rounded-lg object-cover h-[640px] w-full opacity-90"
            />
          </div>

          {/* Right: content */}
          <div className="bg-[#1a1b1c] border border-gray-700/40 rounded-lg overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.2)]">
            <div className="p-8 md:p-10 border-b border-gray-700/40">
              <div className="text-6xl font-black text-transparent" style={{ WebkitTextStroke: '3px #9ca3af' }}>01</div>
              <h1 className="mt-6 text-4xl md:text-5xl font-extrabold text-white leading-tight">WEIGHT LOSS<br/>WORKOUT</h1>
            </div>

            <div className="p-8 md:p-10 border-b border-gray-700/40 text-gray-300">
              <p className="leading-7">
                This program is designed to help you achieve a total body transformation in just 8 weeks! Whether you're
                looking to lose weight, tone up, or improve your overall fitness, this program will help you reach your goals.
                Each week, you'll have 5 workouts that target different areas of the body, along with a recommended meal plan
                to support your progress.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-700/40">
              <div className="p-6 text-center">
                <div className="text-2xl font-bold text-white">8</div>
                <div className="text-sm tracking-wider uppercase text-gray-400">weeks</div>
              </div>
              <div className="p-6 text-center">
                <div className="text-2xl font-bold text-white">60</div>
                <div className="text-sm tracking-wider uppercase text-gray-400">minutes</div>
              </div>
              <div className="p-6 text-center">
                <div className="text-2xl font-bold text-white">5 Day</div>
                <div className="text-sm tracking-wider uppercase text-gray-400">a week</div>
              </div>
              <div className="p-6 text-center bg-lime-300/90">
                <a href="/auth" className="inline-block px-6 py-3 font-bold text-gray-900">JOIN NOW</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Workout; 