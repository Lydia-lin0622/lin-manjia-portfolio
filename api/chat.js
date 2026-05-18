export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed.' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing DEEPSEEK_API_KEY.' });
  }

  const { question, profile } = req.body || {};
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Missing question.' });
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.6,
        max_tokens: 700,
        messages: [
          {
            role: 'system',
            content:
              '你是林曼佳作品集网页里的个人AI助手。请只根据给定资料回答，不要编造。回答使用中文，语气自然、自信、简洁，通常控制在3到5句话。'
          },
          {
            role: 'user',
            content: `以下是林曼佳喂养给你的个人资料：\n\n${profile || ''}\n\n用户问题：${question}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'DeepSeek request failed.'
      });
    }

    const answer = data.choices?.[0]?.message?.content || '暂时没有生成回答。';
    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({ error: 'AI request failed.' });
  }
}
