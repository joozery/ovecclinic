import { auth } from "@/auth";
import { Navbar } from "@/components/home/navbar";
import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { LatestActivities } from "@/components/home/latest-activities";
import { BannerSection } from "@/components/home/banner-section";
import { CalendarSection } from "@/components/home/calendar-section";
import { Footer } from "@/components/home/footer";
import { getSiteSetting } from "@/actions/site-settings";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session;
  const manualUrl = await getSiteSetting("manual_url");

  return (
    <div className="min-h-screen bg-white">
      <Navbar isLoggedIn={isLoggedIn} manualUrl={manualUrl} />
      <main>
        <Hero />
        <Stats />
        <CalendarSection />
        <LatestActivities />
        <BannerSection />
      </main>
      <Footer />
    </div>
  );
}
