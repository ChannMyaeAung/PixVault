import HeroPage from "@/components/hero";
import Navbar from "@/components/navbar";

export default async function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <main className="flex grow flex-col items-center justify-center text-center px-6 py-20 md:py-32">
        <HeroPage />
      </main>
    </div>
  );
}
