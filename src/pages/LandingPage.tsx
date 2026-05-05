import { useNavigate } from 'react-router-dom'
import {
  Leaf,
  Apple,
  BarChart3,
  MessageSquare,
  ChefHat,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react'

const LandingPage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Apple,
      title: 'Personalized Meal Plans',
      desc: 'AI-tailored meal recommendations based on your goals, preferences, and dietary needs.',
    },
    {
      icon: BarChart3,
      title: 'Nutrition Analytics',
      desc: 'Track macros, micronutrients, and progress with clear, actionable insights.',
    },
    {
      icon: MessageSquare,
      title: 'AI Nutrition Coach',
      desc: 'Chat 24/7 with an intelligent assistant for guidance, answers, and motivation.',
    },
    {
      icon: ChefHat,
      title: 'Smart Recipes',
      desc: 'Generate recipes and ingredient substitutions tuned to your pantry and taste.',
    },
    {
      icon: ShieldCheck,
      title: 'Privacy First',
      desc: 'Your health data stays yours — encrypted, secure, and never sold.',
    },
    {
      icon: Sparkles,
      title: 'Continuous Learning',
      desc: 'The more you log, the smarter your recommendations become over time.',
    },
  ]

  const steps = [
    { n: '01', title: 'Create your profile', desc: 'Share your goals, preferences, and dietary restrictions.' },
    { n: '02', title: 'Get your AI plan', desc: 'Receive a personalized nutrition plan in seconds.' },
    { n: '03', title: 'Track & improve', desc: 'Log meals, chat with AI, and refine as you progress.' },
  ]

  const stats = [
    { value: '10k+', label: 'Meals Planned' },
    { value: '98%', label: 'Accuracy Score' },
    { value: '24/7', label: 'AI Support' },
    { value: '4.9★', label: 'User Rating' },
  ]

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">NutriAI</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#stats" className="hover:text-slate-900">Results</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:inline-flex"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.15),_transparent_60%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div className="flex flex-col justify-center">
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by advanced AI
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Smarter nutrition,<br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                personalized for you.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              NutriAI turns your goals, preferences, and routine into a precise nutrition plan.
              Track meals, get recipes, and chat with an AI coach — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:shadow-xl"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                I already have an account
              </button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              {['No credit card required', 'Science-backed', 'Cancel anytime'].map((t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* HERO CARD MOCK */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-emerald-200/40 via-teal-200/30 to-cyan-200/40 blur-2xl" />
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Today's plan</p>
                  <p className="text-lg font-semibold text-slate-900">Balanced • 1,850 kcal</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Leaf className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Protein', val: '112g', pct: 'w-4/5', color: 'bg-emerald-500' },
                  { label: 'Carbs', val: '210g', pct: 'w-3/5', color: 'bg-teal-500' },
                  { label: 'Fats', val: '62g', pct: 'w-2/5', color: 'bg-cyan-500' },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <p className="text-xs text-slate-500">{m.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{m.val}</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className={`h-full ${m.pct} ${m.color}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                {[
                  { t: 'Breakfast', d: 'Greek yogurt bowl with berries', k: '420 kcal' },
                  { t: 'Lunch', d: 'Grilled chicken & quinoa salad', k: '620 kcal' },
                  { t: 'Dinner', d: 'Salmon, asparagus, sweet potato', k: '580 kcal' },
                ].map((m) => (
                  <div key={m.t} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
                    <div>
                      <p className="text-xs font-medium text-slate-500">{m.t}</p>
                      <p className="text-sm font-medium text-slate-800">{m.d}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{m.k}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t border-slate-100 bg-slate-50/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to eat better
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              A complete nutrition toolkit, built around how you actually live.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Get started in minutes
            </h2>
            <p className="mt-4 text-lg text-slate-600">Three simple steps to a healthier routine.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-sm font-semibold text-emerald-600">{s.n}</div>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className="border-y border-slate-100 bg-slate-900 py-16 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 px-8 py-14 text-center text-white shadow-xl sm:px-12">
            <div className="absolute inset-0 -z-10 opacity-20 [background:radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to transform your nutrition?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-emerald-50">
              Join thousands using NutriAI to reach their health goals — smarter, faster, sustainably.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
              >
                Create free account
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900">NutriAI</span>
            <span className="text-sm text-slate-500">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <a href="#" aria-label="GitHub" className="hover:text-slate-900"><Github className="h-5 w-5" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-slate-900"><Twitter className="h-5 w-5" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-slate-900"><Linkedin className="h-5 w-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
