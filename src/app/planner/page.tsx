"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Map as MapIcon, 
  Leaf, 
  Calendar, 
  MapPin, 
  Mic, 
  Waves,
  Zap,
  Info,
  Layers,
  Star,
  Users,
  CreditCard,
  Plane
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "framer-motion";

function PlannerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'map'>('chat');
  const [itinerary, setItinerary] = useState<any>(null);
  const [discoveryData, setDiscoveryData] = useState<any>(null);
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [carbonData, setCarbonData] = useState<any>(null);
  const [ecoActivity, setEcoActivity] = useState<any>(null);

  // Initial trigger if there's a query from landing page
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Set initial hovered item when itinerary or discovery data arrives
  useEffect(() => {
    if (discoveryData?.hotels?.[0]) {
      setHoveredItem({
        type: 'hotel',
        name: discoveryData.hotels[0].name,
        image: discoveryData.hotels[0].image,
        location: discoveryData.hotels[0].region || itinerary?.trip_metadata?.region,
        label: 'Rekomendasi Utama'
      });
    } else if (itinerary?.itinerary?.[0]?.activities?.[0]) {
      const firstAct = itinerary.itinerary[0].activities[0];
      setHoveredItem({
        type: 'activity',
        name: firstAct.activity,
        image: '/images/generic-eco.png',
        location: firstAct.location,
        label: 'Hari 1'
      });
    }
  }, [discoveryData, itinerary]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage = { role: 'user' as const, content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Mapping structured fields
      if (data.itinerary_data) {
        setItinerary(data.itinerary_data);
      }
      
      if (data.carbon_data) {
        setCarbonData(data.carbon_data);
      }
      
      if (data.enriched_data) {
        setDiscoveryData(data.enriched_data);
      }
      
      if (data.eco_activity) {
        setEcoActivity(data.eco_activity);
      }
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.chat_response || "Berikut adalah rencana perjalanan Anda." 
      }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi." 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="h-screen flex flex-col lg:flex-row overflow-hidden bg-warm-cream">
      {/* Left Panel: Chat & Timeline (40%) */}
      <div className={`w-full lg:w-[450px] xl:w-[550px] h-full flex flex-col bg-white border-r border-black/5 shadow-2xl z-20 transition-all ${
        activeTab === 'chat' ? 'flex' : 'hidden lg:flex'
      }`}>
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-black/5 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => router.push('/')}
              className="p-2 hover:bg-black/5 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} className="text-text-primary" />
            </button>
            <div>
              <h1 className="font-black text-lg text-primary">Ekuitraplan.ai</h1>
              <p className="text-xs text-text-muted font-medium">AI Travel Planner</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab(activeTab === 'chat' ? 'map' : 'chat')}
            className="p-2 hover:bg-black/5 rounded-xl transition-colors lg:hidden"
          >
            {activeTab === 'chat' ? <MapIcon size={20} /> : <Sparkles size={20} />}
          </button>
        </div>

        {/* Chat Messages & Itinerary */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-32 md:pb-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles size={40} className="text-white" />
              </div>
              <div>
                <h2 className="font-black text-xl text-text-primary">Halo, aku Liora! 👋</h2>
                <p className="text-sm text-text-secondary mt-1">Ceritakan rencana perjalananmu</p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full`}>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[90%] md:max-w-[85%] p-3 md:p-4 rounded-2xl text-sm relative break-words overflow-hidden ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white shadow-lg rounded-tr-none' 
                    : 'bg-light-gray text-text-primary border border-black/5 rounded-tl-none'
                }`}>
                {msg.role === 'ai' && (
                  <div className="absolute -top-6 left-0 text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={10} />
                    Liora
                  </div>
                )}
                {msg.role === 'ai' ? (
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-secondary prose-strong:font-black w-full break-words">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </motion.div>

              {/* Discovery Section (Only for AI last message with data) */}
              {msg.role === 'ai' && idx === messages.length - 1 && discoveryData && (
                <div className="w-full mt-4 space-y-4">
                  {/* Flights */}
                  {discoveryData.flights?.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-1">
                      {discoveryData.flights.map((f: any, i: number) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex-shrink-0 bg-white border border-black/5 rounded-xl p-3 flex items-center gap-3 shadow-sm"
                        >
                          <div className="p-2 bg-primary/5 text-primary rounded-lg">
                            <Plane size={16} />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-tight">{f.airline}</div>
                            <div className="text-xs font-bold text-text-primary">{f.from} → {f.to}</div>
                            <div className="text-[10px] font-medium text-secondary">{f.price} • {f.carbon} Emission</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Hotels Carousel */}
                  {discoveryData.hotels?.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-6 px-1">
                      {discoveryData.hotels.map((h: any, i: number) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          onMouseEnter={() => setHoveredItem({
                            type: 'hotel',
                            name: h.name,
                            image: h.image,
                            location: h.region || itinerary?.trip_metadata?.region || 'Indonesia',
                            label: 'Rekomendasi Utama'
                          })}
                          className="flex-shrink-0 w-[260px] md:w-[300px] bg-white rounded-[24px] border border-black/10 shadow-md hover:shadow-xl overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-300"
                        >
                          <div className="relative h-32 md:h-40 bg-gray-100">
                            <Image src={h.image} alt={h.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="300px" />
                            <div className="absolute top-3 left-3 z-10 glass px-2 py-1 rounded-lg border-white/40 flex items-center gap-1">
                              <Star size={10} className="fill-yellow-400 text-yellow-400" />
                              <span className="text-[10px] font-bold text-text-primary">{h.rating}</span>
                            </div>
                            <div className="absolute top-3 right-3 z-10 bg-secondary/90 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                              {h.eco_badge}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                          <div className="p-4 space-y-3">
                            <div>
                              <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">{h.name}</h4>
                              <div className="flex items-center gap-1 text-[10px] text-text-muted mt-0.5">
                                <Users size={10} />
                                <span>{h.reviews_count} ulasan terverifikasi</span>
                              </div>
                            </div>
                            
                            <div className="bg-light-gray p-2 rounded-xl text-[10px] italic text-text-secondary line-clamp-2 min-h-[40px]">
                              "{h.reviews[0]}"
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-black/5">
                              <div>
                                <div className="text-[8px] font-bold text-text-muted uppercase">Mulai dari</div>
                                <div className="text-sm font-black text-primary">{h.price}</div>
                              </div>
                              <button className="bg-primary/10 text-primary p-2 rounded-lg hover:bg-primary hover:text-white transition-all">
                                <CreditCard size={16} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Carbon Badge */}
          {carbonData && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-2xl border border-red-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <Plane size={20} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-600 uppercase">Emisi Karbon</p>
                    <p className="text-lg font-bold text-text-primary">{carbonData.total_emissions_kg} kg CO₂</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">{carbonData.distance_km} km</p>
                  <p className="text-xs font-medium text-green-600">+{Math.round(carbonData.emissions_with_buffer_kg - carbonData.total_emissions_kg)} kg (buffer)</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Eco Activity Card - Different design from itinerary */}
          {ecoActivity && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border-2 border-green-200 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Leaf size={24} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-green-600 uppercase bg-green-100 px-2 py-0.5 rounded-full">
                      Eco Activity
                    </span>
                    <span className="text-[10px] font-bold text-green-700 uppercase bg-green-200 px-2 py-0.5 rounded-full">
                      {ecoActivity.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-green-800">{ecoActivity.name}</h4>
                  <p className="text-xs text-green-700 mt-1">{ecoActivity.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] font-medium text-green-600">
                    <MapPin size={12} />
                    {ecoActivity.location}
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <p className="text-xs font-bold text-green-800">💡 {ecoActivity.impact}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Itinerary Timeline */}
          {itinerary && (
            <div className="space-y-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {itinerary.itinerary.map((day: any, i: number) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs">
                      {day.day}
                    </div>
                    <h3 className="font-bold text-text-primary">{day.theme}</h3>
                  </div>
                  <div className="space-y-4 ml-4 border-l-2 border-secondary/10 pl-6">
                    {day.activities.map((act: any, j: number) => (
                      <motion.div 
                        key={j} 
                        whileHover={{ x: 5 }}
                        onMouseEnter={() => setHoveredItem({
                          type: 'activity',
                          name: act.activity,
                          image: '/images/generic-eco.png',
                          location: act.location,
                          label: `Hari ${day.day}`
                        })}
                        className="relative group cursor-pointer"
                      >
                        <div className="absolute -left-[31px] top-2 w-3 h-3 rounded-full bg-white border-2 border-secondary group-hover:scale-125 transition-all" />
                        <div className="glass-heavy p-4 rounded-2xl border-black/5 hover:border-secondary/20 transition-all shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-secondary">{act.time}</span>
                            <div className="flex items-center gap-1 bg-green-50 text-[8px] font-bold text-green-700 px-2 py-0.5 rounded-full uppercase">
                              <Leaf size={8} />
                              {act.eco_impact}
                            </div>
                          </div>
                          <h4 className="font-bold text-sm text-text-primary mb-1">{act.activity}</h4>
                          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{act.description}</p>
                          <div className="flex items-center gap-1 mt-3 text-[10px] font-bold text-text-muted">
                            <MapPin size={10} />
                            {act.location}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-light-gray p-3 rounded-2xl flex items-center gap-2">
                <div className="w-1 h-1 bg-secondary rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-secondary rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-black/5 pb-24 md:pb-6 space-y-4">
          <AnimatePresence>
            {!isGenerating && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-2 overflow-x-auto scrollbar-hide py-1"
              >
                {(itinerary ? [
                  "Lebih banyak alam 🌿", 
                  "Kurangi budget 💸", 
                  "Aktivitas keluarga 👨‍👩‍👧‍👦", 
                  "Ganti penginapan 🏨",
                  "Tambah 1 hari 📅"
                ] : [
                  "Eco-Resort Mewah ✨", 
                  "Homestay Lokal 🏠", 
                  "Petualangan Alam 🌿", 
                  "Wisata Budaya 🏛️",
                  "Keduanya! 😍"
                ]).map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSendMessage(chip)}
                    className="flex-shrink-0 px-4 py-2 rounded-full bg-secondary/5 text-secondary border border-secondary/20 text-xs font-bold hover:bg-secondary hover:text-white transition-all whitespace-nowrap active:scale-95"
                  >
                    {chip}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <div className="absolute inset-0 bg-secondary/5 blur-xl group-focus-within:bg-secondary/10 transition-all rounded-2xl" />
            <div className="relative bg-light-gray rounded-2xl p-1.5 flex items-end gap-2 border border-black/5 group-focus-within:border-secondary/30 transition-all shadow-inner">
              <textarea 
                rows={1}
                placeholder={itinerary ? "Ada perubahan rute, Liora?" : "Tanya Liora tentang perjalanan Anda..."}
                className="flex-1 bg-transparent border-none outline-none p-3 text-sm text-text-primary resize-none placeholder:text-text-muted font-medium"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }
                }}
              />
              <button 
                onClick={() => handleSendMessage(inputValue)}
                className="bg-primary text-white p-3 rounded-xl hover:bg-secondary transition-all shadow-lg active:scale-95 disabled:opacity-50"
                disabled={!inputValue.trim() || isGenerating}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Interactive Map */}
      <div className={`flex-1 relative bg-light-gray transition-all ${
        activeTab === 'map' ? 'flex' : 'hidden lg:flex'
      }`}>
        {/* Map Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-warm-cream to-light-gray overflow-hidden">
          {!hoveredItem && (
            <div className="text-center space-y-4 opacity-40">
              <MapIcon size={64} className="mx-auto text-text-muted" />
              <p className="text-text-muted font-medium">Peta interaktif akan muncul di sini</p>
              <p className="text-xs text-text-muted mt-2">Klik aktivitas untuk melihat detail</p>
            </div>
          )}
          
          {/* Decorative Map Elements */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
             <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-primary rounded-full animate-pulse" />
             <div className="absolute top-1/2 left-2/3 w-2 h-2 bg-secondary rounded-full animate-pulse [animation-delay:0.5s]" />
             <div className="absolute top-2/3 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:1s]" />
          </div>
        </div>

        {/* Floating Info Card (Yesterday's Style) */}
        <div className="absolute bottom-10 md:bottom-16 left-1/2 -translate-x-1/2 z-30 w-[92%] md:w-auto max-w-[95%]">
          <AnimatePresence mode="wait">
            {hoveredItem && (
              <motion.div 
                key={hoveredItem.name}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="max-w-xl glass-heavy rounded-3xl md:rounded-[40px] p-2 md:p-3 border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex gap-4 items-center"
              >
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[32px] overflow-hidden flex-shrink-0">
                  <Image 
                    src={hoveredItem.image || '/images/generic-eco.png'} 
                    alt={hoveredItem.name} 
                    fill 
                    className="object-cover"
                    sizes="150px"
                  />
                </div>
                
                <div className="flex-1 pr-4 md:pr-8 py-2 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-secondary uppercase tracking-[0.2em]">{hoveredItem.label}</span>
                    <div className="w-1 h-1 rounded-full bg-secondary/30" />
                    <div className="flex items-center gap-1">
                      <Star size={10} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] font-bold text-text-primary">4.9</span>
                    </div>
                  </div>
                  <h3 className="font-black text-lg md:text-xl text-text-primary leading-tight mb-1">{hoveredItem.name}</h3>
                  <div className="flex items-center gap-1 text-text-secondary">
                    <MapPin size={12} className="text-primary" />
                    <span className="text-xs font-medium">{hoveredItem.location}</span>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-primary text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-secondary transition-all shadow-lg active:scale-95">
                      Details
                    </button>
                    <button className="px-4 bg-white/50 backdrop-blur-md text-primary py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider border border-primary/20 hover:bg-white transition-all active:scale-95">
                      Book
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-warm-cream">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-text-muted mt-4 font-medium">Memuat...</p>
        </div>
      </div>
    }>
      <PlannerContent />
    </Suspense>
  );
}