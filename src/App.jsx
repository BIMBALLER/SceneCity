import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import emailjs from '@emailjs/browser';

const App = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // States for Booking & Club
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showClubModal, setShowClubModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [bookingStep, setBookingStep] = useState('idle');

  // Admin States
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMovie, setNewMovie] = useState({ title: '', price: '', image_url: '', category: 'Action' });
  const [logoClicks, setLogoClicks] = useState(0);

  const categories = ['All', 'Action', 'Comedy', 'Romance', 'Horror', 'Drama'];

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
      setFilteredItems(data || []);
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  useEffect(() => {
    let result = items;
    if (activeCategory !== 'All') {
      result = result.filter(item => item.category === activeCategory);
    }
    if (searchQuery) {
      result = result.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredItems(result);
  }, [searchQuery, activeCategory, items]);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount === 3) {
      const pw = prompt("ENTER ADMIN PASSWORD:");
      if (pw === "offa123") {
        setIsAdmin(true);
        alert("Admin Mode Activated");
      } else {
        alert("Access Denied");
      }
      setLogoClicks(0);
    }
    setTimeout(() => setLogoClicks(0), 3000);
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('listings').insert([newMovie]);
    if (error) { alert("Error: " + error.message); } 
    else {
      setNewMovie({ title: '', price: '', image_url: '', category: 'Action' });
      setShowAddForm(false);
      fetchListings();
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      const { error } = await supabase.from('listings').delete().eq('id', id);
      if (!error) fetchListings();
    }
  };

  const handleRedirect = (type, details) => {
    setBookingStep('success');
    const phoneNumber = "2348000000000"; 
    let message = type === 'CLUB' 
      ? `Hello Scene City Offa! %0AI would like to *JOIN THE VIP CLUB*. %0AMy name is *${userName}*.`
      : `Hello Scene City Offa! %0AMy name is *${userName}*. %0AI want to book: %0A🎬 *${details.title || details.name}* %0A💰 Price: *${details.price}*`;

    setTimeout(() => {
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
      setSelectedMovie(null);
      setShowClubModal(false);
      setUserName('');
      setBookingStep('idle');
    }, 2000);
  };

  if (loading) return <div className="bg-black text-rose-600 h-screen flex items-center justify-center font-black text-xl tracking-widest">SCENE CITY OFFA...</div>;

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-rose-600 selection:text-white">
      
      {/* TOP BAR */}
      <div className="bg-[#111] px-4 md:px-12 py-2 flex justify-between items-center text-[10px] font-bold border-b border-[#222]">
        <div className={isAdmin ? 'text-rose-500' : 'text-[#444]'}>{isAdmin ? 'ADMIN AUTHORIZED' : 'EXPERIENCE THE MAGIC'}</div>
        <div className="hidden sm:flex gap-5 text-[#666]">
          <span>PREMIER CINEMA OF OFFA</span>
          <span className="text-rose-500">KWARA STATE</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="bg-black/90 backdrop-blur-md px-4 md:px-12 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-[100] border-b border-[#1a1a1a] gap-4">
        <div className="flex items-center justify-between w-full md:w-auto gap-8">
          <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-rose-600 text-white px-3 py-1 font-black text-2xl italic group-hover:bg-white group-hover:text-rose-600 transition-colors">A</div>
            <span className="text-2xl font-black tracking-tighter">SCENE<span className="text-rose-600">CITY</span></span>
          </div>
          
          <div className="relative hidden lg:block">
            <input type="text" placeholder="Search movies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-[#111] border border-[#333] text-white pl-10 pr-4 py-2.5 rounded-full text-sm w-[300px] outline-none focus:border-rose-600 transition-all" />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-center">
          {isAdmin && (
            <button onClick={() => setShowAddForm(true)} className="bg-white text-black px-5 py-2.5 rounded-full font-black text-[11px] hover:bg-rose-600 hover:text-white transition-all whitespace-nowrap">
              + ADD MOVIE
            </button>
          )}
          <button onClick={() => setShowClubModal(true)} className="bg-rose-600 text-white px-8 py-2.5 rounded-full font-black text-[11px] hover:scale-105 transition-transform whitespace-nowrap">
            JOIN CLUB
          </button>
        </div>
      </nav>

      {/* CATEGORY BAR */}
      <div className="px-4 md:px-12 py-4 flex gap-3 overflow-x-auto no-scrollbar bg-[#050505] border-b border-[#111]">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full text-[10px] font-black transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-rose-600 border-rose-600 text-white' : 'bg-transparent border-[#222] text-[#666] hover:border-rose-600'}`}>
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* HERO SECTION */}
      <div className="px-4 md:px-12 pt-12 pb-4">
        <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">NOW <span className="text-rose-600">SHOWING</span></h2>
        <p className="text-[#444] font-bold mt-2 text-xs md:text-sm tracking-widest">OFFICIAL SCHEDULE • OFFA, KWARA STATE</p>
      </div>

      {/* MOVIE GRID (Responsive) */}
      <main className="px-4 md:px-12 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12 mt-10">
        {filteredItems.map((movie) => (
          <div key={movie.id} className="relative group">
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#111] border border-[#222] shadow-2xl relative">
              <img src={movie.image_url} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              {isAdmin && <button onClick={() => handleDelete(movie.id, movie.title)} className="absolute top-4 right-4 bg-rose-600 text-white w-8 h-8 rounded-full font-bold z-10 hover:bg-white hover:text-rose-600 transition-colors">✕</button>}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
            </div>
            <div className="mt-6 px-1">
              <span className="text-[10px] text-rose-600 font-black tracking-widest uppercase">{movie.category || 'ACTION'}</span>
              <h3 className="text-xl font-black uppercase mt-1 mb-4 truncate">{movie.title}</h3>
              <div className="flex justify-between items-center pt-4 border-t border-[#111]">
                <span className="text-2xl font-black text-rose-600">{movie.price}</span>
                <button onClick={() => setSelectedMovie(movie)} className="bg-rose-600 text-white px-6 py-2 rounded-lg font-black text-xs hover:bg-white hover:text-black transition-colors">BOOK NOW</button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* ABOUT US SECTION */}
      <section className="bg-[#050505] px-4 md:px-12 py-20 border-y border-[#111]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-black italic mb-6 uppercase">THE SCENE CITY <span className="text-rose-600">EXPERIENCE</span></h2>
            <p className="text-[#888] leading-relaxed text-sm md:text-base mb-6">
              Located in the heart of Offa, Kwara State, Scene City Cinemas is redefining entertainment. We combine cutting-edge technology with a passion for storytelling to give you an immersive cinematic escape.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {['4K Projection', '7.1 Surround', 'VIP Seating', 'Premium Snacks'].map(feat => (
                <div key={feat} className="flex items-center gap-2 text-[10px] font-black tracking-widest text-rose-500">
                  <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span> {feat.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#111] p-8 rounded-2xl border border-[#222] text-center">
                <span className="block text-rose-600 text-3xl font-black mb-1">100%</span>
                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Comfort</span>
             </div>
             <div className="bg-[#111] p-8 rounded-2xl border border-[#222] text-center">
                <span className="block text-rose-600 text-3xl font-black mb-1">HD</span>
                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Visuals</span>
             </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 md:px-12 py-20 bg-black">
        <h2 className="text-center text-3xl font-black italic mb-16 uppercase">VOICES OF <span className="text-rose-600">OFFA</span></h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            { name: "Segun A.", text: "Best cinema experience in Kwara! The sound quality in Offa is incredible." },
            { name: "Mariam O.", text: "The VIP club is totally worth it. I love the discounts on popcorn!" },
            { name: "David T.", text: "Clean, professional, and world-class. Finally, a real cinema in our backyard." }
          ].map((t, i) => (
            <div key={i} className="bg-[#0a0a0a] p-8 rounded-tr-[40px] border-l-4 border-rose-600 relative">
              <span className="text-6xl text-rose-600/20 absolute top-4 right-8 font-serif">"</span>
              <p className="text-[#777] italic text-sm mb-6 leading-relaxed">"{t.text}"</p>
              <h4 className="font-black text-rose-600 text-xs tracking-widest">— {t.name.toUpperCase()}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#050505] px-4 md:px-12 py-16 border-t border-[#111]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-rose-600 text-white px-2 py-0.5 font-black text-lg">A</div>
              <span className="font-black text-xl tracking-tighter">SCENE CITY OFFA</span>
            </div>
            <p className="text-[#444] text-xs leading-loose italic">Defining the gold standard of cinema in Offa, Kwara State. Join us for the ultimate blockbuster experience.</p>
          </div>
          <div className="grid grid-cols-2 gap-12 sm:gap-24">
            <div className="flex flex-col gap-4 text-xs">
              <span className="font-black text-white tracking-widest mb-2 uppercase">Company</span>
              <span className="text-[#333] hover:text-rose-600 cursor-pointer transition-colors">Now Showing</span>
              <span className="text-[#333] hover:text-rose-600 cursor-pointer transition-colors">VIP Membership</span>
            </div>
            <div className="flex flex-col gap-4 text-xs">
              <span className="font-black text-white tracking-widest mb-2 uppercase">Connect</span>
              <span className="text-[#333] hover:text-rose-600 cursor-pointer transition-colors">WhatsApp Support</span>
              <span className="text-[#333] hover:text-rose-600 cursor-pointer transition-colors">Instagram Offa</span>
            </div>
          </div>
        </div>
        <div className="text-center mt-20 pt-8 border-t border-[#111] text-[9px] text-[#222] font-black tracking-[5px] uppercase">
          © 2026 SCENE CITY OFFA CINEMAS • ALL RIGHTS RESERVED
        </div>
      </footer>

      {/* MODALS (Simplified for Mobile) */}
      {showClubModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[2000] p-6 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] p-10 max-w-md w-full text-center border border-rose-600 rounded-3xl">
            {bookingStep === 'success' ? (
              <div className="animate-pulse">
                <span className="text-6xl mb-4 block">✨</span>
                <h2 className="text-rose-600 font-black text-2xl">WELCOME TO THE ELITE!</h2>
                <p className="text-[#555] mt-2">Opening WhatsApp for confirmation...</p>
              </div>
            ) : (
              <>
                <h2 className="font-black text-3xl italic mb-2">VIP <span className="text-rose-600">CLUB</span></h2>
                <p className="text-[#555] text-xs mb-8 uppercase tracking-widest">Join Offa's most exclusive circle</p>
                <input required placeholder="ENTER YOUR FULL NAME" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-black border border-[#222] p-4 text-white mb-6 rounded-xl text-center font-bold focus:border-rose-600 outline-none" />
                <button onClick={() => handleRedirect('CLUB')} className="w-full bg-rose-600 text-white py-4 rounded-xl font-black hover:bg-white hover:text-black transition-colors">ACTIVATE NOW</button>
                <button onClick={() => setShowClubModal(false)} className="text-[#333] mt-6 block w-full text-[10px] font-black hover:text-white transition-colors">MAYBE LATER</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[2000] p-6 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] p-10 max-w-md w-full text-center border border-rose-600 rounded-3xl">
            {bookingStep === 'success' ? (
              <div className="animate-pulse">
                <span className="text-6xl mb-4 block">🎟️</span>
                <h2 className="text-rose-600 font-black text-2xl uppercase">RESERVATION SENT!</h2>
                <p className="text-[#555] mt-2">Opening WhatsApp box office...</p>
              </div>
            ) : (
              <>
                <h2 className="text-rose-600 font-black text-2xl italic uppercase tracking-tighter">SECURE YOUR SEAT</h2>
                <p className="text-white font-black mt-2 mb-8 text-lg">{selectedMovie.title}</p>
                <input required placeholder="ENTER YOUR NAME" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-black border border-[#222] p-4 text-white mb-6 rounded-xl text-center font-bold focus:border-rose-600 outline-none" />
                <button onClick={() => handleRedirect('BOOK', selectedMovie)} className="w-full bg-rose-600 text-white py-4 rounded-xl font-black hover:bg-white hover:text-black transition-all">CONFIRM BOOKING</button>
                <button onClick={() => setSelectedMovie(null)} className="text-[#333] mt-6 block w-full text-[10px] font-black hover:text-white">GO BACK</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ADMIN FORM MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[2000] p-6">
          <div className="bg-[#111] p-8 max-w-md w-full rounded-2xl border border-[#333]">
            <h2 className="font-black text-xl mb-6 flex items-center gap-2">
              <span className="bg-rose-600 w-2 h-6 block"></span> NEW LISTING
            </h2>
            <form onSubmit={handleAddMovie} className="space-y-4">
              <input required placeholder="TITLE" value={newMovie.title} onChange={e => setNewMovie({...newMovie, title: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-lg outline-none focus:border-rose-600" />
              <select value={newMovie.category} onChange={e => setNewMovie({...newMovie, category: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-lg outline-none">
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input required placeholder="PRICE (₦)" value={newMovie.price} onChange={e => setNewMovie({...newMovie, price: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-lg outline-none" />
              <input required placeholder="IMAGE URL" value={newMovie.image_url} onChange={e => setNewMovie({...newMovie, image_url: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-lg outline-none" />
              <button className="w-full bg-white text-black py-4 rounded-lg font-black hover:bg-rose-600 hover:text-white transition-all">PUBLISH</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="w-full text-[#444] text-[10px] font-black uppercase mt-2">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;