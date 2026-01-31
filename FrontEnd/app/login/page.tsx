'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chrome, ArrowLeft, Code2, Users, Trophy, Sparkles, AlertCircle } from 'lucide-react';
import { ScrollToTop } from '@/components/scroll-to-top';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithGoogle, user, profile, isLoading: authLoading } = useAuth();

  // Check for error in URL params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'auth_callback_error') {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.role === 'admin') {
        router.push('/admin');
      } else if (profile.is_registered) {
        router.push('/team-dashboard');
      } else {
        router.push('/team-registration');
      }
    }
  }, [user, profile, authLoading, router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Animated Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-48 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[100px]"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      {/* Content */}
      <div className="relative w-full max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Main Card */}
        <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-8 space-y-8 shadow-2xl shadow-accent/5 relative overflow-hidden">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>
          
          {/* Logo Section */}
          <div className="relative text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/30 rounded-2xl blur-xl animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl flex items-center justify-center border border-accent/40 shadow-lg shadow-accent/20">
                  <Image 
                    src="/iutcs-logo.png" 
                    alt="IUTCS Logo" 
                    width={56} 
                    height={56}
                    className="w-14 h-auto drop-shadow-lg"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
                IUTCS
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-accent/50"></div>
                <p className="text-accent font-medium tracking-wide">Code Sprint 2026</p>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-accent/50"></div>
              </div>
            </div>
          </div>

          {/* Features badges */}
          <div className="relative flex justify-center gap-3">
            {[
              { icon: Code2, label: 'Code' },
              { icon: Users, label: 'Collaborate' },
              { icon: Trophy, label: 'Compete' },
            ].map((item, idx) => (
              <div 
                key={item.label}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-background/50 rounded-full border border-border/50 text-xs text-muted-foreground"
              >
                <item.icon className="w-3 h-3 text-accent" />
                {item.label}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="relative flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form Section */}
          <div className="relative space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">Welcome, Coder!</h2>
            </div>

            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-white/90 text-black border-0 h-14 text-base font-semibold flex items-center justify-center gap-3 transition-all shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
          </div>

         

          {/* Info */}
          <div className="relative text-center text-sm text-muted-foreground">
            <p>Sign in with your Google account to register your team or access your dashboard.</p>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground space-y-3">
          <p className="text-xs">By signing in, you agree to our</p>
          <div className="flex items-center justify-center gap-3 text-xs">
            <a href="#" className="hover:text-accent transition-colors underline underline-offset-4 decoration-border hover:decoration-accent">Terms of Service</a>
            <span className="text-border">•</span>
            <a href="#" className="hover:text-accent transition-colors underline underline-offset-4 decoration-border hover:decoration-accent">Privacy Policy</a>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
