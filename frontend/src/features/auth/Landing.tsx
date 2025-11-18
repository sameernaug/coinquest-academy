/** @format */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowRight,
  BookOpen,
  Brain,
  TrendingUp,
  Trophy,
  Swords,
  BarChart3,
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/favicon.ico"
              alt="MoneyMaster"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-2xl font-bold text-black dark:text-white">
              MoneyMaster
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              How It Works
            </a>
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-primary hover:bg-primary/90">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight relative z-10">
            Learn Money, <br />
            <span className="text-primary">Earn Rewards,</span>
            <br />
            Build Your Future! 🚀
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto relative z-10">
            From piggy banks to stock markets - financial literacy made fun!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
              >
                Start Learning Free <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => {
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See How It Works
            </Button>
          </div>
          <div className="pt-8 text-6xl animate-bounce-in">💰🪙📈💎🏆</div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "1",
              icon: "📚",
              title: "Learn Finance",
              desc: "Fun, bite-sized lessons about money, saving, and investing",
            },
            {
              step: "2",
              icon: "💰",
              title: "Earn Rewards",
              desc: "Get virtual coins for every lesson, quiz, and achievement",
            },
            {
              step: "3",
              icon: "📈",
              title: "Trade & Compete",
              desc: "Practice with virtual stocks and challenge friends",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="relative p-8 bg-card rounded-2xl shadow-md hover-lift animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute -top-6 left-8 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                {item.step}
              </div>
              <div className="text-6xl mb-4 mt-2">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Everything You Need to Master Money
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: "Interactive Lessons",
                desc: "Learn through stories, games, and real-world scenarios",
              },
              {
                icon: Brain,
                title: "AI-Powered Quizzes",
                desc: "Test your knowledge and earn rewards instantly",
              },
              {
                icon: TrendingUp,
                title: "Virtual Stock Market",
                desc: "Practice trading with real-time price simulations",
              },
              {
                icon: Trophy,
                title: "Badges & Achievements",
                desc: "Unlock rewards as you progress through your journey",
              },
              {
                icon: Swords,
                title: "Quiz Battles",
                desc: "Challenge friends and compete for prizes",
              },
              {
                icon: BarChart3,
                title: "Track Progress",
                desc: "See your growth with detailed analytics",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-card rounded-xl shadow-md hover-lift"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          What Students Say
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: "Priya, 12",
              text: '"I learned how to save for my bicycle! This app makes money fun!" 🚲',
              avatar: "👧",
            },
            {
              name: "Arjun, 14",
              text: '"I\'m beating my friends in stock trading competitions! So cool!" 📈',
              avatar: "👦",
            },
            {
              name: "Sneha, 11",
              text: '"Now I understand why my parents budget. The tools are amazing!" 💡',
              avatar: "👧",
            },
          ].map((testimonial, i) => (
            <div key={i} className="p-6 bg-card rounded-xl shadow-md">
              <div className="text-5xl mb-4">{testimonial.avatar}</div>
              <p className="text-muted-foreground mb-4 italic">
                "{testimonial.text}"
              </p>
              <p className="font-semibold">- {testimonial.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-gradient-primary py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Master Money?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students learning financial literacy!
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Your Journey Free <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 MoneyMaster. Making financial literacy fun for everyone.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
