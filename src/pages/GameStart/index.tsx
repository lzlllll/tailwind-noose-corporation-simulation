import { useState } from 'react';
import {
  User, Building, Calendar, MapPin, Sparkles, Settings,
  FileText, Wand2, Loader2
} from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { generateInitialData, generateInitialGameData } from '@/services/aiService';
import { PlayerInfo } from '@/data/mockData';

interface PlayerFormData {
  name: string;
  age: string;
  gender: string;
  title: string;
  background: string;
}

interface CompanyFormData {
  name: string;
  history: string;
  status: string;
  business: string;
  headquarters: string;
  startYear: string;
  startMonth: string;
  startDay: string;
}

interface AISettingsForm {
  apiKey: string;
  flashModel: string;
  proModel: string;
  apiBaseUrl: string;
}

export default function GameStart() {
  const {
    setPlayerInfo, setCompany, setGameTime, setGameStarted,
    setProducts, setEmployees, setFinance, setNPCs, setNews,
    setCompetitors, setSuppliers, setShareholdings, setStrategies,
    aiSettings, setAISettings
  } = useGameStore();

  const [playerData, setPlayerData] = useState<PlayerFormData>({
    name: '',
    age: '',
    gender: 'male',
    title: '',
    background: '',
  });

  const [companyData, setCompanyData] = useState<CompanyFormData>({
    name: '',
    history: '',
    status: '',
    business: '',
    headquarters: '',
    startYear: '',
    startMonth: '',
    startDay: '',
  });

  const [aiForm, setAiForm] = useState<AISettingsForm>({
    apiKey: aiSettings.apiKey,
    flashModel: aiSettings.flashModel,
    proModel: aiSettings.proModel,
    apiBaseUrl: aiSettings.apiBaseUrl,
  });

  const [quickImportText, setQuickImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  const handlePlayerChange = (field: keyof PlayerFormData, value: string) => {
    setPlayerData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanyChange = (field: keyof CompanyFormData, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleAIChange = (field: keyof AISettingsForm, value: string) => {
    setAiForm(prev => ({ ...prev, [field]: value }));
  };

  const handleQuickImport = async () => {
    if (!quickImportText.trim()) {
      alert('请输入或粘贴开局描述文字');
      return;
    }
    if (!aiForm.apiKey.trim()) {
      setShowAiPanel(true);
      alert('请先配置AI服务API密钥');
      return;
    }

    setAISettings({
      apiKey: aiForm.apiKey,
      flashModel: aiForm.flashModel,
      proModel: aiForm.proModel,
      apiBaseUrl: aiForm.apiBaseUrl,
    });

    setIsImporting(true);

    try {
      const defaultPlayer = {
        name: '',
        age: '',
        gender: '男',
        title: '',
        background: quickImportText,
      };

      const defaultCompany = {
        name: '',
        history: quickImportText,
        status: '',
        business: '',
        headquarters: '',
        startYear: '',
        startMonth: '',
        startDay: '',
      };

      const initData = await generateInitialGameData(defaultPlayer, defaultCompany);

      useGameStore.getState().setInitialSetup({
        player: defaultPlayer,
        company: defaultCompany,
      });

      if (initData.company && Object.keys(initData.company).length > 0) {
        useGameStore.getState().setCompany(initData.company as any);
      }

      if (initData.playerInfo && Object.keys(initData.playerInfo).length > 0) {
        useGameStore.getState().setPlayerInfo(initData.playerInfo as unknown as PlayerInfo);
      }

      if (initData.products && initData.products.length > 0) {
        useGameStore.getState().setProducts(initData.products as any);
      }

      if (initData.employees && initData.employees.length > 0) {
        useGameStore.getState().setEmployees(initData.employees as any);
      }

      if (initData.finance && Object.keys(initData.finance).length > 0) {
        useGameStore.getState().setFinance(initData.finance as any);
      }

      if (initData.strategies && initData.strategies.length > 0) {
        useGameStore.getState().setStrategies(initData.strategies as any);
      }

      if (initData.operations && initData.operations.length > 0) {
        useGameStore.getState().setOperations(initData.operations as any);
      }

      if (initData.innovations && initData.innovations.length > 0) {
        useGameStore.getState().setInnovations(initData.innovations as any);
      }

      if (initData.news && initData.news.length > 0) {
        useGameStore.getState().setNews(initData.news as any);
      }

      if (initData.competitors && initData.competitors.length > 0) {
        useGameStore.getState().setCompetitors(initData.competitors as any);
      }

      if (initData.npcs && initData.npcs.length > 0) {
        useGameStore.getState().setNPCs(initData.npcs as any);
      }

      if (initData.shareholdings && initData.shareholdings.length > 0) {
        useGameStore.getState().setShareholdings(initData.shareholdings as any);
      }

      if (initData.suppliers && initData.suppliers.length > 0) {
        useGameStore.getState().setSuppliers(initData.suppliers as any);
      }

      if (initData.businessLines && initData.businessLines.length > 0) {
        useGameStore.getState().setBusinessLines(initData.businessLines as any);
      }

      if (initData.markets && initData.markets.length > 0) {
        useGameStore.getState().setMarkets(initData.markets as any);
      }

      if (initData.newTime) {
        useGameStore.getState().setGameTime(initData.newTime);
      }

      if (initData.narrative) {
        useGameStore.getState().setNarrativeText(initData.narrative);
        useGameStore.getState().addChatMessage({
          id: Date.now().toString(),
          role: 'assistant',
          content: initData.narrative,
          timestamp: new Date().toLocaleString('zh-CN'),
        });
      }

      useGameStore.getState().setIsDataGenerated(true);
      useGameStore.getState().setGameStarted(true);
    } catch (error: any) {
      console.error('快速导入失败:', error);
      const errorMsg = error?.message || '未知错误';
      alert(`导入失败：${errorMsg}\n请检查AI配置或网络连接`);
      useGameStore.getState().resetGame();
    } finally {
      setIsImporting(false);
    }
  };

  const handleStartGame = async () => {
    if (!playerData.name.trim()) {
      alert('请输入玩家姓名');
      return;
    }
    if (!companyData.name.trim()) {
      alert('请输入公司名称');
      return;
    }
    if (!aiForm.apiKey.trim()) {
      alert('请先配置AI服务API密钥');
      return;
    }

    setAISettings({
      apiKey: aiForm.apiKey,
      flashModel: aiForm.flashModel,
      proModel: aiForm.proModel,
      apiBaseUrl: aiForm.apiBaseUrl,
    });

    useGameStore.getState().setInitialSetup({
      player: playerData,
      company: companyData,
    });

    setIsStarting(true);

    try {
      const initData = await generateInitialGameData(playerData, companyData);

      if (initData.company && Object.keys(initData.company).length > 0) {
        useGameStore.getState().setCompany(initData.company as any);
      }

      if (initData.playerInfo && Object.keys(initData.playerInfo).length > 0) {
        useGameStore.getState().setPlayerInfo(initData.playerInfo as unknown as PlayerInfo);
      }

      if (initData.products && initData.products.length > 0) {
        useGameStore.getState().setProducts(initData.products as any);
      }

      if (initData.employees && initData.employees.length > 0) {
        useGameStore.getState().setEmployees(initData.employees as any);
      }

      if (initData.finance && Object.keys(initData.finance).length > 0) {
        useGameStore.getState().setFinance(initData.finance as any);
      }

      if (initData.strategies && initData.strategies.length > 0) {
        useGameStore.getState().setStrategies(initData.strategies as any);
      }

      if (initData.operations && initData.operations.length > 0) {
        useGameStore.getState().setOperations(initData.operations as any);
      }

      if (initData.innovations && initData.innovations.length > 0) {
        useGameStore.getState().setInnovations(initData.innovations as any);
      }

      if (initData.news && initData.news.length > 0) {
        useGameStore.getState().setNews(initData.news as any);
      }

      if (initData.competitors && initData.competitors.length > 0) {
        useGameStore.getState().setCompetitors(initData.competitors as any);
      }

      if (initData.npcs && initData.npcs.length > 0) {
        useGameStore.getState().setNPCs(initData.npcs as any);
      }

      if (initData.shareholdings && initData.shareholdings.length > 0) {
        useGameStore.getState().setShareholdings(initData.shareholdings as any);
      }

      if (initData.suppliers && initData.suppliers.length > 0) {
        useGameStore.getState().setSuppliers(initData.suppliers as any);
      }

      if (initData.businessLines && initData.businessLines.length > 0) {
        useGameStore.getState().setBusinessLines(initData.businessLines as any);
      }

      if (initData.markets && initData.markets.length > 0) {
        useGameStore.getState().setMarkets(initData.markets as any);
      }

      if (initData.newTime) {
        useGameStore.getState().setGameTime(initData.newTime);
      }

      if (initData.narrative) {
        useGameStore.getState().setNarrativeText(initData.narrative);
        useGameStore.getState().addChatMessage({
          id: Date.now().toString(),
          role: 'assistant',
          content: initData.narrative,
          timestamp: new Date().toLocaleString('zh-CN'),
        });
      }

      useGameStore.getState().setIsDataGenerated(true);
      useGameStore.getState().setGameStarted(true);
    } catch (error: any) {
      console.error('游戏初始化失败:', error);
      const errorMsg = error?.message || '未知错误';
      alert(`游戏初始化失败：${errorMsg}\n请检查AI配置或网络连接`);
      useGameStore.getState().resetGame();
      setIsStarting(false);
    }
  };

  const genders = [
    { value: 'male', label: '男' },
    { value: 'female', label: '女' },
    { value: 'other', label: '其他' },
  ];

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: `${i + 1}月`,
  }));

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: `${i + 1}日`,
  }));

  const steps = [
    { id: 0, label: '快速导入', icon: FileText },
    { id: 1, label: '角色信息', icon: User },
    { id: 2, label: '公司信息', icon: Building },
    { id: 3, label: '开局设置', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-8 overflow-y-auto">
      <div className="w-full max-w-3xl py-8">
        <div className="text-center mb-8 relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-accent-gold" />
            <h1 className="text-3xl font-bold text-white">开启新游戏</h1>
            <Sparkles className="w-8 h-8 text-accent-gold" />
          </div>
          <p className="text-text-secondary">创建您的角色和公司，开始您的商业传奇</p>
          <button
            onClick={() => setShowAiPanel(true)}
            className="absolute top-0 right-0 px-4 py-2 bg-white/5 text-text-secondary rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            AI配置
          </button>
        </div>

        <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${currentStep === step.id
                  ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
                  }`}
              >
                <step.icon className="w-4 h-4" />
                {step.label}
              </button>
              {index < steps.length - 1 && (
                <div className="w-4 h-px bg-white/20 mx-1" />
              )}
            </div>
          ))}
        </div>

        <div className="glass-card p-8">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-accent-gold" />
                <h2 className="text-xl font-bold text-white">快速导入</h2>
              </div>

              <p className="text-text-secondary text-sm">
                粘贴一段开局描述文字，AI将自动解析并填充角色和公司信息。
                可以是小说片段、人物设定、公司介绍等。
              </p>

              <div>
                <label className="block text-sm text-text-secondary mb-2">开局描述文字</label>
                <textarea
                  value={quickImportText}
                  onChange={(e) => setQuickImportText(e.target.value)}
                  placeholder="粘贴或输入开局描述，例如：&#10;玩家姓名、年龄、性别、背景经历...&#10;公司名称、行业、发展历程、当前状态...&#10;总部地点、开局时间..."
                  rows={10}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50 resize-none"
                />
              </div>

              {!aiForm.apiKey && (
                <div className="p-4 bg-status-warning/10 border border-status-warning/20 rounded-lg">
                  <p className="text-sm text-status-warning">
                    请先在"AI配置"步骤中设置API密钥后再使用快速导入功能
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-white/5 text-text-secondary rounded-lg hover:bg-white/10 transition-colors"
                >
                  手动填写 →
                </button>
                <button
                  onClick={handleQuickImport}
                  disabled={isImporting || !quickImportText.trim() || !aiForm.apiKey}
                  className="px-6 py-3 bg-accent-gold/20 text-accent-gold rounded-lg hover:bg-accent-gold/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 解析中...</>
                  ) : (
                    <><Wand2 className="w-4 h-4" /> AI解析并填充</>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-accent-gold" />
                <h2 className="text-xl font-bold text-white">个人信息</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">姓名</label>
                  <input
                    type="text"
                    value={playerData.name}
                    onChange={(e) => handlePlayerChange('name', e.target.value)}
                    placeholder="请输入您的姓名"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-2">年龄</label>
                  <input
                    type="text"
                    value={playerData.age}
                    onChange={(e) => handlePlayerChange('age', e.target.value)}
                    placeholder="如：35"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">性别</label>
                <div className="flex gap-3">
                  {genders.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => handlePlayerChange('gender', g.value)}
                      className={`px-4 py-2 rounded-lg transition-all ${playerData.gender === g.value
                        ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30'
                        : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-transparent'
                        }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">职位头衔</label>
                <input
                  type="text"
                  value={playerData.title}
                  onChange={(e) => handlePlayerChange('title', e.target.value)}
                  placeholder="如：董事长、CEO、创始人"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">背景故事</label>
                <textarea
                  value={playerData.background}
                  onChange={(e) => handlePlayerChange('background', e.target.value)}
                  placeholder="描述您的背景经历，如：曾在某大型企业担任高管，拥有丰富的行业资源..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50 resize-none"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="px-6 py-3 bg-white/5 text-text-secondary rounded-lg hover:bg-white/10 transition-colors"
                >
                  ← 快速导入
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-accent-gold/20 text-accent-gold rounded-lg hover:bg-accent-gold/30 transition-colors"
                >
                  下一步 →
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Building className="w-6 h-6 text-accent-gold" />
                <h2 className="text-xl font-bold text-white">公司信息</h2>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">公司名称</label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => handleCompanyChange('name', e.target.value)}
                  placeholder="请输入公司名称"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">发展历史</label>
                <textarea
                  value={companyData.history}
                  onChange={(e) => handleCompanyChange('history', e.target.value)}
                  placeholder="描述公司的发展历程，如：2020年成立，专注于某领域..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">公司状态</label>
                <input
                  type="text"
                  value={companyData.status}
                  onChange={(e) => handleCompanyChange('status', e.target.value)}
                  placeholder="如：初创期、成长期、成熟期、转型期、快速扩张期..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">主营业务</label>
                <input
                  type="text"
                  value={companyData.business}
                  onChange={(e) => handleCompanyChange('business', e.target.value)}
                  placeholder="如：科技/互联网、金融、医疗"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-white/5 text-text-secondary rounded-lg hover:bg-white/10 transition-colors"
                >
                  ← 上一步
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-accent-gold/20 text-accent-gold rounded-lg hover:bg-accent-gold/30 transition-colors"
                >
                  下一步 →
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-accent-gold" />
                <h2 className="text-xl font-bold text-white">开局设置</h2>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">总部地点</label>
                <input
                  type="text"
                  value={companyData.headquarters}
                  onChange={(e) => handleCompanyChange('headquarters', e.target.value)}
                  placeholder="如：北京、上海、深圳"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">开局时间</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      value={companyData.startYear}
                      onChange={(e) => handleCompanyChange('startYear', e.target.value)}
                      placeholder="年份"
                      maxLength={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                    />
                  </div>
                  <div>
                    <select
                      value={companyData.startMonth}
                      onChange={(e) => handleCompanyChange('startMonth', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-gold/50"
                    >
                      {months.map((m) => (
                        <option key={m.value} value={m.value} className="bg-secondary">
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={companyData.startDay}
                      onChange={(e) => handleCompanyChange('startDay', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-gold/50"
                    >
                      {days.map((d) => (
                        <option key={d.value} value={d.value} className="bg-secondary">
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-accent-gold/10 border border-accent-gold/20 rounded-lg">
                <h3 className="text-sm font-semibold text-accent-gold mb-2">开局信息预览</h3>
                <div className="space-y-1 text-sm text-text-secondary">
                  <p>玩家：{playerData.name || '未设置'}（{playerData.title || '职位未定'}）</p>
                  <p>公司：{companyData.name || '未设置'} - {companyData.business || '行业未定'}</p>
                  <p>状态：{companyData.status || '未设置'}</p>
                  <p>时间：{companyData.startYear}-{companyData.startMonth}-{companyData.startDay}</p>
                  <p>地点：{companyData.headquarters || '未设置'}</p>
                  <p>AI服务：{aiForm.apiKey ? '已配置' : '未配置'}</p>
                </div>
              </div>

              {!aiForm.apiKey && (
                <div className="p-4 bg-status-warning/10 border border-status-warning/20 rounded-lg">
                  <p className="text-sm text-status-warning">
                    警告：AI服务未配置，游戏将无法正常运行。请返回"AI配置"步骤设置API密钥。
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-white/5 text-text-secondary rounded-lg hover:bg-white/10 transition-colors"
                >
                  ← 上一步
                </button>
                <button
                  onClick={handleStartGame}
                  disabled={isStarting}
                  className="px-8 py-3 bg-accent-gold text-primary font-bold rounded-lg hover:bg-accent-gold/80 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AI生成数据中...
                    </>
                  ) : (
                    '开始游戏'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {showAiPanel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-accent-gold" />
                  <h2 className="text-xl font-bold text-white">AI服务配置</h2>
                </div>
                <button
                  onClick={() => setShowAiPanel(false)}
                  className="px-3 py-1.5 text-text-secondary hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">API 密钥</label>
                  <input
                    type="password"
                    value={aiForm.apiKey}
                    onChange={(e) => handleAIChange('apiKey', e.target.value)}
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-2">API 基础地址</label>
                  <input
                    type="text"
                    value={aiForm.apiBaseUrl}
                    onChange={(e) => handleAIChange('apiBaseUrl', e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-secondary mb-2">Flash 模型</label>
                    <input
                      type="text"
                      value={aiForm.flashModel}
                      onChange={(e) => handleAIChange('flashModel', e.target.value)}
                      placeholder="gpt-4o-mini"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-2">Pro 模型</label>
                    <input
                      type="text"
                      value={aiForm.proModel}
                      onChange={(e) => handleAIChange('proModel', e.target.value)}
                      placeholder="gpt-4o"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                    />
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-sm font-semibold text-white mb-2">常用预设</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setAiForm(prev => ({
                          ...prev,
                          apiBaseUrl: 'https://api.openai.com/v1',
                          flashModel: 'gpt-4o-mini',
                          proModel: 'gpt-4o',
                        }));
                      }}
                      className="px-3 py-1.5 text-sm bg-white/5 text-text-secondary rounded-lg hover:bg-white/10 transition-colors"
                    >
                      OpenAI
                    </button>
                    <button
                      onClick={() => {
                        setAiForm(prev => ({
                          ...prev,
                          apiBaseUrl: 'https://api.deepseek.com/v1',
                          flashModel: 'deepseek-v4-flash',
                          proModel: 'deepseek-v4-pro',
                        }));
                      }}
                      className="px-3 py-1.5 text-sm bg-white/5 text-text-secondary rounded-lg hover:bg-white/10 transition-colors"
                    >
                      DeepSeek V4
                    </button>
                    <button
                      onClick={() => {
                        setAiForm(prev => ({
                          ...prev,
                          apiBaseUrl: 'https://api.deepseek.com/v1',
                          flashModel: 'deepseek-r1-flash',
                          proModel: 'deepseek-r1',
                        }));
                      }}
                      className="px-3 py-1.5 text-sm bg-white/5 text-text-secondary rounded-lg hover:bg-white/10 transition-colors"
                    >
                      DeepSeek R1
                    </button>
                    <button
                      onClick={() => {
                        setAiForm(prev => ({
                          ...prev,
                          apiBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
                          flashModel: 'qwen-plus',
                          proModel: 'qwen-max',
                        }));
                      }}
                      className="px-3 py-1.5 text-sm bg-white/5 text-text-secondary rounded-lg hover:bg-white/10 transition-colors"
                    >
                      通义千问
                    </button>
                    <button
                      onClick={() => {
                        setAiForm(prev => ({
                          ...prev,
                          apiBaseUrl: 'https://aip.baidubce.com/v1',
                          flashModel: 'ernie-lite',
                          proModel: 'ernie-4.0',
                        }));
                      }}
                      className="px-3 py-1.5 text-sm bg-white/5 text-text-secondary rounded-lg hover:bg-white/10 transition-colors"
                    >
                      文心一言
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setAISettings({
                      apiKey: aiForm.apiKey,
                      flashModel: aiForm.flashModel,
                      proModel: aiForm.proModel,
                      apiBaseUrl: aiForm.apiBaseUrl,
                    });
                    setShowAiPanel(false);
                  }}
                  className="w-full px-6 py-3 bg-accent-gold text-primary font-bold rounded-lg hover:bg-accent-gold/80 transition-colors"
                >
                  保存配置
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}