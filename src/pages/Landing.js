import React from 'react';
import { Link } from 'react-router-dom';

const bgUrl = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1500&q=80';

function Landing() {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex flex-col justify-between relative"
      style={{ backgroundImage: `url(${bgUrl})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70 z-0" />
      {/* Top Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-10 pt-6">
        <div className="text-lime-400 font-bold text-3xl">{/* Logo placeholder */} <span className="font-black">ƒ</span></div>
        <div className="flex space-x-10 text-gray-200 text-lg font-light">
          <a href="#program" className="hover:text-white">PROGRAM</a>
          <a href="#trainer" className="hover:text-white">TRAINER</a>
          <a href="#promo" className="hover:text-white">PROMO</a>
          <a href="#about" className="hover:text-white">ABOUT</a>
        </div>
        <button className="border border-gray-300 text-gray-200 px-5 py-2 rounded hover:bg-gray-800 hover:text-white transition">CONTACT US</button>
      </nav>
      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
        <div className="flex items-center justify-center w-full mb-8">
          <button className="bg-transparent border border-gray-400 rounded-full p-3 mx-4 text-gray-300 hover:bg-gray-700 transition">
            <span className="text-2xl">&#8592;</span>
          </button>
          <div>
            <div className="flex flex-row items-center space-x-4">
              <span className="text-7xl md:text-8xl font-extrabold text-transparent stroke-text mr-2" style={{ WebkitTextStroke: '2px #fff' }}>FITNESS</span>
              <span className="flex flex-col items-center">
                <span className="text-5xl md:text-6xl font-extrabold text-white bg-black bg-opacity-60 px-4 py-2 rounded shadow-lg">AND</span>
                <span className="text-5xl md:text-6xl font-extrabold text-white bg-black bg-opacity-60 px-4 py-2 rounded shadow-lg mt-2">BODY</span>
              </span>
              <span className="text-7xl md:text-8xl font-extrabold text-transparent stroke-text ml-2" style={{ WebkitTextStroke: '2px #fff' }}>BUILDER</span>
            </div>
          </div>
          <button className="bg-transparent border border-gray-400 rounded-full p-3 mx-4 text-gray-300 hover:bg-gray-700 transition">
            <span className="text-2xl">&#8594;</span>
          </button>
        </div>
        <Link to="/auth" className="mt-8 inline-block bg-lime-300 hover:bg-lime-400 text-gray-900 font-bold px-10 py-4 rounded shadow-lg text-xl transition">JOIN NOW</Link>
      </div>
      {/* For rounded bottom corners */}
      <div className="absolute bottom-0 left-0 right-0 h-4 rounded-b-xl bg-gray-900 z-10" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }} />
    </div>
  );
}

export default Landing; 