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
  const [viewingDetails, setViewingDetails] = useState(null); 
  const [showClubModal, setShowClubModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [bookingStep, setBookingStep] = useState('idle');

  // Admin States
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMovie, setNewMovie] = useState({ 
    title: '', price: '', image_url: '', category: 'Action',
    description: '', genre: '', cast: ''
  });
  const [logoClicks, setLogoClicks] = useState(0);

  const categories = ['All', 'Action', 'Comedy', 'Romance', 'Horror', 'Drama'];

  // CONFIGURATION
  const TEL_1 = "08111112441";
  const TEL_2 = "08111112428";
  const OFFICE_ADDRESS = "5, Rabiat Ibilola Ajeigbe, Off Ojoku Road, Offa, Kwara State";
  
  const SERVICES = [
    "Cinema", "Club Sapphire", "Game Zone", "Kiddies Arena", 
    "Eatery", "Snooker & Co", "Cornershop", "Karaoke", 
    "Pool", "Lounge / Bar", "Hair Barbing Salon", 
    "Massage Service", "Multipurpose Hall"
  ];

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
    if (activeCategory !== 'All') result = result.filter(item => item.category === activeCategory);
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
      if (pw === "offa123") { setIsAdmin(true); alert("Admin Mode Activated"); }
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
    let message = type === 'CLUB' 
      ? `Hello Scene City Offa! %0AI would like to *JOIN THE VIP CLUB*. %0AMy name is *${userName}*.`
      : `Hello Scene City Offa! %0AMy name is *${userName}*. %0AI want to book: %0A🎬 *${details.title}* %0A💰 Price: *${details.price}*`;

    setTimeout(() => {
      window.open(`https://wa.me/2348111112441?text=${message}`, '_blank');
      setSelectedMovie(null);
      setViewingDetails(null);
      setShowClubModal(false);
      setUserName('');
      setBookingStep('idle');
    }, 2000);
  };

  if (loading) return <div className="bg-black text-rose-600 h-screen flex items-center justify-center font-black text-xl tracking-widest uppercase">Scene City Offa...</div>;

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-rose-600 selection:text-white">
      
      {/* TOP BAR */}
      <div className="bg-[#111] px-4 md:px-12 py-2 flex justify-between items-center text-[9px] font-bold border-b border-[#222]">
        <div className={isAdmin ? 'text-rose-500' : 'text-[#444]'}>{isAdmin ? 'ADMIN AUTHORIZED' : OFFICE_ADDRESS.toUpperCase()}</div>
        <div className="hidden sm:flex gap-5 text-rose-500">
          <a href={`tel:${TEL_1}`}>{TEL_1}</a>
          <a href={`tel:${TEL_2}`}>{TEL_2}</a>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="bg-black/90 backdrop-blur-md px-4 md:px-12 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-[100] border-b border-[#1a1a1a] gap-4">
        <div className="flex items-center justify-between w-full md:w-auto gap-8">
          <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-rose-600 text-white px-3 py-1 font-black text-2xl italic">A</div>
            <span className="text-2xl font-black tracking-tighter">SCENE<span className="text-rose-600">CITY</span></span>
          </div>
          <div className="relative hidden lg:block">
            <input type="text" placeholder="Search movies, cast, or genre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-[#111] border border-[#333] text-white pl-10 pr-4 py-2.5 rounded-full text-sm w-[350px] outline-none focus:border-rose-600 transition-all" />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-center">
          {isAdmin && <button onClick={() => setShowAddForm(true)} className="bg-white text-black px-5 py-2.5 rounded-full font-black text-[11px] hover:bg-rose-600 hover:text-white transition-all whitespace-nowrap">+ ADD MOVIE</button>}
          <button onClick={() => setShowClubModal(true)} className="bg-rose-600 text-white px-8 py-2.5 rounded-full font-black text-[11px] hover:scale-105 transition-transform whitespace-nowrap">JOIN CLUB</button>
        </div>
      </nav>

      {/* CATEGORY BAR */}
      <div className="px-4 md:px-12 py-4 flex gap-3 overflow-x-auto no-scrollbar bg-[#050505] border-b border-[#111]">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full text-[10px] font-black transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-rose-600 border-rose-600 text-white' : 'bg-transparent border-[#222] text-[#666] hover:border-rose-600'}`}>{cat.toUpperCase()}</button>
        ))}
      </div>

      <div className="px-4 md:px-12 pt-12 pb-4">
        <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">NOW <span className="text-rose-600">SHOWING</span></h2>
      </div>

      {/* MOVIE GRID */}
      <main className="px-4 md:px-12 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
        {filteredItems.map((movie) => (
          <div key={movie.id} onClick={() => setViewingDetails(movie)} className="relative group flex flex-col cursor-pointer bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] p-2 hover:border-rose-600 transition-all">
            <div className="aspect-[4/5] sm:aspect-[2/3] rounded-xl overflow-hidden bg-[#111] relative">
              <img src={movie.image_url} alt={movie.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 text-[10px] font-black uppercase rounded-sm">{movie.genre || movie.category}</div>
              {isAdmin && <button onClick={(e) => { e.stopPropagation(); handleDelete(movie.id, movie.title); }} className="absolute top-4 right-4 bg-black/50 text-white w-8 h-8 rounded-full font-bold z-10 hover:bg-rose-600 transition-colors">✕</button>}
            </div>
            <div className="mt-6 px-4 pb-4">
              <h3 className="text-xl font-black uppercase mb-2 leading-tight">{movie.title}</h3>
              <p className="text-[#666] text-xs line-clamp-2">More details & storyline...</p>
              <div className="flex justify-between items-center pt-4 border-t border-[#1a1a1a] mt-4">
                <span className="text-xl font-black text-rose-600">{movie.price}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Details →</span>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* FULL MOVIE DETAILS MODAL - REDESIGNED TO PREVENT OVERLAP */}
      {viewingDetails && (
        <div className="fixed inset-0 z-[3000] flex items-end md:items-center justify-center">
          <div onClick={() => setViewingDetails(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md"></div>
          <div className="relative bg-[#0a0a0a] w-full max-w-4xl h-[85vh] md:h-auto md:max-h-[90vh] overflow-y-auto rounded-t-[40px] md:rounded-[40px] border-t md:border border-[#222] shadow-2xl">
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-10">
                <div className="w-full md:w-1/3 shrink-0">
                  <img src={viewingDetails.image_url} alt={viewingDetails.title} className="w-full rounded-2xl shadow-2xl border border-[#222]" />
                </div>
                <div className="w-full md:w-2/3 space-y-6">
                  <div>
                    <span className="text-rose-600 font-black text-xs tracking-widest uppercase">{viewingDetails.category}</span>
                    <h2 className="text-4xl md:text-6xl font-black uppercase italic mt-2 leading-none">{viewingDetails.title}</h2>
                    <p className="text-2xl font-black mt-4">{viewingDetails.price}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-[#444] uppercase tracking-widest">Storyline</h4>
                    <p className="text-[#aaa] text-base md:text-lg leading-relaxed">{viewingDetails.description}</p>
                  </div>
                  {viewingDetails.cast && (
                    <div className="bg-[#111] p-6 rounded-2xl border-l-4 border-rose-600">
                      <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Starring</h4>
                      <p className="text-white font-bold italic">{viewingDetails.cast}</p>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button onClick={() => { setSelectedMovie(viewingDetails); setViewingDetails(null); }} className="flex-1 bg-rose-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all">Book Ticket Now</button>
                    <button onClick={() => setViewingDetails(null)} className="flex-1 border border-[#222] text-[#444] py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:text-white transition-all">Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SERVICES GRID */}
      <section className="px-4 md:px-12 py-24 bg-[#050505] border-y border-[#111]">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black italic mb-12 uppercase text-center">OUR <span className="text-rose-600">SERVICES</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {SERVICES.map((service) => (
                    <div key={service} className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-2xl text-center"><span className="text-[10px] font-black uppercase tracking-widest leading-tight">{service}</span></div>
                ))}
            </div>
        </div>
      </section>

      {/* LOCATION & CONTACT SECTION */}
      <section className="px-4 md:px-12 py-24 bg-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
                <h3 className="text-rose-600 font-black text-xs tracking-widest mb-4 uppercase">Visit The Hub</h3>
                <h2 className="text-4xl md:text-5xl font-black italic mb-8 uppercase leading-none">5, RABIAT IBILOLA <br/><span className="text-rose-600">AJEIGBE</span></h2>
                <p className="text-[#555] italic mb-10">{OFFICE_ADDRESS}</p>
                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Click-to-call links */}
                    <a href={`tel:${TEL_1}`} className="flex flex-col bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-2xl hover:border-rose-600 transition-all group active:scale-95">
                        <span className="text-[10px] font-black text-[#444] mb-2 uppercase group-hover:text-rose-600">MANAGER</span>
                        <span className="text-xl font-black">{TEL_1}</span>
                    </a>
                    <a href={`tel:${TEL_2}`} className="flex flex-col bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-2xl hover:border-rose-600 transition-all group active:scale-95">
                        <span className="text-[10px] font-black text-[#444] mb-2 uppercase group-hover:text-rose-600">FRONT DESK</span>
                        <span className="text-xl font-black">{TEL_2}</span>
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="aspect-square bg-[#0a0a0a] rounded-3xl border border-[#111] flex flex-col items-center justify-center p-8 text-center">
                    <span className="text-rose-600 text-5xl mb-4 italic font-black">24/7</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#444]">Security & Fun</span>
                </div>
                <div className="aspect-square bg-rose-600 rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-2xl shadow-rose-600/20">
                    <span className="text-white text-4xl mb-4 italic font-black uppercase">Sapphire</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Elite Club</span>
                </div>
            </div>
        </div>
      </section>

      <footer className="bg-[#050505] px-4 md:px-12 py-10 border-t border-[#111] text-center">
          <p className="text-[10px] text-[#222] font-black tracking-[8px] uppercase">© 2026 SCENE CITY OFFA • PREMIUM LIFESTYLE HUB</p>
      </footer>

      {/* BOOKING MODAL */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[4000] p-4 backdrop-blur-md">
          <div className="bg-[#0a0a0a] p-10 max-w-md w-full text-center border border-rose-600/50 rounded-[40px] shadow-2xl">
            <h2 className="text-rose-600 font-black text-2xl italic uppercase mb-6 tracking-widest">Booking For {selectedMovie.title}</h2>
            <input required placeholder="ENTER YOUR NAME" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-black border border-[#222] p-5 text-white mb-8 rounded-2xl text-center font-black focus:border-rose-600 outline-none text-lg" />
            <button onClick={() => handleRedirect('BOOK', selectedMovie)} className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest">Confirm Booking</button>
            <button onClick={() => setSelectedMovie(null)} className="text-[#333] mt-8 block w-full text-[11px] font-black uppercase">Cancel</button>
          </div>
        </div>
      )}

      {/* CLUB MODAL */}
      {showClubModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[4000] p-4 backdrop-blur-md">
          <div className="bg-[#0a0a0a] p-12 max-w-md w-full text-center border border-rose-600/50 rounded-[40px] shadow-2xl">
            <h2 className="font-black text-4xl italic mb-4 uppercase">CLUB <span className="text-rose-600">SAPPHIRE</span></h2>
            <input required placeholder="YOUR FULL NAME" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-black border border-[#222] p-5 text-white mb-8 rounded-2xl text-center font-black focus:border-rose-600 outline-none text-lg" />
            <button onClick={() => handleRedirect('CLUB')} className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest">JOIN THE CIRCLE</button>
            <button onClick={() => setShowClubModal(false)} className="text-[#333] mt-8 block w-full text-[11px] font-black uppercase">Close</button>
          </div>
        </div>
      )}

      {/* ADMIN FORM */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/98 flex items-center justify-center z-[5000] p-4 overflow-y-auto">
          <div className="bg-[#0a0a0a] p-10 max-w-md w-full rounded-[30px] border border-[#222] my-auto">
            <h2 className="font-black text-2xl mb-8 uppercase italic"><span className="bg-rose-600 w-3 h-8 inline-block mr-2"></span> Add Movie</h2>
            <form onSubmit={handleAddMovie} className="space-y-5">
              <input required placeholder="TITLE" value={newMovie.title} onChange={e => setNewMovie({...newMovie, title: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-xl outline-none focus:border-rose-600 font-bold" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newMovie.category} onChange={e => setNewMovie({...newMovie, category: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-xl font-bold">
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input required placeholder="GENRE" value={newMovie.genre} onChange={e => setNewMovie({...newMovie, genre: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-xl font-bold" />
              </div>
              <input required placeholder="CAST" value={newMovie.cast} onChange={e => setNewMovie({...newMovie, cast: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-xl font-bold" />
              <textarea required placeholder="STORY" value={newMovie.description} onChange={e => setNewMovie({...newMovie, description: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-xl h-28 resize-none"></textarea>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="PRICE" value={newMovie.price} onChange={e => setNewMovie({...newMovie, price: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-xl font-bold" />
                <input required placeholder="POSTER URL" value={newMovie.image_url} onChange={e => setNewMovie({...newMovie, image_url: e.target.value})} className="w-full bg-black border border-[#222] p-4 rounded-xl font-bold" />
              </div>
              <button className="w-full bg-white text-black py-5 rounded-xl font-black uppercase text-xs">Publish Movie</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="w-full text-[#333] text-[10px] font-black uppercase mt-4">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;