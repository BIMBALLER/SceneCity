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
  const [newMovie, setNewMovie] = useState({ 
    title: '', 
    price: '', 
    image_url: '', 
    category: 'Action',
    description: '',
    genre: '',
    cast: ''
  });
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
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.cast && item.cast.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.genre && item.genre.toLowerCase().includes(searchQuery.toLowerCase()))
      );
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
      setNewMovie({ title: '', price: '', image_url: '', category: 'Action', description: '', genre: '', cast: '' });
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
            <input type="text" placeholder="Search by title, genre, or cast..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-[#111] border border-[#333] text-white pl-10 pr-4 py-2.5 rounded-full text-sm w-[350px] outline-none focus:border-rose-600 transition-all" />
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

      {/* MOVIE GRID - UPDATED FOR BIGGER IMAGES & MOBILE RESPONSIVENESS */}
      <main className="px-4 md:px-12 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10 md:gap-14 mt-10">
        {filteredItems.map((movie) => (
          <div key={movie.id} className="relative group flex flex-col h-full bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] p-2 hover:border-rose-600/50 transition-all duration-500">
            {/* BIGGER ASPECT RATIO FOR POSTERS */}
            <div className="aspect-[4/5] sm:aspect-[2/3] rounded-xl overflow-hidden bg-[#111] border border-[#222] shadow-2xl relative">
              <img src={movie.image_url} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              {isAdmin && <button onClick={() => handleDelete(movie.id, movie.title)} className="absolute top-4 right-4 bg-rose-600 text-white w-10 h-10 rounded-full font-bold z-10 hover:bg-white hover:text-rose-600 transition-colors shadow-lg">✕</button>}
              
              <div className="absolute top-4 left-4">
                <span className="bg-rose-600 text-white px-4 py-1.5 text-[10px] font-black uppercase rounded-sm tracking-widest shadow-lg">
                  {movie.genre || movie.category}
                </span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
            </div>

            <div className="mt-8 px-4 flex flex-col flex-grow pb-4">
              <span className="text-[11px] text-rose-600 font-black tracking-[0.2em] uppercase mb-1">{movie.category || 'ACTION'}</span>
              <h3 className="text-2xl font-black uppercase mb-3 leading-tight">{movie.title}</h3>
              
              <p className="text-[#888] text-sm leading-relaxed line-clamp-3 mb-4 font-medium">
                {movie.description || "Experience the thrill of this latest blockbuster at Scene City Offa."}
              </p>
              
              {movie.cast && (
                <p className="text-[11px] text-[#555] font-bold italic mb-6 border-l-2 border-rose-600 pl-3">
                  CAST: <span className="text-[#aaa]">{movie.cast}</span>
                </p>
              )}

              <div className="mt-auto flex justify-between items-center pt-6 border-t border-[#1a1a1a]">
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#444] font-bold uppercase tracking-widest">Ticket Price</span>
                    <span className="text-3xl font-black text-white">{movie.price}</span>
                </div>
                <button onClick={() => setSelectedMovie(movie)} className="bg-rose-600 text-white px-8 py-3 rounded-xl font-black text-xs hover:bg-white hover:text-black transition-all shadow-lg hover:shadow-rose-600/20 active:scale-95">BOOK NOW</button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* ABOUT US SECTION */}
      <section className="bg-[#050505] px-4 md:px-12 py-24 border-y border-[#111]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black italic mb-8 uppercase leading-none">THE SCENE CITY <br/><span className="text-rose-600 text-5xl md:text-7xl">EXPERIENCE</span></h2>
            <p className="text-[#888] leading-relaxed text-base md:text-lg mb-8 max-w-lg font-medium">
              Located in the heart of Offa, Kwara State, Scene City Cinemas is redefining entertainment. We combine cutting-edge technology with a passion for storytelling to give you an immersive cinematic escape.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {['4K Projection', '7.1 Surround', 'VIP Seating', 'Premium Snacks'].map(feat => (
                <div key={feat} className="flex items-center gap-3 text-[11px] font-black tracking-[0.2em] text-rose-500">
                  <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse"></span> {feat.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div className="bg-[#0a0a0a] p-10 rounded-3xl border border-[#1a1a1a] text-center transform hover:-translate-y-2 transition-transform">
                <span className="block text-rose-600 text-4xl font-black mb-2">100%</span>
                <span className="text-[11px] font-bold text-white uppercase tracking-widest">Comfort</span>
             </div>
             <div className="bg-[#0a0a0a] p-10 rounded-3xl border border-[#1a1a1a] text-center transform hover:-translate-y-2 transition-transform">
                <span className="block text-rose-600 text-4xl font-black mb-2">HD</span>
                <span className="text-[11px] font-bold text-white uppercase tracking-widest">Visuals</span>
             </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 md:px-12 py-24 bg-black">
        <h2 className="text-center text-4xl font-black italic mb-20 uppercase">VOICES OF <span className="text-rose-600">OFFA</span></h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {[
            { name: "Segun A.", text: "Best cinema experience in Kwara! The sound quality in Offa is incredible." },
            { name: "Mariam O.", text: "The VIP club is totally worth it. I love the discounts on popcorn!" },
            { name: "David T.", text: "Clean, professional, and world-class. Finally, a real cinema in our backyard." }
          ].map((t, i) => (
            <div key={i} className="bg-[#0a0a0a] p-10 rounded-2xl border-t border-[#1a1a1a] relative group hover:border-rose-600 transition-colors">
              <span className="text-7xl text-rose-600/10 absolute top-4 right-8 font-serif">"</span>
              <p className="text-[#888] italic text-base mb-8 leading-relaxed font-medium">"{t.text}"</p>
              <h4 className="font-black text-rose-600 text-xs tracking-[0.3em]">— {t.name.toUpperCase()}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#050505] px-4 md:px-12 py-20 border-t border-[#111]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-rose-600 text-white px-3 py-1 font-black text-2xl italic">A</div>
              <span className="font-black text-3xl tracking-tighter">SCENE CITY OFFA</span>
            </div>
            <p className="text-[#555] text-sm leading-relaxed italic font-medium">Defining the gold standard of cinema in Offa, Kwara State. Join us for the ultimate blockbuster experience.</p>
          </div>
          <div className="grid grid-cols-2 gap-16 sm:gap-32">
            <div className="flex flex-col gap-6 text-[11px] font-black tracking-widest">
              <span className="text-white mb-2 uppercase border-b border-rose-600 pb-2 w-fit">Company</span>
              <span className="text-[#444] hover:text-rose-600 cursor-pointer transition-colors">Now Showing</span>
              <span className="text-[#444] hover:text-rose-600 cursor-pointer transition-colors">VIP Membership</span>
            </div>
            <div className="flex flex-col gap-6 text-[11px] font-black tracking-widest">
              <span className="text-white mb-2 uppercase border-b border-rose-600 pb-2 w-fit">Connect</span>
              <span className="text-[#444] hover:text-rose-600 cursor-pointer transition-colors">WhatsApp Support</span>
              <span className="text-[#444] hover:text-rose-600 cursor-pointer transition-colors">Instagram Offa</span>
            </div>
          </div>
        </div>
        <div className="text-center mt-24 pt-10 border-t border-[#111] text-[10px] text-[#222] font-black tracking-[8px] uppercase">
          © 2026 SCENE CITY OFFA CINEMAS • ALL RIGHTS RESERVED
        </div>
      </footer>

      {/* MODALS */}
      {showClubModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[2000] p-4 backdrop-blur-md">
          <div className="bg-[#0a0a0a] p-12 max-w-md w-full text-center border border-rose-600/50 rounded-[40px] shadow-2xl">
            {bookingStep === 'success' ? (
              <div className="animate-pulse">
                <span className="text-7xl mb-6 block">✨</span>
                <h2 className="text-rose-600 font-black text-3xl">WELCOME TO THE ELITE!</h2>
                <p className="text-[#666] mt-4 font-bold uppercase tracking-widest text-[10px]">Opening WhatsApp for confirmation...</p>
              </div>
            ) : (
              <>
                <h2 className="font-black text-4xl italic mb-4">VIP <span className="text-rose-600">CLUB</span></h2>
                <p className="text-[#555] text-[10px] mb-10 uppercase tracking-[0.4em] font-black">Join Offa's most exclusive circle</p>
                <input required placeholder="ENTER YOUR FULL NAME" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-black border border-[#222] p-5 text-white mb-8 rounded-2xl text-center font-black focus:border-rose-600 outline-none text-lg placeholder:text-[#333]" />
                <button onClick={() => handleRedirect('CLUB')} className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black text-sm hover:bg-white hover:text-black transition-all shadow-xl shadow-rose-600/20 uppercase tracking-widest">ACTIVATE NOW</button>
                <button onClick={() => setShowClubModal(false)} className="text-[#333] mt-8 block w-full text-[11px] font-black hover:text-white transition-colors uppercase tracking-[0.2em]">Maybe Later</button>
              </>
            )}
          </div>
        </div>
      )}

      {selectedMovie && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[2000] p-4 backdrop-blur-md">
          <div className="bg-[#0a0a0a] p-12 max-w-md w-full text-center border border-rose-600/50 rounded-[40px] shadow-2xl">
            {bookingStep === 'success' ? (
              <div className="animate-pulse">
                <span className="text-7xl mb-6 block">🎟️</span>
                <h2 className="text-rose-600 font-black text-3xl uppercase">RESERVATION SENT!</h2>
                <p className="text-[#666] mt-4 font-bold uppercase tracking-widest text-[10px]">Opening WhatsApp box office...</p>
              </div>
            ) : (
              <>
                <h2 className="text-rose-600 font-black text-2xl italic uppercase tracking-widest mb-2">SECURE YOUR SEAT</h2>
                <div className="bg-rose-600/5 py-4 px-6 rounded-2xl mb-8">
                    <p className="text-white font-black text-2xl uppercase">{selectedMovie.title}</p>
                    <p className="text-rose-600 font-black text-sm mt-1">{selectedMovie.price}</p>
                </div>
                <input required placeholder="ENTER YOUR NAME" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-black border border-[#222] p-5 text-white mb-8 rounded-2xl text-center font-black focus:border-rose-600 outline-none text-lg placeholder:text-[#333]" />
                <button onClick={() => handleRedirect('BOOK', selectedMovie)} className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black text-sm hover:bg-white hover:text-black transition-all shadow-xl shadow-rose-600/20 uppercase tracking-widest">CONFIRM BOOKING</button>
                <button onClick={() => setSelectedMovie(null)} className="text-[#333] mt-8 block w-full text-[11px] font-black hover:text-white transition-colors uppercase tracking-[0.2em]">Go Back</button>
              </>
            )}
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/98 flex items-center justify-center z-[2000] p-4 overflow-y-auto">
          <div className="bg-[#0a0a0a] p-10 max-w-md w-full rounded-[30px] border border-[#222] my-auto">
            <h2 className="font-black text-2xl mb-8 flex items-center gap-3 italic">
              <span className="bg-rose-600 w-3 h-8 block"></span> NEW BLOCKBUSTER
            </h2>
            <form onSubmit={handleAddMovie} className="space-y-5">
              <input required placeholder="TITLE" value={newMovie.title} onChange={e => setNewMovie({...newMovie, title: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-xl outline-none focus:border-rose-600 font-bold" />
              
              <div className="grid grid-cols-2 gap-3">
                <select value={newMovie.category} onChange={e => setNewMovie({...newMovie, category: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-xl outline-none font-bold">
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input required placeholder="GENRE" value={newMovie.genre} onChange={e => setNewMovie({...newMovie, genre: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-xl outline-none focus:border-rose-600 font-bold" />
              </div>

              <input required placeholder="CAST MEMBERS" value={newMovie.cast} onChange={e => setNewMovie({...newMovie, cast: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-xl outline-none focus:border-rose-600 font-bold" />
              
              <textarea required placeholder="STORYLINE / DESCRIPTION" value={newMovie.description} onChange={e => setNewMovie({...newMovie, description: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-xl outline-none focus:border-rose-600 h-28 resize-none font-medium"></textarea>

              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="PRICE" value={newMovie.price} onChange={e => setNewMovie({...newMovie, price: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-xl outline-none font-bold" />
                <input required placeholder="IMAGE URL" value={newMovie.image_url} onChange={e => setNewMovie({...newMovie, image_url: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-xl outline-none font-bold" />
              </div>
              
              <button className="w-full bg-white text-black py-5 rounded-xl font-black hover:bg-rose-600 hover:text-white transition-all uppercase tracking-widest text-xs">PUBLISH TO SITE</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="w-full text-[#333] text-[10px] font-black uppercase mt-2 tracking-widest hover:text-white">Cancel Listing</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;