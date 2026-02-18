import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { AnimatedBackground, GlassCard, Button } from '../components/ui';
import HeroAnimation from '../components/landing/HeroAnimation';

/* ── Fade-in wrapper for scroll animations ── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Feature data ── */
const features = [
  {
    title: 'Step-by-Step Execution',
    description: 'Watch your code execute line by line with a real interpreter. See exactly when functions push onto the call stack and when they pop off.',
    color: 'cyan' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
      </svg>
    ),
  },
  {
    title: 'Queue Visualization',
    description: 'See microtasks and macrotasks queue up in real time. Understand why Promise.then runs before setTimeout — visually.',
    color: 'lavender' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
      </svg>
    ),
  },
  {
    title: 'Async/Await & Promises',
    description: 'Full support for async functions, Promise chains, and error handling. See how await suspends execution and schedules continuations.',
    color: 'coral' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
      </svg>
    ),
  },
  {
    title: 'Node vs Browser Modes',
    description: 'Toggle between browser and Node.js runtime modes. See how process.nextTick, setImmediate, and event loop phases differ.',
    color: 'mint' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
];

/* ── Learning path data ── */
const learningPath = [
  {
    step: '01',
    title: 'Understand the Runtime',
    desc: 'Learn how the JS engine, call stack, and memory heap work together.',
    link: '/about-runtime',
    accent: 'text-cyan',
  },
  {
    step: '02',
    title: 'Master the Event Loop',
    desc: 'Deep dive into microtasks, macrotasks, and the rendering pipeline.',
    link: '/event-loop',
    accent: 'text-lavender',
  },
  {
    step: '03',
    title: 'Compare Environments',
    desc: 'See how Node.js phases differ from the browser event loop model.',
    link: '/node-vs-browser',
    accent: 'text-coral',
  },
  {
    step: '04',
    title: 'Visualize It',
    desc: 'Write code and watch it execute step by step in the interactive visualizer.',
    link: '/visualizer',
    accent: 'text-mint',
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[100svh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-20 sm:pb-16">
        <AnimatedBackground variant="particles" intensity="medium" className="opacity-60" />

        {/* Hero — text left, animation right, single unit */}
        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center lg:text-left"
          >
            {/* Tagline pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
              <span className="text-xs font-medium text-white/60 tracking-wide">
                Interactive JavaScript Runtime Explorer
              </span>
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1] mb-4 sm:mb-6">
              <span className="text-white">See How JavaScript</span>
              <br />
              <span className="gradient-text">Actually Executes</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-white/45 max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 leading-relaxed">
              Step through your code and watch the call stack, event loop, microtasks, and macrotasks
              come alive. Finally understand async JavaScript — not by reading, but by <em className="text-white/60 not-italic">seeing</em>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <Link to="/visualizer">
                <Button size="lg" variant="primary">
                  Open Visualizer
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </Link>
              <Link to="/about-runtime">
                <Button size="lg" variant="ghost" className="text-white/50">
                  Start Learning
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right: Hero Animation — hidden on very small screens to prevent clutter */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            className="w-full hidden sm:block"
          >
            <HeroAnimation />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-white/30" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4">
        <AnimatedBackground variant="grid" className="opacity-30" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                Everything You Need to <span className="gradient-text-cool">Understand</span>
              </h2>
              <p className="text-white/40 max-w-xl mx-auto">
                A complete toolkit for exploring JavaScript's asynchronous execution model,
                from basic callbacks to complex promise chains.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.1}>
                <GlassCard
                  variant="default"
                  padding="lg"
                  hoverLift
                  className="h-full group cursor-default"
                >
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 ${feature.color === 'cyan' ? 'bg-cyan/10 border border-cyan/20 text-cyan' : feature.color === 'lavender' ? 'bg-lavender/10 border border-lavender/20 text-lavender' : feature.color === 'coral' ? 'bg-coral/10 border border-coral/20 text-coral' : 'bg-mint/10 border border-mint/20 text-mint'}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-white/40 leading-relaxed">{feature.description}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ LEARNING PATH ═══════════ */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                Your <span className="gradient-text-warm">Learning Path</span>
              </h2>
              <p className="text-white/40 max-w-lg mx-auto">
                Follow a structured journey from fundamentals to hands-on visualization.
              </p>
            </div>
          </Reveal>

          <div className="space-y-3 sm:space-y-4">
            {learningPath.map((item, i) => (
              <Reveal key={item.step} delay={i * 0.1}>
                <Link to={item.link}>
                  <GlassCard
                    variant="subtle"
                    padding="none"
                    className="flex items-center gap-3 sm:gap-5 p-4 sm:p-6 group hover:bg-white/[0.04] transition-colors duration-300"
                    whileHover={{ x: 6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <span className={`text-xl sm:text-2xl lg:text-3xl font-black ${item.accent} opacity-40 group-hover:opacity-80 transition-opacity font-mono`}>
                      {item.step}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-white/90 group-hover:text-white transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/35 mt-0.5 line-clamp-2">{item.desc}</p>
                    </div>
                    <svg className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </GlassCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center">
            {/* Decorative glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 sm:w-96 lg:w-[500px] h-48 sm:h-64 lg:h-75 bg-radial-[ellipse_at_center] from-cyan/[0.06] via-transparent to-transparent blur-2xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                Ready to <span className="gradient-text">See It In Action</span>?
              </h2>
              <p className="text-sm sm:text-base text-white/40 mb-6 sm:mb-8 max-w-md mx-auto">
                Write JavaScript, hit play, and watch every step of execution unfold before your eyes.
              </p>
              <Link to="/visualizer">
                <Button size="lg" variant="primary">
                  Launch Visualizer
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
