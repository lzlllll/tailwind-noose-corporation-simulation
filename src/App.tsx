import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import NarrativePanel from '@/components/NarrativePanel';
import PersonalPanel from '@/components/PersonalPanel';
import Overview from '@/pages/Overview';
import Strategy from '@/pages/Strategy';
import Products from '@/pages/Products';
import Operations from '@/pages/Operations';
import Organization from '@/pages/Organization';
import Finance from '@/pages/Finance';
import CapitalMarket from '@/pages/CapitalMarket';
import Innovation from '@/pages/Innovation';
import External from '@/pages/External';
import NPC from '@/pages/NPC';
import GameStart from '@/pages/GameStart';
import { useGameStore } from '@/stores/gameStore';

const pages: Record<string, React.ComponentType> = {
  '/': Overview,
  '/strategy': Strategy,
  '/products': Products,
  '/operations': Operations,
  '/organization': Organization,
  '/finance': Finance,
  '/capital': CapitalMarket,
  '/innovation': Innovation,
  '/external': External,
  '/npc': NPC,
};

export default function App() {
  const currentPage = useGameStore((state) => state.currentPage);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const Page = pages[currentPage] || Overview;

  if (!gameStarted) {
    return <GameStart />;
  }

  return (
    <div className="flex min-h-screen bg-primary">
      <Sidebar />
      <div className="flex flex-1 min-h-screen mr-[450px]">
        <main className="flex-1 min-h-screen overflow-hidden">
          <div className="h-full overflow-auto">
            <Page />
          </div>
        </main>
      </div>
      <div className="fixed right-0 top-0 h-screen w-[450px] flex-shrink-0">
        <NarrativePanel />
      </div>
      <PersonalPanel />
      <Modal />
    </div>
  );
}