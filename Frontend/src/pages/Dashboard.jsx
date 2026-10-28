import StatsCards from "../components/StatsCards";
import CropsOverview from "../components/CropsOverview";
import WeatherAlerts from "../components/WeatherAlerts";
import AIAdvisory from "../components/AIAdvisory";
import MarketPrices from "../components/MarketPrices";
import QuickActions from "../components/QuickActions";
import PricePrediction from "../components/PricePrediction";
import NearbyStorage from "../components/NearbyStorage";
import GovtSchemes from "../components/GovtSchemes";
import VoiceAssistant from "../components/VoiceAssistant";
import Footer from "../components/Footer";

function Dashboard() {
  return (
    <div className="space-y-6">
      <StatsCards />
      <CropsOverview />
      <div className="grid grid-cols-2 gap-6">
        <WeatherAlerts />
        <AIAdvisory />
      </div>
      <MarketPrices />
      <VoiceAssistant />
      <QuickActions />
      <PricePrediction />
      <NearbyStorage />
      <GovtSchemes />
      <Footer />
    </div>
  );
}

export default Dashboard;