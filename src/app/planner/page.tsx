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
  Layers
} from "lucide-react";

function PlannerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'map'>('chat');

  // Initial trigger if there's a query from landing page
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setInputValue("");
    setIsGenerating(true);

    // Mock AI Response for now (Phase 1)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Halo! Saya sedang merancang rencana perjalanan ramah lingkungan terbaik untuk Anda ke " + text + ". Mohon tunggu sebentar selagi saya menghitung rute paling efisien karbon..." 
      }]);
      setIsGenerating(false);
    }, 1500);
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
              className="p-2 hover:bg-light-gray rounded-full transition-all text-text-secondary"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-bold text-text-primary text-sm md:text-base">Rencana Perjalanan</h1>
              <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-secondary">
                <Leaf size={10} />
                Eco-Certified
              </div>
            </div>
          </div>
          <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[10px] font-bold border border-secondary/20">
            Skor: 92
          </div>
        </div>

        {/* Chat / Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 scrollbar-hide pb-24 md:pb-6">
          {messages.length === 0 && !isGenerating && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Sparkles size={32} />
              </div>
              <p className="text-xs font-medium max-w-[200px]">
                Mulai ceritakan detail perjalanan impian Anda di bawah ini.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div className={`max-w-[90%] md:max-w-[85%] p-3 md:p-4 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-light-gray text-text-primary border border-black/5'
              }`}>
                {msg.content}
              </div>
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

        {/* Input Area - Hidden on mobile map view */}
        <div className="p-4 md:p-6 bg-white border-t border-black/5 pb-24 md:pb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-secondary/5 blur-xl group-focus-within:bg-secondary/10 transition-all rounded-2xl" />
            <div className="relative bg-light-gray rounded-2xl p-1.5 flex items-end gap-2 border border-black/5 group-focus-within:border-secondary/30 transition-all">
              <textarea 
                rows={1}
                placeholder="Ada perubahan rute?"
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

      {/* Right Panel: Interactive Map (Fluid) */}
      <div className={`flex-1 relative bg-light-gray transition-all ${
        activeTab === 'map' ? 'flex' : 'hidden lg:flex'
      }`}>
        {/* Map Header Overlay */}
        <div className="absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 z-10 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
             <div className="glass px-3 py-1.5 rounded-xl border-white/40 flex items-center gap-2 shadow-xl">
               <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse" />
               <span className="text-[10px] font-bold text-text-primary uppercase tracking-tight">Rute Eco</span>
             </div>
          </div>
          
          <div className="flex flex-col gap-2 md:gap-3 pointer-events-auto">
            {[MapIcon, Layers, Info].map((Icon, i) => (
              <button key={i} className="w-10 h-10 md:w-12 md:h-12 glass rounded-xl md:rounded-2xl flex items-center justify-center text-text-primary hover:bg-white transition-all shadow-xl border-white/40">
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="absolute inset-0 bg-deep-forest/5 flex items-center justify-center">
          <div className="text-center space-y-3 opacity-20">
             <MapIcon size={60} className="mx-auto" />
             <p className="font-bold uppercase tracking-[0.2em] text-xs">Peta Interaktif</p>
          </div>
        </div>

        {/* Location Preview Card (Dummy) */}
        <div className="absolute bottom-24 md:bottom-10 left-4 md:left-10 right-4 md:right-10 z-10 animate-slide-up">
           <div className="max-w-md glass rounded-3xl md:rounded-[32px] p-1.5 border-white/50 shadow-2xl overflow-hidden flex gap-3 md:gap-4">
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl overflow-hidden flex-shrink-0">
                <Image 
                  src="/images/ubud-resort.png" 
                  alt="Location" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="py-2 md:py-4 pr-4 md:pr-6 flex flex-col justify-center">
                <span className="text-secondary text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Pemberhentian 1</span>
                <h3 className="text-base md:text-xl font-bold text-text-primary mb-0.5 md:mb-1">Ubud Eco Resort</h3>
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-text-secondary">
                  <MapPin size={12} className="text-secondary" />
                  Bali, Indonesia
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-t border-black/5 p-4 flex justify-around items-center">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'chat' ? 'text-primary' : 'text-text-muted'
          }`}
        >
          <Sparkles size={20} className={activeTab === 'chat' ? 'fill-current' : ''} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Rencana</span>
        </button>
        <button 
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'map' ? 'text-primary' : 'text-text-muted'
          }`}
        >
          <MapIcon size={20} className={activeTab === 'map' ? 'fill-current' : ''} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Peta</span>
        </button>
      </div>
    </main>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-warm-cream">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PlannerContent />
    </Suspense>
  );
}
