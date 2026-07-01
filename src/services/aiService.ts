import { useGameStore } from '@/stores/gameStore';
import { SYSTEM_PROMPT } from './systemPrompt';
import { NPC } from '@/data/mockData';

function parsePKVValue(raw: string): any {
  const val = raw.trim();
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === '' || val === 'null' || val === 'undefined') return null;
  const num = Number(val);
  if (!isNaN(num) && val !== '') return num;
  return val;
}

export function parsePKV(text: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx <= 0) continue;

    const path = trimmed.slice(0, colonIdx).trim();
    const valueStr = trimmed.slice(colonIdx + 1).trim();
    const value = parsePKVValue(valueStr);

    const parts = path.split('.').filter(p => p !== '');
    let current: any = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const isArrayIndex = /^\d+$/.test(part);

      if (isLast) {
        if (isArrayIndex) {
          const idx = parseInt(part, 10);
          if (!Array.isArray(current)) {
            console.warn(`路径 ${path} 中 ${part} 是数组索引但父级不是数组`);
            break;
          }
          current[idx] = value;
        } else {
          current[part] = value;
        }
      } else {
        const nextPart = parts[i + 1];
        const nextIsArray = /^\d+$/.test(nextPart);

        if (isArrayIndex) {
          const idx = parseInt(part, 10);
          if (!Array.isArray(current)) {
            console.warn(`路径 ${path} 中 ${part} 是数组索引但父级不是数组`);
            break;
          }
          if (!current[idx]) {
            current[idx] = nextIsArray ? [] : {};
          }
          current = current[idx];
        } else {
          if (!current[part]) {
            current[part] = nextIsArray ? [] : {};
          }
          current = current[part];
        }
      }
    }
  }

  return result;
}

function extractBlock(text: string, blockName: string): string | null {
  const upperName = blockName.toUpperCase();
  const patterns = [
    new RegExp(`===\\s*${upperName}\\s*===\\s*\\n([\\s\\S]*?)(?=\\n===\\s*END_${upperName}\\s*===|$)`, 'i'),
    new RegExp(`\\[${upperName}\\]\\s*\\n([\\s\\S]*?)(?=\\n\\[/${upperName}\\]|$)`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
  }

  return null;
}

function formatDataAsPKV(data: Record<string, unknown>, prefix: string = ''): string {
  const lines: string[] = [];

  function formatValue(value: unknown, currentPath: string) {
    if (value === null || value === undefined) {
      lines.push(`${currentPath}: null`);
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          lines.push(`${currentPath}: []`);
        } else {
          value.forEach((item, index) => {
            formatValue(item, `${currentPath}.${index}`);
          });
        }
      } else {
        const keys = Object.keys(value);
        if (keys.length === 0) {
          lines.push(`${currentPath}: {}`);
        } else {
          keys.forEach(key => {
            formatValue((value as Record<string, unknown>)[key], currentPath ? `${currentPath}.${key}` : key);
          });
        }
      }
    } else {
      lines.push(`${currentPath}: ${String(value)}`);
    }
  }

  Object.keys(data).forEach(key => {
    formatValue(data[key], prefix ? `${prefix}.${key}` : key);
  });

  return lines.join('\n');
}

export interface DataOperation {
  type: 'modify' | 'add' | 'delete';
  target: string;
  data: Record<string, unknown> | unknown[] | string[];
}

export interface AIResponse {
  narrative: string;
  operations: DataOperation[];
  newTime: string;
  summary?: string;
  contextSummary?: string;
}

export interface ContextParams {
  contextSummary: string;
  recentMessages: string[];
}

export interface NPCChatResponse {
  content: string;
  newMemory?: string[];
  chatSummary?: string;
  playerInstructions?: string[];
  npcPromises?: string[];
  delayReply?: boolean;
  replyAfterTime?: string;
  noReply?: boolean;
}

export async function callFlashModel(prompt: string): Promise<string> {
  const { aiSettings } = useGameStore.getState();

  if (!aiSettings.apiKey) {
    return '请先配置AI API密钥';
  }

  try {
    const response = await fetch(`${aiSettings.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiSettings.apiKey}`,
      },
      body: JSON.stringify({
        model: aiSettings.flashModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 32000,
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || '无响应';
  } catch (error) {
    console.error('Flash模型调用失败:', error);
    return '模型调用失败，请检查API配置';
  }
}

export async function callProModel(prompt: string): Promise<string> {
  const { aiSettings } = useGameStore.getState();

  if (!aiSettings.apiKey) {
    return '请先配置AI API密钥';
  }

  try {
    const response = await fetch(`${aiSettings.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiSettings.apiKey}`,
      },
      body: JSON.stringify({
        model: aiSettings.proModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 32000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API错误 ${response.status}:`, errorText);
      throw new Error(`API返回错误状态: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Pro模型调用失败:', error);
    throw error;
  }
}

function extractRelevantData(modules: string[], gameData: Record<string, unknown>): Record<string, unknown> {
  const relevantData: Record<string, unknown> = {};
  modules.forEach((module) => {
    if (gameData[module]) {
      relevantData[module] = gameData[module];
    }
  });
  return relevantData;
}

function tryParseBlockContent(content: string): Record<string, any> {
  let result: Record<string, any> = {};

  try {
    result = parsePKV(content);
    if (Object.keys(result).length > 0) {
      return result;
    }
  } catch (e) {
    console.warn('PKV解析失败，尝试JSON:', e);
  }

  try {
    const trimmed = content.trim();
    if (trimmed.startsWith('{')) {
      result = JSON.parse(trimmed);
      return result;
    }
  } catch (e) {
    console.warn('JSON解析失败，尝试修复:', e);
  }

  try {
    const trimmed = content.trim();
    if (trimmed.startsWith('{')) {
      const fixedJson = trimmed
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/(['"])?([a-zA-Z0-9_\u4e00-\u9fa5]+)(['"])?\s*:/g, '"$2":')
        .replace(/'([^']*)'/g, '"$1"');
      result = JSON.parse(fixedJson);
      return result;
    }
  } catch (e) {
    console.error('修复后JSON解析也失败:', e);
  }

  return result;
}

function parseDataOperations(response: string, validModules: string[]): DataOperation[] {
  const operations: DataOperation[] = [];

  const modifyBlock = extractBlock(response, 'MODIFY');
  if (modifyBlock) {
    const data = tryParseBlockContent(modifyBlock);
    Object.keys(data).forEach((target) => {
      if (validModules.includes(target)) {
        operations.push({
          type: 'modify',
          target,
          data: data[target],
        });
      } else {
        console.warn(`忽略无效的MODIFY目标模块: ${target}`);
      }
    });
  }

  const addBlock = extractBlock(response, 'ADD');
  if (addBlock) {
    const data = tryParseBlockContent(addBlock);
    Object.keys(data).forEach((target) => {
      if (validModules.includes(target)) {
        operations.push({
          type: 'add',
          target,
          data: data[target],
        });
      } else {
        console.warn(`忽略无效的ADD目标模块: ${target}`);
      }
    });
  }

  const deleteBlock = extractBlock(response, 'DELETE');
  if (deleteBlock) {
    const data = tryParseBlockContent(deleteBlock);
    Object.keys(data).forEach((target) => {
      if (validModules.includes(target)) {
        operations.push({
          type: 'delete',
          target,
          data: data[target],
        });
      } else {
        console.warn(`忽略无效的DELETE目标模块: ${target}`);
      }
    });
  }

  return operations.sort((a, b) => {
    const priority = { modify: 0, add: 1, delete: 2 };
    return priority[a.type] - priority[b.type];
  });
}

function parseTime(response: string): string {
  const timeBlock = extractBlock(response, 'TIME');
  if (timeBlock) {
    return timeBlock.trim();
  }
  return '';
}

export async function generateNarrative(playerDecision: string, gameData: Record<string, unknown>, contextParams?: ContextParams): Promise<AIResponse> {
  const dataModules = Object.keys(gameData);
  const validDataModules = ['company', 'products', 'finance', 'employees', 'strategies', 'operations', 'innovations', 'gameTime', 'news', 'competitors', 'npcs', 'playerInfo'];
  const gameTime = (gameData.gameTime as string) || '';

  const flashPrompt = `作为企业数据分析师，请分析以下玩家决策可能涉及哪些数据模块：

【玩家决策】
${playerDecision}

【可用数据模块】
${validDataModules.join(', ')}

请只返回涉及的数据模块名称，用逗号分隔，不要包含任何其他内容。

示例：
finance, products, news`;

  const flashResult = await callFlashModel(flashPrompt);

  const involvedModules = flashResult
    .split(',')
    .map((m) => m.trim())
    .filter((m) => validDataModules.includes(m));

  console.log('Flash分析涉及模块:', involvedModules);

  if (involvedModules.length === 0) {
    return {
      narrative: '您的决策未涉及任何数据模块，请重新描述您的决策。',
      operations: [],
      newTime: gameTime,
      summary: flashResult,
    };
  }

  const relevantData = extractRelevantData(involvedModules, gameData);

  let contextSection = '';
  if (contextParams) {
    const { contextSummary, recentMessages } = contextParams;
    contextSection = `
【历史上下文摘要】
${contextSummary || '暂无历史摘要'}

【最近4条叙事正文】
${recentMessages.length > 0 ? recentMessages.map((msg, i) => `[${i + 1}] ${msg}`).join('\n') : '暂无历史叙事'}`;
  }

  const proPrompt = `${SYSTEM_PROMPT}

【当前时间】
${gameTime}
${contextSection}

【可用数据模块列表】
${validDataModules.map((m) => `- ${m}`).join('\n')}

【涉及数据】
以下是涉及的数据，使用路径键值对格式：
${formatDataAsPKV(relevantData)}

【玩家决策】
${playerDecision}

请根据上述信息进行推演。在推演时：
1. 如果有历史上下文，请结合上下文保持连贯性
2. 每次回复后，用=== SUMMARY ===块提炼50字以内的上下文摘要，供后续推演参考
3. 严格按照以下输出格式输出

输出格式：
=== TIME ===
YYYY-MM-DD HH:mm:ss
=== END_TIME ===

=== SUMMARY ===
50字以内的上下文摘要
=== END_SUMMARY ===

叙事正文内容...

=== MODIFY ===
使用路径键值对格式，每行一个字段
company.name: 新公司名
finance.cash: 新现金数字
=== END_MODIFY ===

=== ADD ===
使用路径键值对格式，每行一个字段
news.0.id: news-new
news.0.title: 新闻标题
news.0.source: 来源
news.0.date: 日期
news.0.impact: positive
news.0.summary: 新闻摘要
=== END_ADD ===

=== DELETE ===
使用路径键值对格式
employees: [emp-001, emp-002]
=== END_DELETE ===

重要规则：
1. 数据块使用 === 块名 === 和 === END_块名 === 包裹
2. 数据使用路径键值对格式，每行一个字段
3. 用点号.表示层级，用数字索引表示数组
4. 字符串不需要引号，数字直接写
5. 布尔值用true或false
6. MODIFY用于更新现有数据，ADD用于新增数据，DELETE用于删除数据
7. 没有数据变更时可以省略对应的数据块`;

  const proResult = await callProModel(proPrompt);
  console.log('Pro模型返回:', proResult);

  const operations = parseDataOperations(proResult, validDataModules);
  const newTime = parseTime(proResult);

  const summaryBlock = extractBlock(proResult, 'SUMMARY');
  const extractedSummary = summaryBlock ? summaryBlock.trim() : undefined;

  let narrative = proResult;
  const blockPatterns = [
    /=== TIME ===[\s\S]*?=== END_TIME ===/gi,
    /=== SUMMARY ===[\s\S]*?=== END_SUMMARY ===/gi,
    /=== MODIFY ===[\s\S]*?=== END_MODIFY ===/gi,
    /=== ADD ===[\s\S]*?=== END_ADD ===/gi,
    /=== DELETE ===[\s\S]*?=== END_DELETE ===/gi,
    /\[TIME\][\s\S]*?\[\/TIME\]/gi,
    /\[SUMMARY\][\s\S]*?\[\/SUMMARY\]/gi,
    /\[MODIFY\][\s\S]*?\[\/MODIFY\]/gi,
    /\[ADD\][\s\S]*?\[\/ADD\]/gi,
    /\[DELETE\][\s\S]*?\[\/DELETE\]/gi,
  ];

  for (const pattern of blockPatterns) {
    narrative = narrative.replace(pattern, '');
  }
  narrative = narrative.trim();

  return {
    narrative,
    operations,
    newTime: newTime || gameTime,
    summary: flashResult,
    contextSummary: extractedSummary,
  };
}

export async function generateNPCResponse(
  npc: NPC,
  playerMessage: string,
  gameTime: string
): Promise<NPCChatResponse> {
  const { aiSettings } = useGameStore.getState();

  if (!aiSettings.apiKey) {
    return {
      content: '请先配置AI API密钥',
    };
  }

  try {
    const systemPrompt = `你正在扮演${npc.name}，一位${npc.role}，来自${npc.company}。

【人格设定】
${npc.systemPrompt}

【基本信息】
- 姓名：${npc.name}
- 职位：${npc.role}
- 公司：${npc.company}
- 性格：${npc.personality}
- 专长：${npc.specialty}
- 与玩家关系：${npc.relationship >= 80 ? '亲密' : npc.relationship >= 60 ? '友好' : npc.relationship >= 40 ? '中立' : npc.relationship >= 20 ? '冷淡' : '敌对'}

【记忆】
${npc.isFirstMeeting ? '这是第一次见面，还没有建立任何记忆。' : npc.memory.length > 0 ? npc.memory.map(m => `- ${m}`).join('\n') : '暂无特殊记忆。'}

【对话历史】
${npc.chatHistory.length > 0 ? npc.chatHistory.slice(-5).map(msg => `${msg.sender === 'player' ? '玩家' : npc.name}: ${msg.content}`).join('\n') : '无历史对话'}

【回复行为规则】
根据你的性格和立场，你可以选择以下回复方式：
1. 正常回复：直接回复玩家的话
2. 延迟回复：因为忙碌、思考或其他原因，选择稍后回复。使用[DELAY]标记块指定回复时间
3. 已读不回：因为不感兴趣、反感或其他原因，选择不回复。使用[NOREPLY]标记块

请根据上述设定，以${npc.name}的身份回复玩家的话。要求：
1. 保持角色性格和立场一致
2. 回复内容要体现NPC的特点
3. 不要推进时间或修改任何数据
4. 如果玩家提到了值得记住的信息，请用[MEMORY]标记块记录
5. 根据NPC的性格决定回复方式
6. 如果玩家下达了命令或指示，使用[INSTRUCTION]标记块记录
7. 如果你做出了承诺或答应，使用[PROMISE]标记块记录

回复格式示例：
正常回复：直接回复内容
延迟回复：回复内容 [DELAY]2000-01-15 10:00:00[/DELAY]
已读不回：[NOREPLY][/NOREPLY]
记忆记录：[MEMORY]记忆内容[/MEMORY]
玩家命令：[INSTRUCTION]玩家下达的命令内容[/INSTRUCTION]
NPC承诺：[PROMISE]NPC做出的承诺内容[/PROMISE]

在回复末尾，请使用[SUMMARY]标记块总结本次对话的核心内容：
[SUMMARY]
本次对话的核心议题和结果简述
[/SUMMARY]`;

    const response = await fetch(`${aiSettings.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiSettings.apiKey}`,
      },
      body: JSON.stringify({
        model: aiSettings.proModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `【当前时间】\n${gameTime}\n\n【玩家说的话】\n${playerMessage}` },
        ],
        temperature: 0.8,
        max_tokens: 8000,
      }),
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '...';

    const memoryMatch = content.match(/\[MEMORY\]\s*([\s\S]*?)\s*\[\/MEMORY\]/);
    let newMemory: string[] | undefined;

    if (memoryMatch) {
      const memoryContent = memoryMatch[1].trim();
      if (!npc.memory.includes(memoryContent)) {
        newMemory = [...npc.memory, memoryContent];
      }
    }

    const summaryMatch = content.match(/\[SUMMARY\]\s*([\s\S]*?)\s*\[\/SUMMARY\]/);
    const chatSummary = summaryMatch ? summaryMatch[1].trim() : undefined;

    const instructionMatches = content.match(/\[INSTRUCTION\]\s*([\s\S]*?)\s*\[\/INSTRUCTION\]/g);
    const playerInstructions = instructionMatches
      ? instructionMatches.map(m => m.replace(/\[INSTRUCTION\]\s*|\s*\[\/INSTRUCTION\]/g, '').trim())
      : undefined;

    const promiseMatches = content.match(/\[PROMISE\]\s*([\s\S]*?)\s*\[\/PROMISE\]/g);
    const npcPromises = promiseMatches
      ? promiseMatches.map(m => m.replace(/\[PROMISE\]\s*|\s*\[\/PROMISE\]/g, '').trim())
      : undefined;

    const noReplyMatch = content.match(/\[NOREPLY\]/);
    if (noReplyMatch) {
      return {
        content: '',
        newMemory,
        chatSummary,
        playerInstructions,
        npcPromises,
        noReply: true,
      };
    }

    const delayMatch = content.match(/\[DELAY\]\s*([\s\S]*?)\s*\[\/DELAY\]/);
    if (delayMatch) {
      const replyTime = delayMatch[1].trim();
      const cleanContent = content
        .replace(/\[MEMORY\][\s\S]*?\[\/MEMORY\]/g, '')
        .replace(/\[DELAY\][\s\S]*?\[\/DELAY\]/g, '')
        .replace(/\[SUMMARY\][\s\S]*?\[\/SUMMARY\]/g, '')
        .replace(/\[INSTRUCTION\][\s\S]*?\[\/INSTRUCTION\]/g, '')
        .replace(/\[PROMISE\][\s\S]*?\[\/PROMISE\]/g, '')
        .trim();

      return {
        content: cleanContent,
        newMemory,
        chatSummary,
        playerInstructions,
        npcPromises,
        delayReply: true,
        replyAfterTime: replyTime,
      };
    }

    const cleanContent = content
      .replace(/\[MEMORY\][\s\S]*?\[\/MEMORY\]/g, '')
      .replace(/\[SUMMARY\][\s\S]*?\[\/SUMMARY\]/g, '')
      .replace(/\[INSTRUCTION\][\s\S]*?\[\/INSTRUCTION\]/g, '')
      .replace(/\[PROMISE\][\s\S]*?\[\/PROMISE\]/g, '')
      .trim();

    return {
      content: cleanContent,
      newMemory,
      chatSummary,
      playerInstructions,
      npcPromises,
    };
  } catch (error) {
    console.error('NPC对话失败:', error);
    return {
      content: '抱歉，我暂时无法回应。',
    };
  }
}

export interface InitialDataResult {
  player?: {
    name?: string;
    age?: string;
    gender?: string;
    title?: string;
    background?: string;
  };
  company?: {
    name?: string;
    industry?: string;
    history?: string;
    status?: string;
    headquarters?: string;
    startYear?: string;
    startMonth?: string;
    startDay?: string;
  };
}

export async function generateInitialData(description: string): Promise<InitialDataResult> {
  const prompt = `请从以下开局描述文字中提取角色和公司信息，以JSON格式返回。

【开局描述】
${description}

请提取以下信息并以严格的JSON格式返回（不要包含任何其他文字，只返回JSON）：
{
  "player": {
    "name": "姓名",
    "age": "年龄",
    "gender": "male/female/other",
    "title": "职位头衔",
    "background": "背景故事简述"
  },
  "company": {
    "name": "公司名称",
    "industry": "主营业务/行业",
    "history": "发展历史简述",
    "status": "公司状态（如：初创期、成长期等）",
    "headquarters": "总部地点",
    "startYear": "成立年份（4位数字）",
    "startMonth": "成立月份（2位数字）",
    "startDay": "成立日期（2位数字）"
  }
}

如果某个信息无法从描述中提取，则留空字符串。`;

  try {
    const result = await callProModel(prompt);

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as InitialDataResult;
    }

    return {};
  } catch (error) {
    console.error('生成初始数据失败:', error);
    return {};
  }
}

export interface GameInitData {
  narrative: string;
  company: Record<string, unknown>;
  products: Record<string, unknown>[];
  finance: Record<string, unknown>;
  employees: Record<string, unknown>[];
  strategies: Record<string, unknown>[];
  operations: Record<string, unknown>[];
  innovations: Record<string, unknown>[];
  news: Record<string, unknown>[];
  competitors: Record<string, unknown>[];
  npcs: Record<string, unknown>[];
  shareholdings: Record<string, unknown>[];
  suppliers: Record<string, unknown>[];
  businessLines: Record<string, unknown>[];
  markets: Record<string, unknown>[];
  playerInfo: Record<string, unknown>;
  newTime: string;
}

export async function generateInitialGameData(playerInfo: {
  name: string;
  age: string;
  gender: string;
  title: string;
  background: string;
}, companyInfo: {
  name: string;
  history: string;
  status: string;
  business: string;
  headquarters: string;
  startYear: string;
  startMonth: string;
  startDay: string;
}): Promise<GameInitData> {
  let startTime = '';
  if (companyInfo.startYear && companyInfo.startMonth && companyInfo.startDay) {
    startTime = `${companyInfo.startYear}-${companyInfo.startMonth.padStart(2, '0')}-${companyInfo.startDay.padStart(2, '0')} 09:00:00`;
  }

  const prompt = `你是一个企业经营模拟游戏的AI主持人。请根据以下玩家和公司信息，生成完整的游戏初始数据和开局叙事。这是开局第一轮，需要生成所有以下内容。
请按以下格式返回内容：
【玩家信息】
姓名：${playerInfo.name || '由你根据背景设定生成'}
年龄：${playerInfo.age || '由你根据背景设定生成'}
性别：${playerInfo.gender || '由你根据背景设定生成'}
职位：${playerInfo.title || '由你根据背景设定生成'}
背景：${playerInfo.background || '请你自行设定一个合理的玩家背景'}

【公司信息】
公司名称：${companyInfo.name || '由你根据行业和背景设定生成'}
发展历史：${companyInfo.history || '请你自行设定公司的发展历史'}
公司状态：${companyInfo.status || '由你根据公司情况设定'}
主营业务：${companyInfo.business || '请你自行设定公司的主营业务'}
总部地点：${companyInfo.headquarters || '由你根据公司情况设定'}
开局时间：${startTime || '请你自行设定一个合理的开局时间，格式为YYYY-MM-DD HH:mm:ss'}


=== NARRATIVE ===
请在这里写开局叙事，描述公司当前的状况、面临的机遇和挑战、玩家的处境等，生动的小说文风。
=== END_NARRATIVE ===

=== TIME ===
开局时间，格式为YYYY-MM-DD HH:mm:ss
=== END_TIME ===

=== ADD ===
company.id: comp-001
company.name: 公司名称
company.industry: 行业
company.marketValue: 市值数字
company.revenue: 年收入数字
company.profit: 年利润数字
company.employees: 员工人数数字
company.foundedYear: 成立年份数字
company.rating: 公司评级0-100
company.brandValue: 品牌价值数字
company.marketShare: 市场份额百分比0-100
company.isListed: true或false
company.stockCode: 股票代码
company.stockPrice: 股价数字
company.stockExchange: 交易所
company.creditRating: 信用评级如AA
company.creditScore: 信用分数0-100
company.loanParameter: 贷款资质参数0-100
company.headquarters: 总部地点

playerInfo.id: player-001
playerInfo.name: 玩家姓名
playerInfo.title: 玩家职位
playerInfo.age: 玩家年龄
playerInfo.gender: 玩家性别
playerInfo.personalCash: 个人流动资金数字
playerInfo.totalAssets: 总资产数字
playerInfo.netWorth: 净资产数字
playerInfo.personalAssets.0.id: asset-001
playerInfo.personalAssets.0.name: 资产名称
playerInfo.personalAssets.0.type: real_estate或vehicle或investment或savings或other
playerInfo.personalAssets.0.value: 资产价值数字
playerInfo.personalAssets.0.description: 描述
playerInfo.personalAssets.0.acquisitionDate: 获得日期YYYY-MM-DD
playerInfo.stockHoldings: []

shareholdings.0.id: share-001
shareholdings.0.name: 股东名称
shareholdings.0.type: founder或institution或public或employee或other
shareholdings.0.shares: 股份数数字
shareholdings.0.percentage: 持股比例数字
shareholdings.0.votingPower: 投票权数字
shareholdings.0.description: 描述
（增加更多股东，3-5个）

products.0.id: prod-001
products.0.name: 产品名称
products.0.category: 产品类别
products.0.developmentProgress: 开发进度0-100
products.0.marketShare: 市场份额数字
products.0.revenue: 营收数字
products.0.status: development或launched或declining
products.0.description: 产品描述
products.0.targetMarket: 目标市场
products.0.price: 价格数字
products.0.unitsSold: 销量数字
（增加更多产品，2-5个）

employees.0.id: emp-001
employees.0.name: 员工姓名
employees.0.avatar: 头像URL
employees.0.role: 职位
employees.0.department: 部门
employees.0.salary: 薪资数字
employees.0.performance: 绩效0-100
employees.0.hireDate: 入职日期YYYY-MM-DD
employees.0.level: junior或senior或manager或executive
（增加更多员工，5-10个）

finance.cash: 现金数字
finance.assets: 总资产数字
finance.liabilities: 负债数字
finance.equity: 所有者权益数字
finance.revenue: 营收数字
finance.expenses: 支出数字
finance.profit: 利润数字
finance.profitMargin: 利润率数字
finance.revenueGrowth: 营收增长率数字
finance.expenseGrowth: 支出增长率数字
finance.cashBalance: 现金结余数字
finance.debt: 债务数字
finance.investments: 投资数字

strategies.0.id: strat-001
strategies.0.name: 战略名称
strategies.0.type: market-expansion或product-diversification或cost-optimization或innovation-leadership或acquisition
strategies.0.status: planning或in-progress或completed
strategies.0.progress: 进度0-100
strategies.0.budget: 预算数字
strategies.0.spent: 已花费数字
strategies.0.startDate: 开始日期YYYY-MM-DD
strategies.0.endDate: 结束日期YYYY-MM-DD
strategies.0.objectives.0: 目标1
strategies.0.keyMetrics.0.name: 指标名称
strategies.0.keyMetrics.0.target: 目标值数字
strategies.0.keyMetrics.0.current: 当前值数字
strategies.0.responsible: 负责人
strategies.0.description: 战略描述
（增加更多战略，1-3个）

operations.0.id: op-001
operations.0.title: 任务标题
operations.0.description: 任务描述
operations.0.priority: low或medium或high或critical
operations.0.status: pending或in-progress或completed
operations.0.assignee: 负责人
operations.0.dueDate: 截止日期YYYY-MM-DD
operations.0.progress: 进度0-100
（增加更多运营任务，3-5个）

innovations.0.id: innov-001
innovations.0.name: 项目名称
innovations.0.category: 类别
innovations.0.progress: 进度0-100
innovations.0.budget: 预算数字
innovations.0.spent: 已花费数字
innovations.0.team.0: 团队成员1
innovations.0.deadline: 截止日期YYYY-MM-DD
innovations.0.impact: 影响0-100
innovations.0.progressDescription: 进展描述
innovations.0.bottleneck: 瓶颈
（增加更多研发项目，1-3个）

news.0.id: news-001
news.0.title: 新闻标题
news.0.source: 来源
news.0.date: 日期YYYY-MM-DD
news.0.impact: positive或negative或neutral
news.0.summary: 新闻摘要
（增加更多新闻，2-3条）

competitors.0.id: comp-001
competitors.0.name: 竞争对手名称
competitors.0.marketShare: 市场份额数字
competitors.0.revenue: 营收数字
competitors.0.products: 产品数量数字
competitors.0.employees: 员工人数数字
competitors.0.strength: 优势
competitors.0.weakness: 劣势
competitors.0.performanceIndex: 绩效指数0-100
competitors.0.marketExpectationIndex: 市场预期指数0-100
competitors.0.influenceIndex: 影响指数0-100
competitors.0.commercialDependency: 商业依赖度0-100
competitors.0.technologyMonopoly: 技术垄断度0-100
competitors.0.playerShareholding: 玩家持股比例0-100
（增加更多竞争对手，2-3个）

suppliers.0.id: supp-001
suppliers.0.name: 供应商名称
suppliers.0.type: supplier或distributor或partner
suppliers.0.category: 类别
suppliers.0.contactPerson: 联系人
suppliers.0.relationshipLevel: 关系等级0-100
suppliers.0.contractValue: 合同金额数字
suppliers.0.contractExpiry: 合同到期日期
suppliers.0.performanceIndex: 绩效指数0-100
suppliers.0.marketExpectationIndex: 市场预期指数0-100
suppliers.0.influenceIndex: 影响指数0-100
suppliers.0.commercialDependency: 商业依赖度0-100
suppliers.0.technologyMonopoly: 技术垄断度0-100
suppliers.0.reliability: 可靠性0-100
suppliers.0.quality: 质量0-100
suppliers.0.responseTime: 响应时间数字
suppliers.0.notes: 备注
（增加更多供应商，2-3个）

npcs.0.id: npc-001
npcs.0.name: NPC姓名
npcs.0.avatar: 头像URL
npcs.0.role: 职位
npcs.0.company: 公司
npcs.0.relationship: 关系值0-100
npcs.0.personality: 性格
npcs.0.specialty: 专长
npcs.0.systemPrompt: 人格设定
npcs.0.memory.0: 记忆1
npcs.0.isFirstMeeting: true
npcs.0.chatHistory: []
（增加更多NPC，3-5个）

businessLines.0.id: bl-001
businessLines.0.name: 业务线名称
businessLines.0.description: 描述
businessLines.0.revenue: 营收数字
businessLines.0.profit: 利润数字
businessLines.0.growthRate: 增长率数字
businessLines.0.employees: 员工人数数字
businessLines.0.products.0: 产品1ID
（增加更多业务线，1-2个）

markets.0.id: market-001
markets.0.name: 市场名称
markets.0.region: 地区
markets.0.size: 市场规模数字
markets.0.growthRate: 增长率数字
markets.0.competition: 竞争程度0-100
markets.0.ourShare: 我方份额数字
markets.0.targetShare: 目标份额数字
markets.0.revenue: 营收数字
（增加更多市场，1-2个）
=== END_ADD ===

强制要求：
1. 必须生成以上所有数据模块，一个都不能少，如果玩家没有提及则根据背景生成
2. 每个模块的所有字段都必须填写，不能留空
3. 数组类型必须生成多个项目（数量参考括号中的说明）
4. 数据必须合理，符合公司发展阶段
5. 使用路径键值对格式，每行一个字段
6. 用点号.表示层级关系
7. 用数字索引表示数组，从0开始连续编号
8. 字符串不需要引号
9. 数字直接写，不要加单位文字
10. 布尔值用true或false
11. 日期格式为YYYY-MM-DD
12. 时间格式为YYYY-MM-DD HH:mm:ss`;

  try {
    const result = await callProModel(prompt);
    console.log('AI原始返回:', result);

    let narrative = '游戏开始，请输入您的决策指令。';
    let newTime = startTime;
    let addData: Record<string, any> = {};

    const narrativeBlock = extractBlock(result, 'NARRATIVE');
    if (narrativeBlock && narrativeBlock.length > 20) {
      narrative = narrativeBlock;
    } else {
      const narrativeAlt = result.match(/【叙事正文】\s*\n([\s\S]*?)(?=\n===|\n\[|$)/i);
      if (narrativeAlt && narrativeAlt[1].trim().length > 20) {
        narrative = narrativeAlt[1].trim();
      }
    }

    if (narrative === '游戏开始，请输入您的决策指令。') {
      const firstBlockIdx = result.search(/(=== (TIME|ADD|MODIFY|DELETE|SUMMARY) ===|\[(TIME|ADD|MODIFY|DELETE|SUMMARY)\])/i);
      if (firstBlockIdx > 20) {
        const beforeBlocks = result.substring(0, firstBlockIdx).trim();
        if (beforeBlocks.length > 20) {
          narrative = beforeBlocks.replace(/^【叙事正文】\s*\n?/i, '').trim();
        }
      }
    }

    const timeBlock = extractBlock(result, 'TIME');
    if (timeBlock) {
      newTime = timeBlock;
    }

    const addBlock = extractBlock(result, 'ADD');
    if (addBlock) {
      try {
        addData = parsePKV(addBlock);
        console.log('PKV解析结果:', Object.keys(addData));
      } catch (e) {
        console.error('PKV解析失败，尝试JSON解析:', e);
      }

      if (Object.keys(addData).length === 0) {
        try {
          const cleanJson = addBlock.trim();
          if (cleanJson.startsWith('{')) {
            addData = JSON.parse(cleanJson);
            console.log('JSON解析成功');
          }
        } catch (e) {
          console.error('JSON解析也失败，尝试修复:', e);
          try {
            const fixedJson = addBlock
              .replace(/,\s*([}\]])/g, '$1')
              .replace(/(['"])?([a-zA-Z0-9_\u4e00-\u9fa5]+)(['"])?\s*:/g, '"$2":')
              .replace(/'([^']*)'/g, '"$1"');
            addData = JSON.parse(fixedJson);
            console.log('修复后JSON解析成功');
          } catch (e2) {
            console.error('修复后JSON解析也失败:', e2);
          }
        }
      }
    }

    if (Object.keys(addData).length === 0) {
      console.warn('未找到ADD块或解析失败，尝试从全文提取');
      const fullJsonMatch = result.match(/\{[\s\S]*"company"[\s\S]*\}/);
      if (fullJsonMatch) {
        try {
          addData = JSON.parse(fullJsonMatch[0]);
          console.log('从全文提取JSON成功');
        } catch (e) {
          console.error('从全文提取JSON也失败:', e);
        }
      }
    }

    console.log('解析结果 - narrative长度:', narrative.length, 'addData keys:', Object.keys(addData));

    return {
      narrative,
      newTime,
      company: addData.company || {},
      playerInfo: addData.playerInfo || {},
      products: addData.products || [],
      employees: addData.employees || [],
      finance: addData.finance || {},
      strategies: addData.strategies || [],
      operations: addData.operations || [],
      innovations: addData.innovations || [],
      news: addData.news || [],
      competitors: addData.competitors || [],
      npcs: addData.npcs || [],
      shareholdings: addData.shareholdings || [],
      suppliers: addData.suppliers || [],
      businessLines: addData.businessLines || [],
      markets: addData.markets || [],
    };
  } catch (error) {
    console.error('生成游戏初始数据失败:', error);
    throw error;
  }
}