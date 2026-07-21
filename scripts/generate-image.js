#!/usr/bin/env node
/**
 * 压花小铺 - AI 图片生成工具
 * 用法: node scripts/generate-image.js "你的描述"
 * 前提: 需要 OPENAI_API_KEY，export 或者写在 .env 里
 */

const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  console.error('❌ 请先设置 OPENAI_API_KEY');
  console.error('   export OPENAI_API_KEY=sk-...');
  process.exit(1);
}

const prompt = process.argv[2];
if (!prompt) {
  console.log('用法: node scripts/generate-image.js "图片描述"');
  console.log('');
  console.log('示例:');
  console.log('  node scripts/generate-image.js "压花书签，粉色花朵，日系小清新风格，产品摄影"');
  console.log('  node scripts/generate-image.js "压花团扇海报，古风汉服，樱花，浅色背景"');
  process.exit(0);
}

async function generate() {
  console.log(`🎨 生成中: "${prompt}"...\n`);

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',          // 最新模型，效果最好
        prompt: prompt,
        n: 1,                        // 生成数量
        size: '1024x1024',           // 1024x1024 | 1792x1024 | 1024x1792
        quality: 'hd',               // standard | hd
        style: 'natural',            // vivid（鲜艳）| natural（自然）
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌', data.error?.message || JSON.stringify(data));
      process.exit(1);
    }

    const imageUrl = data.data[0]?.url;
    const revisedPrompt = data.data[0]?.revised_prompt;

    console.log('✅ 生成成功！');
    console.log('');
    console.log('📷 图片链接:');
    console.log(imageUrl);
    console.log('');
    console.log('📝 OpenAI 优化后的提示词:');
    console.log(revisedPrompt);
    console.log('');

  } catch (err) {
    console.error('❌ 请求失败:', err.message);
    process.exit(1);
  }
}

generate();
