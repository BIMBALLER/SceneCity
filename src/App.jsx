import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';
import html2canvas from 'html2canvas';

const App = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const ticketRef = useRef(null);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(null); 
  const [showClubModal, setShowClubModal] = useState(false);
  const [showTicket, setShowTicket] = useState(false); 
  const [userName, setUserName] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMovie, setNewMovie] = useState({ 
    title: '', price: '', image_url: '', category: 'Action',
    description: '', genre: '', cast: ''
  });
  const [logoClicks, setLogoClicks] = useState(0);

  const categories = ['All', 'Action', 'Comedy', 'Romance', 'Horror', 'Drama'];

  // REVIEWS DATA
  const REVIEWS = [
    { name: "Segun Arinze", text: "The 4K projection at Scene City is unmatched in Kwara!", stars: 5 },
    { name: "Amina Yusuf", text: "Sapphire Lounge is the perfect vibe for a Friday night.", stars: 5 },
    { name: "David O.", text: "Best gaming experience I've had. The VR is top-notch.", stars: 5 },
    { name: "Blessing", text: "The Kiddies Arena is safe and fun. My kids loved it!", stars: 5 },
    { name: "Ibrahim", text: "Private, premium, and professional. Scene City is elite.", stars: 5 }
  ];

  const TEL_1 = "08111112441";
  const TEL_2 = "08111112428";
  const OFFICE_ADDRESS = "5, Rabiat Ibilola Ajeigbe, Off Ojoku Road, Offa, Kwara State";
  const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(OFFICE_ADDRESS)}`;
  
  const VISUAL_SERVICES = [
    { title: "THE CINEMA", desc: "Ultra-comfortable seating & 4K projection.", img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070" },
    { title: "GAME ZONE", desc: "High-intensity gaming & VR experiences.", img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2070" },
    { title: "SAPPHIRE LOUNGE", desc: "Premium drinks & exclusive atmosphere.", img: "https://images.unsplash.com/photo-1574096079513-d8259312b785?q=80&w=1887" },
    { title: "KIDDIES ARENA", desc: "Safe, fun, and engaging for the little ones.", img: "https://images.unsplash.com/photo-1566411520896-01e7ca4726af?q=80&w=2070" }
  ];

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
      setFilteredItems(data || []);
    } catch (err) { console.error("Error:", err.message); } finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleDeleteMovie = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Permanently delete this movie from listings?")) {
      try {
        const { error } = await supabase.from('listings').delete().eq('id', id);
        if (error) throw error;
        fetchListings();
      } catch (err) { alert("Error: " + err.message); }
    }
  };

  const downloadTicket = async () => {
    if (ticketRef.current) {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#e11d48',
        scale: 3,
        useCORS: true,
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `Ticket-${selectedMovie.title}.png`;
      link.click();
    }
  };

  useEffect(() => {
    let result = items;
    if (activeCategory !== 'All') result = result.filter(item => item.category === activeCategory);
    if (searchQuery) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleBookingClick = () => {
    if(!userName) return alert("Please enter your name");
    setShowTicket(true);
  };

  const finishBooking = () => {
    const message = `Hello Scene City Offa! %0AMy name is *${userName}*. %0AI want to book: %0A🎬 *${selectedMovie.title}* %0A💰 Price: *${selectedMovie.price}*`;
    window.open(`https://wa.me/2348111112441?text=${message}`, '_blank');
    setShowTicket(false);
    setSelectedMovie(null);
    setUserName('');
  };

  if (loading) return <div className="bg-black text-rose-600 h-screen flex items-center justify-center font-black text-xl tracking-widest uppercase animate-pulse">Scene City Offa...</div>;

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-rose-600 selection:text-white overflow-x-hidden">
      
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
          <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
            <div className="bg-rose-600 text-white px-3 py-1 font-black text-2xl italic">A</div>
            <span className="text-2xl font-black tracking-tighter uppercase">SCENE<span className="text-rose-600">CITY</span></span>
          </div>
          <div className="relative hidden lg:block">
            <input type="text" placeholder="Search movies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-[#111] border border-[#333] text-white pl-10 pr-4 py-2.5 rounded-full text-sm w-[350px] outline-none focus:border-rose-600" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && <button onClick={() => setShowAddForm(true)} className="bg-white text-black px-5 py-2.5 rounded-full font-black text-[11px]">ADD MOVIE</button>}
          <button onClick={() => setShowClubModal(true)} className="bg-rose-600 text-white px-8 py-2.5 rounded-full font-black text-[11px]">JOIN CLUB</button>
        </div>
      </nav>

      {/* CATEGORY BAR */}
      <div className="px-4 md:px-12 py-4 flex gap-3 overflow-x-auto no-scrollbar bg-[#050505] border-b border-[#111]">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full text-[10px] font-black border transition-all ${activeCategory === cat ? 'bg-rose-600 border-rose-600' : 'border-[#222] text-[#666]'}`}>{cat.toUpperCase()}</button>
        ))}
      </div>

      {/* HERO */}
      <div className="px-4 md:px-12 pt-12">
        <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">NOW <span className="text-rose-600">SHOWING</span></h2>
      </div>

      {/* MOVIE GRID */}
      <main className="px-4 md:px-12 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
        {filteredItems.map((movie) => (
          <div key={movie.id} onClick={() => setViewingDetails(movie)} className="group cursor-pointer relative bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] p-2 hover:border-rose-600 transition-all">
            {isAdmin && (
              <button onClick={(e) => handleDeleteMovie(e, movie.id)} className="absolute top-4 right-4 z-[110] bg-black/80 text-rose-600 border border-rose-600/50 w-8 h-8 rounded-full font-black hover:bg-rose-600 hover:text-white transition-all">✕</button>
            )}
            <div className="aspect-[4/5] rounded-xl overflow-hidden relative">
              <img src={movie.image_url} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 text-[10px] font-black uppercase rounded-sm z-10">{movie.category}</div>
            </div>
            <div className="mt-6 px-4 pb-4 flex justify-between items-center">
              <h3 className="text-xl font-black uppercase leading-tight italic">{movie.title}</h3>
              <span className="text-rose-600 font-black">{movie.price}</span>
            </div>
          </div>
        ))}
      </main>

      {/* FIXED REVIEW WALL */}
      <section className="py-12 bg-rose-600 overflow-hidden relative border-y border-rose-700/50">
        <div className="flex animate-marquee min-w-full">
          {[...REVIEWS, ...REVIEWS, ...REVIEWS].map((rev, i) => (
            <div key={i} className="flex-shrink-0 mx-4 bg-black/10 p-6 rounded-3xl border border-white/5 w-[320px]">
              <div className="flex gap-1 mb-3">
                {[...Array(rev.stars)].map((_, s) => (
                  <span key={s} className="text-white text-[10px]">★</span>
                ))}
              </div>
              <p className="text-sm font-black uppercase italic text-white mb-3 leading-snug whitespace-normal">
                "{rev.text}"
              </p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-[1px] bg-rose-950"></div>
                <p className="text-[9px] font-black text-rose-950 uppercase tracking-widest">{rev.name}</p>
              </div>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
          .animate-marquee {
            display: flex;
            animation: marquee 40s linear infinite;
            width: max-content;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* VIBE GALLERY */}
      <section className="px-4 md:px-12 py-24 bg-[#050505] border-y border-[#111]">
        <h2 className="text-3xl md:text-5xl font-black italic mb-12 uppercase text-center">THE <span className="text-rose-600">EXPERIENCE</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {VISUAL_SERVICES.map((service, i) => (
            <div key={i} className="relative group overflow-hidden rounded-3xl h-[400px]">
              <img src={service.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
              <div className="absolute bottom-0 p-6">
                <h4 className="text-xl font-black uppercase italic">{service.title}</h4>
                <p className="text-[10px] font-bold text-[#aaa] uppercase tracking-widest mt-2">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LOCATION & CONTACT SECTION */}
      <section className="px-4 md:px-12 py-24 border-b border-[#111]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black italic uppercase leading-none mb-6">FIND <span className="text-rose-600">US</span></h2>
            <a href={MAPS_URL} target="_blank" className="text-[#555] block mb-10 hover:text-white transition-colors">{OFFICE_ADDRESS}</a>
            <div className="flex gap-4">
              <a href={`tel:${TEL_1}`} className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-2xl text-center group hover:border-rose-600 transition-all">
                <span className="text-[10px] font-black text-[#444] block mb-2 uppercase">MANAGER</span>
                <span className="font-black group-hover:text-rose-600">{TEL_1}</span>
              </a>
              <a href={`tel:${TEL_2}`} className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-2xl text-center group hover:border-rose-600 transition-all">
                <span className="text-[10px] font-black text-[#444] block mb-2 uppercase">FRONT DESK</span>
                <span className="font-black group-hover:text-rose-600">{TEL_2}</span>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-[#0a0a0a] border border-[#111] rounded-3xl flex flex-col items-center justify-center p-6 text-center">
              <span className="text-rose-600 text-4xl font-black italic mb-2">24/7</span>
              <span className="text-[9px] font-black uppercase text-[#444]">Security & Fun</span>
            </div>
            <div className="aspect-square bg-rose-600 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
              <span className="text-white text-3xl font-black italic mb-2 uppercase leading-none">Sapphire Club</span>
              <span className="text-[9px] font-black uppercase text-black/60">Elite Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED FOOTER */}
      <footer className="bg-black pt-20 pb-10 px-4 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          {/* Brand Col */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-rose-600 text-white px-3 py-1 font-black text-xl italic leading-none">A</div>
              <span className="text-xl font-black tracking-tighter uppercase">SCENE<span className="text-rose-600">CITY</span></span>
            </div>
            <p className="text-[#444] text-[11px] font-bold leading-relaxed uppercase tracking-wider">
              The ultimate entertainment destination in Offa. Experience 4K cinema, high-end gaming, and elite lounge vibes under one roof.
            </p>
          </div>

          {/* Services Col */}
          <div>
            <h4 className="text-white font-black text-xs uppercase italic mb-6 tracking-widest">Our Services</h4>
            <ul className="space-y-3 text-[10px] font-black text-[#666] uppercase">
              <li className="hover:text-rose-600 cursor-pointer transition-colors">Premium 4K Cinema</li>
              <li className="hover:text-rose-600 cursor-pointer transition-colors">VR & Console Gaming</li>
              <li className="hover:text-rose-600 cursor-pointer transition-colors">Sapphire VIP Lounge</li>
              <li className="hover:text-rose-600 cursor-pointer transition-colors">Kiddies Arena</li>
              <li className="hover:text-rose-600 cursor-pointer transition-colors">Event Hall Booking</li>
            </ul>
          </div>

          {/* Support Col */}
          <div>
            <h4 className="text-white font-black text-xs uppercase italic mb-6 tracking-widest">Company</h4>
            <ul className="space-y-3 text-[10px] font-black text-[#666] uppercase">
              <li className="hover:text-white cursor-pointer transition-colors">About Scene City</li>
              <li className="hover:text-white cursor-pointer transition-colors">Club Sapphire Perks</li>
              <li className="hover:text-white cursor-pointer transition-colors">Private Screenings</li>
              <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
            </ul>
          </div>

          {/* Hours Col */}
          <div>
            <h4 className="text-white font-black text-xs uppercase italic mb-6 tracking-widest">Opening Hours</h4>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-[#111] pb-2">
                <span className="text-[10px] font-black text-[#444] uppercase">Mon — Thu</span>
                <span className="text-[10px] font-black text-white">10AM — 10PM</span>
              </div>
              <div className="flex justify-between border-b border-[#111] pb-2">
                <span className="text-[10px] font-black text-rose-600 uppercase italic">Fri — Sun</span>
                <span className="text-[10px] font-black text-white">10AM — LATE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-[#111] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black text-[#222] tracking-[0.4em] uppercase">
            © 2026 Scene City Offa • High Standards Only
          </p>
          <div className="flex gap-8 text-[9px] font-black text-[#333] uppercase tracking-widest">
            <span className="hover:text-rose-600 cursor-pointer transition-colors">Instagram</span>
            <span className="hover:text-rose-600 cursor-pointer transition-colors">Facebook</span>
            <span className="hover:text-rose-600 cursor-pointer transition-colors">WhatsApp</span>
          </div>
        </div>
      </footer>

      {/* MODALS & FORMS (KEPT AS IS) */}
      {viewingDetails && (
        <div className="fixed inset-0 z-[3000] flex items-end md:items-center justify-center p-4">
          <div onClick={() => setViewingDetails(null)} className="absolute inset-0 bg-black/90 backdrop-blur-sm"></div>
          <div className="relative bg-[#0a0a0a] w-full max-w-2xl rounded-[32px] border border-[#222] overflow-hidden">
             <div className="p-8 space-y-6">
                <div className="flex gap-6">
                  <img src={viewingDetails.image_url} className="w-32 h-44 rounded-xl object-cover" />
                  <div>
                    <h2 className="text-3xl font-black uppercase italic leading-none">{viewingDetails.title}</h2>
                    <p className="text-rose-600 font-black mt-2">{viewingDetails.price}</p>
                    <p className="text-xs text-[#555] mt-4 leading-relaxed">{viewingDetails.description}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setSelectedMovie(viewingDetails); setViewingDetails(null); }} className="flex-1 bg-rose-600 py-4 rounded-xl font-black uppercase text-xs">Book This Movie</button>
                  <button onClick={() => setViewingDetails(null)} className="flex-1 bg-[#111] py-4 rounded-xl font-black uppercase text-xs">Close</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {selectedMovie && !showTicket && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          <div onClick={() => setSelectedMovie(null)} className="absolute inset-0 bg-black/95"></div>
          <div className="relative bg-[#0a0a0a] p-10 max-w-sm w-full rounded-[40px] border border-rose-600/30 text-center">
            <h2 className="text-xl font-black uppercase italic mb-8">Who is <span className="text-rose-600">Booking?</span></h2>
            <input required placeholder="YOUR FULL NAME" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-black border border-[#222] p-5 text-white mb-6 rounded-2xl text-center font-black focus:border-rose-600 outline-none uppercase" />
            <button onClick={handleBookingClick} className="w-full bg-rose-600 py-5 rounded-2xl font-black uppercase text-xs">Generate Ticket</button>
          </div>
        </div>
      )}

      {showTicket && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 backdrop-blur-xl">
          <div onClick={() => setShowTicket(false)} className="absolute inset-0 bg-black/80"></div>
          <div className="relative w-full max-w-sm">
            <div ref={ticketRef} className="bg-rose-600 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(225,29,72,0.3)]">
              <div className="p-8 border-b-2 border-dashed border-rose-800/50 relative">
                <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-black rounded-full"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-black rounded-full"></div>
                <div className="flex justify-between items-start mb-10">
                  <div className="font-black italic text-xl leading-none">SCENE<br/>CITY</div>
                  <div className="bg-black text-rose-600 px-3 py-1 rounded text-[10px] font-black tracking-widest">ADMIT ONE</div>
                </div>
                <h2 className="text-4xl font-black uppercase italic leading-none mb-2">{selectedMovie.title}</h2>
                <p className="text-rose-950 font-black text-xs uppercase tracking-tighter">Premium Cinema Experience</p>
              </div>
              <div className="p-8 bg-rose-600">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[8px] font-black text-rose-950 uppercase block mb-1">VIEWER</span>
                    <span className="font-black uppercase text-sm truncate block">{userName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black text-rose-950 uppercase block mb-1">ADMISSION</span>
                    <span className="font-black uppercase text-sm">{selectedMovie.price}</span>
                  </div>
                </div>
                <div className="mt-10 pt-6 border-t border-rose-500 flex justify-between items-center">
                  <div className="text-[10px] font-black uppercase text-rose-950 tracking-[0.2em]">#SCENECITYOFFA</div>
                  <div className="bg-rose-950 text-rose-500 px-3 py-1 rounded-full text-[8px] font-black uppercase">CONFIRMED</div>
                </div>
              </div>
            </div>
            <div className="mt-8 space-y-4 text-center">
              <button onClick={downloadTicket} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2">
                Download Ticket ↓
              </button>
              <button onClick={finishBooking} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10">
                Send to WhatsApp →
              </button>
              <button onClick={() => setShowTicket(false)} className="text-white/20 font-black uppercase text-[10px]">Back</button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 overflow-y-auto">
          <div onClick={() => setShowAddForm(false)} className="absolute inset-0 bg-black/98"></div>
          <div className="relative bg-[#0a0a0a] p-8 max-w-md w-full rounded-3xl border border-[#222]">
            <h2 className="text-2xl font-black mb-6 italic uppercase">Add Listing</h2>
            <div className="space-y-4">
              <input placeholder="TITLE" className="w-full bg-black border border-[#222] p-4 rounded-xl font-bold uppercase" onChange={e => setNewMovie({...newMovie, title: e.target.value})} />
              <input placeholder="PRICE" className="w-full bg-black border border-[#222] p-4 rounded-xl font-bold uppercase" onChange={e => setNewMovie({...newMovie, price: e.target.value})} />
              <input placeholder="IMAGE URL" className="w-full bg-black border border-[#222] p-4 rounded-xl font-bold" onChange={e => setNewMovie({...newMovie, image_url: e.target.value})} />
              <textarea placeholder="DESCRIPTION" className="w-full bg-black border border-[#222] p-4 rounded-xl font-bold h-24" onChange={e => setNewMovie({...newMovie, description: e.target.value})} />
              <button onClick={async () => {
                await supabase.from('listings').insert([newMovie]);
                setShowAddForm(false);
                fetchListings();
              }} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase">Publish</button>
            </div>
          </div>
        </div>
      )}

      {showClubModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[4000] p-4 backdrop-blur-md">
          <div className="bg-[#0a0a0a] p-12 max-w-md w-full text-center border border-rose-600/50 rounded-[40px]">
            <h2 className="font-black text-4xl italic mb-4 uppercase tracking-tighter text-white">CLUB <span className="text-rose-600">SAPPHIRE</span></h2>
            <input placeholder="YOUR FULL NAME" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-black border border-[#222] p-5 text-white mb-8 rounded-2xl text-center font-black focus:border-rose-600 outline-none uppercase" />
            <button onClick={() => {
                window.open(`https://wa.me/2348111112441?text=I would like to JOIN CLUB SAPPHIRE. Name: ${userName}`, '_blank');
                setShowClubModal(false);
            }} className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest">JOIN THE CIRCLE</button>
            <button onClick={() => setShowClubModal(false)} className="text-[#333] mt-8 block w-full text-[11px] font-black uppercase tracking-widest">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;