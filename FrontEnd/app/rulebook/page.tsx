'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Loader2, AlertCircle, Trophy, GitBranch, Users, FileText, HelpCircle, Mail, Phone, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const sections = [
  { id: 'what-is-hackathon', label: 'What is a Hackathon?' },
  { id: 'microservices-devops', label: 'Microservices and DevOps' },
  { id: 'general-guidelines', label: 'General Guidelines' },
  { id: 'repository-submission', label: 'Repository & Submission' },
  { id: 'deliverables', label: 'Deliverables' },
  { id: 'evaluation', label: 'Evaluation & Presentation' },
  { id: 'example', label: 'An Example' },
];

export default function RulebookPage() {
  const [published, setPublished] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRulebook = async () => {
      try {
        const { data, error } = await supabase
          .from('rulebook')
          .select('published')
          .single();
        if (data && !error) {
          setPublished(data.published);
        } else {
          setPublished(false);
        }
      } catch (err) {
        console.error('Error fetching rulebook:', err);
        setPublished(false);
      } finally {
        setLoading(false);
      }
    };
    fetchRulebook();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading rulebook...</p>
        </div>
      </div>
    );
  }

  // Not published
  if (!published) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-48 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>
        <nav className="border-b border-border/50 sticky top-0 z-40 bg-background/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/30 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Image src={`${basePath}/iutcs-logo.png`} alt="IUTCS Logo" width={40} height={40} className="relative h-10 w-auto" />
              </div>
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="relative w-full max-w-md">
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-8 text-center space-y-6 shadow-2xl shadow-amber-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-accent/5 rounded-lg pointer-events-none"></div>
              <div className="relative flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-full flex items-center justify-center border-2 border-amber-500/50 shadow-lg shadow-amber-500/20">
                    <AlertCircle className="w-12 h-12 text-amber-500" />
                  </div>
                </div>
              </div>
              <div className="relative space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-amber-400 bg-clip-text text-transparent">Rulebook Not Published</h1>
                <p className="text-muted-foreground">The rulebook hasn&apos;t been published yet. Please check back later.</p>
              </div>
              <div className="relative pt-4">
                <Link href="/" className="w-full block">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white h-12 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Published — show full hardcoded rulebook
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-48 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-1/3 -left-48 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      {/* Navbar */}
      <nav className="border-b border-border/50 sticky top-0 z-40 bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Image src={`${basePath}/iutcs-logo.png`} alt="IUTCS Logo" width={40} height={40} className="relative h-10 w-auto" />
            </div>
          </Link>
          <span className="text-xs font-mono bg-accent/20 text-accent border border-accent/30 px-3 py-1 rounded-full">v1.0 — Published</span>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Header */}
        <div className="mb-12 text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-accent/30 to-accent/10 rounded-full flex items-center justify-center border-2 border-accent/40 shadow-xl shadow-accent/20">
                <BookOpen className="w-10 h-10 text-accent" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
            DevSprint 2026
          </h1>
          <p className="text-lg text-muted-foreground font-medium">DevOps &amp; Microservices — Official Rulebook</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Table of Contents (sticky sidebar) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Card className="bg-card/70 backdrop-blur-xl border border-border/40 p-5 shadow-xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Table of Contents</p>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors group py-1"
                    >
                      <ChevronRight className="w-3 h-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      {s.label}
                    </a>
                  ))}
                </nav>
              </Card>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-10 max-w-3xl mx-auto w-full">
            {/* Section 1: What is a Hackathon */}
            <section id="what-is-hackathon" className="scroll-mt-24">
              <Card className="bg-card/60 backdrop-blur-xl border border-border/40 p-7 shadow-lg hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-accent/20 rounded-lg flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold text-white">What is a Hackathon?</h2>
                </div>
                <div className="space-y-3 text-muted-foreground leading-relaxed text-[15px]">
                  <p>A hackathon is an intensive, short-term innovation event where participants collaborate in teams to conceptualize, design, and develop software solutions from the ground up.</p>
                  <p>Within a fixed time limit, teams transform ideas into functional prototypes by leveraging technical expertise, creativity, and problem-solving skills.</p>
                  <p>These events bring together individuals from diverse fields, including software development, system architecture, and user experience design. The goal is not only to create working applications but also to showcase teamwork, originality, and impactful solutions.</p>
                  <p>At the end of the event, teams present their projects to a panel of judges for assessment.</p>
                </div>
              </Card>
            </section>

            {/* Section 2: Microservices and DevOps */}
            <section id="microservices-devops" className="scroll-mt-24">
              <Card className="bg-card/60 backdrop-blur-xl border border-border/40 p-7 shadow-lg hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <GitBranch className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Microservices and DevOps</h2>
                </div>
                <div className="space-y-3 text-muted-foreground leading-relaxed text-[15px]">
                  <p>Microservices and DevOps represent a modern approach to building and managing software systems that emphasizes flexibility, efficiency, and reliability. In this model, applications are structured as a collection of small, independent services, each responsible for a specific function.</p>
                  <p>DevOps practices complement this architecture by introducing automated workflows for building, testing, and deploying software through CI/CD pipelines. This ensures consistent quality, faster releases, and reduced chances of human error.</p>
                  <p>The primary focus lies on creating scalable, resilient, and well-structured systems, with careful attention to clean architecture and operational stability rather than simply adding more features.</p>
                  <p>Prior exposure to microservices or DevOps concepts is not required, as guidance and mentorship will be available throughout the event to support participants in learning and applying these practices effectively.</p>
                </div>
              </Card>
            </section>

            {/* Section 3: General Guidelines */}
            <section id="general-guidelines" className="scroll-mt-24">
              <Card className="bg-card/60 backdrop-blur-xl border border-border/40 p-7 shadow-lg hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">General Guidelines</h2>
                </div>
                <ul className="space-y-3">
                  {[
                    { bold: 'Eligibility:', rest: ' Participation is strictly open to students currently enrolled in their 1st, 2nd, or 3rd year of IUT.' },
                    { bold: null, rest: 'Participants can use any development stack they want and the final project could be of any kind (desktop app, mobile app or website).' },
                    { bold: null, rest: 'One student must be a member of only one team. No student can participate as a member in different teams at the same time.' },
                    { bold: 'Team Independence:', rest: ' Teams must work independently. Any form of copying code or sharing solutions with other teams will result in immediate disqualification for all involved parties.' },
                    { bold: 'AI Policy:', rest: ' You are encouraged to use AI tools such as ChatGPT, GitHub Copilot, Google Gemini or any other forms of AI. However, you must disclose all AI tools used in your README file.' },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-muted-foreground text-[15px] leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                      <span>{item.bold && <strong className="text-white">{item.bold}</strong>}{item.rest}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>

            {/* Section 4: Repository & Submission */}
            <section id="repository-submission" className="scroll-mt-24">
              <Card className="bg-card/60 backdrop-blur-xl border border-border/40 p-7 shadow-lg hover:border-green-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <GitBranch className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Repository &amp; Submission Guidelines</h2>
                </div>
                <ul className="space-y-3">
                  {[
                    'Create a brand-new GitHub repository during the event.',
                    'The repository must be publicly accessible.',
                    'Ensure that all code, configurations, and documentation are written entirely during the hackathon.',
                    'Maintain a consistent, clear, and meaningful commit history that reflects steady progress and teamwork.',
                    'Include a comprehensive and well-structured README file describing the project, its features, setup instructions, and AI usage details.',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-muted-foreground text-[15px] leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>

            {/* Section 5: Deliverables */}
            <section id="deliverables" className="scroll-mt-24">
              <Card className="bg-card/60 backdrop-blur-xl border border-border/40 p-7 shadow-lg hover:border-orange-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-orange-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Deliverables</h2>
                </div>
                <ul className="space-y-4">
                  {[
                    { title: 'Requirement Analysis & System Architecture', desc: 'A clear description of the problem being addressed, the identified requirements, and a detailed overview of the system design, including component interactions and overall architecture.' },
                    { title: 'Tools and Stack Report', desc: 'A brief report outlining the technologies, frameworks, and tools used in the project, along with concise reasoning for why each choice was made.' },
                    { title: 'GitHub Link', desc: 'A link to the project\'s GitHub repository containing the complete source code, commit history, and documentation.' },
                    { title: 'Demonstration Video', desc: 'A short video (maximum 3 minutes) showcasing the key features, functionality, and workflow of the application.' },
                    { title: 'Deployment Link', desc: 'A link to the live, deployed version of the application for testing and evaluation (optional but encouraged).' },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                      <span className="mt-1 w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 text-xs font-bold shrink-0">{i + 1}</span>
                      <span><strong className="text-white">{item.title}:</strong> <span className="text-muted-foreground">{item.desc}</span></span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>

            {/* Section 6: Evaluation */}
            <section id="evaluation" className="scroll-mt-24">
              <Card className="bg-card/60 backdrop-blur-xl border border-border/40 p-7 shadow-lg hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-accent/20 rounded-lg flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Evaluation and Final Presentation</h2>
                </div>
                <ul className="space-y-3">
                  {[
                    { bold: 'Shortlisting:', rest: ' Based on overall performance, the top-performing teams will be selected to advance to the Final Presentation phase.' },
                    { bold: 'Presentation Format:', rest: ' Shortlisted teams will deliver a live demonstration of their project, highlighting core features, system design, and functionality.' },
                    { bold: 'Q&A Session:', rest: ' Teams must be prepared for a 5-minute technical question-and-answer session, during which judges will ask in-depth questions to assess understanding of the system, implementation choices, and technical decisions.' },
                    { bold: 'Documentation:', rest: ' Final evaluation will also take into account the quality, clarity, and completeness of the submitted documentation files.' },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-muted-foreground text-[15px] leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                      <span><strong className="text-white">{item.bold}</strong>{item.rest}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>

            {/* Section 7: An Example */}
            <section id="example" className="scroll-mt-24">
              <Card className="bg-card/60 backdrop-blur-xl border border-border/40 p-7 shadow-lg hover:border-teal-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-teal-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-teal-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">An Example</h2>
                </div>

                {/* Intro */}
                <p className="text-muted-foreground text-[15px] leading-relaxed mb-6">
                  This is the story of <strong className="text-teal-400">MoodThanda</strong>, a food-tech startup that&apos;s about to go from a local favorite to a digital powerhouse. To get there, we need to build more than just an app; we need a living, breathing digital ecosystem.
                </p>

                {/* Story block */}
                <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-5 mb-6 space-y-3">
                  <h3 className="text-base font-semibold text-teal-300">The MoodThanda Story: Scaling the Flavor</h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed">
                    Imagine MoodThanda on a busy Friday night. The kitchen is buzzing, the aroma of spices fills the air, and online orders are pouring in. Right now, the business is thriving, but the technology behind it needs to evolve. We aren&apos;t just building a menu; we are building a platform that can handle a massive surge of hungry customers during a seasonal festival without breaking a sweat.
                  </p>
                  <p className="text-muted-foreground text-[15px] leading-relaxed">
                    As the lead architect, your mission is to move away from a single, clunky system and toward a <strong className="text-white">Microservice Architecture</strong>. This means if the notification system hits a snag, customers can still browse the menu and place orders. It&apos;s about building a resilient, &quot;always-on&quot; experience where updates happen behind the scenes while the milkshakes keep flowing.
                  </p>
                </div>

                {/* Services */}
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-white mb-3">The Core Ingredients (Our Services)</h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed mb-4">
                    To keep things simple yet powerful for our initial launch, we are decomposing MoodThanda into five essential services:
                  </p>
                  <ul className="space-y-2.5">
                    {[
                      { name: 'Authentication Service', role: 'The "Bouncer."', desc: 'It ensures every user is who they say they are.' },
                      { name: 'Menu Service', role: 'The "Digital Catalog."', desc: 'This serves up images, descriptions, and real-time pricing.' },
                      { name: 'Inventory Service', role: 'The "Stock Keeper."', desc: 'It tracks if we have enough ingredients for that midnight craving.' },
                      { name: 'Notification Service', role: 'The "Messenger."', desc: 'It sends the "Order Received" and "Out for Delivery" alerts.' },
                      { name: 'Monitoring Service', role: 'The "Doctor."', desc: 'It watches the health of all services to ensure 100% uptime.' },
                    ].map((s, i) => (
                      <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                        <span className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 text-xs font-bold shrink-0">{i + 1}</span>
                        <span><strong className="text-white">{s.name}:</strong> <span className="text-teal-300/80 italic">{s.role}</span> <span className="text-muted-foreground">{s.desc}</span></span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mission Tasks */}
                <div>
                  <h3 className="text-base font-semibold text-white mb-3">Your Mission Tasks</h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed mb-4">
                    To bring the MoodThanda platform to life, we will focus on these key architectural milestones:
                  </p>
                  <ul className="space-y-4">
                    {[
                      {
                        title: 'Design the Modular Blueprint',
                        desc: "Break the platform into the five services mentioned above. You'll need to decide how they \"talk\" to each other so that if the Menu Service updates a price, the rest of the system stays in sync.",
                        sub: null,
                      },
                      {
                        title: 'Architect for Growth & Resilience',
                        desc: "Design the system so each service can scale independently. If everyone is checking the menu but no one is ordering yet, we should be able to boost the Menu Service's power without wasting resources elsewhere.",
                        sub: null,
                      },
                      {
                        title: 'Implement "Quality Control" (Testing & CI)',
                        desc: 'To ensure no "bugs" end up in our digital kitchen, you must:',
                        sub: [
                          'Write 2–3 Unit Tests for a core service (e.g., testing if the Inventory Service correctly rejects an order when stock is zero).',
                          'Build a CI (Continuous Integration) Pipeline that automatically runs these tests every time a developer submits new code. If the tests fail, the code is blocked from entering the system.',
                        ],
                      },
                      {
                        title: 'Build the "Auto-Heal" Logic',
                        desc: "Configure the platform to be fault-tolerant. If the Notification Service fails, the system should be designed to restart it automatically so the core ordering process doesn't crash.",
                        sub: null,
                      },
                      {
                        title: 'Eyes on the Engine (Monitoring)',
                        desc: 'Set up a centralized dashboard. We need to see real-time traffic spikes and error logs in one place so we can fix issues before a single customer notices a delay.',
                        sub: null,
                      },
                    ].map((task, i) => (
                      <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                        <span className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 text-xs font-bold shrink-0">{i + 1}</span>
                        <span className="flex-1">
                          <strong className="text-white">{task.title}:</strong>{' '}
                          <span className="text-muted-foreground">{task.desc}</span>
                          {task.sub && (
                            <ul className="mt-2 space-y-1.5 pl-1">
                              {task.sub.map((s, j) => (
                                <li key={j} className="flex gap-2 text-muted-foreground">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400/60 shrink-0"></span>
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </section>

            {/* Contact / Helpline */}            <section className="scroll-mt-24">
              <Card className="bg-gradient-to-br from-accent/10 via-card/60 to-purple-500/10 backdrop-blur-xl border border-accent/30 p-7 shadow-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-accent/20 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Helpline &amp; Support</h2>
                </div>
                <p className="text-muted-foreground text-[15px] mb-5">In case of any questions or queries regarding the rules, technical requirements, or submission process, please reach out to the organizing committee:</p>
                <div className="bg-background/40 rounded-xl border border-border/40 p-5 space-y-3">
                  <p className="text-white font-semibold text-base">Abrar Mahmud Hasan</p>
                  <p className="text-muted-foreground text-sm">Joint Secretary, IUT Computer Society</p>
                  <div className="space-y-2 pt-1">
                    <a href="mailto:abrarhasan@iut-dhaka.edu" className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm group">
                      <Mail className="w-4 h-4 shrink-0" />
                      abrarhasan@iut-dhaka.edu
                    </a>
                    <a href="https://wa.me/8801793241773" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm">
                      <Phone className="w-4 h-4 shrink-0" />
                      +880 1793241773 (WhatsApp)
                    </a>
                  </div>
                </div>
              </Card>
            </section>

            {/* Back to home */}
            <div className="pt-4 pb-12">
              <Link href="/">
                <Button variant="outline" className="border-border/50 text-white hover:bg-accent/5 hover:border-accent/40 bg-transparent transition-all gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
