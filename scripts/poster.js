#!/usr/bin/env node
/**
 * 压花小铺 - 海报生成器
 * 用法: node scripts/poster.js [序号]
 */

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error('❌ 请先设置 OPENAI_API_KEY');
  console.error('   export OPENAI_API_KEY=sk-...');
  process.exit(1);
}

// 预设海报模板
const POSTERS = [
  {
    name: '产品海报-书签',
    prompt: `A beautiful pressed flower bookmark on a wooden table, with soft morning light shining through the window. The bookmark features real pressed pink cherry blossoms and small daisies preserved in clear material. A cup of tea and an open book nearby. Warm, cozy, Japanese wabi-sabi aesthetic. Product photography style, clean composition, natural lighting. No text or watermark.`,
  },
  {
    name: '产品海报-团扇',
    prompt: `A traditional Chinese round silk fan with pressed flowers embedded in the fan surface, held by a woman in hanfu (traditional Chinese dress). Cherry blossoms and lavender pressed into the fan. Soft pastel background with falling petals. Elegant, poetic, ancient Chinese painting style meets modern product photography. Natural diffused lighting. No text or watermark.`,
  },
  {
    name: '产品海报-台灯',
    prompt: `A bedside table lamp with a lampshade covered in pressed flowers, glowing warmly in a dark cozy bedroom. The petals create beautiful silhouettes when the light shines through. Soft golden hour ambient lighting, hygge aesthetic, peaceful atmosphere. Product photography, shallow depth of field. No text or watermark.`,
  },
  {
    name: '品牌宣传-春日花园',
    prompt: `A dreamy spring garden scene for a pressed flower artisan brand. Scattered fresh flowers and pressed flower artworks on a white linen cloth. Hands gently arranging flower petals. Soft pastel color palette - pink, lavender, cream, sage green. Natural sunlight, airy and ethereal. Editorial photography style, overhead flat lay composition. No text or watermark.`,
  },
  {
    name: '品牌宣传-手工制作',
    prompt: `Close-up of artisan hands carefully pressing fresh flowers between sheets of paper. Tools and materials scattered on a wooden workbench - tweezers, fresh daisies, ferns, pressed flower sheets. Warm natural light from a window. Authentic craftsmanship mood, documentary photography style. No text or watermark.`,
  },
];

const choice = parseInt(process.argv[2]);

async function generate(poster) {
  console.log(`🎨 生成: ${poster.name}...\n`);

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: poster.prompt,
      n: 1,
      size: '1792x1024',  // 横幅，适合海报
      quality: 'hd',
      style: 'natural',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('❌', data.error?.message);
    return;
  }

  console.log(`✅ ${poster.name}`);
  console.log(`📷 ${data.data[0].url}\n`);
}

async function main() {
  if (choice && POSTERS[choice]) {
    await generate(POSTERS[choice]);
  } else if (choice && !POSTERS[choice]) {
    console.log(`序号 0-${POSTERS.length - 1}，你输入的是 ${choice}`);
    listPosters();
  } else {
    // 生成全部
    for (const p of POSTERS) {
      await generate(p);
    }
    console.log('🎉 全部完成！');
  }
}

function listPosters() {
  console.log('可选海报:\n');
  POSTERS.forEach((p, i) => console.log(`  ${i}. ${p.name}`));
  console.log(`\n用法: node scripts/poster.js [序号]`);
  console.log(`不加序号则生成全部（${POSTERS.length} 张）`);
}

main();
