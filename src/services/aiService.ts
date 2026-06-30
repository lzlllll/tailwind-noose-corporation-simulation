import { useGameStore } from '@/stores/gameStore';
import { SYSTEM_PROMPT } from './systemPrompt';
import { NPC } from '@/data/mockData';

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
        max_tokens: 300,
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
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API错误 ${response.status}:`, errorText);
      throw new Error(`API返回错误状态: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '无响应';
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

function parseDataOperations(response: string, validModules: string[]): DataOperation[] {
  const operations: DataOperation[] = [];

  const modifyMatch = response.match(/\[MODIFY\]\s*([\s\S]*?)\s*\[\/MODIFY\]/);
  if (modifyMatch) {
    try {
      const data = JSON.parse(modifyMatch[1]);
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
    } catch {
      console.error('解析MODIFY操作失败');
    }
  }

  const addMatch = response.match(/\[ADD\]\s*([\s\S]*?)\s*\[\/ADD\]/);
  if (addMatch) {
    try {
      const data = JSON.parse(addMatch[1]);
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
    } catch {
      console.error('解析ADD操作失败');
    }
  }

  const deleteMatch = response.match(/\[DELETE\]\s*([\s\S]*?)\s*\[\/DELETE\]/);
  if (deleteMatch) {
    try {
      const data = JSON.parse(deleteMatch[1]);
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
    } catch {
      console.error('解析DELETE操作失败');
    }
  }

  return operations.sort((a, b) => {
    const priority = { modify: 0, add: 1, delete: 2 };
    return priority[a.type] - priority[b.type];
  });
}

function parseTime(response: string): string {
  const timeMatch = response.match(/\[TIME\]\s*([\s\S]*?)\s*\[\/TIME\]/);
  if (timeMatch) {
    return timeMatch[1].trim();
  }
  return '';
}

export async function generateNarrative(playerDecision: string, gameData: Record<string, unknown>, contextParams?: ContextParams): Promise<AIResponse> {
  const dataModules = Object.keys(gameData);
  const validDataModules = ['company', 'products', 'finance', 'employees', 'strategies', 'operations', 'innovations', 'gameTime', 'news', 'competitors', 'npcs', 'playerInfo'];
  const gameTime = (gameData.gameTime as string) || '2000-01-06 09:00:00';

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
${JSON.stringify(relevantData, null, 2)}

【玩家决策】
${playerDecision}

请根据上述信息进行推演。在推演时：
1. 如果有历史上下文，请结合上下文保持连贯性
2. 每次回复后，用[SUMMARY]标记块提炼50字以内的上下文摘要，供后续推演参考
3. 严格按照系统提示中的输出格式输出

输出格式：
[TIME]
YYYY-MM-DD HH:mm:ss
[/TIME]

[SUMMARY]
50字以内的上下文摘要
[/SUMMARY]

叙事正文内容...

[MODIFY]
{ ... }
[/MODIFY]

[ADD]
{ ... }
[/ADD]

[DELETE]
{ ... }
[/DELETE]`;

  const proResult = await callProModel(proPrompt);

  const operations = parseDataOperations(proResult, validDataModules);
  const newTime = parseTime(proResult);

  const summaryMatch = proResult.match(/\[SUMMARY\]\s*([\s\S]*?)\s*\[\/SUMMARY\]/);
  const extractedSummary = summaryMatch ? summaryMatch[1].trim() : undefined;

  const narrative = proResult
    .replace(/\[TIME\][\s\S]*?\[\/TIME\]/g, '')
    .replace(/\[SUMMARY\][\s\S]*?\[\/SUMMARY\]/g, '')
    .replace(/\[MODIFY\][\s\S]*?\[\/MODIFY\]/g, '')
    .replace(/\[ADD\][\s\S]*?\[\/ADD\]/g, '')
    .replace(/\[DELETE\][\s\S]*?\[\/DELETE\]/g, '')
    .trim();

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
        max_tokens: 500,
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
  const startTime = `${companyInfo.startYear}-${companyInfo.startMonth.padStart(2, '0')}-${companyInfo.startDay.padStart(2, '0')} 09:00:00`;

  const prompt = `你是一个企业经营模拟游戏的AI主持人。请根据以下玩家和公司信息，生成完整的游戏初始数据和开局叙事。

【玩家信息】
姓名：${playerInfo.name}
年龄：${playerInfo.age}
性别：${playerInfo.gender}
职位：${playerInfo.title}
背景：${playerInfo.background}

【公司信息】
公司名称：${companyInfo.name}
发展历史：${companyInfo.history}
公司状态：${companyInfo.status}
主营业务：${companyInfo.business}
总部地点：${companyInfo.headquarters}
开局时间：${startTime}

请按以下格式返回内容（使用块标记格式）：

【叙事正文】
请在这里写开局叙事，描述公司当前的状况、面临的机遇和挑战、玩家的处境等，200-300字。

[TIME]
${startTime}
[/TIME]

[ADD]
{
  "company": {
    "id": "comp-001",
    "name": "${companyInfo.name}",
    "industry": "${companyInfo.business}",
    "marketValue": 市值(数字，单位元),
    "revenue": 年收入(数字),
    "profit": 年利润(数字),
    "employees": 员工人数(数字),
    "foundedYear": ${companyInfo.startYear},
    "rating": 公司评级0-100,
    "brandValue": 品牌价值(数字),
    "marketShare": 市场份额百分比(数字0-100),
    "isListed": 是否上市(true/false),
    "creditRating": "信用评级如AA",
    "creditScore": 信用分数0-100,
    "loanParameter": 贷款资质参数0-100
  },
  "playerInfo": {
    "id": "player-001",
    "name": "${playerInfo.name}",
    "title": "${playerInfo.title}",
    "personalCash": 个人流动资金(数字),
    "totalAssets": 总资产(数字),
    "netWorth": 净资产(数字),
    "personalAssets": [个人资产数组，可包含房产、车辆等],
    "stockHoldings": [持股列表，初始可为空]
  },
  "products": [产品数组，2-5个初始产品],
  "employees": [员工数组，5-10个核心员工],
  "finance": {
    "cash": 现金(数字),
    "assets": 总资产(数字),
    "liabilities": 负债(数字),
    "equity": 所有者权益(数字),
    "revenue": 营收(数字),
    "expenses": 支出(数字),
    "debt": 债务(数字),
    "investments": 投资(数字)
  },
  "strategies": [战略数组，1-3个初始战略],
  "operations": [运营任务数组，3-5个当前任务],
  "innovations": [研发项目数组，1-3个研发项目],
  "news": [新闻数组，2-3条近期新闻],
  "competitors": [竞争对手数组，2-3个主要对手，包含performanceIndex和marketExpectationIndex字段],
  "npcs": [NPC数组，3-5个关键人物，每人包含id,name,avatar,role,company,relationship,personality,specialty,systemPrompt,memory,isFirstMeeting,chatHistory],
  "shareholdings": [股权结构数组]
}
[/ADD]

请确保数据合理，符合"${companyInfo.status}"阶段的公司规模。
注意：[ADD]块内必须是严格有效的JSON格式。`;

  try {
    const result = await callProModel(prompt);
    console.log('AI原始返回:', result);

    let narrative = '游戏开始，请输入您的决策指令。';
    let newTime = startTime;
    let addData: Record<string, any> = {};

    const cleanResult = result.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();

    const narrativePatterns = [
      /【叙事正文】\s*\n([\s\S]*?)(?=\n\[|\n*$)/i,
      /【叙事正文】\s*([\s\S]*?)(?=\[|\s*$)/i,
      /叙事正文[：:]\s*\n([\s\S]*?)(?=\n\[|\n*$)/i,
    ];

    for (const pattern of narrativePatterns) {
      const match = cleanResult.match(pattern);
      if (match && match[1].trim().length > 20) {
        narrative = match[1].trim();
        break;
      }
    }

    if (narrative === '游戏开始，请输入您的决策指令。') {
      const firstBlockIdx = cleanResult.search(/\[(TIME|ADD|MODIFY|DELETE|SUMMARY)\]/i);
      if (firstBlockIdx > 20) {
        const beforeBlocks = cleanResult.substring(0, firstBlockIdx).trim();
        if (beforeBlocks.length > 20) {
          narrative = beforeBlocks.replace(/^【叙事正文】\s*\n?/i, '').trim();
        }
      }
    }

    const timeMatch = cleanResult.match(/\[TIME\]\s*([\s\S]*?)\s*\[\/TIME\]/i);
    if (timeMatch && timeMatch[1].trim()) {
      newTime = timeMatch[1].trim();
    }

    const addMatch = cleanResult.match(/\[ADD\]\s*([\s\S]*?)\s*\[\/ADD\]/i);
    if (addMatch) {
      const addContent = addMatch[1].trim();
      try {
        addData = JSON.parse(addContent);
      } catch (e) {
        console.error('解析ADD块失败，尝试提取JSON:', e);
        const jsonMatch = addContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            addData = JSON.parse(jsonMatch[0]);
          } catch (e2) {
            console.error('二次解析ADD块也失败，尝试修复JSON:', e2);
            try {
              const fixedJson = addContent
                .replace(/,\s*([}\]])/g, '$1')
                .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
                .replace(/'([^']*)'/g, '"$1"');
              addData = JSON.parse(fixedJson);
              console.log('修复后解析成功');
            } catch (e3) {
              console.error('三次解析ADD块也失败:', e3);
            }
          }
        }
      }
    }

    if (Object.keys(addData).length === 0) {
      console.warn('未找到ADD块，尝试从整个返回中提取JSON');
      const fullJsonMatch = cleanResult.match(/\{[\s\S]*"company"[\s\S]*\}/);
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
    };
  } catch (error) {
    console.error('生成游戏初始数据失败:', error);
    throw error;
  }
}