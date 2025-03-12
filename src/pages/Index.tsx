
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/Button';
import Navbar from '@/components/Navbar';

const Index = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  // Animate elements when they enter viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            entry.target.classList.remove('opacity-0');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      el.classList.add('opacity-0');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/50 to-transparent -z-10"></div>
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium animate-slide-down">
            Connect with people worldwide
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance animate-fade-in">
            Random video chats with<br className="hidden md:block" /> real people, in real time
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-8 text-balance animate-fade-in">
            ChatBubble connects you instantly with people around the world. 
            Have meaningful conversations or just have fun - it's up to you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link to="/chat">
              <Button 
                size="lg" 
                className="w-full sm:w-auto shadow-lg shadow-primary/20 font-medium"
              >
                Start a Random Chat
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto font-medium"
              onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        className="py-20 md:py-32 px-4 bg-accent/30"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-on-scroll">
              Simple. Secure. Instant.
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto animate-on-scroll">
              Our platform is designed to make connecting with others as seamless as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card p-6 animate-on-scroll">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="m22 8-6 4 6 4V8Z"></path>
                  <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Video Chat</h3>
              <p className="text-foreground/70">
                High-quality video calls with strangers from around the world using WebRTC technology.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 animate-on-scroll delay-100">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" x2="8" y1="13" y2="13"></line>
                  <line x1="16" x2="8" y1="17" y2="17"></line>
                  <line x1="10" x2="8" y1="9" y2="9"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Text Chat</h3>
              <p className="text-foreground/70">
                Exchange messages in real-time alongside your video call for enhanced communication.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 animate-on-scroll delay-200">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Matching</h3>
              <p className="text-foreground/70">
                Our advanced algorithm pairs you with another person in seconds for seamless connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-on-scroll">
              Getting Started is Easy
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto animate-on-scroll">
              No registration required. Just click and start chatting instantly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center animate-on-scroll">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-6 text-primary font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Click "Start Chatting"</h3>
              <p className="text-foreground/70">
                Visit our platform and click the button to enter the chat queue.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center animate-on-scroll delay-100">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-6 text-primary font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Allow Camera & Mic</h3>
              <p className="text-foreground/70">
                Give permission to use your camera and microphone for the video chat.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center animate-on-scroll delay-200">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-6 text-primary font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Connecting</h3>
              <p className="text-foreground/70">
                You'll be matched with someone random and can start your conversation immediately.
              </p>
            </div>
          </div>

          <div className="text-center mt-16 animate-on-scroll">
            <Link to="/chat">
              <Button 
                size="lg" 
                className="shadow-lg shadow-primary/20 font-medium"
              >
                Start Chatting Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-foreground/60">
              © 2023 ChatBubble. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-sm text-foreground/60 hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-foreground/60 hover:text-foreground">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-foreground/60 hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
