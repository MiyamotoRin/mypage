module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  res.json({
    propName: process.env.NOTION_PROP_NAME || '著者名',
    propBirth: process.env.NOTION_PROP_BIRTH || '生年',
    propDeath: process.env.NOTION_PROP_DEATH || '没年',
    propCategory: process.env.NOTION_PROP_CATEGORY || '',
  });
};
