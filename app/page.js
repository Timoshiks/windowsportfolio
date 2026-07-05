"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { 
  Sun, 
  Shield, 
  Volume2, 
  TreePine, 
  ArrowRight, 
  Check, 
  MapPin, 
  Building, 
  Ruler, 
  Sliders, 
  Send, 
  CheckCircle2, 
  ChevronRight, 
  Menu, 
  X,
  Sparkles,
  Info,
  Layers,
  Thermometer,
  CloudSun,
  Phone,
  Mail
} from "lucide-react";

// Configuration specifications
const FRAMES = {
  oak: {
    id: "oak",
    name: "Minimalist Oak Core",
    description: "Sustainably harvested Scandinavian white oak, oiled finish, offering supreme natural thermal performance and interior warmth.",
    uValueMod: 0.05,
    weightMod: 14,
    costFactor: 1.3,
    color: "#D4A373", // oak tone
    hex: "#EAD6C0",
    cladding: "Warm Timber"
  },
  aluminum: {
    id: "aluminum",
    name: "Anodized Aluminum",
    description: "Ultra-slim marine-grade anodized aluminum with structural thermal breaks. Absolute weather resistance and architectural minimalism.",
    uValueMod: 0.18,
    weightMod: 9,
    costFactor: 1.0,
    color: "#4A5568", // slate grey
    hex: "#7E8F83",
    cladding: "Sage/Slate Clad"
  },
  steel: {
    id: "steel",
    name: "Obsidian Charcoal Steel",
    description: "Cold-rolled structural steel profiles. Engineered for massive triple-pane architectural spans with industrial-era visual lines.",
    uValueMod: 0.22,
    weightMod: 19,
    costFactor: 1.5,
    color: "#1A202C", // dark grey/charcoal
    hex: "#2C3530",
    cladding: "Obsidian Powder"
  }
};

const GLAZING = {
  double: {
    id: "double",
    name: "Double-Pane Low-E",
    description: "Argon-filled double panes with high-performance low-emissivity coating. The baseline standard for premium architectural glazing.",
    baseUValue: 1.1,
    shgc: 0.42,
    db: 34,
    glassThickness: 24,
    glassColor: "rgba(186, 230, 253, 0.15)", // light translucent blue
    glassColorTinted: "rgba(186, 230, 253, 0.15)"
  },
  triple: {
    id: "triple",
    name: "Acoustic Triple-Pane",
    description: "Three panes of glass featuring dual argon-filled cavities and acoustic PVB layers. Engineered for sub-zero climates and ultimate sound isolation.",
    baseUValue: 0.62,
    shgc: 0.33,
    db: 45,
    glassThickness: 48,
    glassColor: "rgba(125, 211, 252, 0.25)", // slightly deeper blue
    glassColorTinted: "rgba(125, 211, 252, 0.25)"
  },
  smart: {
    id: "smart",
    name: "Electrochromic Smart Glass",
    description: "Dynamic solid-state glazing. Changes tint electronically via integrated sensors or home automation to mitigate solar heat gain dynamically.",
    baseUValue: 0.72,
    shgc: 0.45, // clear state
    shgcTinted: 0.09, // fully tinted state
    db: 39,
    glassThickness: 36,
    glassColor: "rgba(186, 230, 253, 0.2)",
    glassColorTinted: "rgba(8, 47, 73, 0.85)" // deep ocean tint
  }
};

const CLIMATES = {
  nordic: {
    id: "nordic",
    name: "Nordic / Subarctic",
    description: "Severe winters, mild summers. Heating dominated.",
    degreeDays: 4500,
    energyCostPerKwh: 0.26,
    co2PerKwh: 0.08 // kg CO2 per kWh (mostly hydro/nuclear/renewables, but high demand)
  },
  temperate: {
    id: "temperate",
    name: "Temperate / Maritime",
    description: "Moderate winters, mild summers. Balanced thermal demand.",
    degreeDays: 2800,
    energyCostPerKwh: 0.32,
    co2PerKwh: 0.21
  },
  sunny: {
    id: "sunny",
    name: "Southern / High Solar",
    description: "Mild winters, hot summers. Cooling and solar control dominated.",
    degreeDays: 1200,
    energyCostPerKwh: 0.28,
    co2PerKwh: 0.28
  }
};

const PAST_WINDOWS = {
  single: {
    id: "single",
    name: "Single-Glazed Timber (Pre-1980)",
    uValue: 5.2
  },
  double_old: {
    id: "double_old",
    name: "Early Double-Glazed Metal (1990s)",
    uValue: 2.9
  }
};

export default function Home() {
  // Navigation & UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Configurator States
  const [frame, setFrame] = useState(FRAMES.oak);
  const [glazing, setGlazing] = useState(GLAZING.triple);
  const [width, setWidth] = useState(2400); // mm
  const [height, setHeight] = useState(2100); // mm
  const [panels, setPanels] = useState(2); // 1, 2, or 3 panels
  const [smartTintActive, setSmartTintActive] = useState(false);
  const [noiseSimulationActive, setNoiseSimulationActive] = useState(false);
  const [activeTechModal, setActiveTechModal] = useState(null); // 'rc2' | 'timber' | 'warm-edge' | null

  // Dynamic SVG dimensions for the window drawing
  const svgWidth = useMemo(() => {
    return 140 + ((width - 1200) / (4000 - 1200)) * 220; // 140 to 360
  }, [width]);

  const svgHeight = useMemo(() => {
    return 120 + ((height - 1200) / (3000 - 1200)) * 140; // 120 to 260
  }, [height]);

  const x0 = useMemo(() => 200 - svgWidth / 2, [svgWidth]);
  const y0 = useMemo(() => 150 - svgHeight / 2, [svgHeight]);

  // Calculator States
  const [climate, setClimate] = useState(CLIMATES.nordic);
  const [oldWindow, setOldWindow] = useState(PAST_WINDOWS.single);
  const [calcArea, setCalcArea] = useState(35); // m² of glazing in property

  // Contact Form States
  const [formState, setFormState] = useState({
    name: "",
    phone: "",
    projectType: "Residential Custom",
    message: "",
    area: "20-50 m²"
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Disable automatic scroll restoration on mobile and force scroll to top on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  }, []);

  // Web Audio API refs for noise simulation
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const filterNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);

  // Helper to generate brown noise buffer (warm low city rumble)
  const createBrownNoiseBuffer = (ctx) => {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // boost volume before gain node
    }
    return noiseBuffer;
  };

  // Update audio filter frequency and gain volume smoothly based on the current glazing selection
  const updateAudioParameters = (ctx, filter, gain) => {
    if (!ctx || !filter || !gain) return;

    let targetGain = 0.05;
    let targetFrequency = 400;

    if (glazing.id === "double") {
      targetGain = 0.08;
      targetFrequency = 350;
    } else if (glazing.id === "triple") {
      targetGain = 0.015;
      targetFrequency = 110;
    } else if (glazing.id === "smart") {
      targetGain = 0.035;
      targetFrequency = 200;
    }

    const now = ctx.currentTime;
    // Smooth transition over 0.5s to make it sound premium
    filter.frequency.setValueAtTime(filter.frequency.value, now);
    filter.frequency.exponentialRampToValueAtTime(targetFrequency, now + 0.5);

    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(targetGain, now + 0.5);
  };

  const startAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const buffer = createBrownNoiseBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      sourceNodeRef.current = source;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filterNodeRef.current = filter;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime); // start silent for fade-in
      gainNodeRef.current = gain;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(0);

      updateAudioParameters(ctx, filter, gain);
    } catch (err) {
      console.error("Failed to initialize Web Audio:", err);
    }
  };

  const stopAudio = () => {
    const ctx = audioContextRef.current;
    const gain = gainNodeRef.current;
    if (ctx && gain) {
      const now = ctx.currentTime;
      // Fade out to zero volume over 0.4 seconds
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);

      setTimeout(() => {
        try {
          if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
          }
          if (filterNodeRef.current) {
            filterNodeRef.current.disconnect();
          }
          if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
          }
          if (ctx.state !== "closed") {
            ctx.close();
          }
        } catch (e) {}
        audioContextRef.current = null;
        gainNodeRef.current = null;
        filterNodeRef.current = null;
        sourceNodeRef.current = null;
      }, 500);
    }
  };

  // Sync audio state with simulation toggle and selected glazing type
  useEffect(() => {
    if (noiseSimulationActive) {
      if (!audioContextRef.current) {
        startAudio();
      } else {
        updateAudioParameters(
          audioContextRef.current,
          filterNodeRef.current,
          gainNodeRef.current
        );
      }
    } else {
      if (audioContextRef.current) {
        stopAudio();
      }
    }
  }, [noiseSimulationActive, glazing]);

  // Stop audio on component unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        try {
          sourceNodeRef.current?.stop();
          audioContextRef.current?.close();
        } catch (e) {}
      }
    };
  }, []);

  // Handle header background transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Performance calculations
  const performance = useMemo(() => {
    // U-Value: Glazing baseline + Frame frame thermal conductivity modifier
    const uValue = parseFloat((glazing.baseUValue + frame.uValueMod).toFixed(2));
    
    // SHGC: If electrochromic smart glass, check if tinted
    let shgc = glazing.shgc;
    if (glazing.id === "smart") {
      shgc = smartTintActive ? glazing.shgcTinted : glazing.shgc;
    }

    // Acoustic insulation
    const db = glazing.db;

    // Weight Calculation: glass density ~2.5 kg/m²/mm of thickness.
    // Glass covers roughly 90% of area. Frame contributes weight too.
    const areaSqM = (width / 1000) * (height / 1000);
    // Rough glass weight = area * glass thickness * 2.2 kg.
    // Frame weight = frame weight modifier * perimeter (meters)
    const perimeterM = ((width + height) * 2) / 1000;
    const glassWeight = areaSqM * glazing.glassThickness * 2.2;
    const frameWeight = perimeterM * frame.weightMod;
    const totalWeightKg = Math.round(glassWeight + frameWeight);

    // Energy rating criteria
    let rating = "A+++";
    if (uValue > 1.2) rating = "B";
    else if (uValue > 1.0) rating = "A";
    else if (uValue > 0.8) rating = "A+";
    else if (uValue > 0.7) rating = "A++";

    return {
      uValue,
      shgc,
      db,
      totalWeightKg,
      rating,
      areaSqM: parseFloat(areaSqM.toFixed(2))
    };
  }, [frame, glazing, width, height, smartTintActive]);

  // Savings Calculator
  const savings = useMemo(() => {
    // Energy Heat loss formula: Q = U * Area * Temp Difference (approximated via Heating Degree Days)
    // Heat Loss (kWh/year) = (U-value * Area * Degree Days * 24) / 1000
    const oldLoss = (oldWindow.uValue * calcArea * climate.degreeDays * 24) / 1000;
    const newLoss = (performance.uValue * calcArea * climate.degreeDays * 24) / 1000;
    
    const energySavedKwh = Math.max(0, Math.round(oldLoss - newLoss));
    const financialSavings = Math.round(energySavedKwh * climate.energyCostPerKwh);
    const co2SavedKg = Math.round(energySavedKwh * climate.co2PerKwh);

    return {
      kwh: energySavedKwh,
      cash: financialSavings,
      co2: co2SavedKg
    };
  }, [climate, oldWindow, calcArea, performance.uValue]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formState.name && formState.phone) {
      setFormSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex flex-col selection:bg-brand/20 selection:text-brand-dark">
      
      {/* Dynamic Header */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "py-4 glass-nav" : "py-6 bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center border-2 border-brand text-brand font-bold rounded-sm transition-transform duration-500 group-hover:rotate-90">
              {/* Outer frame box */}
              <div className="absolute inset-[3px] border border-brand/40"></div>
              {/* Double pane line */}
              <div className="w-[2px] h-5 bg-accent/90 transform rotate-12"></div>
              <div className="w-[2px] h-5 bg-brand/80 transform rotate-12 ml-1"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-xl tracking-widest text-ink uppercase">Vindö</span>
              <span className="text-[9px] tracking-[0.3em] uppercase text-brand font-medium">Glazing systems</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <a href="#visualizer" className="text-ink/80 hover:text-brand transition-colors">Visualizer</a>
            <a href="#technology" className="text-ink/80 hover:text-brand transition-colors">Technology</a>
            <a href="#savings" className="text-ink/80 hover:text-brand transition-colors">Savings</a>
            <a href="#portfolio" className="text-ink/80 hover:text-brand transition-colors">Portfolio</a>
            <a href="#contact" className="px-5 py-2.5 bg-brand text-canvas rounded-sm hover:bg-brand-dark transition-all shadow-sm shine-effect text-xs font-bold uppercase tracking-wider">
              Request Config
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-ink hover:text-brand transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-40 bg-canvas/95 backdrop-blur-md transform transition-transform duration-500 md:hidden ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full justify-between p-8 pt-28">
          <nav className="flex flex-col gap-6 text-2xl font-heading font-medium">
            <a 
              href="#visualizer" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between border-b border-brand/10 py-3"
            >
              <span>Visualizer</span> <ChevronRight size={20} className="text-brand" />
            </a>
            <a 
              href="#technology" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between border-b border-brand/10 py-3"
            >
              <span>Technology</span> <ChevronRight size={20} className="text-brand" />
            </a>
            <a 
              href="#savings" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between border-b border-brand/10 py-3"
            >
              <span>Energy Savings</span> <ChevronRight size={20} className="text-brand" />
            </a>
            <a 
              href="#portfolio" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between border-b border-brand/10 py-3"
            >
              <span>Portfolio</span> <ChevronRight size={20} className="text-brand" />
            </a>
          </nav>

          <a 
            href="#contact" 
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-4 bg-brand text-canvas rounded-sm text-center font-bold uppercase text-xs tracking-wider shadow-md"
          >
            Request Config
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center pt-24 overflow-hidden">
        {/* Background Image with elegant gradient blending into canvas */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero-bg.jpg" 
            alt="Vindö Architectural Glazing Detail" 
            fill
            priority
            className="object-cover object-center scale-105 animate-scale-up"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/90 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col items-start text-left max-w-2xl">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-light border border-brand/15 text-brand text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
              <Sparkles size={12} className="text-accent" />
              <span>Scandinavian Precision Glazing</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink leading-[1.1] mb-6 animate-fade-in-delayed">
              Windows that frame light, <br />
              <span className="text-brand font-medium italic">glazing that defies</span> the elements.
            </h1>

            <p className="text-base sm:text-lg text-ink/80 leading-relaxed mb-8 max-w-xl animate-fade-in-delayed">
              Vindö designs and installs minimal-profile timber-aluminum and structural steel glazing systems. Engineered to withstand harsh Nordic climates without compromising on clean architectural silhouettes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-delayed">
              <a 
                href="#visualizer" 
                className="px-8 py-4 bg-brand text-canvas font-medium rounded-sm text-center hover:bg-brand-dark transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group shine-effect"
              >
                <span>Interactive Simulator</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a 
                href="#portfolio" 
                className="px-8 py-4 bg-white/70 backdrop-blur-sm border border-ink/10 text-ink font-medium rounded-sm text-center hover:bg-white hover:border-brand/40 transition-all duration-300"
              >
                Explore Portfolios
              </a>
            </div>
            
            {/* Quick Metrics Summary */}
            <div className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-brand/10 w-full animate-fade-in-delayed">
              <div>
                <span className="block font-heading text-2xl sm:text-3xl font-bold text-brand">0.60</span>
                <span className="text-xs text-ink/60 font-medium uppercase tracking-wider">Lowest U-Value</span>
              </div>
              <div>
                <span className="block font-heading text-2xl sm:text-3xl font-bold text-brand">45dB</span>
                <span className="text-xs text-ink/60 font-medium uppercase tracking-wider">Acoustic Shield</span>
              </div>
              <div>
                <span className="block font-heading text-2xl sm:text-3xl font-bold text-brand">100%</span>
                <span className="text-xs text-ink/60 font-medium uppercase tracking-wider">Custom Sized</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Visualizer & Physics Simulator Section */}
      <section id="visualizer" className="py-24 bg-brand-light/30 border-y border-brand/5 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="max-w-3xl mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink tracking-tight mb-4">
              Window Architect &amp; Performance Simulator
            </h2>
            <p className="text-lg text-ink/75">
              Customize structural profiles, glazing specifications, and dimensions. Observe estimated acoustic insulation, heat gain values, and total weight in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Customization Controls (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-card border border-brand/10 p-6 md:p-8 rounded-sm shadow-sm flex flex-col gap-8">
              
              {/* Option 1: Profile Framework */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand mb-3 flex items-center justify-between">
                  <span>1. Architectural Profile Core</span>
                  <span className="text-ink/50 text-[10px] font-normal lowercase">Determines structural frame conductivity</span>
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.values(FRAMES).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setFrame(item)}
                      className={`text-left p-4 rounded-sm border transition-all duration-300 flex justify-between items-center ${frame.id === item.id ? "bg-brand/5 border-brand ring-1 ring-brand" : "border-ink/10 hover:border-brand/40 bg-white"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <div>
                          <h4 className="font-semibold text-sm text-ink">{item.name}</h4>
                          <p className="text-xs text-ink/60 mt-0.5 line-clamp-1">{item.cladding} Exterior Clad</p>
                        </div>
                      </div>
                      {frame.id === item.id && <Check size={16} className="text-brand shrink-0" />}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-ink/50 mt-2 leading-relaxed">
                  {frame.description}
                </p>
              </div>

              {/* Option 2: Glazing Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand mb-3 flex items-center justify-between">
                  <span>2. Glass Insulation Specification</span>
                  <span className="text-ink/50 text-[10px] font-normal lowercase">Determines thermal core performance</span>
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.values(GLAZING).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setGlazing(item);
                        // Reset smart tint if changing glazing type
                        if (item.id !== "smart") setSmartTintActive(false);
                      }}
                      className={`text-left p-4 rounded-sm border transition-all duration-300 flex justify-between items-center ${glazing.id === item.id ? "bg-brand/5 border-brand ring-1 ring-brand" : "border-ink/10 hover:border-brand/40 bg-white"}`}
                    >
                      <div>
                        <h4 className="font-semibold text-sm text-ink">{item.name}</h4>
                        <p className="text-xs text-ink/60 mt-0.5">{item.glassThickness}mm total thickness</p>
                      </div>
                      {glazing.id === item.id && <Check size={16} className="text-brand shrink-0" />}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-ink/50 mt-2 leading-relaxed">
                  {glazing.description}
                </p>
              </div>

              {/* Option 3: Dimensions Sliders */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand">
                    3. Custom Frame Dimensions
                  </label>
                  <span className="text-xs font-mono bg-brand-light text-brand px-2 py-0.5 rounded-sm">
                    {performance.areaSqM} m² total area
                  </span>
                </div>
                
                {/* Width Slider */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-ink/70">Frame Width</span>
                    <span className="font-semibold font-mono text-ink">{width} mm</span>
                  </div>
                  <input 
                    type="range" 
                    min="1200" 
                    max="4000" 
                    step="100" 
                    value={width} 
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full accent-brand bg-brand-light rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-ink/40 mt-1">
                    <span>1.2m min</span>
                    <span>4.0m max</span>
                  </div>
                </div>

                {/* Height Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-ink/70">Frame Height</span>
                    <span className="font-semibold font-mono text-ink">{height} mm</span>
                  </div>
                  <input 
                    type="range" 
                    min="1200" 
                    max="3000" 
                    step="100" 
                    value={height} 
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full accent-brand bg-brand-light rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-ink/40 mt-1">
                    <span>1.2m min</span>
                    <span>3.0m max</span>
                  </div>
                </div>
              </div>

              {/* Additional Toggles depending on choice */}
              <div className="flex flex-col gap-4 pt-4 border-t border-brand/10">
                {/* Dynamic panels slider */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-ink block">Mullion Panel Dividers</span>
                    <span className="text-[11px] text-ink/50">Configure panes within architectural boundary</span>
                  </div>
                  <div className="flex bg-brand-light p-1 rounded-sm border border-brand/5">
                    {[1, 2, 3].map((val) => (
                      <button
                        key={val}
                        onClick={() => setPanels(val)}
                        className={`px-3 py-1 font-mono text-xs font-bold rounded-sm transition-all ${panels === val ? "bg-white text-brand shadow-sm" : "text-ink/60 hover:text-ink"}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Electrochromic controls (Conditional on smart glass selection) */}
                {glazing.id === "smart" && (
                  <div className="flex items-center justify-between p-3 bg-brand/5 border border-brand/20 rounded-sm animate-scale-up">
                    <div className="flex items-center gap-2">
                      <CloudSun size={18} className="text-accent" />
                      <div>
                        <span className="text-xs font-bold text-ink block">Active Electrochromic Shading</span>
                        <span className="text-[10px] text-ink/50">Toggle tinting layer to deflect sunlight</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSmartTintActive(!smartTintActive)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${smartTintActive ? "bg-brand" : "bg-ink/20"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${smartTintActive ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                )}
                
                {/* Noise Simulation Control */}
                <div className="flex items-center justify-between p-3 bg-brand/5 border border-brand/20 rounded-sm">
                  <div className="flex items-center gap-2">
                    <Volume2 size={18} className="text-brand" />
                    <div>
                      <span className="text-xs font-bold text-ink block">Acoustic Sound Simulator</span>
                      <span className="text-[10px] text-ink/50">Simulate external environmental noise waves</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setNoiseSimulationActive(!noiseSimulationActive)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-all border ${noiseSimulationActive ? "bg-brand text-canvas border-brand" : "bg-white text-ink border-ink/20 hover:border-brand"}`}
                  >
                    {noiseSimulationActive ? "Active" : "Simulate"}
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Live SVG Rendering and Physics Analytics (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              
              {/* Box A: The Interactive SVG Canvas */}
              <div className="glass-card rounded-sm p-8 flex flex-col items-center justify-center relative min-h-[460px] border border-brand/10 shadow-sm overflow-hidden">
                
                {/* Background decorative gridlines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(86,110,93,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(86,110,93,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Noise waves visualization overlay */}
                {noiseSimulationActive && (
                  <div className="absolute top-4 left-0 right-0 px-8 flex justify-between items-center z-10 animate-fade-in">
                    {/* Left wave (outside - large) */}
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[9px] uppercase tracking-widest text-red-500 font-bold">Outside (City Noise 85dB)</span>
                      <div className="flex items-end gap-[3px] h-8">
                        {[0.6, 0.9, 0.4, 0.8, 0.95, 0.7, 0.5, 0.85, 0.9, 0.4].map((h, i) => (
                          <div 
                            key={i} 
                            className="w-[3px] bg-red-400 rounded-sm animate-pulse" 
                            style={{ height: `${h * 100}%`, animationDelay: `${i * 120}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Right wave (inside - shielded) */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] uppercase tracking-widest text-brand font-bold">Inside (Shielded Room)</span>
                      <div className="flex items-end gap-[3px] h-8">
                        {[0.1, 0.15, 0.08, 0.12, 0.18, 0.1, 0.05, 0.15, 0.1, 0.08].map((h, i) => {
                          // Scale amplitude based on decibel reduction
                          const acousticFactor = (85 - performance.db) / 85; 
                          const actualH = h * acousticFactor * 0.9;
                          return (
                            <div 
                              key={i} 
                              className="w-[3px] bg-brand rounded-sm animate-pulse" 
                              style={{ height: `${actualH * 100}%`, animationDelay: `${i * 120}ms` }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* The Dynamic SVG Window Drawing */}
                <div className="relative w-full max-w-[420px] flex items-center justify-center p-4">
                  
                  {/* Outer Container containing size indicators */}
                  <div className="relative w-full pt-[80%] flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg 
                        viewBox="0 0 400 320" 
                        className="w-full h-full drop-shadow-md transition-all duration-300"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* 1. Glazing glass layer (colored by selection and state) */}
                        <rect
                          x={x0 + 6}
                          y={y0 + 6}
                          width={svgWidth - 12}
                          height={svgHeight - 12}
                          rx="4"
                          fill={glazing.id === "smart" && smartTintActive ? glazing.glassColorTinted : glazing.glassColor}
                          className="transition-fill duration-700 ease-in-out"
                        />
                        
                        {/* Glass Reflections details */}
                        <path 
                          d={`M${x0 + 30},${y0 + 20} L${x0 + Math.min(svgWidth - 30, 180)},${y0 + svgHeight - 20} M${x0 + 60},${y0 + 20} L${x0 + Math.min(svgWidth - 30, 210)},${y0 + svgHeight - 20}`} 
                          stroke="rgba(255,255,255,0.18)" 
                          strokeWidth="5" 
                          strokeLinecap="round" 
                          className="pointer-events-none"
                        />

                        {/* 2. Panels divider lines (mullions) */}
                        {panels === 2 && (
                          <line 
                            x1="200" 
                            y1={y0} 
                            x2="200" 
                            y2={y0 + svgHeight} 
                            stroke={frame.hex} 
                            strokeWidth="8" 
                            className="transition-all duration-300"
                          />
                        )}
                        {panels === 3 && (
                          <>
                            <line 
                              x1={x0 + svgWidth / 3} 
                              y1={y0} 
                              x2={x0 + svgWidth / 3} 
                              y2={y0 + svgHeight} 
                              stroke={frame.hex} 
                              strokeWidth="8" 
                              className="transition-all duration-300"
                            />
                            <line 
                              x1={x0 + (2 * svgWidth) / 3} 
                              y1={y0} 
                              x2={x0 + (2 * svgWidth) / 3} 
                              y2={y0 + svgHeight} 
                              stroke={frame.hex} 
                              strokeWidth="8" 
                              className="transition-all duration-300"
                            />
                          </>
                        )}

                        {/* 3. Solid profile perimeter frame */}
                        <rect
                          x={x0}
                          y={y0}
                          width={svgWidth}
                          height={svgHeight}
                          rx="4"
                          fill="none"
                          stroke={frame.hex}
                          strokeWidth="12"
                          className="transition-all duration-300"
                        />

                        {/* Inner bead details */}
                        <rect
                          x={x0 + 6}
                          y={y0 + 6}
                          width={svgWidth - 12}
                          height={svgHeight - 12}
                          rx="2"
                          fill="none"
                          stroke="rgba(28,34,30,0.12)"
                          strokeWidth="2"
                          className="pointer-events-none"
                        />

                        {/* Dynamic Dimension lines */}
                        {/* Bottom Width line */}
                        <line x1={x0} y1={y0 + svgHeight + 25} x2={x0 + svgWidth} y2={y0 + svgHeight + 25} stroke="#566E5D" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1={x0} y1={y0 + svgHeight + 21} x2={x0} y2={y0 + svgHeight + 29} stroke="#566E5D" strokeWidth="1.5" />
                        <line x1={x0 + svgWidth} y1={y0 + svgHeight + 21} x2={x0 + svgWidth} y2={y0 + svgHeight + 29} stroke="#566E5D" strokeWidth="1.5" />
                        
                        {/* Left Height line */}
                        <line x1={x0 - 18} y1={y0} x2={x0 - 18} y2={y0 + svgHeight} stroke="#566E5D" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1={x0 - 22} y1={y0} x2={x0 - 14} y2={y0} stroke="#566E5D" strokeWidth="1.5" />
                        <line x1={x0 - 22} y1={y0 + svgHeight} x2={x0 - 14} y2={y0 + svgHeight} stroke="#566E5D" strokeWidth="1.5" />

                        {/* Width & Height labels inside the SVG canvas for perfect centering */}
                        <text
                          x="200"
                          y={y0 + svgHeight + 38}
                          fill="#566E5D"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {width} мм
                        </text>

                        <text
                          x={x0 - 28}
                          y="150"
                          fill="#566E5D"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                          transform={`rotate(-90, ${x0 - 28}, 150)`}
                        >
                          {height} мм
                        </text>
                      </svg>
                    </div>
                  </div>

                </div>

                {/* Glazing cross-section preview indicator */}
                <div className="w-full flex items-center justify-between mt-4 px-4 py-2.5 bg-canvas/60 border border-brand/5 rounded-sm text-xs">
                  <div className="flex items-center gap-1.5 text-ink/70">
                    <Layers size={14} className="text-brand" />
                    <span>Configuration: <strong>{panels} pane panel(s)</strong></span>
                  </div>
                  <div className="font-semibold text-brand">
                    {frame.cladding} / {glazing.glassThickness}mm Glazing
                  </div>
                </div>

              </div>

              {/* Box B: Real-Time Physics & Performance Dashboard */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* Metric 1: U-Value (Thermal Transmittance) */}
                <div className="bg-card border border-brand/10 p-4 rounded-sm flex flex-col justify-between shadow-sm relative group overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-brand tracking-wider">U-Value (US/SI)</span>
                    <Thermometer size={14} className="text-accent" />
                  </div>
                  <div>
                    <span className="block font-heading text-3xl font-extrabold text-ink leading-none">
                      {performance.uValue}
                    </span>
                    <span className="text-[9px] text-ink/50 mt-1 block">W/m²·K (lower is warmer)</span>
                  </div>
                  {/* Gauge bar */}
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-light">
                    <div 
                      className="h-full bg-brand transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.max(10, (1.8 - performance.uValue) * 80))}%` }} 
                    />
                  </div>
                </div>

                {/* Metric 2: Solar Control (SHGC) */}
                <div className="bg-card border border-brand/10 p-4 rounded-sm flex flex-col justify-between shadow-sm relative group overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-brand tracking-wider">Solar SHGC</span>
                    <Sun size={14} className="text-accent" />
                  </div>
                  <div>
                    <span className="block font-heading text-3xl font-extrabold text-ink leading-none">
                      {performance.shgc}
                    </span>
                    <span className="text-[9px] text-ink/50 mt-1 block">Heat gain percentage</span>
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-light">
                    <div 
                      className="h-full bg-accent transition-all duration-500" 
                      style={{ width: `${performance.shgc * 100}%` }} 
                    />
                  </div>
                </div>

                {/* Metric 3: Acoustic Dampening (dB) */}
                <div className="bg-card border border-brand/10 p-4 rounded-sm flex flex-col justify-between shadow-sm relative group overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-brand tracking-wider">Acoustic dB</span>
                    <Volume2 size={14} className="text-accent" />
                  </div>
                  <div>
                    <span className="block font-heading text-3xl font-extrabold text-ink leading-none">
                      {performance.db}
                    </span>
                    <span className="text-[9px] text-ink/50 mt-1 block">Sound reduction rating</span>
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-light">
                    <div 
                      className="h-full bg-brand-dark transition-all duration-500" 
                      style={{ width: `${(performance.db / 50) * 100}%` }} 
                    />
                  </div>
                </div>

                {/* Metric 4: Glass Weight (Physical scale) */}
                <div className="bg-card border border-brand/10 p-4 rounded-sm flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-brand tracking-wider">Total Weight</span>
                    <Sliders size={14} className="text-accent" />
                  </div>
                  <div>
                    <span className="block font-heading text-3xl font-extrabold text-ink leading-none">
                      {performance.totalWeightKg}
                    </span>
                    <span className="text-[9px] text-ink/50 mt-1 block">Kilograms (estimated)</span>
                  </div>
                  {/* Rating stamp at bottom */}
                  <div className="absolute bottom-1 right-2 text-[10px] font-bold font-mono text-brand bg-brand-light px-1.5 py-0.5 rounded-sm">
                    Rating: {performance.rating}
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Craftsmanship & Technology Details */}
      <section id="technology" className="py-24 bg-canvas relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-6">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider block mb-3">Scandinavian Engineering</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink tracking-tight">
                Architectural details that define premium structural performance.
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-lg text-ink/80 leading-relaxed">
                Vindö windows fuse hand-finished timber interiors with weather-shielded exterior frameworks. Explore our structural composition, engineered to provide extreme durability and structural glass thermal bridges.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Tech 1 */}
            <div className="bg-white border border-brand/10 p-8 rounded-sm hover:border-brand/40 transition-all duration-300 shadow-sm relative group overflow-hidden">
              <div className="w-12 h-12 bg-brand-light text-brand flex items-center justify-center rounded-sm mb-6">
                <Shield size={22} />
              </div>
              <h3 className="font-heading text-xl font-bold text-ink mb-3">Concealed Locking Hardware</h3>
              <p className="text-sm text-ink/75 leading-relaxed">
                All hinges, locking systems, and structural pivots are fully integrated within the sash frame. Zero visible brackets on the interior, leaving flush timber surfaces uninterrupted.
              </p>
              <button 
                onClick={() => setActiveTechModal('rc2')}
                className="mt-6 flex items-center gap-1.5 text-xs text-brand font-semibold hover:text-brand-dark transition-colors cursor-pointer text-left"
              >
                <span>RC2 Security Certified</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Tech 2 */}
            <div className="bg-white border border-brand/10 p-8 rounded-sm hover:border-brand/40 transition-all duration-300 shadow-sm relative group overflow-hidden">
              <div className="w-12 h-12 bg-brand-light text-brand flex items-center justify-center rounded-sm mb-6">
                <TreePine size={22} />
              </div>
              <h3 className="font-heading text-xl font-bold text-ink mb-3">Sustainable Dense Timber Core</h3>
              <p className="text-sm text-ink/75 leading-relaxed">
                We select slow-grown Swedish pine and premium oak with extremely dense growth ring structures. Oiled and vacuum-impregnated to prevent warp and thermal degradation over decades.
              </p>
              <button 
                onClick={() => setActiveTechModal('timber')}
                className="mt-6 flex items-center gap-1.5 text-xs text-brand font-semibold hover:text-brand-dark transition-colors cursor-pointer text-left"
              >
                <span>PEFC &amp; FSC Certified Wood</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Tech 3 */}
            <div className="bg-white border border-brand/10 p-8 rounded-sm hover:border-brand/40 transition-all duration-300 shadow-sm relative group overflow-hidden">
              <div className="w-12 h-12 bg-brand-light text-brand flex items-center justify-center rounded-sm mb-6">
                <Layers size={22} />
              </div>
              <h3 className="font-heading text-xl font-bold text-ink mb-3">Hybrid Thermal Spacers</h3>
              <p className="text-sm text-ink/75 leading-relaxed">
                Multi-pane glass units use non-conductive polymer composite spacer bars instead of cold aluminum. This isolates internal air spaces, eliminating edge condensation and frost transfer.
              </p>
              <button 
                onClick={() => setActiveTechModal('warm-edge')}
                className="mt-6 flex items-center gap-1.5 text-xs text-brand font-semibold hover:text-brand-dark transition-colors cursor-pointer text-left"
              >
                <span>WARM-EDGE Technology</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Interactive Savings Calculator */}
      <section id="savings" className="py-24 bg-brand-light/20 border-y border-brand/5 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Info & Controls */}
            <div className="lg:col-span-6">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider block mb-3">Sustainability Math</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink tracking-tight mb-6">
                Calculate your custom carbon &amp; energy savings.
              </h2>
              <p className="text-base text-ink/85 leading-relaxed mb-8">
                Replacing drafty glazing with Vindö High-Efficiency panels yields substantial heating and cooling carbon offset. Configure your property scale below to estimate dividends.
              </p>

              {/* Calculator Settings */}
              <div className="flex flex-col gap-6 bg-white p-6 rounded-sm border border-brand/10 shadow-sm">
                
                {/* Climate Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-brand mb-2.5">
                    Your Regional Climate
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.values(CLIMATES).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setClimate(item)}
                        className={`py-2 px-3 text-xs font-semibold border rounded-sm transition-all text-center ${climate.id === item.id ? "bg-brand text-canvas border-brand" : "bg-canvas text-ink/80 hover:border-brand"}`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Existing Glazing Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-brand mb-2.5">
                    Current Glass System
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(PAST_WINDOWS).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setOldWindow(item)}
                        className={`py-2 px-3 text-xs font-semibold border rounded-sm transition-all text-center ${oldWindow.id === item.id ? "bg-brand text-canvas border-brand" : "bg-canvas text-ink/80 hover:border-brand"}`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glazing Area Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-ink mb-2">
                    <span>Total Window Area</span>
                    <span className="font-mono text-brand">{calcArea} m²</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={calcArea}
                    onChange={(e) => setCalcArea(Number(e.target.value))}
                    className="w-full accent-brand bg-brand-light rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-ink/40 mt-1">
                    <span>10 m² (Apartment)</span>
                    <span>100 m² (Grand Villa)</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Savings Dashboard */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              
              <div className="bg-brand text-canvas p-8 md:p-10 rounded-sm shadow-md relative overflow-hidden">
                {/* Accent texture background */}
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full bg-brand-dark/30 pointer-events-none" />
                <div className="absolute bottom-[-30px] left-[-30px] w-36 h-36 rounded-full bg-accent/10 pointer-events-none" />

                <h3 className="font-heading text-xl font-bold mb-8 flex items-center gap-2">
                  <Sparkles className="text-accent" size={20} />
                  <span>Annual Projected Benefits</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 border-b border-canvas/10 pb-8">
                  {/* Financial savings */}
                  <div>
                    <span className="text-xs uppercase tracking-wider text-canvas/70 font-semibold block mb-1">Estimated Cost Reduction</span>
                    <span className="font-heading text-4xl font-extrabold text-accent font-mono block">
                      ${savings.cash}
                    </span>
                    <span className="text-[11px] text-canvas/60 mt-1.5 block">saved in annual heating &amp; cooling</span>
                  </div>

                  {/* CO2 Savings */}
                  <div>
                    <span className="text-xs uppercase tracking-wider text-canvas/70 font-semibold block mb-1">Carbon Offset</span>
                    <span className="font-heading text-4xl font-extrabold text-white font-mono block">
                      {savings.co2} kg
                    </span>
                    <span className="text-[11px] text-canvas/60 mt-1.5 block">CO₂ emission reduction annually</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center justify-between text-sm text-canvas/80">
                  <div>
                    <span className="block font-semibold text-white">Equates to:</span>
                    <span className="text-xs text-canvas/75 mt-0.5 block">
                      Planting roughly <strong>{Math.round(savings.co2 / 22)} mature pine trees</strong> every year.
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 text-xs text-accent font-bold uppercase tracking-wider bg-canvas/10 px-3 py-1.5 rounded-sm">
                    <span>Performance tier: A+++</span>
                  </div>
                </div>

              </div>

              {/* Quick Info Alert */}
              <div className="mt-6 flex items-start gap-3 p-4 bg-white border border-brand/10 rounded-sm text-xs text-ink/70">
                <Info size={16} className="text-brand shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Based on a calculated delta of U-value from {oldWindow.uValue} W/m²K to {performance.uValue} W/m²K. Actual performance varies with orientation, frame sealant insulation index, and architectural shading profiles.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Portfolio Showcase Grid */}
      <section id="portfolio" className="py-24 bg-canvas relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider block mb-3">Selected Projects</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink tracking-tight">
                Crafting clean vistas. Realized architectural showcases.
              </h2>
            </div>
            <a 
              href="#contact" 
              className="group text-sm font-bold text-brand uppercase tracking-wider flex items-center gap-1 hover:text-brand-dark transition-colors"
            >
              <span>Consult new project</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Lakeside Villa */}
            <div className="group flex flex-col bg-white border border-brand/10 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <div className="relative h-[280px] overflow-hidden">
                <Image 
                  src="/portfolio-villa.jpg" 
                  alt="Lakeside Villa Glass Installation" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-brand/90 backdrop-blur-sm text-canvas text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
                  Lakeside Villa
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-brand font-medium mb-2">
                    <MapPin size={12} />
                    <span>Siljan, Sweden</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-ink mb-2">The Siljan Pavilion</h3>
                  <p className="text-xs text-ink/70 leading-relaxed line-clamp-3">
                    Features dynamic oversized 3-track sliding glass walls. Fully concealed structural bottom rails embedded inside timber terrace flooring.
                  </p>
                </div>
                <div className="border-t border-brand/5 mt-6 pt-4 flex justify-between items-center text-[10px] uppercase font-bold text-brand">
                  <span>Profile: Oak Timber Core</span>
                  <span>U: 0.65 W/m²K</span>
                </div>
              </div>
            </div>

            {/* Card 2: Forest Cabin */}
            <div className="group flex flex-col bg-white border border-brand/10 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <div className="relative h-[280px] overflow-hidden">
                <Image 
                  src="/portfolio-cabin.jpg" 
                  alt="Forest Cabin Glass Installation" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-brand/90 backdrop-blur-sm text-canvas text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
                  Alpine Cabin
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-brand font-medium mb-2">
                    <MapPin size={12} />
                    <span>Lillehammer, Norway</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-ink mb-2">Fjell Pine Hideaway</h3>
                  <p className="text-xs text-ink/70 leading-relaxed line-clamp-3">
                    Architectural triple-glazed fixed frames customized to withstand freezing temperatures, optimizing solar insulation coefficient during winter months.
                  </p>
                </div>
                <div className="border-t border-brand/5 mt-6 pt-4 flex justify-between items-center text-[10px] uppercase font-bold text-brand">
                  <span>Profile: Anodized Slate</span>
                  <span>U: 0.60 W/m²K</span>
                </div>
              </div>
            </div>

            {/* Card 3: Urban Penthouse */}
            <div className="group flex flex-col bg-white border border-brand/10 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <div className="relative h-[280px] overflow-hidden">
                <Image 
                  src="/portfolio-penthouse.jpg" 
                  alt="Urban Penthouse Glass Installation" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-brand/90 backdrop-blur-sm text-canvas text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
                  Luxury Penthouse
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-brand font-medium mb-2">
                    <MapPin size={12} />
                    <span>Stockholm, Sweden</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-ink mb-2">Östermalm Skyline</h3>
                  <p className="text-xs text-ink/70 leading-relaxed line-clamp-3">
                    Installed electrochromic smart glass spanning 12 meters, allowing automatic sun protection matching lighting shifts, shielding custom art assets.
                  </p>
                </div>
                <div className="border-t border-brand/5 mt-6 pt-4 flex justify-between items-center text-[10px] uppercase font-bold text-brand">
                  <span>Profile: Obsidian Steel</span>
                  <span>U: 0.72 W/m²K</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Quote / Custom Configuration Request Form */}
      <section id="contact" className="py-24 bg-brand-light/30 border-t border-brand/10 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Form info */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-semibold text-accent uppercase tracking-wider block mb-3">Architectural Consultation</span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink tracking-tight mb-6">
                  Initiate your bespoke glazing specification.
                </h2>
                <p className="text-base text-ink/80 leading-relaxed mb-8">
                  Submit your sizing demands or blueprint details. Our architectural advisory team will compile detailed structural feasibility and performance specs.
                </p>
              </div>

              <div className="flex flex-col gap-6 border-t border-brand/10 pt-8">
                {/* Phone & Messengers */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-white border border-brand/10 rounded-sm text-brand">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-ink/50 block">Contact us</span>
                    <div className="flex flex-col gap-1 mt-1 text-sm font-semibold">
                      <a href="tel:+4681234567" className="hover:text-brand transition-colors text-ink">+46 (8) 123-45-67</a>
                      <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-brand uppercase tracking-wider">
                        <a href="https://t.me/vindo_glazing" target="_blank" rel="noopener noreferrer" className="hover:text-brand-dark transition-colors">Telegram</a>
                        <span className="text-ink/20">|</span>
                        <a href="https://wa.me/4681234567" target="_blank" rel="noopener noreferrer" className="hover:text-brand-dark transition-colors">WhatsApp</a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-white border border-brand/10 rounded-sm text-brand">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-ink/50 block">Write Email</span>
                    <a href="mailto:info@vindo.se" className="text-sm font-semibold text-ink hover:text-brand transition-colors block mt-1">info@vindo.se</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-white border border-brand/10 rounded-sm text-brand">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-ink/50 block">HQ Office</span>
                    <span className="text-sm font-semibold text-ink">Skeppsbron 14, 111 30 Stockholm, Sweden</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-white border border-brand/10 rounded-sm text-brand">
                    <Building size={18} />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-ink/50 block">Glazing Factory</span>
                    <span className="text-sm font-semibold text-ink">Vindö Industriväg 4, Gustavsberg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actual Form Panel */}
            <div className="lg:col-span-7 bg-card border border-brand/10 p-8 rounded-sm shadow-sm relative overflow-hidden">
              
              {!formSubmitted ? (
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="flex flex-col">
                      <label className="text-[11px] uppercase font-bold text-brand mb-2">
                        Contact Name
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        placeholder="e.g. Erik Larsson"
                        className="w-full px-4 py-3 bg-canvas border border-ink/10 focus:border-brand focus:outline-none text-sm text-ink rounded-sm"
                      />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col">
                      <label className="text-[11px] uppercase font-bold text-brand mb-2">
                        Phone Number
                      </label>
                      <input 
                        type="tel" 
                        required
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        placeholder="e.g. +46 8 123 45 67"
                        className="w-full px-4 py-3 bg-canvas border border-ink/10 focus:border-brand focus:outline-none text-sm text-ink rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Project Area Scope */}
                    <div className="flex flex-col">
                      <label className="text-[11px] uppercase font-bold text-brand mb-2">
                        Approx Glazing Area
                      </label>
                      <select 
                        value={formState.area}
                        onChange={(e) => setFormState({ ...formState, area: e.target.value })}
                        className="w-full px-4 py-3 bg-canvas border border-ink/10 focus:border-brand focus:outline-none text-sm text-ink rounded-sm appearance-none"
                      >
                        <option>Under 20 m²</option>
                        <option>20-50 m²</option>
                        <option>50-100 m²</option>
                        <option>100m² + (Grand Residence)</option>
                      </select>
                    </div>

                    {/* Project Category */}
                    <div className="flex flex-col">
                      <label className="text-[11px] uppercase font-bold text-brand mb-2">
                        Project Category
                      </label>
                      <select 
                        value={formState.projectType}
                        onChange={(e) => setFormState({ ...formState, projectType: e.target.value })}
                        className="w-full px-4 py-3 bg-canvas border border-ink/10 focus:border-brand focus:outline-none text-sm text-ink rounded-sm appearance-none"
                      >
                        <option>Residential Custom</option>
                        <option>Luxe Commercial</option>
                        <option>Historical Renovation</option>
                        <option>New Villa Construction</option>
                      </select>
                    </div>
                  </div>

                  {/* Blueprint details */}
                  <div className="flex flex-col">
                    <label className="text-[11px] uppercase font-bold text-brand mb-2">
                      Specific Architectural Requirements / Sizes
                    </label>
                    <textarea 
                      rows="4"
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Detail frame core choice, custom sizes, or specific climate constraints..."
                      className="w-full px-4 py-3 bg-canvas border border-ink/10 focus:border-brand focus:outline-none text-sm text-ink rounded-sm resize-none"
                    />
                  </div>

                  {/* Summary of current configuration attached */}
                  <div className="p-4 bg-brand-light/40 border border-brand/10 rounded-sm flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Ruler size={16} className="text-brand" />
                      <span className="text-ink/80">
                        Attaching current active simulator specs: <strong>{width}x{height}mm, {frame.name}, {glazing.name}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    className="w-full py-4 bg-brand text-canvas font-bold uppercase tracking-wider rounded-sm hover:bg-brand-dark transition-all duration-300 flex items-center justify-center gap-2 shadow-sm shine-effect"
                  >
                    <span>Submit Specification Request</span>
                    <Send size={14} />
                  </button>

                </form>
              ) : (
                // Success panel
                <div className="flex flex-col items-center justify-center py-12 text-center animate-scale-up">
                  <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-ink mb-2">Specification Submitted</h3>
                  <p className="text-sm text-ink/75 max-w-md mb-8">
                    Thank you, {formState.name}. We have logged your request under ticket <strong>#VD-{Math.floor(100000 + Math.random() * 900000)}</strong>. An architectural expert will follow up by phone within 24 business hours.
                  </p>

                  <div className="bg-canvas border border-brand/10 p-6 rounded-sm w-full max-w-md text-left text-xs mb-8 flex flex-col gap-3">
                    <div className="flex justify-between border-b border-brand/5 pb-2">
                      <span className="text-ink/50 font-bold uppercase">Client</span>
                      <span className="font-semibold text-ink">{formState.name} ({formState.phone})</span>
                    </div>
                    <div className="flex justify-between border-b border-brand/5 pb-2">
                      <span className="text-ink/50 font-bold uppercase">Area Scope</span>
                      <span className="font-semibold text-ink">{formState.area}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand/5 pb-2">
                      <span className="text-ink/50 font-bold uppercase">Frame System</span>
                      <span className="font-semibold text-ink">{frame.name} ({width} x {height} mm)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink/50 font-bold uppercase">Glazing System</span>
                      <span className="font-semibold text-ink">{glazing.name}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormState({ name: "", phone: "", projectType: "Residential Custom", message: "", area: "20-50 m²" });
                    }}
                    className="px-6 py-2.5 border border-brand text-brand hover:bg-brand hover:text-canvas text-xs font-bold uppercase tracking-wider rounded-sm transition-all"
                  >
                    Configure Another Specification
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* Symmetrical Footnote Footer */}
      <footer className="mt-auto bg-ink text-canvas/70 py-16 border-t border-brand-dark/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Column 1: Info and Monogram */}
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 flex items-center justify-center border border-canvas/40 text-canvas font-bold rounded-sm">
                  <div className="absolute inset-[2px] border border-canvas/20"></div>
                  <div className="w-[1.5px] h-4 bg-accent transform rotate-12"></div>
                  <div className="w-[1.5px] h-4 bg-canvas/60 transform rotate-12 ml-0.5"></div>
                </div>
                <span className="font-heading font-bold text-lg tracking-widest text-white uppercase">VINDÖ</span>
              </div>
              <p className="text-xs text-canvas/50 leading-relaxed mt-2">
                Bespoke Scandinavian architectural window and glazing systems. Fusing durability, safety, and minimalist geometry for premium construction projects.
              </p>
            </div>

            {/* Column 2: Systems */}
            <div>
              <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4">Glazing Systems</h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li><a href="#visualizer" className="hover:text-white transition-colors">Minimalist Oak Systems</a></li>
                <li><a href="#visualizer" className="hover:text-white transition-colors">Anodized Aluminium Clad</a></li>
                <li><a href="#visualizer" className="hover:text-white transition-colors">Obsidian Structural Steel</a></li>
                <li><a href="#visualizer" className="hover:text-white transition-colors">Acoustic Triple-Pane Glass</a></li>
                <li><a href="#visualizer" className="hover:text-white transition-colors">Electrochromic Smart Systems</a></li>
              </ul>
            </div>

            {/* Column 3: Tech Info */}
            <div>
              <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4">Sustainability</h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li><a href="#technology" className="hover:text-white transition-colors">PEFC Certified Timber</a></li>
                <li><a href="#savings" className="hover:text-white transition-colors">Energy Savings Index</a></li>
                <li><a href="#technology" className="hover:text-white transition-colors">Thermal Isolators Core</a></li>
                <li><a href="#technology" className="hover:text-white transition-colors">Low-E Micro Coating</a></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase text-white tracking-widest">Architectural Insights</h4>
              <p className="text-xs text-canvas/50 leading-relaxed">
                Subscribe to receive our periodic review of modernist residential designs and structural glazing achievements.
              </p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="email@address.com" 
                  className="bg-white/10 border border-white/10 focus:border-white focus:outline-none text-xs text-white px-3 py-2 w-full rounded-sm"
                />
                <button className="bg-brand hover:bg-brand-dark text-canvas px-4 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors">
                  Join
                </button>
              </div>
            </div>

          </div>

          {/* Symmetrical divider */}
          <div className="border-t border-canvas/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-canvas/40">
            <div>
              &copy; {new Date().getFullYear()} Vindö Glazing Systems AB. All rights reserved.
            </div>
            <div className="flex gap-6 mt-4 sm:mt-0 font-medium">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Spec Use</a>
              <a href="#" className="hover:text-white transition-colors">Environmental Decl. (EPD)</a>
            </div>
          </div>

        </div>
      </footer>

      {/* Dynamic Technology Details Modal Overlay */}
      {activeTechModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in" onClick={() => setActiveTechModal(null)}>
          <div className="bg-canvas border border-brand/20 p-6 md:p-8 rounded-sm max-w-lg w-full shadow-lg relative animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setActiveTechModal(null)} 
              className="absolute top-4 right-4 p-1.5 text-ink/40 hover:text-brand hover:bg-brand-light transition-all rounded-sm"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            
            {activeTechModal === 'rc2' && (
              <div>
                <div className="w-10 h-10 bg-brand-light text-brand flex items-center justify-center rounded-sm mb-5">
                  <Shield size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-ink mb-3">RC2 Security &amp; Burglar Resistance</h3>
                <p className="text-sm text-ink/75 leading-relaxed mb-5">
                  Resistance Class 2 (RC2) certification guarantees that the window structure can resist break-in attempts using tools like screwdrivers, pliers, and wedges for at least 3 minutes of continuous physical force.
                </p>
                <ul className="text-xs text-ink/70 flex flex-col gap-2">
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>Mushroom-head security locking cams around the sash perimeter.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>Lockable handle with drill protection plates on the lock box.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>Steel reinforcement chambers inside the frame and sash profiles.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>Structural glass bonding (silicone glazing) preventing glass pane removal.</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTechModal === 'timber' && (
              <div>
                <div className="w-10 h-10 bg-brand-light text-brand flex items-center justify-center rounded-sm mb-5">
                  <TreePine size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-ink mb-3">PEFC &amp; FSC Certified Forest Management</h3>
                <p className="text-sm text-ink/75 leading-relaxed mb-5">
                  PEFC and FSC certifications guarantee that all timber materials originate from sustainably managed woodlands, supporting forest replenishment and biodiversity.
                </p>
                <ul className="text-xs text-ink/70 flex flex-col gap-2">
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>Sourced exclusively from replenishment-monitored Scandinavian woodlands.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>100% traceability from raw timber yard to the final product line.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>Ultra-dense slow-growth winter-harvested pine and premium oak cores.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>Oiled and vacuum-impregnated using VOC-free ecological sealants.</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTechModal === 'warm-edge' && (
              <div>
                <div className="w-10 h-10 bg-brand-light text-brand flex items-center justify-center rounded-sm mb-5">
                  <Layers size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-ink mb-3">Warm-Edge Spacer Bar Technology</h3>
                <p className="text-sm text-ink/75 leading-relaxed mb-5">
                  Warm-Edge spacer technology replaces standard cold aluminium spacers with thin-walled polymer composite bars featuring low thermal conductivity.
                </p>
                <ul className="text-xs text-ink/70 flex flex-col gap-2">
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>Reduces edge heat loss around glass panes by over 70%.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>Lowers the overall window U-value by 10-12%.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>Eliminates thermal bridges and stops interior edge condensation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>Prevents frost build-up and mold growth near gasket lines.</span>
                  </li>
                </ul>
              </div>
            )}
            
            <button 
              onClick={() => setActiveTechModal(null)}
              className="w-full mt-6 py-2.5 bg-brand text-canvas font-bold uppercase text-xs tracking-wider rounded-sm hover:bg-brand-dark transition-colors"
            >
              Close Detail
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
