import { useState, useRef, useEffect } from 'react';
import { Send, Settings, Loader2, User, Bot, FileText, Clock, Save, Upload, Plus } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { generateNarrative, DataOperation } from '@/services/aiService';
import { ExternalNews, Competitor, OperationTask, InnovationProject } from '@/data/mockData';
import { checkMonthChange, generateMonthlyCashFlow } from '@/services/calculationService';

function calculateDerivedData(store: ReturnType<typeof useGameStore.getState>) {
  const finance = store.finance;
  const financeHistory = store.financeHistory;
  
  if (finance) {
    const profit = finance.revenue - finance.expenses;
    const profitMargin = finance.revenue > 0 ? (profit / finance.revenue) * 100 : 0;
    const cashBalance = finance.cash + finance.investments - finance.debt;
    
    const lastQuarter = financeHistory.length > 0 ? financeHistory[financeHistory.length - 1] : null;
    const revenueGrowth = lastQuarter && lastQuarter.revenue > 0 
      ? ((finance.revenue - lastQuarter.revenue) / lastQuarter.revenue) * 100 
      : 0;
    const expenseGrowth = lastQuarter && lastQuarter.expenses > 0 
      ? ((finance.expenses - lastQuarter.expenses) / lastQuarter.expenses) * 100 
      : 0;
    
    store.setFinance({
      ...finance,
      profit,
      profitMargin,
      cashBalance,
      revenueGrowth,
      expenseGrowth,
    });
  }
  
  const company = store.company;
  if (company) {
    store.setCompany({
      ...company,
    });
  }
}

function applyDataOperations(operations: DataOperation[]) {
  const store = useGameStore.getState();
  
  operations.forEach((op) => {
    switch (op.type) {
      case 'modify':
        if (op.target === 'company' && store.company) {
          store.setCompany({ ...store.company, ...(op.data as Record<string, unknown>) });
        } else if (op.target === 'finance' && store.finance) {
          store.setFinance({ ...store.finance, ...(op.data as Record<string, unknown>) });
        } else if (op.target === 'npcs') {
          const updates = op.data as Record<string, unknown>;
          if (updates.npcId && typeof updates.npcId === 'string') {
            store.updateNPC(updates.npcId, updates as any);
          }
        } else if (op.target === 'playerInfo' && store.playerInfo) {
          const updates = op.data as Record<string, unknown>;
          if (updates.personalCash !== undefined) {
            const cashChange = typeof updates.personalCash === 'number' 
              ? updates.personalCash - store.playerInfo.personalCash 
              : 0;
            if (cashChange !== 0) {
              store.updatePersonalCash(cashChange);
            }
          }
          store.setPlayerInfo({ ...store.playerInfo, ...updates } as any);
        }
        break;
      case 'add':
        if (op.target === 'products') {
          const newProducts = [...store.products, ...(op.data as Record<string, unknown>[])];
          store.setProducts(newProducts as any);
        } else if (op.target === 'employees') {
          const newEmployees = [...store.employees, ...(op.data as Record<string, unknown>[])];
          store.setEmployees(newEmployees as any);
        } else if (op.target === 'strategies') {
          const newStrategies = [...store.strategies, ...(op.data as Record<string, unknown>[])];
          store.setStrategies(newStrategies as any);
        } else if (op.target === 'news') {
          const newNews = [...store.news, ...(op.data as ExternalNews[])];
          store.setNews(newNews);
        } else if (op.target === 'competitors') {
          const newCompetitors = [...store.competitors, ...(op.data as Competitor[])];
          store.setCompetitors(newCompetitors);
        } else if (op.target === 'operations') {
          const newOperations = [...store.operations, ...(op.data as OperationTask[])];
          store.setOperations(newOperations);
        } else if (op.target === 'innovations') {
          const newInnovations = [...store.innovations, ...(op.data as InnovationProject[])];
          store.setInnovations(newInnovations);
        }
        break;
      case 'delete':
        if (op.target === 'products') {
          const productIds = op.data as string[];
          const filteredProducts = store.products.filter((p) => !productIds.includes(p.id));
          store.setProducts(filteredProducts);
        } else if (op.target === 'employees') {
          const employeeIds = op.data as string[];
          const filteredEmployees = store.employees.filter((e) => !employeeIds.includes(e.id));
          store.setEmployees(filteredEmployees);
        } else if (op.target === 'news') {
          const newsIds = op.data as string[];
          const filteredNews = store.news.filter((n) => !newsIds.includes(n.id));
          store.setNews(filteredNews);
        } else if (op.target === 'operations') {
          const operationIds = op.data as string[];
          const filteredOperations = store.operations.filter((o) => !operationIds.includes(o.id));
          store.setOperations(filteredOperations);
        }
        break;
    }
  });
  
  calculateDerivedData(store);
}

export default function NarrativePanel() {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    chatMessages,
    addChatMessage,
    setIsAIProcessing,
    isAIProcessing,
    narrativeText,
    setNarrativeText,
    aiSettings,
    openModal,
    company,
    products,
    finance,
    employees,
    strategies,
    news,
    competitors,
    operations,
    innovations,
    npcs,
    gameTime,
    playerInfo,
    setGameTime,
    setIsDataGenerated,
    contextSummary,
    setContextSummary,
  } = useGameStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSaveGame = () => {
    const store = useGameStore.getState();
    const saveData = store.saveGame();
    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `savegame_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadGame = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const store = useGameStore.getState();
      const success = store.loadGame(content);
      if (success) {
        alert('存档加载成功');
      } else {
        alert('存档加载失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleNewGame = () => {
    if (confirm('确定要开启新游戏吗？当前进度将丢失。')) {
      const store = useGameStore.getState();
      const aiSettings = store.aiSettings;
      const timeSettings = store.timeSettings;
      store.resetGame();
      store.setAISettings(aiSettings);
      store.setTimeSettings(timeSettings);
    }
  };

  const getRecentMessages = () => {
    if (chatMessages.length === 0) return [];
    const assistantMessages = chatMessages.filter(m => m.role === 'assistant');
    return assistantMessages.slice(-4).map(m => m.content);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isAIProcessing) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputValue.trim(),
      timestamp: new Date().toLocaleString('zh-CN'),
    };

    addChatMessage(userMessage);
    setInputValue('');
    setIsAIProcessing(true);

    try {
      const gameData = {
        company,
        products: products.slice(0, 5),
        finance,
        employees: employees.slice(0, 10),
        strategies,
        news: news.slice(0, 5),
        competitors: competitors.slice(0, 5),
        operations: operations.slice(0, 5),
        innovations: innovations.slice(0, 3),
        npcs: npcs.slice(0, 5).map(n => ({
          id: n.id,
          name: n.name,
          role: n.role,
          company: n.company,
          relationship: n.relationship,
          systemPrompt: n.systemPrompt,
        })),
        playerInfo: playerInfo ? {
          id: playerInfo.id,
          name: playerInfo.name,
          title: playerInfo.title,
          personalCash: playerInfo.personalCash,
          totalAssets: playerInfo.totalAssets,
          netWorth: playerInfo.netWorth,
        } : null,
        gameTime,
      };

      const recentMessages = getRecentMessages();

      const response = await generateNarrative(inputValue.trim(), gameData, {
        contextSummary: contextSummary,
        recentMessages: recentMessages,
      });

      setNarrativeText(response.narrative);

      if (response.contextSummary) {
        setContextSummary(response.contextSummary);
      }

      if (response.newTime) {
        const previousTime = gameTime;
        setGameTime(response.newTime);
        
        if (checkMonthChange(response.newTime, previousTime)) {
          generateMonthlyCashFlow();
          console.log('过月了，已更新现金流数据');
        }
        
        setIsDataGenerated(true);
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response.narrative,
        timestamp: new Date().toLocaleString('zh-CN'),
      };

      addChatMessage(aiMessage);

      if (response.operations && response.operations.length > 0) {
        applyDataOperations(response.operations);
        console.log('数据操作已应用:', response.operations);
      }
    } catch (error) {
      console.error('AI调用失败:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'AI服务暂时不可用，请稍后重试',
        timestamp: new Date().toLocaleString('zh-CN'),
      };
      addChatMessage(errorMessage);
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasApiKey = aiSettings.apiKey.length > 0;

  return (
    <div className="flex flex-col h-full bg-secondary/50 backdrop-blur-lg border-l border-white/10">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-gold to-accent-green rounded-lg flex items-center justify-center">
            <FileText className="text-primary" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">游戏叙事</h2>
            <p className="text-xs text-text-secondary">
              {hasApiKey ? 'AI服务已连接' : '请配置AI服务'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-blue/10 rounded-lg border border-accent-blue/20">
            <Clock className="text-accent-blue" size={14} />
            <span className="text-sm text-accent-blue font-mono">{gameTime}</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleLoadGame}
            className="hidden"
          />
          <button
            onClick={handleSaveGame}
            title="保存游戏"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Save className="text-text-secondary" size={18} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="读取存档"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Upload className="text-text-secondary" size={18} />
          </button>
          <button
            onClick={handleNewGame}
            title="新游戏"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Plus className="text-text-secondary" size={18} />
          </button>
          <button
            onClick={() => openModal('ai-settings')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Settings className="text-text-secondary" size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4 scrollbar-thin">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="text-text-muted mb-4" size={48} />
            <p className="text-text-secondary mb-2">欢迎来到星辰科技集团</p>
            <p className="text-text-muted text-sm">输入您的决策指令，AI将为您推演企业发展</p>
            {!hasApiKey && (
              <button
                onClick={() => openModal('ai-settings')}
                className="mt-4 px-4 py-2 bg-accent-gold/20 text-accent-gold rounded-lg hover:bg-accent-gold/30 transition-colors"
              >
                配置AI服务
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-accent-blue/20'
                      : 'bg-accent-green/20'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="text-accent-blue" size={16} />
                  ) : (
                    <Bot className="text-accent-green" size={16} />
                  )}
                </div>
                <div
                  className={`max-w-[85%] ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-xl ${
                      message.role === 'user'
                        ? 'bg-accent-blue/20 text-white rounded-tr-sm'
                        : 'bg-white/5 text-text-secondary rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {narrativeText && chatMessages.length > 0 && (
        <div className="p-4 border-t border-white/10">
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-accent-gold mb-2 flex items-center gap-2">
              <FileText size={14} />
              叙事正文
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
              {narrativeText}
            </p>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasApiKey ? '输入您的决策指令...' : '请先配置AI服务'}
              disabled={!hasApiKey || isAIProcessing}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors resize-none h-20 disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || !hasApiKey || isAIProcessing}
            className="px-4 py-3 bg-accent-gold/20 text-accent-gold rounded-xl hover:bg-accent-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAIProcessing ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
            <span className="hidden sm:inline">{isAIProcessing ? '推演中...' : '发送'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}