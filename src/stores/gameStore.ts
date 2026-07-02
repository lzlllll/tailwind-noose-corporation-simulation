import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asArray } from '@/lib/utils';
import {
  Company,
  Product,
  Employee,
  Finance,
  NPC,
  NPCMessage,
  OperationTask,
  InnovationProject,
  ExternalNews,
  Competitor,
  Supplier,
  BusinessLine,
  Market,
  Inventory,
  Factory,
  SupplyChain,
  Logistics,
  Subsidiary,
  CashFlowItem,
  Strategy,
  Shareholding,
  PlayerInfo,
  StockHolding,
  PersonalAsset
} from '@/data/mockData';

interface AISettings {
  apiKey: string;
  flashModel: string;
  proModel: string;
  apiBaseUrl: string;
  devMode: boolean;
}

interface TimeSettings {
  timezone: number;
  timezoneName: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface GameStore {
  currentPage: string;
  company: Company | null;
  products: Product[];
  employees: Employee[];
  finance: Finance | null;
  financeHistory: { quarter: string; revenue: number; expenses: number; profit: number }[];
  npcs: NPC[];
  operations: OperationTask[];
  innovations: InnovationProject[];
  news: ExternalNews[];
  competitors: Competitor[];
  suppliers: Supplier[];
  shareholdings: Shareholding[];
  departmentsData: { id: string; name: string; head: string; employees: number; budget: number }[];
  businessLines: BusinessLine[];
  markets: Market[];
  inventory: Inventory[];
  factories: Factory[];
  supplyChain: SupplyChain[];
  logistics: Logistics[];
  subsidiaries: Subsidiary[];
  cashFlow: CashFlowItem[];
  strategies: Strategy[];
  aiSettings: AISettings;
  timeSettings: TimeSettings;
  chatMessages: ChatMessage[];
  npcChatSummaries: { npcId: string; summary: string; timestamp: string }[];
  isAIProcessing: boolean;
  narrativeText: string;
  gameTime: string;
  previousGameTime: string;
  activeNPCId: string | null;
  isNPCChatting: boolean;
  modalOpen: boolean;
  modalContent: string;
  isDataGenerated: boolean;
  playerInfo: PlayerInfo | null;
  personalPanelOpen: boolean;
  gameStarted: boolean;
  contextSummary: string;
  memorySummaries: string[];
  initialSetup: {
    player: { name: string; age: string; gender: string; title: string; background: string } | null;
    company: { name: string; history: string; status: string; business: string; headquarters: string; startYear: string; startMonth: string; startDay: string } | null;
  };

  setCurrentPage: (page: string) => void;
  setCompany: (company: Company) => void;
  setProducts: (products: Product[]) => void;
  setEmployees: (employees: Employee[]) => void;
  setFinance: (finance: Finance) => void;
  setFinanceHistory: (financeHistory: { quarter: string; revenue: number; expenses: number; profit: number }[]) => void;
  setNPCs: (npcs: NPC[]) => void;
  updateNPC: (npcId: string, updates: Partial<NPC>) => void;
  addNPCMessage: (npcId: string, message: NPCMessage) => void;
  setOperations: (operations: OperationTask[]) => void;
  setInnovations: (innovations: InnovationProject[]) => void;
  setNews: (news: ExternalNews[]) => void;
  setCompetitors: (competitors: Competitor[]) => void;
  setSuppliers: (suppliers: Supplier[]) => void;
  setShareholdings: (shareholdings: Shareholding[]) => void;
  setDepartmentsData: (departmentsData: { id: string; name: string; head: string; employees: number; budget: number }[]) => void;
  setBusinessLines: (businessLines: BusinessLine[]) => void;
  setMarkets: (markets: Market[]) => void;
  setInventory: (inventory: Inventory[]) => void;
  setFactories: (factories: Factory[]) => void;
  setSupplyChain: (supplyChain: SupplyChain[]) => void;
  setLogistics: (logistics: Logistics[]) => void;
  setSubsidiaries: (subsidiaries: Subsidiary[]) => void;
  setCashFlow: (cashFlow: CashFlowItem[]) => void;
  setStrategies: (strategies: Strategy[]) => void;
  setAISettings: (settings: AISettings) => void;
  setTimeSettings: (settings: TimeSettings) => void;
  addChatMessage: (message: ChatMessage) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  addNPCChatSummary: (summary: { npcId: string; summary: string; timestamp: string }) => void;
  setIsAIProcessing: (processing: boolean) => void;
  setNarrativeText: (text: string) => void;
  setGameTime: (time: string) => void;
  setPreviousGameTime: (time: string) => void;
  setActiveNPCId: (npcId: string | null) => void;
  setIsNPCChatting: (chatting: boolean) => void;
  setIsDataGenerated: (generated: boolean) => void;
  openModal: (content: string) => void;
  closeModal: () => void;
  setPlayerInfo: (playerInfo: PlayerInfo) => void;
  updatePersonalCash: (amount: number) => void;
  addStockHolding: (holding: StockHolding) => void;
  updateStockHolding: (id: string, updates: Partial<StockHolding>) => void;
  removeStockHolding: (id: string) => void;
  addPersonalAsset: (asset: PersonalAsset) => void;
  removePersonalAsset: (id: string) => void;
  setPersonalPanelOpen: (open: boolean) => void;
  setGameStarted: (started: boolean) => void;
  setContextSummary: (summary: string) => void;
  setMemorySummaries: (summaries: string[]) => void;
  setInitialSetup: (setup: { player: any; company: any }) => void;
  resetGame: () => void;
  saveGame: () => string;
  loadGame: (saveData: string) => boolean;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set): GameStore => ({
      currentPage: '/',
      company: null,
      products: [],
      employees: [],
      finance: null,
      financeHistory: [],
      npcs: [],
      operations: [],
      innovations: [],
      news: [],
      competitors: [],
      suppliers: [],
      shareholdings: [],
      departmentsData: [],
      businessLines: [],
      markets: [],
      inventory: [],
      factories: [],
      supplyChain: [],
      logistics: [],
      subsidiaries: [],
      cashFlow: [],
      strategies: [],
      aiSettings: {
        apiKey: '',
        flashModel: 'gpt-4o-mini',
        proModel: 'gpt-4o',
        apiBaseUrl: 'https://api.openai.com/v1',
        devMode: false,
      },
      timeSettings: {
        timezone: 8,
        timezoneName: '东八区 (UTC+8)',
      },
      chatMessages: [],
      npcChatSummaries: [],
      isAIProcessing: false,
      narrativeText: '',
      gameTime: '',
      previousGameTime: '',
      activeNPCId: null,
      isNPCChatting: false,
      modalOpen: false,
      modalContent: '',
      isDataGenerated: false,
      playerInfo: null,
      personalPanelOpen: false,
      gameStarted: false,
      contextSummary: '',
      memorySummaries: [],
      initialSetup: {
        player: null,
        company: null,
      },

      setCurrentPage: (page) => set({ currentPage: page }),
      setCompany: (company) => set({
        company: company ? {
          ...company,
          shareholdings: asArray<Shareholding>(company.shareholdings),
        } : company
      }),
      setProducts: (products) => set({ products: asArray<Product>(products) }),
      setEmployees: (employees) => set({ employees: asArray<Employee>(employees) }),
      setFinance: (finance) => set({ finance }),
      setFinanceHistory: (financeHistory) => set({ financeHistory: asArray(financeHistory) }),
      setNPCs: (npcs) => set({
        npcs: asArray<NPC>(npcs).map((npc) => ({
          ...npc,
          chatHistory: asArray<NPCMessage>(npc.chatHistory),
          memory: asArray<string>(npc.memory),
        }))
      }),
      updateNPC: (npcId, updates) => set((state) => ({
        npcs: state.npcs.map((npc) =>
          npc.id === npcId
            ? {
              ...npc,
              ...updates,
              chatHistory: updates.chatHistory !== undefined
                ? asArray<NPCMessage>(updates.chatHistory)
                : npc.chatHistory,
              memory: updates.memory !== undefined
                ? asArray<string>(updates.memory)
                : npc.memory,
            }
            : npc
        ),
      })),
      addNPCMessage: (npcId, message) => set((state) => ({
        npcs: state.npcs.map((npc) =>
          npc.id === npcId
            ? { ...npc, chatHistory: [...asArray<NPCMessage>(npc.chatHistory), message] }
            : npc
        ),
      })),
      setOperations: (operations) => set({ operations: asArray<OperationTask>(operations) }),
      setInnovations: (innovations) => set({
        innovations: asArray<InnovationProject>(innovations).map((inn) => ({
          ...inn,
          team: asArray<string>(inn.team),
        }))
      }),
      setNews: (news) => set({ news: asArray<ExternalNews>(news) }),
      setCompetitors: (competitors) => set({ competitors: asArray<Competitor>(competitors) }),
      setSuppliers: (suppliers) => set({ suppliers: asArray<Supplier>(suppliers) }),
      setShareholdings: (shareholdings) => set({ shareholdings: asArray<Shareholding>(shareholdings) }),
      setDepartmentsData: (departmentsData) => set({ departmentsData: asArray(departmentsData) }),
      setBusinessLines: (businessLines) => set({
        businessLines: asArray<BusinessLine>(businessLines).map((bl) => ({
          ...bl,
          products: asArray<string>(bl.products),
        }))
      }),
      setMarkets: (markets) => set({ markets: asArray<Market>(markets) }),
      setInventory: (inventory) => set({ inventory: asArray<Inventory>(inventory) }),
      setFactories: (factories) => set({ factories: asArray<Factory>(factories) }),
      setSupplyChain: (supplyChain) => set({ supplyChain: asArray<SupplyChain>(supplyChain) }),
      setLogistics: (logistics) => set({ logistics: asArray<Logistics>(logistics) }),
      setSubsidiaries: (subsidiaries) => set({ subsidiaries: asArray<Subsidiary>(subsidiaries) }),
      setCashFlow: (cashFlow) => set({ cashFlow: asArray<CashFlowItem>(cashFlow) }),
      setStrategies: (strategies) => set({
        strategies: asArray<Strategy>(strategies).map((s) => ({
          ...s,
          objectives: asArray<string>(s.objectives),
          keyMetrics: asArray(s.keyMetrics),
        }))
      }),
      setAISettings: (aiSettings) => set({ aiSettings }),
      setTimeSettings: (timeSettings) => set({ timeSettings }),
      addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
      setChatMessages: (chatMessages) => set({ chatMessages: asArray<ChatMessage>(chatMessages) }),
      addNPCChatSummary: (summary) => set((state) => ({ npcChatSummaries: [...state.npcChatSummaries, summary] })),
      setIsAIProcessing: (isAIProcessing) => set({ isAIProcessing }),
      setNarrativeText: (narrativeText) => set({ narrativeText }),
      setGameTime: (gameTime) => set({ gameTime }),
      setPreviousGameTime: (previousGameTime) => set({ previousGameTime }),
      setActiveNPCId: (activeNPCId) => set({ activeNPCId }),
      setIsNPCChatting: (isNPCChatting) => set({ isNPCChatting }),
      setIsDataGenerated: (isDataGenerated) => set({ isDataGenerated }),
      openModal: (content) => set({ modalOpen: true, modalContent: content }),
      closeModal: () => set({ modalOpen: false, modalContent: '' }),
      setPlayerInfo: (playerInfo) => set({
        playerInfo: {
          ...playerInfo,
          personalAssets: asArray<PersonalAsset>(playerInfo.personalAssets),
          stockHoldings: asArray<StockHolding>(playerInfo.stockHoldings),
        }
      }),
      updatePersonalCash: (amount) => set((state) => {
        if (!state.playerInfo) return state;
        return {
          playerInfo: {
            ...state.playerInfo,
            personalCash: state.playerInfo.personalCash + amount,
            netWorth: state.playerInfo.netWorth + amount,
          }
        };
      }),
      addStockHolding: (holding) => set((state) => {
        if (!state.playerInfo) return state;
        return {
          playerInfo: {
            ...state.playerInfo,
            stockHoldings: [...asArray<StockHolding>(state.playerInfo.stockHoldings), holding],
          }
        };
      }),
      updateStockHolding: (id, updates) => set((state) => {
        if (!state.playerInfo) return state;
        return {
          playerInfo: {
            ...state.playerInfo,
            stockHoldings: asArray<StockHolding>(state.playerInfo.stockHoldings).map(h =>
              h.id === id ? { ...h, ...updates } : h
            ),
          }
        };
      }),
      removeStockHolding: (id) => set((state) => {
        if (!state.playerInfo) return state;
        return {
          playerInfo: {
            ...state.playerInfo,
            stockHoldings: asArray<StockHolding>(state.playerInfo.stockHoldings).filter(h => h.id !== id),
          }
        };
      }),
      addPersonalAsset: (asset) => set((state) => {
        if (!state.playerInfo) return state;
        return {
          playerInfo: {
            ...state.playerInfo,
            personalAssets: [...asArray<PersonalAsset>(state.playerInfo.personalAssets), asset],
            totalAssets: state.playerInfo.totalAssets + asset.value,
            netWorth: state.playerInfo.netWorth + asset.value,
          }
        };
      }),
      removePersonalAsset: (id) => set((state) => {
        if (!state.playerInfo) return state;
        const asset = asArray<PersonalAsset>(state.playerInfo.personalAssets).find(a => a.id === id);
        if (!asset) return state;
        return {
          playerInfo: {
            ...state.playerInfo,
            personalAssets: asArray<PersonalAsset>(state.playerInfo.personalAssets).filter(a => a.id !== id),
            totalAssets: state.playerInfo.totalAssets - asset.value,
            netWorth: state.playerInfo.netWorth - asset.value,
          }
        };
      }),
      setPersonalPanelOpen: (personalPanelOpen) => set({ personalPanelOpen }),
      setGameStarted: (gameStarted) => set({ gameStarted }),
      setContextSummary: (contextSummary) => set({ contextSummary }),
      setMemorySummaries: (memorySummaries) => set({ memorySummaries: asArray<string>(memorySummaries) }),
      setInitialSetup: (initialSetup) => set({ initialSetup }),
      resetGame: () => set({
        currentPage: '/',
        company: null,
        products: [],
        employees: [],
        finance: null,
        financeHistory: [],
        npcs: [],
        operations: [],
        innovations: [],
        news: [],
        competitors: [],
        suppliers: [],
        shareholdings: [],
        departmentsData: [],
        businessLines: [],
        markets: [],
        inventory: [],
        factories: [],
        supplyChain: [],
        logistics: [],
        subsidiaries: [],
        cashFlow: [],
        strategies: [],
        chatMessages: [],
        npcChatSummaries: [],
        isAIProcessing: false,
        narrativeText: '',
        gameTime: '',
        previousGameTime: '',
        activeNPCId: null,
        isNPCChatting: false,
        isDataGenerated: false,
        playerInfo: null,
        personalPanelOpen: false,
        gameStarted: false,
        contextSummary: '',
        memorySummaries: [],
      }),
      saveGame: () => {
        const state = useGameStore.getState();
        const saveData = {
          version: 1,
          savedAt: new Date().toISOString(),
          data: {
            currentPage: state.currentPage,
            company: state.company,
            products: state.products,
            employees: state.employees,
            finance: state.finance,
            financeHistory: state.financeHistory,
            npcs: state.npcs,
            operations: state.operations,
            innovations: state.innovations,
            news: state.news,
            competitors: state.competitors,
            suppliers: state.suppliers,
            shareholdings: state.shareholdings,
            departmentsData: state.departmentsData,
            businessLines: state.businessLines,
            markets: state.markets,
            inventory: state.inventory,
            factories: state.factories,
            supplyChain: state.supplyChain,
            logistics: state.logistics,
            subsidiaries: state.subsidiaries,
            cashFlow: state.cashFlow,
            strategies: state.strategies,
            aiSettings: state.aiSettings,
            timeSettings: state.timeSettings,
            chatMessages: state.chatMessages,
            npcChatSummaries: state.npcChatSummaries,
            narrativeText: state.narrativeText,
            gameTime: state.gameTime,
            previousGameTime: state.previousGameTime,
            isDataGenerated: state.isDataGenerated,
            playerInfo: state.playerInfo,
            gameStarted: state.gameStarted,
            contextSummary: state.contextSummary,
            memorySummaries: state.memorySummaries,
          },
        };
        return JSON.stringify(saveData);
      },
      loadGame: (saveData: string) => {
        try {
          const parsed = JSON.parse(saveData);
          if (!parsed.version || !parsed.data) return false;
          const data = parsed.data;
          set({
            currentPage: data.currentPage || '/',
            company: data.company ? {
              ...data.company,
              shareholdings: asArray<Shareholding>(data.company.shareholdings),
            } : null,
            products: asArray<Product>(data.products),
            employees: asArray<Employee>(data.employees),
            finance: data.finance || null,
            financeHistory: asArray(data.financeHistory),
            npcs: asArray<NPC>(data.npcs).map((npc: NPC) => ({
              ...npc,
              chatHistory: asArray<NPCMessage>(npc.chatHistory),
              memory: asArray<string>(npc.memory),
            })),
            operations: asArray<OperationTask>(data.operations),
            innovations: asArray<InnovationProject>(data.innovations).map((inn: InnovationProject) => ({
              ...inn,
              team: asArray<string>(inn.team),
            })),
            news: asArray<ExternalNews>(data.news),
            competitors: asArray<Competitor>(data.competitors),
            suppliers: asArray<Supplier>(data.suppliers),
            shareholdings: asArray<Shareholding>(data.shareholdings),
            departmentsData: asArray(data.departmentsData),
            businessLines: asArray<BusinessLine>(data.businessLines).map((bl: BusinessLine) => ({
              ...bl,
              products: asArray<string>(bl.products),
            })),
            markets: asArray<Market>(data.markets),
            inventory: asArray<Inventory>(data.inventory),
            factories: asArray<Factory>(data.factories),
            supplyChain: asArray<SupplyChain>(data.supplyChain),
            logistics: asArray<Logistics>(data.logistics),
            subsidiaries: asArray<Subsidiary>(data.subsidiaries),
            cashFlow: asArray<CashFlowItem>(data.cashFlow),
            strategies: asArray<Strategy>(data.strategies).map((s: Strategy) => ({
              ...s,
              objectives: asArray<string>(s.objectives),
              keyMetrics: asArray(s.keyMetrics),
            })),
            aiSettings: data.aiSettings ? {
              ...data.aiSettings,
              devMode: data.aiSettings.devMode ?? false,
            } : {
              apiKey: '',
              flashModel: 'gpt-4o-mini',
              proModel: 'gpt-4o',
              apiBaseUrl: 'https://api.openai.com/v1',
              devMode: false,
            },
            timeSettings: data.timeSettings || {
              timezone: 8,
              timezoneName: '东八区 (UTC+8)',
            },
            chatMessages: asArray(data.chatMessages),
            npcChatSummaries: asArray(data.npcChatSummaries),
            narrativeText: data.narrativeText || '',
            gameTime: data.gameTime || '',
            previousGameTime: data.previousGameTime || '',
            isDataGenerated: data.isDataGenerated || false,
            playerInfo: data.playerInfo ? {
              ...data.playerInfo,
              personalAssets: asArray<PersonalAsset>(data.playerInfo.personalAssets),
              stockHoldings: asArray<StockHolding>(data.playerInfo.stockHoldings),
            } : null,
            gameStarted: data.gameStarted !== undefined ? data.gameStarted : true,
            contextSummary: data.contextSummary || '',
            memorySummaries: asArray<string>(data.memorySummaries),
          });
          return true;
        } catch (e) {
          console.error('加载存档失败:', e);
          return false;
        }
      },
    }),
    {
      name: 'game-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        aiSettings: state.aiSettings,
        timeSettings: state.timeSettings,
        gameStarted: state.gameStarted,
        company: state.company,
        products: state.products,
        employees: state.employees,
        finance: state.finance,
        financeHistory: state.financeHistory,
        npcs: state.npcs,
        operations: state.operations,
        innovations: state.innovations,
        news: state.news,
        competitors: state.competitors,
        suppliers: state.suppliers,
        shareholdings: state.shareholdings,
        departmentsData: state.departmentsData,
        businessLines: state.businessLines,
        markets: state.markets,
        inventory: state.inventory,
        factories: state.factories,
        supplyChain: state.supplyChain,
        logistics: state.logistics,
        subsidiaries: state.subsidiaries,
        cashFlow: state.cashFlow,
        strategies: state.strategies,
        chatMessages: state.chatMessages,
        npcChatSummaries: state.npcChatSummaries,
        narrativeText: state.narrativeText,
        gameTime: state.gameTime,
        previousGameTime: state.previousGameTime,
        isDataGenerated: state.isDataGenerated,
        playerInfo: state.playerInfo,
        contextSummary: state.contextSummary,
        memorySummaries: state.memorySummaries,
        currentPage: state.currentPage,
        initialSetup: state.initialSetup,
      }),
    }
  )
);
