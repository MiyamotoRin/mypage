require('dotenv').config();
const express = require('express');
const https = require('https');
const path = require('path');

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = (process.env.NOTION_DATABASE_ID || '').replace(/-/g, '');

if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
  console.error('エラー: .env に NOTION_API_KEY と NOTION_DATABASE_ID を設定してください。');
  console.error('.env.example を参考に .env ファイルを作成してください。');
  process.exit(1);
}

const app = express();
app.use(express.json());

const root = __dirname;

app.get('/',           (_req, res) => res.sendFile(path.join(root, 'view/pages/top/index.html')));
app.get('/profile',    (_req, res) => res.sendFile(path.join(root, 'view/pages/profile/index.html')));
app.get('/works',      (_req, res) => res.sendFile(path.join(root, 'view/pages/works/index.html')));
app.get('/works/:page', (req, res) => res.sendFile(path.join(root, 'view/pages/works', req.params.page)));
app.get('/timeline',   (_req, res) => res.sendFile(path.join(root, 'view/pages/timeline/index.html')));
app.get('/read-books', (_req, res) => res.sendFile(path.join(root, 'view/pages/read-books/index.html')));

app.use(express.static(root));

app.get('/api/config', (_req, res) => {
  res.json({
    propName:     process.env.NOTION_PROP_NAME     || '名前',
    propBirth:    process.env.NOTION_PROP_BIRTH    || '生年',
    propDeath:    process.env.NOTION_PROP_DEATH    || '没年',
    propCategory: process.env.NOTION_PROP_CATEGORY || '',
  });
});

app.post('/api/notion/query', (req, res) => {
  const body = { page_size: 100 };
  if (req.body && req.body.start_cursor) {
    body.start_cursor = req.body.start_cursor;
  }
  const payload = JSON.stringify(body);

  const options = {
    hostname: 'api.notion.com',
    path: `/v1/databases/${NOTION_DATABASE_ID}/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const notionReq = https.request(options, (notionRes) => {
    let data = '';
    notionRes.on('data', chunk => { data += chunk; });
    notionRes.on('end', () => {
      res.status(notionRes.statusCode).set('Content-Type', 'application/json').send(data);
    });
  });

  notionReq.on('error', (err) => {
    res.status(502).json({ message: `Notion APIへの接続に失敗しました: ${err.message}` });
  });

  notionReq.write(payload);
  notionReq.end();
});

const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
