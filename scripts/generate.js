#!/usr/bin/env node
/**
 * 压花小铺 - 图片生成工具
 * 使用 gpt-image-2 通过 openox 中转站
 * 用法: node scripts/generate.js [模板名或描述]
 */

const BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openox.tech';
const API_KEY = process.env.OPENAI_API_KEY;

// ── 预设模板 ──
const TEMPLATES = {
  '书签': 'A pressed flower bookmark with real pink cherry blossoms on a wooden desk, warm morning light, soft bokeh. Product photography, cozy aesthetic, 4K.',
  '团扇': 'Chinese round fan with pressed flowers, cherry blossoms and baby breath. Elegant woman hand holding. Ancient Chinese painting style, ethereal lighting.',
  '台灯': 'Bedside lamp with pressed flower shade glowing warmly in dim room. Golden hour ambiance, hygge, product photo.',
  '帆布包': 'Canvas tote with pressed flowers in clear pocket, hanging on chair in sunlit garden. Fresh daisies, spring vibe, lifestyle photo.',
  '镜子': 'Small hand mirror with pressed flowers on back, lying on lace among rose petals. Vintage feminine, soft light, close-up.',
  '笔记本': 'Handmade notebook with pressed flower cover, open on desk with dried flowers and pen. Cozy study atmosphere, editorial flat lay.',
  '画框': 'Wooden picture frame with pressed flowers inside, hung on pastel wall. Simple elegant home decor. Natural lighting.',
  '品牌': 'Spring garden flat lay. Pressed flower artworks on white linen, hands arranging petals. Pastel palette, sunlight, airy editorial.',
  '匠心': 'Close-up of hands pressing flowers between paper. Tweezers, daisies, ferns on wooden workbench. Documentary craftsmanship style.',
  'banner': 'Wide decorative banner for pressed flower store. Spring flowers border, pastel gradient, empty center space. Clean elegant design, cottagecore.',
};

const SIZES = {
  square: '1024x1024',
  wide: '1792x1024',
  tall: '1024x1792',
};

function listTemplates() {
  console.log('\n📋 预设模板:\n');
  Object.entries(TEMPLATES).forEach(([name, prompt]) => {
    console.log(`  ${name.padEnd(8)} ${prompt.slice(0, 70)}...`);
  });
  console.log('\n💡 用法:');
  console.log('  node scripts/generate.js 书签          ← 用模板');
  console.log('  node scripts/generate.js "一只猫咪"    ← 自由描述');
  console.log('  node scripts/generate.js               ← 看这个菜单');
}

async function generate(prompt, size = 'square') {
  console.log(`\n🎨 生成中: "${prompt.slice(0, 80)}..."`);

  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-2',
      messages: [
        { role: 'user', content: `Generate an image: ${prompt}. High quality, photorealistic, no text or watermark.` }
      ],
      max_tokens: 4096,
    }),
  });

  const data = await res.json();

  if (data.error) {
    console.error('❌', data.error.message || data.error);
    return null;
  }

  // gpt-image-2 returns base64 in markdown image format
  const content = data.choices?.[0]?.message?.content || '';

  if (!content) {
    console.error('❌ 空响应:', JSON.stringify(data).slice(0, 200));
    return null;
  }

  // Extract base64 data
  const base64Match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);

  if (!base64Match) {
    // Maybe it returned a URL instead
    console.log('📷 响应内容:', content.slice(0, 300));
    return null;
  }

  const base64 = base64Match[0];
  const ext = base64.includes('image/png') ? 'png' : base64.includes('image/jpeg') ? 'jpg' : 'png';

  // Save to public/uploads
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });

  const filename = `ai-${Date.now()}.${ext}`;
  const filepath = path.join(uploadsDir, filename);

  const base64Data = base64.split(',')[1];
  fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

  const url = `/api/uploads/${filename}`;
  console.log(`✅ 已保存: ${url}`);
  console.log(`📁 ${filepath}`);

  return url;
}

async function main() {
  if (!API_KEY) {
    console.error('❌ 缺少 OPENAI_API_KEY，检查 .env.local');
    process.exit(1);
  }

  const input = process.argv[2];

  if (!input) {
    listTemplates();
    process.exit(0);
  }

  // 匹配模板
  const matched = TEMPLATES[input];
  const prompt = matched || input;
  const size = input === 'banner' ? 'wide' : 'square';

  if (matched) console.log(`📋 模板: ${input}`);

  const url = await generate(prompt, size);
  if (url) {
    console.log(`\n💡 在管理后台选择图片: ${url}`);
  }
}

main();
