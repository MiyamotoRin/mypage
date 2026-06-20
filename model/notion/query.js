const https = require('https');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.NOTION_API_KEY;
  const dbId   = (process.env.NOTION_DATABASE_ID || '').replace(/-/g, '');

  if (!apiKey || !dbId) {
    return res.status(500).json({
      message: '環境変数が設定されていません。Vercel ダッシュボードで NOTION_API_KEY と NOTION_DATABASE_ID を設定してください。',
    });
  }

  const body = { page_size: 100 };
  if (req.body && req.body.start_cursor) body.start_cursor = req.body.start_cursor;
  const payload = JSON.stringify(body);

  const options = {
    hostname: 'api.notion.com',
    path: `/v1/databases/${dbId}/query`,
    method: 'POST',
    headers: {
      'Authorization':    `Bearer ${apiKey}`,
      'Notion-Version':   '2022-06-28',
      'Content-Type':     'application/json',
      'Content-Length':   Buffer.byteLength(payload),
    },
  };

  const notionReq = https.request(options, (notionRes) => {
    let data = '';
    notionRes.on('data', chunk => { data += chunk; });
    notionRes.on('end', () => {
      res.status(notionRes.statusCode).setHeader('Content-Type', 'application/json').send(data);
    });
  });

  notionReq.on('error', err => {
    res.status(502).json({ message: `Notion API への接続に失敗しました: ${err.message}` });
  });

  notionReq.write(payload);
  notionReq.end();
};
