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

    const data = await response.json();
    return data.choices[0]?.message?.content || '无响应';
  } catch (error) {
    console.error('Pro模型调用失败:', error);
    return '模型调用失败，请检查API配置';
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