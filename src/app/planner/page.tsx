"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
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
  Plane,
  TreeDeciduous,
  Compass,
  Clock
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "framer-motion";
import InteractiveMap from "@/components/InteractiveMap";

function PlannerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  
  const [messages, setMessages] = useState<{
    role: 'user' | 'ai';
    content: string;
    data?: {
      itinerary?: any;
      discoveryData?: any;
      carbonData?: any;
      ecoActivity?: any;
      ecoComparisons?: any[];
      recommendedActivities?: any[];
    };
  }[]>([]);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'map'>('chat');
  const [itinerary, setItinerary] = useState<any>(null);
  const [discoveryData, setDiscoveryData] = useState<any>(null);
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [carbonData, setCarbonData] = useState<any>(null);
  const [ecoActivity, setEcoActivity] = useState<any>(null);
  const [ecoComparisons, setEcoComparisons] = useState<any[]>([]);
  const [recommendedActivities, setRecommendedActivities] = useState<any[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialQueryRef = useRef(initialQuery);
  const messagesRef = useRef(messages);

  // Keep messagesRef in sync with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    const userMessage = { role: 'user' as const, content: text };
    const currentMessages = messagesRef.current;
    const newMessages = [...currentMessages, userMessage];
    
    setMessages(newMessages);
    setInputValue("");
    setIsGenerating(true);

    try {
      // Use messagesRef to always get current messages
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

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
      
      if (data.eco_comparisons) {
        setEcoComparisons(data.eco_comparisons);
      }

      if (data.recommended_activities) {
        setRecommendedActivities(data.recommended_activities);
      }
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.chat_response || "Berikut adalah rencana perjalanan Anda.",
        data: {
          itinerary: data.itinerary_data,
          discoveryData: data.enriched_data,
          carbonData: data.carbon_data,
          ecoActivity: data.eco_activity,
          ecoComparisons: data.eco_comparisons,
          recommendedActivities: data.recommended_activities || []
        }
      }]);
    } catch (error: any) {
      // Ignore abort errors (cancelled requests)
      if (error.name === 'AbortError') {
        return;
      }
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi." 
      }]);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Initial trigger if there's a query from landing page
  useEffect(() => {
    const query = searchParams.get("q");
    
    if (!query || messages.length > 0) {
      return;
    }
    
    setMessages([{ role: 'user' as const, content: query }]);
    setInputValue("");
    setIsGenerating(true);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: 'user' as const, content: query }] }),
      signal: abortControllerRef.current.signal,
    }).then(res => res.json()).then(data => {
      if (data.itinerary_data) setItinerary(data.itinerary_data);
      if (data.carbon_data) setCarbonData(data.carbon_data);
      if (data.enriched_data) setDiscoveryData(data.enriched_data);
      if (data.eco_activity) setEcoActivity(data.eco_activity);
      if (data.eco_comparisons) setEcoComparisons(data.eco_comparisons);
      if (data.recommended_activities) setRecommendedActivities(data.recommended_activities);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.chat_response || "Berikut adalah rencana perjalanan Anda.",
        data: {
          itinerary: data.itinerary_data,
          discoveryData: data.enriched_data,
          carbonData: data.carbon_data,
          ecoActivity: data.eco_activity,
          ecoComparisons: data.eco_comparisons,
          recommendedActivities: data.recommended_activities || []
        }
      }]);
    }).catch(error => {
      if (error.name === 'AbortError') return;
      console.error("Initial request failed:", error);
    }).finally(() => {
      setIsGenerating(false);
      abortControllerRef.current = null;
    });
  }, [searchParams, messages.length]);

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
                <h2 className="font-black text-xl text-text-primary">Halo, aku Arisca! 👋</h2>
                <p className="text-sm text-text-secondary mt-1">Ceritakan rencana perjalananmu</p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full`}>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[85%] md:max-w-[75%] p-4 rounded-3xl text-sm relative shadow-sm border border-black/5 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-warm-cream/50 backdrop-blur-sm text-text-primary rounded-tl-none'
                }`}>
                {msg.role === 'ai' && (
                  <div className="absolute -top-6 left-0 text-[10px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-1.5 opacity-80">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    Arisca AI
                  </div>
                )}
                {msg.role === 'ai' ? (
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1.5 prose-headings:my-2 prose-strong:text-secondary prose-strong:font-black w-full break-words overflow-hidden">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                )}
              </motion.div>

              {/* Cards Section (Attached to AI message) */}
              {msg.role === 'ai' && msg.data && (
                (() => {
                  const { discoveryData, carbonData, ecoActivity, recommendedActivities = [], itinerary } = msg.data;
                  if (!discoveryData && !carbonData && !ecoActivity && recommendedActivities.length === 0 && !itinerary) return null;
                  
                  return (
                    <div className="w-full mt-6 space-y-6">
                      {/* Discovery Section */}
                      {discoveryData && (
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
                          className="flex-shrink-0 bg-white border border-black/5 rounded-xl p-3 flex items-center gap-3 premium-shadow hover:scale-105 transition-all cursor-pointer"
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
                          onClick={() => setSelectedHotel(h)}
                          className="flex-shrink-0 w-[280px] flex flex-col bg-white rounded-[32px] p-5 premium-shadow hover:scale-[1.02] transition-all group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                          
                          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-md">
                            <img 
                              src={h.image} 
                              alt={h.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black text-primary border border-primary/10">
                              {h.eco_badge}
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="min-h-[44px] flex items-start">
                              <h4 className="font-bold text-[15px] text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-tight">{h.name}</h4>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-text-muted mt-1">
                              <Users size={10} />
                              <span>{h.reviews_count} ulasan terverifikasi</span>
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

                  {/* Global Insights & Discovery Section */}
                  {(carbonData || ecoActivity || recommendedActivities.length > 0) && (
            <div className="space-y-6 pt-4 border-t border-black/5 mt-6">
              <div className="flex items-center gap-2 px-1">
                <Sparkles size={16} className="text-primary" />
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Discovery & Impact</h3>
              </div>

              {/* Carbon & Impact Summary Card */}
              {carbonData && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-black/5 rounded-[32px] p-6 premium-shadow relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Zap size={120} className="text-secondary" />
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Waves size={16} className="text-secondary" />
                        </div>
                        <span className="text-xs font-black text-secondary uppercase tracking-[0.2em]">Carbon Analysis</span>
                      </div>
                      <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-100">
                        Eco-Score: 92/100
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Total Emisi</p>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-black text-text-primary tracking-tight">{carbonData.total_emissions_kg}</span>
                          <span className="text-[10px] font-bold text-text-secondary">kg</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Jarak</p>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-black text-text-primary tracking-tight">{(carbonData.distance_km / 1000).toFixed(1)}</span>
                          <span className="text-[10px] font-bold text-text-secondary">k km</span>
                        </div>
                      </div>
                      <div className="text-emerald-600">
                        <p className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-wider mb-1">Hemat</p>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-black tracking-tight">+{carbonData.total_saved_kg || 0}</span>
                          <span className="text-[10px] font-bold">kg</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-warm-cream/50 p-4 rounded-2xl border border-black/5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                          <Sparkles size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-primary mb-1">Regeneration Buffer</p>
                          <p className="text-[10px] text-text-secondary leading-relaxed">
                            Kami merekomendasikan tambahan <span className="font-bold text-secondary">+{Math.round(carbonData.emissions_with_buffer_kg - carbonData.total_emissions_kg)}kg</span> untuk memulihkan ekosistem lokal.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* NEW: Recommended Activities (Permata Tersembunyi) */}
              {recommendedActivities.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-primary rounded-full" />
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Permata Tersembunyi ✨</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary animate-pulse">Geser →</span>
                  </div>
                  <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-6 -mx-1 px-1">
                    {recommendedActivities.map((act, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -8, scale: 1.02 }}
                        onMouseEnter={() => setHoveredItem({
                          type: 'activity',
                          name: act.name,
                          image: '/images/eco-discovery.png',
                          location: act.location,
                          label: 'Rekomendasi Arisca'
                        })}
                        className="flex-shrink-0 w-[260px] flex flex-col bg-white/60 backdrop-blur-xl p-5 rounded-[32px] border border-white/40 premium-shadow hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                        
                        <div className="flex-1 flex flex-col relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary shadow-inner">
                              <Leaf size={22} />
                            </div>
                            <div className="px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black border border-green-100 flex items-center gap-1">
                              <Sparkles size={10} />
                              {act.eco_score}/100
                            </div>
                          </div>
                          
                          {/* Name container with min-height for 2 lines */}
                          <div className="min-h-[44px] mb-1 flex items-start pt-1">
                            <h4 className="font-black text-[15px] text-text-primary group-hover:text-primary transition-colors leading-tight line-clamp-2">
                              {act.name}
                            </h4>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[10px] text-text-muted mb-4 font-bold tracking-tight">
                            <MapPin size={12} className="text-secondary" />
                            <span className="truncate">{act.location}</span>
                          </div>
                          
                          {/* Description container with min-height for 2 lines */}
                          <div className="min-h-[38px] mb-5">
                            <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2 italic opacity-80 font-medium">
                              "{act.description}"
                            </p>
                          </div>
                        </div>
                        
                        <button className="w-full py-3 bg-white/80 hover:bg-primary hover:text-white text-primary rounded-2xl text-[11px] font-black transition-all border border-primary/10 uppercase tracking-widest shadow-sm active:scale-95 flex items-center justify-center gap-2">
                          Detail Aktivitas
                          <ArrowLeft size={14} className="rotate-180" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regenerative Project Card */}
              {ecoActivity && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                    <TreeDeciduous size={140} />
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Sparkles size={16} className="text-white" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Proyek Utama</span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black tracking-tight mb-2">{ecoActivity.name}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold opacity-90">
                        <MapPin size={14} />
                        {ecoActivity.location}
                      </div>
                    </div>

                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                      <p className="text-xs leading-relaxed opacity-90 italic">
                        "{ecoActivity.description}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Estimasi Impact</span>
                        <span className="text-sm font-black">{ecoActivity.impact}</span>
                      </div>
                      <button className="px-5 py-2 bg-white text-emerald-700 rounded-full text-xs font-black shadow-lg hover:scale-105 transition-transform">
                        Kontribusi →
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Itinerary Timeline */}
          {itinerary && (
            <div className="space-y-8 mt-12 pt-8 border-t border-black/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-secondary" />
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Rencana Perjalanan</h3>
                </div>
                <div className="text-[10px] font-bold text-text-muted bg-light-gray px-3 py-1 rounded-full">
                  {itinerary.itinerary.length} Hari Petualangan
                </div>
              </div>
              
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
                            {act.transport && (
                              <div className="flex items-center gap-1 bg-blue-50 text-[8px] font-bold text-blue-700 px-2 py-0.5 rounded-full uppercase">
                                {act.transport}
                              </div>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-text-primary mb-1">{act.activity}</h4>
                          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{act.description}</p>
                          
                          {/* Eco Comparison Badge - use directly attached eco_message */}
                          {act.eco_message && act.eco_saved_kg > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                              className="mt-3"
                            >
                              <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 p-2.5 rounded-xl border border-green-100 shadow-sm">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-sm">
                                  🍃
                                </div>
                                <span className="text-[11px] font-bold text-green-700 leading-tight">
                                  {act.eco_message}
                                </span>
                              </div>
                            </motion.div>
                          )}
                          
                          <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-text-muted">
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
                    </div>
                  );
                })()
              )}
            </div>
          ))}

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
                placeholder={itinerary ? "Ada perubahan rute, Arisca?" : "Tanya Arisca tentang perjalanan Anda..."}
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

      <div className={`flex-1 relative bg-light-gray transition-all ${
        activeTab === 'map' ? 'flex' : 'hidden lg:flex'
      }`}>
        <InteractiveMap 
          itinerary={itinerary} 
          hoveredItem={hoveredItem} 
          onHoverItem={setHoveredItem} 
        />

        {/* Floating Info Card (Yesterday's Style) */}
        <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-30 w-full px-4 md:px-0 md:w-auto">
          <AnimatePresence mode="wait">
            {hoveredItem && (
                <motion.div 
                key={hoveredItem.name}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                className="max-w-xl mx-auto glass-heavy rounded-3xl md:rounded-[32px] p-3 md:p-4 border-white/80 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] backdrop-blur-3xl flex gap-4 md:gap-6 items-center"
              >
                <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-[28px] overflow-hidden flex-shrink-0 shadow-lg">
                  <Image 
                    src={hoveredItem.image || '/images/generic-eco.png'} 
                    alt={hoveredItem.name} 
                    fill 
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
                
                <div className="flex-1 pr-2 md:pr-6 py-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="px-2 py-0.5 bg-secondary/10 rounded-md">
                      <span className="text-[8px] font-black text-secondary uppercase tracking-[0.1em]">{hoveredItem.label}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Star size={10} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] font-bold text-text-primary">4.9</span>
                    </div>
                  </div>
                  <h3 className="font-black text-base md:text-lg text-text-primary leading-tight mb-1 truncate">{hoveredItem.name}</h3>
                  <div className="flex items-center gap-1 text-text-secondary mb-3">
                    <MapPin size={10} className="text-primary" />
                    <span className="text-[10px] font-medium truncate">{hoveredItem.location}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-primary text-white py-2 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-secondary transition-all shadow-md active:scale-95">
                      Detail
                    </button>
                    <button className="px-3 bg-white/40 text-primary py-2 rounded-xl font-black text-[9px] uppercase tracking-wider border border-primary/10 hover:bg-white transition-all active:scale-95">
                      Simpan
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