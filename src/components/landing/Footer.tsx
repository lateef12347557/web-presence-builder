import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-sidebar border-t border-sidebar-border py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-sidebar-foreground">LeadFinder</span>
            </Link>
            <p className="text-sm text-sidebar-foreground/60 leading-relaxed">
              AI-powered lead generation for web development agencies. 
              Find businesses that need websites and grow your client base.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sidebar-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">Features</a></li>
              <li><a href="#" className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">Integrations</a></li>
              <li><a href="#" className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sidebar-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">About</a></li>
              <li><a href="#" className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sidebar-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">CAN-SPAM Compliance</a></li>
              <li><a href="#" className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">TCPA Guidelines</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sidebar-border mt-12 pt-8 text-center">
          <p className="text-sm text-sidebar-foreground/40">
            © 2024 LeadFinder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
