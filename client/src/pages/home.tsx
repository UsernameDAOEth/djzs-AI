import { Hero } from "@/components/sections/hero";
import { SubscriptionGate } from "@/components/sections/subscription-gate";
import { Features } from "@/components/sections/features";
import { About } from "@/components/sections/about";
import { FAQ } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import DebugWalletStatus from "@/components/DebugWalletStatus";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a14] via-[#0e0b1f] to-[#0a0a14] -z-20"></div>
      <div className="starfield -z-10"></div>
      <div className="gradient-overlay fixed inset-0 -z-10"></div>

      <Hero />
      <SubscriptionGate />
      
      <div className="container mx-auto px-4 py-8">
        <DebugWalletStatus />
      </div>
      
      <Features />
      <About />
      <FAQ />
      <Footer />
    </div>
  );
}
