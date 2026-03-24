import { Navbar } from "@/components/landing/Navbar";
import { TickerBar } from "@/components/landing/TickerBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <TickerBar />
      <HeroSection />
      <div id="features">
        <FeaturesSection />
      </div>
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
