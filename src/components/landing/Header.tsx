import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-sidebar/80 backdrop-blur-md border-b border-sidebar-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">LeadFinder</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
              Pricing
            </a>
            <a href="#" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
              Documentation
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent">
                Sign In
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="hero" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
