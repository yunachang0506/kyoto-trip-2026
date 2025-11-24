import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Utensils, 
  Navigation, 
  Hotel, 
  Plus, 
  Trash2, 
  Wallet, 
  ShoppingBag, 
  List, 
  ArrowRightCircle, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  BookOpen, 
  Zap, 
  Bus, 
  Image as ImageIcon, 
  LayoutGrid, 
  AlignJustify, 
  Plane, 
  Phone, 
  AlertCircle, 
  CheckSquare, 
  Coins, 
  CalendarDays, 
  Pencil, 
  Save, 
  Settings, 
  Palette, 
  Users, 
  Heart, 
  Flower2, 
  Train, 
  Footprints 
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  setDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';

// =================================================================
// 🔥【請將您的 Firebase Config 貼在下方】🔥
// 格式應該是 { apiKey: "...", authDomain: "...", ... }
// 如果還沒設定，保持 null，App 會以「離線模式」運作。
// =================================================================
const FIREBASE_CONFIG = null; 

// --- RICH KYOTO THEMES ---
const THEMES = {
  sunset: { 
    id: 'sunset', name: '金閣', 
    bg: 'bg-[#fcf9f2]', 
    cardBg: 'bg-[#fffef9]',
    primary: 'bg-[#d4af37]', 
    primaryText: 'text-[#d4af37]',
    accent: 'text-[#8c6400]',
    border: 'border-[#d4af37]',
    soft: 'bg-[#f9f1d8]',
    shadow: 'shadow-[#bfa030]',
    gradient: 'from-[#d4af37] to-[#bfa030]',
    text: 'text-[#5c4f30]',
  },
  matcha: { 
    id: 'matcha', name: '宇治', 
    bg: 'bg-[#f4f7f2]', 
    cardBg: 'bg-[#fdfffc]',
    primary: 'bg-[#5c7a4a]', 
    primaryText: 'text-[#5c7a4a]',
    accent: 'text-[#3d5230]',
    border: 'border-[#5c7a4a]',
    soft: 'bg-[#eaf0e6]',
    shadow: 'shadow-[#3d5230]',
    gradient: 'from-[#5c7a4a] to-[#4a633b]',
    text: 'text-[#3d423a]',
  },
  sakura: { 
    id: 'sakura', name: '哲学', 
    bg: 'bg-[#fffafb]',
    cardBg: 'bg-[#fffdfd]',
    primary: 'bg-[#d66a7e]', 
    primaryText: 'text-[#d66a7e]',
    accent: 'text-[#b55d6c]',
    border: 'border-[#d66a7e]',
    soft: 'bg-[#fdedef]',
    shadow: 'shadow-[#b55d6c]',
    gradient: 'from-[#e08998] to-[#d17384]',
    text: 'text-[#594a4d]',
  },
  ocean: { 
    id: 'ocean', name: '鴨川', 
    bg: 'bg-[#f0f4f7]',
    cardBg: 'bg-[#fcfdfe]',
    primary: 'bg-[#2d5f7a]', 
    primaryText: 'text-[#2d5f7a]',
    accent: 'text-[#1b3a4b]',
    border: 'border-[#2d5f7a]',
    soft: 'bg-[#e1eaf0]',
    shadow: 'shadow-[#1b3a4b]',
    gradient: 'from-[#3a6c87] to-[#2d5469]',
    text: 'text-[#2c3e4a]',
  },
  midnight: { 
    id: 'midnight', name: '祇園', 
    bg: 'bg-[#f5f3f7]',
    cardBg: 'bg-[#fbfaff]',
    primary: 'bg-[#5d4a75]', 
    primaryText: 'text-[#5d4a75]',
    accent: 'text-[#362a45]',
    border: 'border-[#5d4a75]',
    soft: 'bg-[#eaddf5]',
    shadow: 'shadow-[#362a45]',
    gradient: 'from-[#4a3b5c] to-[#362a45]',
    text: 'text-[#2d2a30]',
  },
};

const WASHI_TEXTURE = "before:content-[''] before:fixed before:inset-0 before:bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] before:opacity-60 before:pointer-events-none before:z-[-1]";

const DEFAULT_TRIP_INFO = {
  title: "2026阪京之旅",
  dateRange: "1/17 - 1/22",
  days: [1, 2, 3, 4, 5, 6],
  startDate: "2026-01-17",
  theme: 'sunset', 
  coverImage: null 
};

const DEFAULT_FLIGHTS = {
  departure: { date: "1/17", flight: "JX821", time: "10:00 -> 13:30", terminal: "桃機 T1" },
  return: { date: "1/22", flight: "JX822", time: "15:00 -> 17:10", terminal: "關空 T1" }
};

const DEFAULT_CONTACTS = [
  { id: 'c1', name: "旅外急難救助", phone: "+886-800-085-095" },
  { id: 'c2', name: "日本報警", phone: "110" },
  { id: 'c3', name: "男友手機", phone: "0912-345-678" }
];

const DEFAULT_HOTELS = [
  { id: 'h1', days: [1, 2, 3], name: "KOKO HOTEL 京都", address: "京都府京都市...", mapLink: "" },
  { id: 'h2', days: [4, 5, 6], name: "Vessel Inn Namba", address: "大阪市中央区...", mapLink: "" }
];

const PRE_DEPARTURE_CHECKLIST = [
  { id: 'chk1', text: '護照 (效期6個月+)', checked: false, important: true },
  { id: 'chk2', text: 'VJW 填寫', checked: false, important: true },
  { id: 'chk3', text: '旅遊平險/不便險', checked: false, important: true },
  { id: 'chk4', text: 'eSIM / 漫遊', checked: false },
  { id: 'chk5', text: '換日幣', checked: false },
];

const INITIAL_WISHLIST = [
  {
    id: 'w1', type: 'food', title: '奧丹 湯豆腐', location: '京都・清水',
    tags: ['京都名物'], description: '庭園景色優美。推薦昔豆腐套餐。',
    assignedDay: 1, order: 2
  },
  {
    id: 'w4', type: 'spot', title: '清水寺', location: '京都・東山',
    tags: ['必去'], description: '早晨去避開人潮。',
    assignedDay: 1, order: 1
  }
];

const getMockTransit = (fromId, toId) => {
  const random = Math.random();
  if (random > 0.6) return { type: 'bus', line: '市營206', duration: '15分', icon: Bus };
  if (random > 0.3) return { type: 'train', line: '京阪本線', duration: '20分', icon: Train };
  return { type: 'walk', line: '步行', duration: '10分', icon: Footprints };
};

export default function TabiNote() {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [showSettings, setShowSettings] = useState(false);
  
  const [tripInfo, setTripInfo] = useState(DEFAULT_TRIP_INFO);
  const [flights, setFlights] = useState(DEFAULT_FLIGHTS);
  const [hotels, setHotels] = useState(DEFAULT_HOTELS);
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS);
  
  const [wishlist, setWishlist] = useState(INITIAL_WISHLIST);
  const [shoppingList, setShoppingList] = useState([]);
  const [checklist, setChecklist] = useState(PRE_DEPARTURE_CHECKLIST);
  const [expenses, setExpenses] = useState([]);
  
  const [selectedSpot, setSelectedSpot] = useState(null);

  const [db, setDb] = useState(null);
  const [user, setUser] = useState(null);
  const [appId, setAppId] = useState('kyoto-trip-default');
  const [isOnline, setIsOnline] = useState(false);

  const theme = THEMES[tripInfo.theme] || THEMES.sunset;

  // --- Initialize System ---
  useEffect(() => {
    const initSystem = async () => {
      if (FIREBASE_CONFIG) {
        try {
          const app = initializeApp(FIREBASE_CONFIG);
          const auth = getAuth(app);
          const firestore = getFirestore(app);
          setDb(firestore);
          await signInAnonymously(auth);
          onAuthStateChanged(auth, (u) => {
            setUser(u);
            setIsOnline(!!u);
          });
        } catch (e) { 
          console.error("Firebase init error:", e);
          loadLocalData();
        }
      } else {
        loadLocalData();
      }
    };
    initSystem();
  }, []);

  const loadLocalData = () => {
    const load = (key, setter, def) => {
      const saved = localStorage.getItem(key);
      if (saved) setter(JSON.parse(saved));
      else setter(def);
    };
    load('tabi_tripInfo', setTripInfo, DEFAULT_TRIP_INFO);
    load('tabi_flights', setFlights, DEFAULT_FLIGHTS);
    load('tabi_hotels', setHotels, DEFAULT_HOTELS);
    load('tabi_contacts', setContacts, DEFAULT_CONTACTS);
    load('tabi_wishlist', setWishlist, INITIAL_WISHLIST);
    load('tabi_shopping', setShoppingList, []);
    load('tabi_checklist', setChecklist, PRE_DEPARTURE_CHECKLIST);
    load('tabi_expenses', setExpenses, []);
  };

  const getColl = (name) => {
    if (!db || !appId) return null;
    return collection(db, 'artifacts', appId, 'public', 'data', name);
  };

  const getDocRef = (collName, docId) => {
    if (!db || !appId) return null;
    return doc(db, 'artifacts', appId, 'public', 'data', collName, docId);
  };

  // --- Sync Effects ---
  useEffect(() => {
    if (!db || !user || !appId) return;

    const unsubWish = onSnapshot(query(getColl('wishlist')), sn => {
      const data = sn.docs.map(d => ({ id: d.id, ...d.data() }));
      if(data.length > 0) setWishlist(data); 
    });
    const unsubShop = onSnapshot(query(getColl('shopping')), sn => setShoppingList(sn.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExp = onSnapshot(query(getColl('expenses')), sn => {
      const data = sn.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setExpenses(data);
    });
    const unsubCheck = onSnapshot(query(getColl('checklist')), sn => {
       const data = sn.docs.map(d => ({ id: d.id, ...d.data() }));
       if (data.length > 0) {
         data.sort((a,b) => a.id.localeCompare(b.id));
         setChecklist(data);
       }
    });
    const unsubHotels = onSnapshot(query(getColl('hotels')), sn => {
      const data = sn.docs.map(d => ({ id: d.id, ...d.data() }));
      if(data.length > 0) setHotels(data);
    });
    const unsubContacts = onSnapshot(query(getColl('contacts')), sn => {
      const data = sn.docs.map(d => ({ id: d.id, ...d.data() }));
      if(data.length > 0) setContacts(data);
    });

    const unsubTrip = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'tripInfo'), sn => {
      if(sn.exists()) setTripInfo({ ...DEFAULT_TRIP_INFO, ...sn.data() });
    });
    const unsubFlights = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'flights'), sn => {
      if(sn.exists()) setFlights(sn.data());
    });

    return () => {
      unsubWish(); unsubShop(); unsubExp(); unsubCheck(); unsubHotels(); unsubContacts(); unsubTrip(); unsubFlights();
    };
  }, [db, user, appId]);

  // --- Handlers ---
  const handleUpdateTrip = async (newInfo) => {
    setTripInfo(newInfo);
    if(isOnline) await setDoc(getDocRef('settings', 'tripInfo'), newInfo);
    else localStorage.setItem('tabi_tripInfo', JSON.stringify(newInfo));
  };

  const handleUpdateFlights = async (newFlights) => {
    setFlights(newFlights);
    if(isOnline) await setDoc(getDocRef('settings', 'flights'), newFlights);
    else localStorage.setItem('tabi_flights', JSON.stringify(newFlights));
  };

  const addToCollection = async (coll, item, setList) => {
    const newItem = { ...item, id: item.id || Date.now().toString() };
    if(isOnline) await setDoc(getDocRef(coll, newItem.id), newItem);
    else {
      setList(prev => {
        const updated = [...prev, newItem];
        localStorage.setItem(`tabi_${coll}`, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateInCollection = async (coll, item, setList) => {
    if(isOnline) await setDoc(getDocRef(coll, item.id), item, { merge: true });
    else {
      setList(prev => {
        const updated = prev.map(i => i.id === item.id ? item : i);
        localStorage.setItem(`tabi_${coll}`, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const deleteFromCollection = async (coll, id, setList) => {
    if(isOnline) await deleteDoc(getDocRef(coll, id));
    else {
      setList(prev => {
        const updated = prev.filter(i => i.id !== id);
        localStorage.setItem(`tabi_${coll}`, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleAssignDay = (spotId, day) => {
    const item = wishlist.find(i => i.id === spotId);
    if(!item) return;
    const maxOrder = wishlist.filter(i => i.assignedDay === day).reduce((max, x) => Math.max(max, x.order || 0), 0);
    updateInCollection('wishlist', { ...item, assignedDay: day, order: maxOrder + 1 }, setWishlist);
  };

  const handleOptimizeRoute = (day) => {
    const dayItems = wishlist.filter(i => i.assignedDay === day);
    if (dayItems.length < 2) return;
    const newOrder = [...dayItems].sort(() => Math.random() - 0.5);
    newOrder.forEach((item, idx) => {
      updateInCollection('wishlist', { ...item, order: idx }, setWishlist);
    });
  };

  const toggleChecklist = (id) => {
    const item = checklist.find(i => i.id === id);
    if(item) updateInCollection('checklist', { ...item, checked: !item.checked }, setChecklist);
  };

  const openMap = (location) => {
    const query = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const TransitNode = ({ from, to }) => {
    const transit = getMockTransit(from, to);
    const Icon = transit.icon;
    return (
      <div className="relative pl-12 mb-8 group cursor-default">
        <div className="absolute left-[38px] top-0 bottom-0 w-0.5 bg-stone-200 border-l-2 border-dashed border-stone-300 group-hover:border-stone-400 transition-colors"></div>
        <div className="flex items-center gap-3 bg-[#fffefc] border-2 border-stone-100 px-3 py-2 rounded-lg shadow-sm w-fit max-w-[85%] hover:border-stone-300 transition-colors">
           <div className={`p-1.5 rounded-full ${theme.bg} ${theme.text}`}>
             <Icon className="w-3.5 h-3.5" />
           </div>
           <div>
             <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{transit.line}</p>
             <p className="text-xs font-bold text-stone-600 font-mono">約 {transit.duration}</p>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme.bg} font-sans text-stone-800 pb-24 select-none ${WASHI_TEXTURE}`}>
      
      {/* Header */}
      <header className={`relative transition-all duration-500 ${tripInfo.coverImage ? 'h-64' : 'h-auto'}`}>
        {tripInfo.coverImage ? (
          <div className="absolute inset-0 overflow-hidden shadow-lg">
            <img src={tripInfo.coverImage} className="w-full h-full object-cover" alt="Cover" />
            <div className={`absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 mix-blend-multiply`}></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-30"></div>
          </div>
        ) : (
          <div className={`absolute inset-0 ${theme.bg} border-b-2 ${theme.border} shadow-sm`}></div>
        )}

        <div className={`relative z-10 px-6 py-6 flex justify-between items-start ${tripInfo.coverImage ? 'text-white pt-32' : 'text-stone-800'}`}>
          <div className="drop-shadow-md">
            <div className="flex items-center gap-3">
              <h1 className={`font-serif font-bold tracking-widest ${tripInfo.coverImage ? 'text-4xl' : 'text-3xl'}`}>
                {tripInfo.title}
              </h1>
            </div>
            <p className={`text-xs font-bold mt-2 tracking-[0.2em] uppercase flex items-center gap-2 ${tripInfo.coverImage ? 'text-stone-200' : theme.text}`}>
              <span className="border-b border-current pb-0.5">{tripInfo.dateRange}</span>
              {isOnline && <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] border border-white/30">同步中</span>}
            </p>
          </div>
          
          <button 
            onClick={() => setShowSettings(true)} 
            className={`p-3 rounded-xl backdrop-blur-md transition-all shadow-lg border ${tripInfo.coverImage ? 'bg-white/10 hover:bg-white/20 border-white/30 text-white' : `bg-white hover:bg-stone-50 ${theme.border} ${theme.text}`}`}
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`bg-[#fffbf0] w-full max-w-sm rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] p-6 animate-in slide-in-from-bottom-10 space-y-6 border-4 ${theme.border} relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-full h-2 ${theme.primary}`}></div>
            <div className="flex justify-between items-center border-b-2 border-stone-200 pb-4">
              <h3 className="font-serif font-bold text-2xl flex items-center gap-2 text-stone-800"><Palette className="w-6 h-6" /> 風格設定</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 rounded-lg hover:bg-stone-200 transition-colors"><XCircle className="w-6 h-6 text-stone-500" /></button>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-widest block">主題色系</label>
              <div className="grid grid-cols-5 gap-3">
                {Object.values(THEMES).map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => handleUpdateTrip({ ...tripInfo, theme: t.id })}
                    className={`flex flex-col items-center gap-2 transition-all ${tripInfo.theme === t.id ? 'scale-110' : 'opacity-70 grayscale hover:grayscale-0'}`}
                  >
                    <div className={`w-12 h-12 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border-2 ${t.primary} ${tripInfo.theme === t.id ? 'border-stone-800 ring-2 ring-offset-2 ring-stone-300' : 'border-transparent'} flex items-center justify-center`}>
                      {tripInfo.theme === t.id && <CheckCircle2 className="w-6 h-6 text-white" />}
                    </div>
                    <span className="text-[10px] font-bold text-stone-600 font-serif">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-widest block">封面照片</label>
              {tripInfo.coverImage ? (
                <div className="relative h-40 rounded-lg overflow-hidden group shadow-inner border-2 border-stone-200">
                  <img src={tripInfo.coverImage} className="w-full h-full object-cover" alt="Cover" />
                  <button 
                    onClick={() => handleUpdateTrip({ ...tripInfo, coverImage: null })}
                    className="absolute top-2 right-2 bg-white text-red-500 p-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border border-stone-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <ImageUpload onImageSelect={(b64) => handleUpdateTrip({ ...tripInfo, coverImage: b64 })} theme={theme} />
              )}
            </div>
            
            <button onClick={() => setShowSettings(false)} className={`w-full py-4 rounded-lg font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] transition-all border-2 border-black/10 ${theme.primary}`}>
              完成設定
            </button>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto p-5 space-y-6">
        {activeTab === 'wishlist' && (
          <TreasureBoxView 
            wishlist={wishlist} 
            onAssign={handleAssignDay} 
            onAdd={(item) => addToCollection('wishlist', item, setWishlist)} 
            onOpenGuide={setSelectedSpot}
            theme={theme} 
          />
        )}
        
        {activeTab === 'itinerary' && (
          <ItineraryView 
            wishlist={wishlist} 
            onAssign={handleAssignDay} 
            onOpenGuide={setSelectedSpot} 
            tripInfo={tripInfo} 
            hotels={hotels} 
            onOptimize={handleOptimizeRoute}
            theme={theme}
            TransitNode={TransitNode}
            openMap={openMap}
          />
        )}
        
        {activeTab === 'shopping' && (
          <ShoppingListView 
            items={shoppingList} 
            onAdd={(item) => addToCollection('shopping', item, setShoppingList)} 
            onToggle={(id) => {
              const item = shoppingList.find(i => i.id === id);
              if(item) updateInCollection('shopping', { ...item, bought: !item.bought }, setShoppingList);
            }} 
            onDelete={(id) => deleteFromCollection('shopping', id, setShoppingList)}
            theme={theme} 
          />
        )}
        
        {activeTab === 'info' && (
          <TravelInfoView 
            tripInfo={tripInfo} onUpdateTrip={handleUpdateTrip}
            hotels={hotels} 
            onAddHotel={(h) => addToCollection('hotels', h, setHotels)}
            onUpdateHotel={(h) => updateInCollection('hotels', h, setHotels)}
            onDeleteHotel={(id) => deleteFromCollection('hotels', id, setHotels)}
            flights={flights} onUpdateFlights={handleUpdateFlights}
            contacts={contacts} 
            onUpdateContact={(c) => updateInCollection('contacts', c, setContacts)}
            checklist={checklist} onToggleCheck={toggleChecklist}
            theme={theme}
          />
        )}
        
        {activeTab === 'budget' && (
          <BudgetView 
            expenses={expenses} 
            onAdd={(ex) => addToCollection('expenses', { ...ex, timestamp: serverTimestamp() }, setExpenses)}
            theme={theme}
          />
        )}
      </main>

      {selectedSpot && <SpotDetailModal spot={selectedSpot} onClose={() => setSelectedSpot(null)} theme={theme} />}

      {/* Bottom Nav */}
      <div className="fixed bottom-8 left-6 right-6 z-40 pb-safe">
        <nav className={`bg-[#fffcf5] border-2 border-stone-200 px-2 py-3 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] flex justify-between items-center max-w-sm mx-auto relative`}>
          <NavBtn id="wishlist" icon={List} label="百寶" active={activeTab} set={setActiveTab} theme={theme} />
          <NavBtn id="itinerary" icon={MapPin} label="行程" active={activeTab} set={setActiveTab} theme={theme} />
          <div className="w-px h-8 bg-stone-200 mx-1"></div>
          <NavBtn id="shopping" icon={ShoppingBag} label="必買" active={activeTab} set={setActiveTab} theme={theme} />
          <NavBtn id="budget" icon={Wallet} label="記帳" active={activeTab} set={setActiveTab} theme={theme} />
          <NavBtn id="info" icon={BookOpen} label="資訊" active={activeTab} set={setActiveTab} theme={theme} />
        </nav>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const NavBtn = ({ id, icon: Icon, label, active, set, theme }) => (
  <button onClick={() => set(id)} className={`flex flex-col items-center gap-1 p-1 w-14 rounded-xl transition-all duration-200 group`}>
    <div className={`p-2 rounded-xl transition-all ${active === id ? `${theme.primary} text-white shadow-md -translate-y-2` : 'text-stone-400 group-hover:bg-stone-100 group-hover:text-stone-600'}`}>
      <Icon className={`w-6 h-6 ${active === id ? 'stroke-2' : 'stroke-[1.5]'}`} />
    </div>
    <span className={`text-[10px] font-bold tracking-widest transition-all ${active === id ? `${theme.text} opacity-100` : 'text-stone-300 opacity-0 group-hover:opacity-100'}`}>{label}</span>
  </button>
);

const ImageUpload = ({ onImageSelect, theme }) => {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onImageSelect(reader.result);
      reader.readAsDataURL(file);
    }
  };
  return (
    <label className={`w-full h-40 border-2 border-dashed ${theme.border} bg-[#fffbf0] rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white transition-all text-stone-400 hover:text-stone-600 shadow-inner`}>
      <div className={`p-4 rounded-full ${theme.soft} border border-stone-100`}><Camera className={`w-8 h-8 ${theme.icon}`} /></div>
      <span className="text-xs font-bold tracking-wider">點擊上傳相片</span>
      <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </label>
  );
};

// 1. TREASURE BOX
const TreasureBoxView = ({ wishlist, onAssign, onAdd, onOpenGuide, theme }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', address: '', image: '', tags: '', description: '', type: 'spot' });
  const pool = wishlist.filter(i => !i.assignedDay);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!newItem.title) return;
    const tagArray = newItem.tags ? newItem.tags.split(/[,，\s]+/).filter(t => t.trim().length > 0) : [];
    onAdd({ ...newItem, tags: tagArray.length > 0 ? tagArray : ['自訂'], location: newItem.address || '自訂地點' });
    setNewItem({ title: '', address: '', image: '', tags: '', description: '', type: 'spot' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className={`p-6 rounded-xl border-2 ${theme.border} bg-gradient-to-br ${theme.gradient} text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] relative overflow-hidden`}>
        <div className="relative z-10">
          <h2 className="font-serif font-bold text-2xl mb-2 flex items-center gap-2 drop-shadow-md"><Heart className="w-6 h-6 fill-white/20" /> 收藏清單</h2>
          <p className="text-sm opacity-90 font-medium tracking-wide">收錄想去的京都角落，與心愛的人共享。</p>
        </div>
        <div className="absolute -right-4 -bottom-8 opacity-30 rotate-12 mix-blend-overlay">
           <Flower2 className="w-40 h-40 text-white" />
        </div>
      </div>
      
      {!isAdding ? (
        <button onClick={() => setIsAdding(true)} className={`w-full py-5 rounded-xl border-2 border-dashed ${theme.border} text-stone-500 font-bold hover:bg-white hover:${theme.text} transition-all flex items-center justify-center gap-3 bg-white/50 shadow-sm group`}>
          <span className={`p-1 rounded-full ${theme.bg} ${theme.text} group-hover:scale-110 transition-transform`}><Plus className="w-6 h-6" /></span> 新增許願地點
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] border-2 border-stone-800 animate-in slide-in-from-top-4 space-y-5 relative">
          <button type="button" onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><XCircle className="w-8 h-8" /></button>
          <h3 className="font-serif font-bold text-stone-800 text-xl border-l-[6px] pl-3 border-stone-800">新增地點</h3>
          
          <div className="grid grid-cols-3 gap-3">
            {[{ id: 'spot', label: '景點', icon: MapPin }, { id: 'food', label: '美食', icon: Utensils }, { id: 'shopping', label: '購物', icon: ShoppingBag }].map(t => (
              <button key={t.id} type="button" onClick={() => setNewItem({...newItem, type: t.id})} className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${newItem.type === t.id ? `${theme.primary} text-white border-stone-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]` : 'bg-stone-50 text-stone-400 border-stone-200'}`}>
                <t.icon className="w-6 h-6" /> <span className="text-sm font-bold">{t.label}</span>
              </button>
            ))}
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute top-[-10px] left-3 bg-white px-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">Name</span>
              <input autoFocus placeholder="地點名稱" className="w-full p-4 bg-stone-50 border-2 border-stone-200 rounded-xl text-base font-bold focus:outline-none focus:border-stone-800 transition-colors" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} />
            </div>
            <div className="relative">
              <span className="absolute top-[-10px] left-3 bg-white px-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">Address</span>
              <input placeholder="地址 / 連結" className="w-full p-4 bg-stone-50 border-2 border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-800 transition-colors" value={newItem.address} onChange={e => setNewItem({...newItem, address: e.target.value})} />
            </div>
            
            <div className="flex items-center gap-3">
              <label className="cursor-pointer flex-1 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl text-sm font-bold text-stone-500 hover:bg-stone-100 transition-colors flex items-center justify-center gap-2 hover:border-stone-400">
                <Camera className="w-5 h-5" /> 上傳封面
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files[0]; if(file) { const reader = new FileReader(); reader.onloadend = () => setNewItem({...newItem, image: reader.result}); reader.readAsDataURL(file); } }} />
              </label>
              {newItem.image && <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-stone-800 shadow-md"><img src={newItem.image} className="w-full h-full object-cover" /></div>}
            </div>
            <textarea rows={2} placeholder="寫點備註..." className="w-full p-4 bg-stone-50 border-2 border-stone-200 rounded-xl text-sm resize-none focus:outline-none focus:border-stone-800 transition-colors" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
          </div>
          <button type="submit" className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-stone-900 ${theme.primary}`}>加入清單</button>
        </form>
      )}
      
      <div className="space-y-6">
        {pool.map(item => <SpotCard key={item.id} item={item} mode="pool" onAction={onAssign} onGuide={() => onOpenGuide(item)} theme={theme} />)}
        {pool.length === 0 && !isAdding && (
          <div className="text-center py-20 border-2 border-dashed border-stone-300 rounded-2xl opacity-50">
            <p className="text-stone-400 text-base font-serif font-bold">尚未收藏任何地點</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. ITINERARY VIEW (With Transit)
const ItineraryView = ({ wishlist, onAssign, onOpenGuide, tripInfo, hotels, onOptimize, theme, TransitNode, openMap }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [optimizing, setOptimizing] = useState(false);
  
  const currentEvents = wishlist.filter(i => i.assignedDay === selectedDay).sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentHotel = hotels.find(h => h.days.includes(selectedDay));

  const handleSmartPlan = () => {
    setOptimizing(true);
    setTimeout(() => { onOptimize(selectedDay); setOptimizing(false); }, 800);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-4 px-4 pt-2">
        {tripInfo.days.map(d => (
          <button key={d} onClick={() => setSelectedDay(d)} className={`flex-shrink-0 w-16 h-24 rounded-full border-2 flex flex-col items-center justify-center transition-all ${selectedDay === d ? `${theme.primary} ${theme.shadow} text-white border-stone-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1` : 'bg-white text-stone-400 border-stone-200'}`}>
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 mt-2">DAY</span>
            <span className="text-3xl font-serif font-bold leading-none mb-2">{d}</span>
          </button>
        ))}
      </div>
      
      <div className="flex justify-between items-end px-1 border-b-4 border-stone-200 pb-2">
        <h2 className="font-serif font-bold text-stone-800 text-3xl">Day {selectedDay}</h2>
        {currentEvents.length > 1 && (
          <button onClick={handleSmartPlan} disabled={optimizing} className={`flex items-center gap-1.5 bg-white border-2 border-stone-800 ${theme.text} px-4 py-2 rounded-full text-xs font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-70 transition-all`}>
            <Zap className={`w-4 h-4 ${optimizing ? 'animate-pulse' : ''}`} /> {optimizing ? '整頓中' : 'AI 順路'}
          </button>
        )}
      </div>
      
      <div className="relative min-h-[300px] pl-6">
        <div className="absolute left-10 top-4 bottom-10 w-1 bg-stone-200 z-0 border-r-2 border-stone-300 border-dashed"></div>
        
        {/* START HOTEL */}
        {currentHotel && (
           <div className="relative mb-10 animate-in slide-in-from-bottom-2 z-10 pl-12">
             <div className="absolute left-[34px] top-8 w-4 h-4 rounded-full bg-stone-800 border-4 border-stone-200 shadow-sm z-20" />
             <div className="absolute left-0 top-8 w-10 text-right text-[10px] font-mono font-bold text-stone-400 -ml-4">09:00</div>
             <div 
                onClick={() => openMap(currentHotel.name)}
                className="bg-white border-2 border-stone-100 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-stone-400 hover:shadow-md transition-all cursor-pointer active:scale-95"
             >
               <div className="bg-stone-100 p-3 rounded-lg"><Hotel className="w-6 h-6 text-stone-600"/></div>
               <div>
                 <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">START</p>
                 <p className="font-bold text-stone-800 text-lg font-serif">{currentHotel.name}</p>
                 <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-1"><Navigation className="w-3 h-3"/> 點擊導航</p>
               </div>
             </div>
           </div>
        )}
        
        {/* EVENTS LOOP */}
        {currentEvents.map((item, idx) => (
          <React.Fragment key={item.id}>
            {idx === 0 && currentHotel && <TransitNode from={currentHotel.name} to={item.title} />}
            {idx > 0 && <TransitNode from={currentEvents[idx-1].title} to={item.title} />}

            <div className="relative mb-10 animate-in slide-in-from-bottom-2 z-10 pl-12">
              <div className={`absolute left-[34px] top-8 w-4 h-4 rounded-full border-4 border-white shadow-md z-20 ${item.type === 'food' ? 'bg-orange-500' : 'bg-emerald-600'}`} />
              <div className="absolute left-0 top-8 w-10 text-right text-[10px] font-mono font-bold text-stone-400 -ml-4">{10 + idx}:00</div>
              <SpotCard item={item} mode="schedule" onAction={onAssign} onGuide={() => onOpenGuide(item)} theme={theme} />
            </div>
          </React.Fragment>
        ))}

        {/* END HOTEL */}
        {currentHotel && (
           <>
             {currentEvents.length > 0 && <TransitNode from={currentEvents[currentEvents.length-1].title} to={currentHotel.name} />}
             <div className="relative mb-10 animate-in slide-in-from-bottom-2 z-10 pl-12">
               <div className="absolute left-[34px] top-8 w-4 h-4 rounded-full bg-stone-800 border-4 border-stone-200 shadow-sm z-20" />
               <div className="absolute left-0 top-8 w-10 text-right text-[10px] font-mono font-bold text-stone-400 -ml-4">END</div>
               <div 
                  onClick={() => openMap(currentHotel.name)}
                  className="bg-white border-2 border-stone-100 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-stone-400 hover:shadow-md transition-all cursor-pointer active:scale-95"
               >
                 <div className="bg-stone-100 p-3 rounded-lg"><Hotel className="w-6 h-6 text-stone-600"/></div>
                 <div>
                   <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">RETURN</p>
                   <p className="font-bold text-stone-800 text-lg font-serif">{currentHotel.name}</p>
                   <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-1"><Navigation className="w-3 h-3"/> 點擊導航</p>
                 </div>
               </div>
             </div>
           </>
        )}
      </div>
    </div>
  );
};

// 3. SHOPPING LIST VIEW
const ShoppingListView = ({ items, onAdd, onToggle, onDelete, theme }) => {
  const [viewMode, setViewMode] = useState('list');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', image: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if(!newItem.name) return;
    onAdd(newItem);
    setNewItem({ name: '', price: '', image: '' });
    setIsAdding(false);
  };

  const total = items.reduce((s, i) => s + (i.bought ? 0 : (Number(i.price) || 0)), 0);
  const boughtTotal = items.reduce((s, i) => s + (i.bought ? (Number(i.price) || 0) : 0), 0);

  return (
    <div className="space-y-6 pb-20">
      <div className={`bg-[#fffbf0] p-6 rounded-xl border-2 border-stone-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center relative overflow-hidden`}>
        <div className={`absolute top-0 left-0 w-2 h-full ${theme.primary}`}></div>
        <div><p className="text-xs text-stone-500 font-bold uppercase tracking-widest mb-1">預計花費</p><p className="text-3xl font-serif font-bold text-stone-900">¥{total.toLocaleString()}</p></div>
        <div className="text-right"><p className="text-xs text-stone-500 font-bold uppercase tracking-widest mb-1">已購買</p><p className={`text-2xl font-serif font-bold ${theme.text}`}>¥{boughtTotal.toLocaleString()}</p></div>
      </div>
      
      <div className="flex gap-3">
        <button onClick={() => setIsAdding(true)} className={`flex-1 py-4 ${theme.primary} text-white rounded-xl font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-stone-900 flex items-center justify-center gap-2 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all`}><Plus className="w-5 h-5" /> 新增商品</button>
        <div className="flex bg-white border-2 border-stone-200 p-1 rounded-xl shadow-sm">
          <button onClick={() => setViewMode('list')} className={`p-3 rounded-lg transition-all ${viewMode === 'list' ? `${theme.bgSoft} ${theme.text} font-bold` : 'text-stone-400'}`}><AlignJustify className="w-5 h-5" /></button>
          <button onClick={() => setViewMode('grid')} className={`p-3 rounded-lg transition-all ${viewMode === 'grid' ? `${theme.bgSoft} ${theme.text} font-bold` : 'text-stone-400'}`}><LayoutGrid className="w-5 h-5" /></button>
        </div>
      </div>
      
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-5 rounded-xl shadow-xl border-2 border-stone-800 animate-in fade-in space-y-4">
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">商品名</label>
             <input placeholder="例如：DHC 護唇膏" className="w-full p-3 bg-stone-50 border-2 border-stone-200 rounded-xl text-base font-bold focus:outline-none focus:border-stone-800" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} autoFocus />
          </div>
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
               <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">價格</label>
               <input type="number" placeholder="¥" className="w-full p-3 bg-stone-50 border-2 border-stone-200 rounded-xl text-base font-mono font-bold focus:outline-none focus:border-stone-800" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">照片</label>
               <label className="w-14 h-[50px] flex items-center justify-center bg-stone-100 border-2 border-stone-200 rounded-xl cursor-pointer hover:bg-stone-200">
                  <Camera className="w-5 h-5 text-stone-500" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files[0]; if(file) { const reader = new FileReader(); reader.onloadend = () => setNewItem({...newItem, image: reader.result}); reader.readAsDataURL(file); } }} />
               </label>
            </div>
          </div>
          {newItem.image && <img src={newItem.image} className="h-24 rounded-xl object-cover border-2 border-stone-800" />}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs text-stone-500 font-bold hover:text-stone-800">取消</button>
            <button type="submit" className={`px-6 py-2 ${theme.primary} text-white rounded-lg text-sm font-bold shadow-md`}>加入</button>
          </div>
        </form>
      )}
      
      <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-4" : "space-y-3"}>
        {items.map(item => (
          <div key={item.id} className={`bg-white rounded-xl border-2 transition-all ${viewMode === 'list' ? 'flex items-center gap-4 p-4 border-stone-100 hover:border-stone-300' : 'overflow-hidden border-stone-100 hover:border-stone-300'} ${item.bought ? 'opacity-50 grayscale bg-stone-50' : 'shadow-sm'}`}>
             {viewMode === 'grid' && <div className="h-36 bg-stone-100 flex items-center justify-center overflow-hidden border-b-2 border-stone-100">{item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <ShoppingBag className="w-10 h-10 text-stone-300" />}</div>}
             <div className={viewMode === 'list' ? "w-16 h-16 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-100" : "p-4"}>
               {viewMode === 'list' && (item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-stone-300" /></div>)}
               {viewMode === 'grid' && (
                 <>
                   <div className="flex justify-between items-start">
                     <p className={`font-bold text-base font-serif truncate ${item.bought && 'line-through'}`}>{item.name}</p>
                     <button onClick={() => onDelete(item.id)} className="text-stone-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                   </div>
                   <p className="text-sm font-mono font-bold text-stone-400 mb-3">¥{Number(item.price || 0).toLocaleString()}</p>
                   <button onClick={() => onToggle(item.id)} className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${item.bought ? 'bg-stone-200 text-stone-500' : `${theme.bgSoft} ${theme.text}`}`}>
                     {item.bought ? '已購買' : '標記購買'}
                   </button>
                 </>
               )}
             </div>
             {viewMode === 'list' && (
               <>
                 <div className="flex-1">
                   <p className={`font-bold text-lg font-serif text-stone-800 ${item.bought ? 'line-through text-stone-400' : ''}`}>{item.name}</p>
                   {item.price && <p className="text-sm font-mono font-bold text-stone-400">¥{Number(item.price).toLocaleString()}</p>}
                 </div>
                 <button onClick={() => onToggle(item.id)} className="p-2 hover:scale-110 transition-transform">
                   {item.bought ? <CheckCircle2 className={`w-8 h-8 ${theme.text}`} /> : <div className="w-8 h-8 rounded-full border-2 border-stone-300" />}
                 </button>
               </>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. TRAVEL INFO VIEW
const TravelInfoView = ({ 
  tripInfo, onUpdateTrip,
  hotels, onAddHotel, onUpdateHotel, onDeleteHotel,
  flights, onUpdateFlights, 
  contacts, onUpdateContact,
  checklist, onToggleCheck,
  theme 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFlights, setEditFlights] = useState(flights);
  
  useEffect(() => { setEditFlights(flights); }, [flights]);

  const handleSave = () => {
    onUpdateFlights(editFlights);
    setIsEditing(false);
  };

  const getHotelDates = (days) => {
    if (!days || days.length === 0) return { date: "", days: "", nights: 0 };
    const start = new Date(tripInfo.startDate);
    start.setDate(start.getDate() + (days[0] - 1));
    const end = new Date(tripInfo.startDate);
    end.setDate(end.getDate() + (days[days.length - 1] - 1));
    const format = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
    return { 
      date: days.length > 1 ? `${format(start)} - ${format(end)}` : format(start),
      days: days.length > 1 ? `D${days[0]}-D${days[days.length - 1]}` : `D${days[0]}`,
      nights: days.length 
    };
  };

  return (
    <div className="space-y-8 pb-20 relative">
      <div className="flex justify-between items-center border-b-2 border-stone-200 pb-3">
         <h2 className="text-2xl font-serif font-bold text-stone-900">旅のしおり</h2>
         <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`flex items-center gap-1 px-5 py-2 rounded-full text-xs font-bold shadow-md transition-all ${isEditing ? `${theme.primary} text-white border-stone-800 border-2` : 'bg-white text-stone-500 border-2 border-stone-200'}`}>
           {isEditing ? <><Save className="w-3 h-3"/> 儲存</> : <><Pencil className="w-3 h-3"/> 編輯</>}
         </button>
      </div>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-stone-400 tracking-[0.2em] uppercase flex items-center gap-2"><CheckSquare className={`w-4 h-4 ${theme.text}`} /> 準備清單</h3>
        <div className="bg-white rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] border-2 border-stone-100 space-y-1">
          {checklist.map(item => (
            <div key={item.id} onClick={() => onToggleCheck(item.id)} className="flex items-center gap-3 p-3 hover:bg-stone-50 cursor-pointer transition-colors rounded-lg group">
               <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${item.checked ? `${theme.primary} border-transparent` : 'border-stone-200 group-hover:border-stone-300'}`}>
                 {item.checked && <CheckCircle2 className="w-4 h-4 text-white" />}
               </div>
               <div className="flex-1">
                 <p className={`text-sm font-bold ${item.checked ? 'text-stone-300 line-through decoration-2 decoration-stone-200' : 'text-stone-700'}`}>{item.text}</p>
               </div>
               {item.important && !item.checked && <span className="text-[10px] text-red-500 bg-red-50 px-2 py-1 rounded-md font-bold border border-red-100">重要</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-stone-400 tracking-[0.2em] uppercase flex items-center gap-2"><Plane className={`w-4 h-4 ${theme.text}`} /> 航班</h3>
        <div className="space-y-4">
          {['departure', 'return'].map((type, i) => {
            const f = isEditing ? editFlights[type] : flights[type];
            return (
              <div key={i} className="bg-white p-6 rounded-xl border-2 border-stone-100 shadow-sm relative overflow-hidden">
                 <div className={`absolute top-0 right-0 px-4 py-1.5 ${theme.bgSoft} text-[10px] font-bold ${theme.text} rounded-bl-xl border-b-2 border-l-2 border-white`}>{i===0?'去程':'回程'}</div>
                 {isEditing ? (
                   <div className="space-y-3 text-sm mt-4">
                     <div className="flex gap-2 items-center"><span className="w-10 font-bold text-stone-400">日期</span><input className="bg-stone-50 p-2 rounded-lg border border-stone-200 flex-1" value={f.date} onChange={e => setEditFlights({...editFlights, [type]: {...f, date: e.target.value}})} /></div>
                     <div className="flex gap-2 items-center"><span className="w-10 font-bold text-stone-400">航班</span><input className="bg-stone-50 p-2 rounded-lg border border-stone-200 flex-1" value={f.flight} onChange={e => setEditFlights({...editFlights, [type]: {...f, flight: e.target.value}})} /></div>
                     <div className="flex gap-2 items-center"><span className="w-10 font-bold text-stone-400">時間</span><input className="bg-stone-50 p-2 rounded-lg border border-stone-200 flex-1" value={f.time} onChange={e => setEditFlights({...editFlights, [type]: {...f, time: e.target.value}})} /></div>
                     <div className="flex gap-2 items-center"><span className="w-10 font-bold text-stone-400">航廈</span><input className="bg-stone-50 p-2 rounded-lg border border-stone-200 flex-1" value={f.terminal} onChange={e => setEditFlights({...editFlights, [type]: {...f, terminal: e.target.value}})} /></div>
                   </div>
                 ) : (
                   <>
                     <div className="flex justify-between items-end mb-2 border-b border-dashed border-stone-200 pb-2">
                       <p className="text-sm font-bold text-stone-500">{f.date}</p>
                       <p className="text-xs font-black text-stone-300 tracking-widest">{f.flight}</p>
                     </div>
                     <p className="text-2xl font-serif font-bold text-stone-800 tracking-wide">{f.time}</p>
                     <p className="text-xs text-stone-500 mt-3 flex items-center gap-1 font-bold"><MapPin className="w-3 h-3"/> {f.terminal}</p>
                   </>
                 )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-stone-400 tracking-[0.2em] uppercase flex items-center gap-2"><Hotel className={`w-4 h-4 ${theme.text}`} /> 住宿</h3>
        {(isEditing ? hotels : hotels).map((h, i) => {
          const { date, days, nights } = getHotelDates(h.days);
          return (
            <div key={h.id} className={`bg-white p-6 rounded-xl border-2 ${theme.border} shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] relative group`}>
              {isEditing ? (
                 <div className="space-y-3 text-sm">
                   <div className="flex justify-between items-center border-b border-stone-100 pb-2"><span className="font-bold text-stone-500 text-xs">飯店 #{i+1}</span> <button onClick={() => onDeleteHotel(h.id)} className="text-red-400 bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4"/></button></div>
                   <input className="w-full bg-stone-50 p-3 rounded-lg border border-stone-200" placeholder="飯店名稱" value={h.name} onChange={e => onUpdateHotel({ ...h, name: e.target.value })} />
                   <input className="w-full bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs" placeholder="地址" value={h.address} onChange={e => onUpdateHotel({ ...h, address: e.target.value })} />
                   <div className="flex gap-2 items-center">
                      <span className="text-xs font-bold text-stone-400">天數 (如 1,2,3)</span>
                      <input className="flex-1 bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs font-mono" placeholder="1,2,3" value={h.days.join(',')} onChange={e => onUpdateHotel({ ...h, days: e.target.value.split(',').map(Number) })} />
                   </div>
                 </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                     <span className={`text-[10px] font-black ${theme.text} ${theme.bgSoft} px-2 py-1 rounded border border-current`}>{days} ({nights}泊)</span>
                     <span className="text-xs font-bold text-stone-400">{date}</span>
                  </div>
                  <h4 className="font-serif font-bold text-stone-800 text-xl">{h.name}</h4>
                  <p 
                    onClick={() => openMap(h.name)}
                    className="text-xs text-stone-500 mt-2 mb-4 flex items-start gap-1 opacity-80 cursor-pointer hover:text-stone-800 hover:underline"
                  >
                    <MapPin className="w-3 h-3 mt-0.5 shrink-0" /> {h.address}
                  </p>
                  <button 
                    onClick={() => openMap(h.name)}
                    className={`text-[10px] font-bold ${theme.text} border ${theme.border} px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors inline-flex items-center gap-1`}
                  >
                    <Navigation className="w-3 h-3" /> 地圖
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {isEditing && (
          <button onClick={() => onAddHotel({ id: Date.now().toString(), days: [], name: "", address: "", mapLink: "" })} className="w-full py-4 border-2 border-dashed border-stone-300 text-stone-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-white hover:border-stone-400 hover:text-stone-600 transition-all">
             <Plus className="w-4 h-4" /> 新增飯店
          </button>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-stone-400 tracking-[0.2em] uppercase flex items-center gap-2"><Phone className={`w-4 h-4 ${theme.text}`} /> 緊急聯絡</h3>
        <div className="grid grid-cols-2 gap-3">
          {contacts.map((e, idx) => (
             isEditing ? (
               <div key={idx} className="flex flex-col gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <input className="bg-white p-2 rounded-lg text-xs border border-stone-200" value={e.name} onChange={ev => onUpdateContact({ ...e, name: ev.target.value })} />
                  <input className="bg-white p-2 rounded-lg text-xs font-mono border border-stone-200" value={e.phone} onChange={ev => onUpdateContact({ ...e, phone: ev.target.value })} />
               </div>
             ) : (
              <a key={idx} href={`tel:${e.phone}`} className="flex flex-col p-4 bg-white rounded-xl border-2 border-stone-100 shadow-sm hover:border-red-200 hover:bg-red-50 transition-all group">
                <span className="text-xs font-bold text-stone-400 mb-1 group-hover:text-red-400">{e.name}</span>
                <span className="text-base font-bold text-stone-800 font-mono group-hover:text-red-600">{e.phone}</span>
              </a>
             )
          ))}
        </div>
      </section>
    </div>
  );
};

// 5. BUDGET VIEW (Unchanged from last refined version)
const BudgetView = ({ expenses, onAdd, theme }) => {
  const [form, setForm] = useState({ title: '', amount: '', payer: 'me', type: 'personal', method: 'cash' });
  const TOTAL_CASH_BUDGET = 100000; 
  const submit = (e) => { e.preventDefault(); if(!form.amount || !form.title) return; onAdd({ ...form, category: 'general' }); setForm({ title: '', amount: '', payer: 'me', type: 'personal', method: 'cash' }); };
  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  let bfOwesMe = 0, iOweBf = 0;
  expenses.forEach(e => { const amt = Number(e.amount); if (e.payer === 'me') { if (e.type === 'shared') bfOwesMe += amt / 2; if (e.type === 'bf') bfOwesMe += amt; } else if (e.payer === 'bf') { if (e.type === 'shared') iOweBf += amt / 2; if (e.type === 'me') iOweBf += amt; }});
  const finalSettlement = bfOwesMe - iOweBf;
  const myCashTotal = expenses.filter(e => e.payer === 'me' && e.method === 'cash').reduce((s, e) => s + Number(e.amount), 0);
  const cashProgress = Math.min((myCashTotal / TOTAL_CASH_BUDGET) * 100, 100);

  return (
    <div className="pb-20 space-y-6">
       <div className="grid grid-cols-2 gap-4"><div className={`text-white p-6 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] ${theme.primary} flex flex-col justify-between relative overflow-hidden border-2 border-stone-800`}><div className="absolute -right-4 -top-4 opacity-20"><Coins className="w-24 h-24" /></div><p className="opacity-90 text-[10px] font-bold uppercase tracking-widest border-b border-white/30 pb-1 mb-1">總支出</p><h2 className="text-2xl font-serif font-bold mt-1">¥{totalSpent.toLocaleString()}</h2></div><div className={`p-6 rounded-xl shadow-sm border-2 ${finalSettlement >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}><p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest border-b border-stone-200/50 pb-1 mb-1">{finalSettlement >= 0 ? '他需給妳' : '妳需給他'}</p><h2 className={`text-2xl font-bold font-mono mt-1 ${finalSettlement >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>¥{Math.abs(finalSettlement).toLocaleString()}</h2></div></div>
       <div className="bg-white p-6 rounded-xl border-2 border-stone-200 shadow-sm"><div className="flex justify-between items-end mb-4"><div className="flex items-center gap-2"><Wallet className={`w-6 h-6 ${theme.text}`} /><span className="font-bold text-stone-800 text-base">現金殘高</span></div><span className="text-sm font-mono font-bold text-stone-500">¥{myCashTotal.toLocaleString()} <span className="text-stone-300 mx-1">/</span> ¥{TOTAL_CASH_BUDGET.toLocaleString()}</span></div><div className="h-4 bg-stone-100 rounded-full overflow-hidden border border-stone-200"><div className={`h-full rounded-full transition-all duration-500 ${cashProgress > 80 ? 'bg-red-500' : theme.primary}`} style={{ width: `${cashProgress}%` }}></div></div><p className="text-[10px] text-stone-400 mt-2 text-right font-bold tracking-wider">設定總現金預算 ¥100,000</p></div>
       <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] border-2 border-stone-800 space-y-4 relative"><div className="flex gap-3"><div className="flex-[2] space-y-1"><span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">項目</span><input placeholder="例如: 章魚燒" className="w-full p-3 bg-stone-50 border-2 border-stone-200 rounded-lg text-sm font-bold focus:outline-none focus:border-stone-800" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div><div className="flex-1 space-y-1"><span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">金額</span><input type="number" placeholder="¥" className="w-full p-3 bg-stone-50 border-2 border-stone-200 rounded-lg text-sm font-mono font-bold focus:outline-none focus:border-stone-800" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div></div><div className="grid grid-cols-3 gap-3"><div className="flex bg-stone-50 p-1 rounded-lg border border-stone-200"><button type="button" onClick={() => setForm({...form, payer: 'me'})} className={`flex-1 rounded-md py-2 text-xs font-bold transition-all ${form.payer === 'me' ? 'bg-white shadow text-stone-800 ring-1 ring-stone-200' : 'text-stone-400'}`}>我付</button><button type="button" onClick={() => setForm({...form, payer: 'bf'})} className={`flex-1 rounded-md py-2 text-xs font-bold transition-all ${form.payer === 'bf' ? 'bg-white shadow text-stone-800 ring-1 ring-stone-200' : 'text-stone-400'}`}>他付</button></div><div className="flex bg-stone-50 p-1 rounded-lg border border-stone-200"><button type="button" onClick={() => setForm({...form, method: 'cash'})} className={`flex-1 rounded-md py-2 text-xs font-bold transition-all ${form.method === 'cash' ? 'bg-white shadow text-stone-800 ring-1 ring-stone-200' : 'text-stone-400'}`}>現金</button><button type="button" onClick={() => setForm({...form, method: 'card'})} className={`flex-1 rounded-md py-2 text-xs font-bold transition-all ${form.method === 'card' ? 'bg-white shadow text-stone-800 ring-1 ring-stone-200' : 'text-stone-400'}`}>刷卡</button></div><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-600 px-2 outline-none focus:border-stone-800"><option value="personal">個人</option><option value="shared">公費</option><option value="bf">代墊</option></select></div><button type="submit" className={`w-full py-4 ${theme.primary} text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-110 transition-all border-2 border-stone-900`}><Plus className="w-5 h-5" /> 記下一筆</button></form>
       <div className="space-y-3">{expenses.map(e => (<div key={e.id} className="flex justify-between items-center p-4 bg-white rounded-xl border-2 border-stone-100 hover:border-stone-300 transition-colors shadow-sm"><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold border-2 ${e.payer === 'me' ? `${theme.primary} text-white border-transparent` : 'bg-stone-100 text-stone-500 border-stone-200'}`}>{e.payer === 'me' ? '我' : '他'}</div><div><p className="font-bold text-stone-800 text-base font-serif">{e.title}</p><div className="flex gap-2 mt-1"><span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">{e.method === 'cash' ? '現金' : '信用卡'}</span><span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">{e.type === 'shared' ? '平分' : e.type === 'personal' ? '自用' : '代墊'}</span></div></div></div><span className="font-mono font-bold text-lg text-stone-800">¥{Number(e.amount).toLocaleString()}</span></div>))}</div>
    </div>
  );
};

const SpotDetailModal = ({ spot, onClose, theme }) => (
  <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4 animate-in fade-in">
    <div className="bg-[#fffbf0] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 flex flex-col max-h-[85vh] border-4 border-stone-900">
      <div className="h-64 bg-stone-200 relative shrink-0">
        {spot.image ? <img src={spot.image} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-stone-400"><ImageIcon className="w-12 h-12 opacity-20" /></div>}
        <button onClick={onClose} className="absolute top-4 right-4 bg-white text-stone-900 p-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-stone-900 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"><XCircle className="w-6 h-6" /></button>
        <div className="absolute bottom-4 left-4">
           <span className={`text-xs font-bold px-3 py-1 ${theme.primary} text-white rounded-lg border-2 border-stone-900 shadow-md`}>{spot.type === 'food' ? '美食' : spot.type === 'shopping' ? '購物' : '景點'}</span>
        </div>
      </div>
      <div className="p-6 overflow-y-auto">
        <h3 className="text-3xl font-serif font-bold text-stone-900 mb-2">{spot.title}</h3>
        <p 
          onClick={() => { const query = encodeURIComponent(spot.address || spot.location); window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank'); }}
          className="text-sm text-stone-500 mb-6 flex items-center gap-1 font-bold border-b-2 border-stone-200 pb-4 cursor-pointer hover:text-stone-800 hover:underline"
        >
          <MapPin className="w-4 h-4" /> {spot.address || spot.location}
        </p>
        <div className="space-y-6 text-stone-700">
          {spot.description && (
            <div className="bg-white p-5 rounded-xl border-2 border-stone-100 shadow-sm leading-relaxed font-medium">
              {spot.description}
            </div>
          )}
        </div>
        <div className="mt-8"><a href={`https://www.google.com/maps/search/?api=1&query=${spot.title}`} target="_blank" className={`w-full py-4 ${theme.primary} text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-stone-900 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all`}><Navigation className="w-5 h-5" /> 開啟 Google Maps</a></div>
      </div>
    </div>
  </div>
);

const SpotCard = ({ item, mode, onAction, onGuide, theme }) => {
  const [showDayPicker, setShowDayPicker] = useState(false);
  const openMap = (e, location) => { e.stopPropagation(); const query = encodeURIComponent(location); window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank'); };
  return (
    <div className={`bg-white rounded-xl border-2 border-stone-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden group hover:border-stone-300 transition-all relative`}>
      {item.image && <div className="h-32 w-full bg-stone-100 relative border-b-2 border-stone-100"><img src={item.image} className="w-full h-full object-cover" /></div>}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-black uppercase text-stone-300 tracking-widest border border-stone-200 px-2 rounded">{item.type === 'food' ? 'FOOD' : item.type === 'shopping' ? 'SHOP' : 'SPOT'}</span>
          <button onClick={onGuide} className={`flex items-center gap-1 text-xs font-bold ${theme.text} px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-100 transition-colors`}><BookOpen className="w-3.5 h-3.5" /> 詳細</button>
        </div>
        <h3 className="font-serif font-bold text-stone-800 text-xl mb-1 leading-tight">{item.title}</h3>
        <p onClick={(e) => openMap(e, item.address || item.location)} className="text-xs text-stone-500 mb-4 flex items-center gap-1 truncate font-medium cursor-pointer hover:text-stone-800 hover:underline transition-all"><MapPin className="w-3.5 h-3.5 shrink-0" /> {item.address || item.location}</p>
        <div className="pt-4 border-t-2 border-dashed border-stone-100 flex gap-2">
          {mode === 'pool' ? ( !showDayPicker ? ( <button onClick={() => setShowDayPicker(true)} className={`w-full py-3 ${theme.bg} ${theme.text} rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all border border-transparent hover:border-current`}>加入行程 <ArrowRightCircle className="w-4 h-4" /></button> ) : ( <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide w-full"> {[1,2,3,4,5,6].map(d => <button key={d} onClick={() => { onAction(item.id, d); setShowDayPicker(false); }} className={`flex-shrink-0 w-10 h-10 rounded-lg ${theme.primary} text-white text-sm font-bold shadow-sm border-2 border-stone-900`}>D{d}</button>)} <button onClick={() => setShowDayPicker(false)} className="px-3 text-stone-400 hover:text-stone-600"><XCircle className="w-6 h-6"/></button> </div> ) ) : ( <button onClick={() => onAction(item.id, null)} className="w-full py-2 border-2 border-stone-200 text-stone-400 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">移出</button> )}
        </div>
      </div>
    </div>
  );
};
