import { useState } from 'react';
import { X, Save, AlertCircle, Check, Terminal } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

interface ModelPreset {
  id: string;
  name: string;
  apiBaseUrl: string;
  flashModel: string;
  proModel: string;
  description: string;
}

const modelPresets: ModelPreset[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    apiBaseUrl: 'https://api.openai.com/v1',
    flashModel: 'gpt-4o-mini',
    proModel: 'gpt-4o',
    description: '官方模型，稳定可靠',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek V4',
    apiBaseUrl: 'https://api.deepseek.com/v1',
    flashModel: 'deepseek-v4-flash',
    proModel: 'deepseek-v4-pro',
    description: '国产高性能模型',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    apiBaseUrl: 'https://api.deepseek.com/v1',
    flashModel: 'deepseek-r1-flash',
    proModel: 'deepseek-r1',
    description: '新一代推理模型',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    apiBaseUrl: 'https://api.anthropic.com/v1',
    flashModel: 'claude-3-haiku-20240307',
    proModel: 'claude-3-opus-20240229',
    description: '长上下文支持',
  },
  {
    id: 'custom',
    name: '自定义',
    apiBaseUrl: '',
    flashModel: '',
    proModel: '',
    description: '手动配置所有参数',
  },
];

export default function Modal() {
  const { modalOpen, modalContent, closeModal, aiSettings, setAISettings } = useGameStore();
  const [localSettings, setLocalSettings] = useState(aiSettings);
  const [selectedPreset, setSelectedPreset] = useState<string>('openai');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!modalOpen) return null;

  const handleInputChange = (field: keyof typeof aiSettings, value: string) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
    if (selectedPreset !== 'custom') {
      setSelectedPreset('custom');
    }
  };

  const handlePresetSelect = (preset: ModelPreset) => {
    setSelectedPreset(preset.id);
    if (preset.id !== 'custom') {
      setLocalSettings((prev) => ({
        ...prev,
        apiBaseUrl: preset.apiBaseUrl,
        flashModel: preset.flashModel,
        proModel: preset.proModel,
      }));
    }
  };

  const handleSave = () => {
    setAISettings(localSettings);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      closeModal();
    }, 1500);
  };

  const renderAISettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">模型预设</label>
        <div className="grid grid-cols-2 gap-2">
          {modelPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={`p-3 rounded-lg border text-left transition-all ${selectedPreset === preset.id
                ? 'border-accent-gold bg-accent-gold/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{preset.name}</span>
                {selectedPreset === preset.id && (
                  <Check className="text-accent-gold" size={16} />
                )}
              </div>
              <p className="text-xs text-text-muted mt-1">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">API 密钥</label>
        <div className="relative">
          <input
            type="password"
            value={localSettings.apiKey}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors"
          />
        </div>
        <p className="text-xs text-text-muted mt-2">请输入您的 API 密钥</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">API 基础 URL</label>
        <input
          type="text"
          value={localSettings.apiBaseUrl}
          onChange={(e) => handleInputChange('apiBaseUrl', e.target.value)}
          placeholder="https://api.openai.com/v1"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors"
        />
        <p className="text-xs text-text-muted mt-2">支持自定义 API 端点，如代理服务</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            <span className="text-accent-blue">Flash</span> 模型
          </label>
          <input
            type="text"
            value={localSettings.flashModel}
            onChange={(e) => handleInputChange('flashModel', e.target.value)}
            placeholder="gpt-4o-mini"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors"
          />
          <p className="text-xs text-text-muted mt-2">用于数据筛选和快速响应</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            <span className="text-accent-gold">Pro</span> 模型
          </label>
          <input
            type="text"
            value={localSettings.proModel}
            onChange={(e) => handleInputChange('proModel', e.target.value)}
            placeholder="gpt-4o"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors"
          />
          <p className="text-xs text-text-muted mt-2">用于深度推演和叙事正文</p>
        </div>
      </div>

      <div className="p-4 bg-accent-blue/5 rounded-lg border border-accent-blue/10">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-accent-blue flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm text-text-secondary">
              <strong className="text-white">模型说明：</strong>
            </p>
            <ul className="text-xs text-text-muted mt-2 space-y-1">
              <li>- <span className="text-accent-blue">Flash 模型</span>：低成本、快速响应，适用于数据摘要、信息筛选等轻量级任务</li>
              <li>- <span className="text-accent-gold">Pro 模型</span>：高精度、深度推理，适用于叙事创作、决策推演等复杂任务</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Terminal className="text-accent-gold flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm text-text-secondary">
                <strong className="text-white">开发者模式</strong>
              </p>
              <p className="text-xs text-text-muted mt-1">开启后可在每条AI回复下方查看原始输出，便于调试和数据检查</p>
            </div>
          </div>
          <button
            onClick={() => setLocalSettings(prev => ({ ...prev, devMode: !prev.devMode }))}
            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${localSettings.devMode ? 'bg-accent-gold' : 'bg-white/10'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${localSettings.devMode ? 'translate-x-6' : ''}`}
            />
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-white/5 text-text-secondary rounded-lg hover:bg-white/10 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
        >
          {showSuccess ? (
            <>
              <Save className="animate-check" size={18} />
              已保存
            </>
          ) : (
            <>
              <Save size={18} />
              保存配置
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderDefault = () => (
    <>
      <div className="text-text-secondary">
        {modalContent}
      </div>
      <div className="flex justify-end mt-6">
        <button onClick={closeModal} className="btn-primary">
          关闭
        </button>
      </div>
    </>
  );

  const getTitle = () => {
    switch (modalContent) {
      case 'ai-settings':
        return 'AI 服务配置';
      default:
        return '详情';
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{getTitle()}</h3>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {modalContent === 'ai-settings' ? renderAISettings() : renderDefault()}
      </div>
    </div>
  );
}