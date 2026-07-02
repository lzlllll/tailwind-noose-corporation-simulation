import { useState, useRef, useEffect } from 'react';
import { Users2, MessageCircle, Heart, Briefcase, Building2, Star, Send, Loader2, Check, Clock, AlertCircle } from 'lucide-react';
import Card from '@/components/Card';
import { useGameStore } from '@/stores/gameStore';
import { generateNPCResponse, NPCChatResponse } from '@/services/aiService';
import { NPCMessage } from '@/data/mockData';
import { asArray } from '@/lib/utils';

function getNameInitials(name: string): string {
  if (!name) return '?';
  const trimmed = name.trim();
  if (/[\u4e00-\u9fa5]/.test(trimmed)) {
    return trimmed.charAt(0);
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

const relationshipLevels = [
  { min: 0, max: 20, label: '敌对', color: 'bg-status-danger' },
  { min: 21, max: 40, label: '冷淡', color: 'bg-status-warning' },
  { min: 41, max: 60, label: '中立', color: 'bg-accent-blue' },
  { min: 61, max: 80, label: '友好', color: 'bg-accent-green' },
  { min: 81, max: 100, label: '亲密', color: 'bg-accent-gold' },
];

function getRelationshipLevel(value: number) {
  return relationshipLevels.find(r => value >= r.min && value <= r.max) || relationshipLevels[2];
}

function parseTime(gameTime: string, replyAfterTime: string | undefined): boolean {
  if (!replyAfterTime) return true;

  const current = new Date(gameTime);
  const replyTime = new Date(replyAfterTime);

  return current >= replyTime;
}

export default function NPC() {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    npcs,
    activeNPCId,
    setActiveNPCId,
    isNPCChatting,
    setIsNPCChatting,
    addNPCMessage,
    updateNPC,
    aiSettings,
    gameTime,
  } = useGameStore();

  const activeNPC = (npcs || []).find(n => n.id === activeNPCId);

  const unreadCount = activeNPC
    ? asArray<NPCMessage>(activeNPC.chatHistory).filter(m => m && m.sender === 'npc' && !m.isRead).length
    : 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeNPC?.chatHistory]);

  useEffect(() => {
    if (activeNPC?.pendingReply && parseTime(gameTime, activeNPC.pendingReply.replyAfterTime)) {
      const npcMessage: NPCMessage = {
        id: Date.now().toString(),
        sender: 'npc',
        content: activeNPC.pendingReply.content,
        timestamp: new Date().toLocaleString('zh-CN'),
        isRead: false,
      };

      addNPCMessage(activeNPC.id, npcMessage);
      updateNPC(activeNPC.id, { pendingReply: undefined });
    }
  }, [gameTime, activeNPC, addNPCMessage, updateNPC]);

  const handleSelectNPC = (npcId: string) => {
    setActiveNPCId(npcId);

    const npc = (npcs || []).find(n => n.id === npcId);
    if (npc) {
      const chatHistory = asArray<NPCMessage>(npc.chatHistory);
      const unreadMessages = chatHistory.filter(m => m && m.sender === 'npc' && !m.isRead);
      if (unreadMessages.length > 0) {
        updateNPC(npcId, {
          chatHistory: chatHistory.map(m =>
            m.sender === 'npc' && !m.isRead ? { ...m, isRead: true } : m
          ),
        });
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeNPC || isNPCChatting) return;

    const playerMessage: NPCMessage = {
      id: Date.now().toString(),
      sender: 'player',
      content: messageInput.trim(),
      timestamp: new Date().toLocaleString('zh-CN'),
      isRead: false,
    };

    addNPCMessage(activeNPC.id, playerMessage);
    setMessageInput('');
    setIsNPCChatting(true);

    try {
      const response = await generateNPCResponse(activeNPC, messageInput.trim(), gameTime);

      if (response.delayReply && response.replyAfterTime) {
        updateNPC(activeNPC.id, {
          pendingReply: {
            content: response.content,
            replyAfterTime: response.replyAfterTime,
          },
        });

        const delayMessage: NPCMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'npc',
          content: `[延迟回复] 将在 ${response.replyAfterTime} 后回复`,
          timestamp: new Date().toLocaleString('zh-CN'),
          isRead: true,
        };
        addNPCMessage(activeNPC.id, delayMessage);
      } else if (response.noReply) {
        const noReplyMessage: NPCMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'npc',
          content: '[已读不回]',
          timestamp: new Date().toLocaleString('zh-CN'),
          isRead: true,
        };
        addNPCMessage(activeNPC.id, noReplyMessage);
      } else {
        const npcMessage: NPCMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'npc',
          content: response.content,
          timestamp: new Date().toLocaleString('zh-CN'),
          isRead: false,
        };
        addNPCMessage(activeNPC.id, npcMessage);
      }

      if (activeNPC.isFirstMeeting) {
        updateNPC(activeNPC.id, { isFirstMeeting: false });
      }

      if (response.newMemory) {
        updateNPC(activeNPC.id, { memory: response.newMemory });
      }
    } catch (error) {
      console.error('NPC对话失败:', error);
      const errorMessage: NPCMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'npc',
        content: '抱歉，我暂时无法回应。',
        timestamp: new Date().toLocaleString('zh-CN'),
        isRead: false,
      };
      addNPCMessage(activeNPC.id, errorMessage);
    } finally {
      setIsNPCChatting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const hasApiKey = aiSettings.apiKey.length > 0;

  return (
    <div className="flex-1 p-8 overflow-auto scrollbar-thin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">NPC互动</h1>
        <p className="text-text-secondary">与虚拟角色建立关系，获取信息和资源</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="角色列表">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(npcs || []).map((npc) => {
                const relLevel = getRelationshipLevel(npc.relationship);
                const npcUnread = asArray<NPCMessage>(npc.chatHistory).filter(m => m && m.sender === 'npc' && !m.isRead).length;
                const hasPendingReply = npc.pendingReply && !parseTime(gameTime, npc.pendingReply.replyAfterTime);

                return (
                  <div
                    key={npc.id}
                    onClick={() => handleSelectNPC(npc.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${activeNPCId === npc.id
                      ? 'bg-white/10 border border-accent-gold/30'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-accent-gold/20 to-accent-green/20 rounded-xl flex items-center justify-center relative">
                        <span className="text-accent-gold font-semibold text-lg">{getNameInitials(npc.name)}</span>
                        {npcUnread > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-status-danger rounded-full flex items-center justify-center text-xs text-white">
                            {npcUnread}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium">{npc.name}</h3>
                          <span className={`w-2 h-2 rounded-full ${relLevel.color}`} />
                          {npc.isFirstMeeting && (
                            <span className="text-xs text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded">新</span>
                          )}
                          {hasPendingReply && (
                            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded flex items-center gap-1">
                              <Clock size={12} />
                              待回复
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                          <Briefcase size={14} />
                          <span>{npc.role}</span>
                          <span>·</span>
                          <Building2 size={14} />
                          <span>{npc.company}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="text-accent-gold" size={16} />
                          <div className="flex-1 max-w-[120px] progress-bar">
                            <div
                              className={`h-full rounded-full ${relLevel.color}`}
                              style={{ width: `${npc.relationship}%` }}
                            />
                          </div>
                          <span className="text-text-muted text-xs w-12">{relLevel.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Star className="text-accent-gold" size={14} />
                        <span className="text-text-muted text-xs">专长: {npc.specialty}</span>
                      </div>
                      <p className="text-text-secondary text-xs mt-1">性格: {npc.personality}</p>
                      {asArray<string>(npc.memory).length > 0 && (
                        <div className="mt-2 flex items-center gap-1">
                          <MessageCircle className="text-accent-blue" size={12} />
                          <span className="text-text-muted text-xs">记忆 {asArray<string>(npc.memory).length} 条</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {activeNPC ? (
            <>
              <Card title={`与 ${activeNPC.name} 对话`}>
                {unreadCount > 0 && (
                  <div className="mb-4 px-3 py-2 bg-accent-blue/10 rounded-lg flex items-center gap-2">
                    <AlertCircle className="text-accent-blue" size={16} />
                    <span className="text-accent-blue text-sm">{unreadCount} 条未读消息</span>
                  </div>
                )}

                {activeNPC.pendingReply && !parseTime(gameTime, activeNPC.pendingReply.replyAfterTime) && (
                  <div className="mb-4 px-3 py-2 bg-yellow-400/10 rounded-lg flex items-center gap-2">
                    <Clock className="text-yellow-400" size={16} />
                    <span className="text-yellow-400 text-sm">
                      将在 {activeNPC.pendingReply.replyAfterTime} 后回复
                    </span>
                  </div>
                )}

                <div className="h-64 overflow-y-auto space-y-4 mb-4 scrollbar-thin">
                  {asArray<NPCMessage>(activeNPC.chatHistory).length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="mx-auto text-text-muted mb-4" size={32} />
                      <p className="text-text-secondary text-sm">
                        {activeNPC.isFirstMeeting ? '这是第一次见面' : '开始对话吧'}
                      </p>
                      {!hasApiKey && (
                        <p className="text-text-muted text-xs mt-2">请先配置AI服务</p>
                      )}
                    </div>
                  ) : (
                    asArray<NPCMessage>(activeNPC.chatHistory).map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'player'
                          ? 'bg-accent-gold/20 text-accent-gold rounded-tr-none'
                          : msg.content.includes('[已读不回]')
                            ? 'bg-text-muted/10 text-text-muted rounded-tl-none'
                            : msg.content.includes('[延迟回复]')
                              ? 'bg-yellow-400/10 text-yellow-400 rounded-tl-none'
                              : 'bg-white/10 text-white rounded-tl-none'
                          }`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-text-muted">
                              {msg.sender === 'player' ? '我' : activeNPC.name} · {msg.timestamp}
                            </p>
                            {msg.sender === 'npc' && (
                              msg.isRead
                                ? <Check className="text-accent-green" size={12} />
                                : <AlertCircle className="text-accent-blue" size={12} />
                            )}
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={hasApiKey ? '输入消息...' : '请先配置AI服务'}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!hasApiKey || isNPCChatting}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || !hasApiKey || isNPCChatting}
                    className="btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isNPCChatting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </Card>

              {activeNPC.memory.length > 0 && (
                <Card title="记忆">
                  <div className="space-y-2">
                    {activeNPC.memory.map((mem, index) => (
                      <div key={index} className="p-2 bg-white/5 rounded-lg">
                        <p className="text-text-secondary text-sm">{mem}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card title="角色信息">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="text-accent-gold" size={16} />
                    <span className="text-text-secondary">{activeNPC.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="text-accent-gold" size={16} />
                    <span className="text-text-secondary">{activeNPC.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="text-accent-gold" size={16} />
                    <span className="text-text-secondary">{activeNPC.specialty}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-text-muted text-xs mb-1">人格设定</p>
                    <p className="text-text-secondary text-sm">{activeNPC.systemPrompt}</p>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card title="选择角色">
              <div className="text-center py-12">
                <MessageCircle className="mx-auto text-text-muted mb-4" size={48} />
                <p className="text-text-secondary">选择一个角色开始对话</p>
              </div>
            </Card>
          )}

          <Card title="关系概览">
            <div className="space-y-3">
              {relationshipLevels.map((level) => {
                const count = npcs.filter(n => n && n.relationship >= level.min && n.relationship <= level.max).length;
                return (
                  <div key={level.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${level.color}`} />
                      <span className="text-text-secondary text-sm">{level.label}</span>
                    </div>
                    <span className="text-white text-sm">{count}人</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}