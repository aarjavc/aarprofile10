import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { ArrowUpRight, Mail, Instagram, Music, MapPin, Play, X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

/* --- ASSETS & DATA --- */
// `motion` is used primarily in JSX tags; this makes ESLint see it as "used".
void motion;

const ASSETS = {
  // User-specified local images
  heroBg: "/aabout.jpg", 
  aboutImg: "/realAabout.jpg",
};

const SONGS = [
  { title: "Uphill", url: "https://soundcloud.com/aarjavchauhan/uphill" },
  { title: "I'm Just Too Without You", url: "https://soundcloud.com/aarjavchauhan/im-just-too-without-you" },
  { title: "Away", url: "https://soundcloud.com/aarjavchauhan/away" },
  { title: "Balance", url: "https://soundcloud.com/aarjavchauhan/balance" },
  { title: "Nearly There", url: "https://soundcloud.com/aarjavchauhan/nearly-there" },
  { title: "Bittersweet Memories", url: "https://soundcloud.com/aarjavchauhan/bittersweet-memories" },
];

const LOCAL_COVERS = {
  "Uphill": "/Covers/Uphill.png",
  "I'm Just Too Without You": "/Covers/i'mjusttoowithoutyou.png",
  "Away": "/Covers/Away.png",
  "Balance": "/Covers/Balance.png",
  "Nearly There": "/Covers/NearlyThere.png",
  "Bittersweet Memories": "/Covers/BittersweetMemories.png",
};

const TOUR_DATES = [
  { event: "BUURTFEEST", location: "Tomorrowland, Belgium", date: "22 July" }
];

const sectionParent = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.12 },
  },
};

const sectionChild = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.0, ease: [0.25, 0.1, 0.25, 1] } },
};

/* --- COMPONENTS --- */

// Glassmorphism SoundCloud Player Modal
const SoundCloudModal = ({ isOpen, onClose, trackUrl, title }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 20, rotateX: -8 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10, rotateX: 6 }}
            transition={{ type: "spring", stiffness: 120, damping: 24, mass: 1.05 }}
            onClick={handleModalClick}
            className="w-full max-w-3xl bg-[#0f0f0f]/90 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative [transform-style:preserve-3d]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
              <h3 className="text-white/80 font-display text-sm tracking-widest uppercase truncate max-w-[80%]">
                Now Playing: <span className="text-white font-bold">{title}</span>
              </h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors duration-300 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SoundCloud Embed */}
            <div className="w-full aspect-video md:aspect-[3/1] bg-black relative">
              <iframe
                width="100%"
                height="100%"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23d97706&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-4 bg-black/40 border-t border-white/5 gap-4">
              <a 
                href={trackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d97706] hover:text-white transition-colors duration-300"
              >
                <span>Open full track</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed top-0 left-0 right-0 z-[120] h-[2px] origin-left bg-gradient-to-r from-[#d97706] via-orange-300 to-[#d97706]"
    />
  );
};

const MagneticButton = ({ href, children, className = "", target, rel }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 240, damping: 18 });
  const springY = useSpring(y, { stiffness: 140, damping: 22, mass: 1.1 });

  const onMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * 0.18);
    y.set(relY * 0.18);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      onMouseMove={onMouseMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.96 }}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.a>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'About', href: '#about' },
    { name: 'Music', href: '#songs' },
    { name: 'Tour', href: '#tour' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-center pt-6 px-4`}
    >
      <div 
        className={`
          flex items-center justify-between w-full max-w-[95%] md:max-w-7xl 
          rounded-full px-6 py-4 transition-all duration-500
          ${scrolled 
            ? 'bg-black/60 backdrop-blur-xl border border-white/5 shadow-2xl' 
            : 'bg-transparent border-transparent'
          }
        `}
      >
        <div className="text-white font-display font-bold text-xl tracking-widest z-10">
          AARJAV
        </div>

        <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-white/60 hover:text-white text-sm font-medium transition-colors tracking-wide uppercase"
            >
              {link.name}
            </a>
          ))}
        </div>

        <MagneticButton
          href="https://soundcloud.com/aarjavchauhan"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 bg-[#d97706] text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-white transition-all duration-300"
        >
          <span>LISTEN</span>
          <Play className="w-3 h-3 fill-current" />
        </MagneticButton>
      </div>
    </motion.nav>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const yBg = useTransform(scrollY, [0, 900], [0, 120]);
  const yLayer = useTransform(scrollY, [0, 900], [0, -80]);
  const letters = "AARJAV".split("");
  
  return (
    <section id="hero" className="relative h-screen w-screen overflow-hidden flex items-center justify-center">
      {/* Background with Slow Zoom */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        <motion.div
          style={{ y: yBg }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1.0 }}
          transition={{ duration: 28, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="relative w-full h-full"
        >
          <img 
            src={ASSETS.heroBg} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60 object-[center_-5%] scale-[0.92] md:scale-110 blur-sm"
            onError={(e) => {
              // Fallback if hero.jpg isn't found
              e.target.src = "https://images.unsplash.com/photo-1571266028243-371695039989?q=80&w=2535&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/40" />
        </motion.div>
      </div>

      {/* Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center text-center px-4"
      >
        <div className="overflow-hidden mb-6">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[14vw] md:text-[12vw] leading-[0.85] font-display font-bold text-[#ededed] tracking-tight md:tracking-tighter mix-blend-overlay px-2">
              {letters.map((ch, idx) => (
                <motion.span
                  key={`${ch}-${idx}`}
                  initial={{ opacity: 0, y: 42 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.08, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                  className="inline-block"
                >
                  {ch}
                </motion.span>
              ))}
            </h1>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
        >
          <span className="text-white/80 font-display uppercase tracking-[0.2em] text-sm md:text-lg">
            Producer & DJ
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="relative py-32 px-4 md:px-12 bg-[#050505]">
      <motion.div
        variants={sectionParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        {/* Image */}
        <motion.div 
          variants={sectionChild}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative h-[60vh] rounded-[2rem] overflow-hidden group"
        >
          <img 
            src={ASSETS.aboutImg} 
            alt="Aarjav Studio" 
            className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
            onError={(e) => {
              // Fallback if about.jpg isn't found
              e.target.src = "https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?q=80&w=2076&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
        </motion.div>

        {/* Text */}
        <motion.div variants={sectionChild} className="flex flex-col justify-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#d97706] font-display uppercase tracking-widest text-sm mb-8"
          >
            About The Artist
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-8"
          >
            <p className="text-[#ededed] text-lg md:text-xl lg:text-2xl font-light leading-relaxed">
              I’m Aarjav, a 15-year-old EDM producer from Bangalore. I’ve been producing music for over a year, with a strong focus on progressive house — the space where melody, emotion, and energy intersect.
            </p>
            <p className="text-[#999] text-base md:text-lg leading-relaxed">
              Inspired by artists like Martin Garrix, David Guetta, and Fred again, my sound blends modern electronic production with uplifting progressions and cinematic moments. While I continue to explore different styles, progressive house is where my creative voice feels most natural.
            </p>
            <p className="text-[#999] text-base md:text-lg leading-relaxed">
              Each track is an experiment, a story, and a step forward. I hope you enjoy the journey.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

const SongCard = ({ song, index, onPlay, isLoading }) => {
  const hasArtwork = typeof song.img === 'string' && song.img.length > 0;
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [pulse, setPulse] = useState(null);

  const handleMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 8;
    const rx = (0.5 - py) * 8;
    setTilt({ rx, ry });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  const handleClick = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setPulse({ x: e.clientX - rect.left, y: e.clientY - rect.top, key: Date.now() });
    }
    onPlay(song);
  };
  return (
    <motion.div 
      ref={cardRef}
      onClick={handleClick}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ scale: 1.015 }}
      animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
      style={{ transformStyle: "preserve-3d" }}
      className="group relative aspect-square rounded-[2rem] overflow-hidden bg-white/5 cursor-pointer block [perspective:1000px]"
    >
      {hasArtwork ? (
        <img 
          src={song.img}
          alt={song.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/0 to-[#d97706]/10"
          />
          {isLoading && (
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              />
            </div>
          )}
        </>
      )}
      <motion.div
        aria-hidden="true"
        initial={{ x: "-120%" }}
        whileHover={{ x: "120%" }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent mix-blend-soft-light"
      />
      {pulse && (
        <motion.span
          key={pulse.key}
          initial={{ opacity: 0.55, scale: 0 }}
          animate={{ opacity: 0, scale: 12 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute pointer-events-none rounded-full bg-white/40"
          style={{ width: 16, height: 16, left: pulse.x - 8, top: pulse.y - 8 }}
        />
      )}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-500" />
      
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <h3 className="text-white font-display text-2xl md:text-3xl font-bold leading-tight mb-2">
            {song.title}
          </h3>
          <div className="flex items-center gap-2 text-[#d97706] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            <span className="text-sm font-bold uppercase tracking-wider">Play Track</span>
            <Play className="w-4 h-4 fill-current" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Songs = () => {
  const [selectedSong, setSelectedSong] = useState(null);
  const [artworkByUrl] = useState(() =>
    Object.fromEntries(SONGS.map((s) => [s.url, LOCAL_COVERS[s.title] || null]))
  );
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollIntervalRef = useRef(null);
  const scrollSpeedRef = useRef(1);
  const speedBoostTimeoutRef = useRef(null);

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const autoScroll = () => {
      if (!isPaused) {
        scrollContainer.scrollLeft += scrollSpeedRef.current;
        
        // Calculate when to reset (at 1/3 point since we have 3 copies)
        const maxScroll = scrollContainer.scrollWidth / 3;
        if (scrollContainer.scrollLeft >= maxScroll * 2) {
          scrollContainer.scrollLeft = maxScroll;
        }
      }
    };

    scrollIntervalRef.current = setInterval(autoScroll, 16);

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isPaused]);

  // Manual scroll function with speed boost
  const handleScroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = 320; // w-80 = 320px
    const gap = 24; // gap-6 = 24px
    const scrollAmount = cardWidth + gap;

    // Boost scroll speed
    scrollSpeedRef.current = direction === 'left' ? -8 : 8;

    // Clear any existing timeout
    if (speedBoostTimeoutRef.current) {
      clearTimeout(speedBoostTimeoutRef.current);
    }

    // Reset speed after 1000ms
    speedBoostTimeoutRef.current = setTimeout(() => {
      scrollSpeedRef.current = 1;
    }, 1000);

    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }

    // Handle wrap-around after scroll completes
    setTimeout(() => {
      const maxScroll = container.scrollWidth / 3;
      if (container.scrollLeft >= maxScroll * 2) {
        container.scrollLeft = maxScroll;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft = maxScroll;
      }
    }, 400);
  };

  return (
    <>
      <section id="songs" className="py-32 px-4 md:px-12 bg-[#050505]">
        <motion.div
          variants={sectionParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-7xl mx-auto"
        >
          <motion.div 
            variants={sectionChild}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-16"
          >
            <div className="flex flex-col items-center md:items-start md:flex-row md:justify-between md:w-full gap-4">
              <h2 className="text-[10vw] md:text-8xl font-display font-bold text-white select-none leading-none text-center md:text-left">
                ORIGINALS
              </h2>
              <MagneticButton
                href="https://soundcloud.com/aarjavchauhan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/15 text-white/80 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all duration-300 md:mt-4"
              >
                <span>View SoundCloud</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </MagneticButton>
            </div>
          </motion.div>

          <div className="relative">
            {/* Left Scroll Button */}
            <button
              onClick={() => handleScroll('left')}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/90 backdrop-blur-sm border border-white/20 text-white p-4 rounded-full hover:bg-[#d97706] hover:border-[#d97706] transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Scroll Button */}
            <button
              onClick={() => handleScroll('right')}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/90 backdrop-blur-sm border border-white/20 text-white p-4 rounded-full hover:bg-[#d97706] hover:border-[#d97706] transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div 
              ref={scrollRef}
              className="flex gap-6 overflow-x-scroll pb-6 scrollbar-hide scroll-smooth"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Triple the songs for true infinite scroll */}
              {[...SONGS, ...SONGS, ...SONGS].map((song, idx) => (
                <motion.div 
                  key={`${song.title}-${idx}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex-none w-80 h-80"
                >
                  <SongCard 
                    song={{ ...song, img: artworkByUrl[song.url] }}
                    index={idx % SONGS.length} 
                    isLoading={false}
                    onPlay={setSelectedSong}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <SoundCloudModal 
        isOpen={!!selectedSong}
        onClose={() => setSelectedSong(null)}
        trackUrl={selectedSong?.url || ''}
        title={selectedSong?.title || ''}
      />
    </>
  );
};

const Tour = () => {
  return (
    <section id="tour" className="py-32 px-4 md:px-12 bg-[#050505] text-[#ededed]">
      <motion.div
        variants={sectionParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-5xl mx-auto"
      >
        <motion.div
          variants={sectionChild}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 border-b border-white/10 pb-4 flex justify-between items-end"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold">Live Performances</h2>
          <motion.span
            initial={{ opacity: 0, x: 14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
            className="text-white/40 font-mono text-sm"
          >
            2026 / 2027
          </motion.span>
        </motion.div>

        <div className="space-y-6">
          {TOUR_DATES.map((date, idx) => (
            <motion.div
              key={idx}
              variants={sectionChild}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12 text-center md:text-left flex-1">
                <div className="min-w-[120px]">
                  <p className="text-[#d97706] font-display font-bold text-2xl md:text-3xl uppercase tracking-wider">
                    {date.date}
                  </p>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-display font-bold text-xl md:text-2xl mb-2 uppercase tracking-wide">
                    {date.event}
                  </h3>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-white/60">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm md:text-base">{date.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="py-20 px-4 md:px-12 bg-[#050505]">
      <motion.div 
        variants={sectionParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto rounded-[3rem] bg-[#0f0f0f] border border-white/5 p-12 md:p-24 text-center overflow-hidden relative"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 16, 0], y: [0, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[#d97706]/10 blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, -14, 0], y: [0, -8, 0] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[80%] rounded-full bg-blue-900/10 blur-[120px]"
          />
        </div>

        <div className="relative z-10">
          <motion.h2 variants={sectionChild} className="text-4xl md:text-6xl font-display font-bold text-white mb-8">
            Let's Create Something.
          </motion.h2>
          
          <motion.div variants={sectionChild} className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
             <MagneticButton
              href="mailto:aarjavchauhan.in@gmail.com"
              className="flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-[#d97706] hover:text-white transition-all duration-300"
            >
              <Mail className="w-5 h-5" />
              <span>Get in Touch</span>
            </MagneticButton>
            <MagneticButton
              href="https://www.instagram.com/aarjav.music"
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-300"
            >
              <Instagram className="w-5 h-5" />
              <span>Instagram</span>
            </MagneticButton>
             <MagneticButton
              href="https://soundcloud.com/aarjavchauhan"
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-300"
            >
              <Music className="w-5 h-5" />
              <span>SoundCloud</span>
            </MagneticButton>
          </motion.div>

          <div className="flex flex-col items-center gap-4 text-white/30 text-sm">
            <p>&copy; {new Date().getFullYear()} AARJAV. All Rights Reserved.</p>
            <div className="w-12 h-[1px] bg-white/10" />
            <p className="font-display tracking-widest uppercase text-xs">Bangalore, India</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

/* --- MAIN APP --- */

export default function App() {
  return (
    <div className="bg-[#050505] min-h-screen text-[#ededed] font-sans selection:bg-[#d97706] selection:text-white">
      <ScrollProgress />
      {/* Font Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600&family=Syne:wght@400;500;700;800&display=swap');
        
        html { scroll-behavior: smooth; }
        body { background-color: #050505; }
        
        .font-display { font-family: 'Syne', sans-serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        
        /* Hide scrollbar for clean look */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
        
        /* Hide scrollbar for horizontal scroll */
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}} />

      <Navbar />
      <Hero />
      <About />
      <Songs />
      <Tour />
      <Contact />
    </div>
  );
}