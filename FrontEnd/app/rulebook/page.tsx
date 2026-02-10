'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface RulebookData {
  id: string;
  link: string;
  published: boolean;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function RulebookPage() {
  const [rulebook, setRulebook] = useState<RulebookData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRulebook = async () => {
      try {
        const { data, error } = await supabase
          .from('rulebook')
          .select('*')
          .single();

        if (data && !error) {
          setRulebook(data);
          // If published and has a link, open in new tab and go to landing page
          if (data.published && data.link) {
            window.open(data.link, '_blank');
            window.location.href = `${basePath}/`;
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching rulebook:', err);
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

  // If published with a link, show a fallback with manual link (in case redirect is slow)
  if (rulebook?.published && rulebook.link) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-48 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>

        <nav className="border-b border-border/50 sticky top-0 z-40 bg-background/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-8 text-center space-y-6 shadow-2xl shadow-accent/10">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 rounded-lg pointer-events-none"></div>

              <div className="relative flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/30 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-accent/20 to-accent/5 rounded-full flex items-center justify-center border-2 border-accent/50 shadow-lg shadow-accent/20">
                    <BookOpen className="w-12 h-12 text-accent" />
                  </div>
                </div>
              </div>

              <div className="relative space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">Redirecting...</h1>
                <p className="text-muted-foreground">You are being redirected to the rulebook. If not redirected automatically, click below.</p>
              </div>

              <div className="relative space-y-3 pt-4">
                <a href={rulebook.link} target="_blank" rel="noopener noreferrer" className="w-full block">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white h-12 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Open Rulebook
                  </Button>
                </a>
                <Link href="/" className="w-full block">
                  <Button variant="outline" className="w-full border-border/50 text-white hover:bg-accent/5 hover:border-accent/30 h-12 bg-transparent transition-all gap-2">
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

  // Rulebook not published yet
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-48 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <nav className="border-b border-border/50 sticky top-0 z-40 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

            <div className="relative space-y-3 pt-4">
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
