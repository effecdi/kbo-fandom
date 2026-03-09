import { GoogleGenAI, Modality } from "@google/genai";
import sharp from "sharp";
import path from "path";
import type { Character } from "@shared/schema";

// 한국어 프롬프트를 영어로 번역하는 함수
// AI 이미지 생성 모델은 한글 텍스트를 정확히 렌더링할 수 없으므로
// 프롬프트를 영어로 번역하여 한글 텍스트가 이미지에 포함되는 것을 방지
async function translateToEnglish(text: string, aiClient: GoogleGenAI): Promise<string> {
  // 영어만 포함된 경우 번역 불필요
  if (/^[\x00-\x7F\s]*$/.test(text)) return text;

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{
          text: `Translate the following text to English. This is a character/scene description for image generation. Output ONLY the English translation, nothing else. Keep it concise and descriptive.

Text: ${text}`
        }]
      }],
    });

    const candidate = response.candidates?.[0];
    const translatedText = candidate?.content?.parts?.find((part: any) => part.text)?.text?.trim();
    return translatedText || text;
  } catch (error) {
    console.warn("Translation failed, using original text:", error);
    return text;
  }
}

// 개발 모드에서 API 키가 없으면 더미 클라이언트 생성
let ai: GoogleGenAI;
try {
  if (!process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️  Gemini API 키가 설정되지 않았습니다. 이미지 생성 기능이 동작하지 않습니다.");
      // 더미 클라이언트 생성 (실제 사용 시 에러 발생)
      ai = new GoogleGenAI({
        apiKey: "dummy-key",
        httpOptions: {
          apiVersion: "",
          baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "https://dummy.api",
        },
      });
    } else {
      throw new Error("AI_INTEGRATIONS_GEMINI_API_KEY must be set");
    }
  } else {
    ai = new GoogleGenAI({
      apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
      httpOptions: {
        apiVersion: "",
        baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
      },
    });
  }
} catch (error) {
  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️  Gemini 클라이언트 생성 실패:", error);
    ai = new GoogleGenAI({
      apiKey: "dummy-key",
      httpOptions: {
        apiVersion: "",
        baseUrl: "https://dummy.api",
      },
    });
  } else {
    throw error;
  }
}

const stylePrompts: Record<string, { keywords: string; instruction: string }> = {
  "simple-line": {
    keywords: "very simple line drawing, thick black outlines, minimal details, cute rounded shapes, clean white background, korean instagram webtoon (instatoon) style, doodle-like simplicity, flat colors with minimal shading, adorable and slightly silly character",
    instruction: `Draw in a very SIMPLE, minimal Korean Instagram webtoon (instatoon) style. The character must look like a simple doodle - NOT detailed, NOT realistic, NOT fancy. Think of simple Korean Instagram comic characters with:
- Very thick, clean black outlines
- Minimal facial features (dot eyes, simple mouth)
- Round, cute body proportions
- Very few details - keep it as simple as possible
- Clean white background
- Flat colors with no complex shading
- Charming and slightly silly feeling`,
  },
  "cute-animal": {
    keywords: "super simple cute animal character, thick black outlines, minimal features, round body shape, tiny limbs, clean white background, korean instagram webtoon (instatoon) style, kawaii doodle, very few details, flat pastel colors",
    instruction: `Draw a super cute, simple animal character in Korean Instagram webtoon (instatoon) style. The character must be:
- Very round and cute body shape with tiny limbs
- Thick black outlines
- Minimal facial features (dot eyes, small simple mouth)
- Kawaii/귀여운 style
- Clean white background
- Flat pastel colors, very few details`,
  },
  "doodle": {
    keywords: "rough hand-drawn doodle comic, loose expressive pen lines, casual messy sketch, korean instagram webtoon instatoon doodle like hoho80887 iwsurvive00, rough charming illustration, hand-drawn comic panel feel, unpolished raw doodle art, marker pen casual drawing, expressive loose linework, imperfect endearing character sketch",
    instruction: `Draw in an authentic Korean Instagram webtoon DOODLE style (낙서풍) - like popular Korean instatoon artists who draw rough, casual, expressive comics. This is NOT a clean or polished style. Key requirements:
- ROUGH, LOOSE, EXPRESSIVE pen/marker lines - lines should look genuinely hand-drawn, unsteady, and imperfect
- NOT clean, NOT polished, NOT precise - the charm is in the roughness and rawness
- Think of Korean instatoon accounts like hoho80887 or iwsurvive00 - their drawings look like quick rough doodles but are full of personality and expression
- Lines can vary in thickness, can overlap, can be messy - this adds character
- Simple but EXPRESSIVE features - the character should have clear emotions even with rough drawing
- Flat, simple coloring is okay - or just black outlines on white
- The feeling should be like someone grabbed a pen and quickly drew a funny comic character
- NOT anime, NOT digital art, NOT professional illustration - this should look hand-drawn on paper
- White or simple solid color background
- The character should feel alive and expressive despite the rough drawing style`,
  },
  "minimal": {
    keywords: "extremely minimalist character design, simple geometric shapes, dot eyes, small mouth, thick clean outlines, clean white background, korean instagram webtoon (instatoon) style, understated and cute, very few lines and details, geometric minimalism",
    instruction: `Draw an EXTREMELY minimalist character. The simplest possible design with the fewest lines. Think geometric shapes:
- Character made of basic geometric shapes (circles, ovals, rectangles)
- Absolute minimum number of lines and strokes
- Dot eyes and tiny simple mouth only
- Thick clean outlines but VERY few of them
- Clean white background
- Flat simple colors or even monochrome
- The most stripped-down, bare-minimum character possible`,
  },
  "scribble": {
    keywords: "scribble handwriting style comic, wiggly wobbly continuous pen lines, ballpoint pen scrawl drawing, scratchy energetic hand-drawn character, korean instagram webtoon instatoon scribble style, rough scribbly outlines like real handwriting, pen pressure variation, overlapping scratchy strokes, raw unfiltered doodle energy, hand-drawn on paper feel",
    instruction: `Draw a character in authentic Korean instatoon SCRIBBLE style (구불구불 손글씨) - where the lines look like actual handwriting/scrawling with a pen. This style is characterized by WOBBLY, SCRIBBLY, CONTINUOUS pen strokes. Key requirements:
- Lines must be genuinely WOBBLY and SCRIBBLY - like writing/scrawling with a ballpoint pen, NOT smooth digital lines
- SCRATCHY, overlapping strokes are encouraged - real pen drawings have this quality where the artist goes over lines multiple times
- The line quality should look like someone drawing with the same casual energy as writing a quick note
- Pen pressure variation - some lines thicker, some thinner, naturally uneven
- Simple character with expressive features - big emotions communicated through rough, energetic linework
- Think of Korean instatoon artists who draw with a deliberately rough, scribbly, handwriting-like quality
- The character should look like it was drawn in 30 seconds with a ballpoint pen on notebook paper
- NOT clean, NOT smooth, NOT digital-looking - the beauty is in the raw, scribbly, handwritten quality
- White or simple background
- Lines can be slightly messy where they connect - this is authentic to the style`,
  },
  "ink-sketch": {
    keywords: "expressive ink brush sketch, loose dynamic brush pen drawing, bold ink strokes with natural variation, korean instagram webtoon instatoon ink style like leeyounghwan, brush pen illustration, dynamic flowing ink lines, quick confident brush strokes, monochrome ink character art, expressive hand-drawn ink comic, asian ink drawing style",
    instruction: `Draw a character in expressive Korean instatoon INK SKETCH style (잉크 스케치) - like popular Korean Instagram comic artists who draw with brush pens or ink pens. This style has bold, confident, dynamic strokes. Key requirements:
- Bold, expressive INK strokes with natural variation in thickness - thick to thin transitions from brush/pen pressure
- Confident, dynamic linework - NOT timid, NOT scratchy - these are decisive brush strokes
- Natural ink qualities: some lines thick and bold, some thin and delicate, flowing transitions
- Loose and expressive but with clear intent - like a skilled artist drawing quickly with a brush pen
- Character should have personality and expression conveyed through the ink linework
- Primarily monochrome (black ink) with optional minimal gray wash tones
- Think of Korean instatoon artists who use brush pens to create expressive, dynamic character illustrations
- White or cream background
- The beauty is in the CONTRAST between thick bold strokes and thin delicate lines
- NOT digital, NOT clean vectors - this should look like real ink on paper
- Slightly loose where lines meet - authentic ink drawing quality`,
  },
};

const defaultStyle = stylePrompts["simple-line"];
const fallbackStyles = ["webtoon", "anime", "realistic", "pixar"];

function getStyleConfig(style: string) {
  if (stylePrompts[style]) return stylePrompts[style];
  return defaultStyle;
}

const noTextRule = `CRITICAL TEXT & SPEECH BUBBLE PROHIBITION: Do NOT include ANY text, letters, words, labels, captions, watermarks, or writing of ANY kind in the image - this includes Korean (한글/Hangul), English, Japanese, Chinese, or any other language. NO characters, NO letters, NO words, NO numbers, NO symbols that look like text. Do NOT draw any speech bubbles, thought bubbles, dialogue boxes, text containers, or balloon shapes. The image must contain ONLY the visual illustration with absolutely ZERO text, text-like elements, or bubble shapes. Any attempt to render non-Latin scripts like Korean will result in garbled, broken characters - so do NOT attempt it under any circumstances.`;

/**
 * 무료 사용자 이미지에 OLLI 로고 워터마크를 삽입.
 * 로고를 이미지 너비의 30%로 리사이즈, opacity 0.7, 중앙 하단 배치.
 */
export async function applyWatermark(dataUrl: string): Promise<string> {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return dataUrl;

  try {
    const imgBuf = Buffer.from(match[2], "base64");
    const imgMeta = await sharp(imgBuf).metadata();
    const imgWidth = imgMeta.width || 800;
    const imgHeight = imgMeta.height || 1200;

    const logoPath = path.resolve(__dirname, "..", "attached_assets", "logo.png");
    const logoSize = Math.round(imgWidth * 0.3);

    // 로고 리사이즈 + opacity 0.7 적용
    const resizedLogo = await sharp(logoPath)
      .resize(logoSize, logoSize, { fit: "inside" })
      .toBuffer();

    const { data: logoRaw, info: logoInfo } = await sharp(resizedLogo)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const logoPixels = Buffer.from(logoRaw);
    for (let i = 3; i < logoPixels.length; i += 4) {
      logoPixels[i] = Math.round(logoPixels[i] * 0.7);
    }

    const opaqueLogoBuf = await sharp(logoPixels, {
      raw: { width: logoInfo.width, height: logoInfo.height, channels: 4 },
    })
      .png()
      .toBuffer();

    // 중앙 하단 (하단에서 5% 여백)
    const left = Math.round((imgWidth - logoInfo.width) / 2);
    const top = Math.round(imgHeight - logoInfo.height - imgHeight * 0.05);

    const result = await sharp(imgBuf)
      .composite([{ input: opaqueLogoBuf, left, top }])
      .png()
      .toBuffer();

    return `data:image/png;base64,${result.toString("base64")}`;
  } catch (error) {
    console.warn("Watermark application failed, returning original:", error);
    return dataUrl;
  }
}

/**
 * base64 data URL 이미지를 200×200 JPEG 썸네일로 변환.
 * 갤러리 목록 등에서 원본 대신 경량 이미지 표시용.
 */
export async function generateThumbnail(dataUrl: string, maxSize = 200): Promise<string> {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return dataUrl;

  try {
    const buf = Buffer.from(match[2], "base64");
    const thumbBuf = await sharp(buf)
      .resize(maxSize, maxSize, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 60 })
      .toBuffer();
    return `data:image/jpeg;base64,${thumbBuf.toString("base64")}`;
  } catch (error) {
    console.warn("Thumbnail generation failed, skipping:", error);
    return "";
  }
}

/**
 * 이미지 가장자리에서 flood-fill하여 배경 흰색만 투명으로 변환.
 * 캐릭터 내부의 흰색(눈, 옷 등)은 보존됨.
 */
export async function removeWhiteBackground(dataUrl: string): Promise<string> {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return dataUrl;

  const buf = Buffer.from(match[2], "base64");
  const { data: raw, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(raw);
  const { width, height } = info;
  const threshold = 235;

  const isWhite = (idx: number) => {
    return pixels[idx] >= threshold && pixels[idx + 1] >= threshold && pixels[idx + 2] >= threshold;
  };

  // BFS flood-fill from image edges
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  // Seed: all edge pixels that are white
  for (let x = 0; x < width; x++) {
    const topIdx = x;
    const botIdx = (height - 1) * width + x;
    if (isWhite(topIdx * 4) && !visited[topIdx]) { visited[topIdx] = 1; queue.push(topIdx); }
    if (isWhite(botIdx * 4) && !visited[botIdx]) { visited[botIdx] = 1; queue.push(botIdx); }
  }
  for (let y = 0; y < height; y++) {
    const leftIdx = y * width;
    const rightIdx = y * width + (width - 1);
    if (isWhite(leftIdx * 4) && !visited[leftIdx]) { visited[leftIdx] = 1; queue.push(leftIdx); }
    if (isWhite(rightIdx * 4) && !visited[rightIdx]) { visited[rightIdx] = 1; queue.push(rightIdx); }
  }

  // BFS
  let head = 0;
  while (head < queue.length) {
    const pos = queue[head++];
    const x = pos % width;
    const y = (pos - x) / width;
    const neighbors = [
      y > 0 ? pos - width : -1,
      y < height - 1 ? pos + width : -1,
      x > 0 ? pos - 1 : -1,
      x < width - 1 ? pos + 1 : -1,
    ];
    for (const n of neighbors) {
      if (n >= 0 && !visited[n] && isWhite(n * 4)) {
        visited[n] = 1;
        queue.push(n);
      }
    }
  }

  // Mark background pixels transparent
  for (let i = 0; i < visited.length; i++) {
    if (visited[i]) {
      pixels[i * 4 + 3] = 0;
    }
  }

  const pngBuf = await sharp(pixels, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();

  return `data:image/png;base64,${pngBuf.toString("base64")}`;
}

export async function generateCharacterImage(prompt: string, style: string, sourceImageData?: string): Promise<string> {
  const config = getStyleConfig(style);
  const parts: any[] = [];

  const hasImage = sourceImageData && sourceImageData.startsWith("data:");
  const hasPrompt = prompt && prompt.trim().length > 0;

  // 한국어 프롬프트를 영어로 번역하여 이미지에 한글이 포함되지 않도록 함
  const translatedPrompt = hasPrompt ? await translateToEnglish(prompt, ai) : "";

  if (hasImage && hasPrompt) {
    // Image + prompt: analyze image and apply prompt modifications
    parts.push({
      text: `${config.instruction}

${noTextRule}

IMPORTANT: The character must be on a completely plain solid white background with NOTHING else - no shadows, no ground, no decorations, no patterns. Just the character floating on pure white. This is critical because the image will be used as a sticker/cutout.

IMPORTANT: Generate the image in 3:4 portrait aspect ratio. The image MUST be taller than wide.

Look at this reference image carefully. Analyze the character, person, or subject in it. Now create a NEW character illustration based on this image, but with the following modifications: ${translatedPrompt}

Keep the core appearance from the reference image (face features, body type, clothing style etc.) but apply the requested changes and draw it in this style: ${config.keywords}.

Single character only, full body view, pure solid white background, no shadows on background. Do NOT write any text or words in the image. Do NOT render any Korean, Japanese, Chinese or other non-Latin characters.`
    });
    const match = sourceImageData.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        }
      });
    }
  } else if (hasImage) {
    // Image only: analyze and recreate as character
    parts.push({
      text: `${config.instruction}

${noTextRule}

IMPORTANT: The character must be on a completely plain solid white background with NOTHING else - no shadows, no ground, no decorations, no patterns. Just the character floating on pure white. This is critical because the image will be used as a sticker/cutout.

IMPORTANT: Generate the image in 3:4 portrait aspect ratio. The image MUST be taller than wide.

Look at this reference image carefully. Analyze the character, person, or subject in it - their appearance, clothing, pose, expression, and key features. Now recreate this as a character illustration in the following style: ${config.keywords}.

Capture the essence and key visual features of the reference but draw it as a stylized character illustration. Single character only, full body view, pure solid white background, no shadows on background. Do NOT write any text or words in the image. Do NOT render any Korean, Japanese, Chinese or other non-Latin characters.`
    });
    const match = sourceImageData.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        }
      });
    }
  } else {
    // Prompt only (original behavior)
    parts.push({
      text: `${config.instruction}

${noTextRule}

IMPORTANT: The character must be on a completely plain solid white background with NOTHING else - no shadows, no ground, no decorations, no patterns. Just the character floating on pure white. This is critical because the image will be used as a sticker/cutout.

IMPORTANT: Generate the image in 3:4 portrait aspect ratio. The image MUST be taller than wide.

Create a character: ${translatedPrompt}.
Style: ${config.keywords}.
Single character only, full body view, pure solid white background, no shadows on background. Do NOT write any text or words in the image. Do NOT render any Korean, Japanese, Chinese or other non-Latin characters.`
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: parts,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
      imageConfig: {
        aspectRatio: "3:4",
      },
    },
  });

  const promptFeedback = (response as any).promptFeedback;
  if (promptFeedback?.blockReason) {
    throw new Error(`Prompt blocked: ${promptFeedback.blockReason}`);
  }

  const candidate = response.candidates?.[0];
  if (!candidate) {
    throw new Error("No candidates in response — model may have rejected the request");
  }

  const imagePart = candidate?.content?.parts?.find(
    (part: any) => part.inlineData
  );

  if (!imagePart?.inlineData?.data) {
    const reason = candidate.finishReason ? ` (finishReason: ${candidate.finishReason})` : "";
    throw new Error(`Failed to generate image - no image data in response${reason}`);
  }

  const mimeType = imagePart.inlineData.mimeType || "image/png";
  const rawDataUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;
  return removeWhiteBackground(rawDataUrl);
}

export async function generatePoseImage(
  characters: Character[],
  posePrompt: string,
  referenceImageData?: string
): Promise<string> {
  const config = getStyleConfig(characters[0].style);

  // 한국어 프롬프트를 영어로 번역
  const translatedPosePrompt = await translateToEnglish(posePrompt, ai);

  const parts: any[] = [];
  const isMulti = characters.length > 1;

  if (isMulti) {
    // 다중 캐릭터: 모든 캐릭터 이미지를 parts에 추가
    const charDescriptions = await Promise.all(
      characters.map((c, i) => translateToEnglish(c.prompt, ai).then(t => `Character ${i + 1}: ${t}`))
    );

    parts.push({
      text: `${config.instruction}

${noTextRule}

Look at these ${characters.length} reference character images. Generate ALL ${characters.length} characters together in a SINGLE scene. Keep each character looking EXACTLY the same as their reference - same style, same features, same colors, same proportions.

IMPORTANT: Generate the image in 3:4 portrait aspect ratio. The image MUST be taller than wide.

${charDescriptions.join("\n")}
Style: ${config.keywords}
Scene/pose: ${translatedPosePrompt}

Place all ${characters.length} characters together in the scene, interacting naturally. Keep each character's unique appearance. Do NOT write any text or words in the image. Do NOT render any Korean, Japanese, Chinese or other non-Latin characters.`
    });

    for (const character of characters) {
      if (character.imageUrl.startsWith("data:")) {
        const match = character.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            }
          });
        }
      }
    }
  } else {
    // 단일 캐릭터: 기존 로직 유지
    const character = characters[0];
    const translatedCharPrompt = await translateToEnglish(character.prompt, ai);

    parts.push({
      text: `${config.instruction}

${noTextRule}

Generate a new pose of the same character described below. Keep the character looking EXACTLY the same - same style, same features, same colors. Only change the pose and expression.

IMPORTANT: Generate the image in 3:4 portrait aspect ratio. The image MUST be taller than wide.

Original character description: ${translatedCharPrompt}
Style: ${config.keywords}
New pose/expression: ${translatedPosePrompt}

Keep the SAME style. Single character. Do NOT write any text or words in the image. Do NOT render any Korean, Japanese, Chinese or other non-Latin characters.`
    });

    if (character.imageUrl.startsWith("data:")) {
      const match = character.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          }
        });
        parts[0] = {
          text: `${config.instruction}

${noTextRule}

Look at this reference character image. Generate the EXACT SAME character in a different pose. Keep it in the same style - same line thickness, same level of detail, same colors.

IMPORTANT: Generate the image in 3:4 portrait aspect ratio. The image MUST be taller than wide.

New pose/expression: ${translatedPosePrompt}
Style: ${config.keywords}

Keep the character identical to the reference. Only change the pose. Single character. Do NOT write any text or words in the image. Do NOT render any Korean, Japanese, Chinese or other non-Latin characters.`
        };
      }
    }
  }

  if (referenceImageData && referenceImageData.startsWith("data:")) {
    const match = referenceImageData.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        }
      });
    }
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: parts,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
      imageConfig: {
        aspectRatio: "3:4",
      },
    },
  });

  const promptFeedback = (response as any).promptFeedback;
  if (promptFeedback?.blockReason) {
    throw new Error(`Prompt blocked: ${promptFeedback.blockReason}`);
  }

  const candidate = response.candidates?.[0];
  if (!candidate) {
    throw new Error("No candidates in response — model may have rejected the request");
  }

  const imagePart = candidate?.content?.parts?.find(
    (part: any) => part.inlineData
  );

  if (!imagePart?.inlineData?.data) {
    const reason = candidate.finishReason ? ` (finishReason: ${candidate.finishReason})` : "";
    throw new Error(`Failed to generate pose - no image data in response${reason}`);
  }

  const mimeType = imagePart.inlineData.mimeType || "image/png";
  const rawDataUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;
  return removeWhiteBackground(rawDataUrl);
}

export async function generateWithBackground(
  sourceImageDataList: string[] | undefined,
  backgroundPrompt: string,
  itemsPrompt?: string,
  noBackground?: boolean,
  aspectRatio?: string
): Promise<string> {
  // 한국어 프롬프트를 영어로 번역
  const translatedBgPrompt = await translateToEnglish(backgroundPrompt, ai);
  const translatedItemsPrompt = itemsPrompt ? await translateToEnglish(itemsPrompt, ai) : undefined;
  const arInstruction = aspectRatio || "3:4 portrait";

  const parts: any[] = [];
  const images = sourceImageDataList ?? [];
  const isMulti = images.length > 1;
  const hasImages = images.length > 0;

  const itemsInstruction = translatedItemsPrompt
    ? `Also add these items/props around or with the characters: ${translatedItemsPrompt}.`
    : "";

  // 자동화툰 멀티컷용: 배경 없이 캐릭터/아이템만 생성
  if (noBackground) {
    if (!hasImages) {
      parts.push({
        text: `Generate a character illustration for the following scene description.

${noTextRule}

CRITICAL RULES:
- Do NOT draw any background, scenery, room, furniture, or environment
- The background MUST be a plain solid white color (#FFFFFF) — absolutely nothing else
- Draw ONLY the characters and essential props/items they are holding or interacting with
- Draw in a very simple, cute Korean Instagram webtoon (instatoon) style
- Use thick clean outlines and minimal flat colors
- Keep the same consistent art style across all images
- Characters should be drawn large, filling most of the image area
- Center the characters in the image

Scene action: ${translatedBgPrompt}
${itemsInstruction}

IMPORTANT: Generate the image in ${arInstruction} aspect ratio. The image MUST completely fill the canvas in this exact ratio.
IMPORTANT: Plain white background ONLY. NO rooms, NO walls, NO floors, NO furniture, NO scenery, NO gradients, NO patterns.

Do NOT write any text or words in the image. Do NOT render any Korean, Japanese, Chinese or other non-Latin characters.`
      });
    } else if (isMulti) {
      parts.push({
        text: `Take these ${images.length} character images and draw them together performing the described action.

${noTextRule}

CRITICAL RULES:
- Keep each character looking EXACTLY the same as their reference - same style, same features, same colors, same proportions
- Do NOT draw any background, scenery, room, furniture, or environment
- The background MUST be a plain solid white color (#FFFFFF) — absolutely nothing else
- Draw ONLY the characters and essential props/items they are holding or interacting with
- All ${images.length} characters should appear together
- Characters should be drawn large, filling most of the image area
- Keep the overall style ultra-simple and cute with thick clean outlines and flat colors
- Maintain consistent style across all generated images

Scene action: ${translatedBgPrompt}
${itemsInstruction}

IMPORTANT: Generate the image in ${arInstruction} aspect ratio. The image MUST completely fill the canvas in this exact ratio.
IMPORTANT: Plain white background ONLY. NO rooms, NO walls, NO floors, NO furniture, NO scenery, NO gradients, NO patterns.

Do NOT write any text or words in the image. Do NOT render any Korean, Japanese, Chinese or other non-Latin characters.`
      });
    } else {
      parts.push({
        text: `Take this character image and draw the character performing the described action.

${noTextRule}

CRITICAL RULES:
- Keep the character looking EXACTLY the same - same style, same features, same colors, same proportions
- Do NOT draw any background, scenery, room, furniture, or environment
- The background MUST be a plain solid white color (#FFFFFF) — absolutely nothing else
- Draw ONLY the character and essential props/items they are holding or interacting with
- The character should be drawn large, filling most of the image area
- Keep the overall style ultra-simple and cute with thick clean outlines and flat colors
- Maintain consistent style across all generated images

Scene action: ${translatedBgPrompt}
${itemsInstruction}

IMPORTANT: Generate the image in ${arInstruction} aspect ratio. The image MUST completely fill the canvas in this exact ratio.
IMPORTANT: Plain white background ONLY. NO rooms, NO walls, NO floors, NO furniture, NO scenery, NO gradients, NO patterns.

Do NOT write any text or words in the image. Do NOT render any Korean, Japanese, Chinese or other non-Latin characters.`
      });
    }
  } else if (!hasImages) {
    // 캐릭터 이미지 없이 배경/장면만 생성
    parts.push({
      text: `Generate an illustration for the following scene.

${noTextRule}

IMPORTANT RULES:
- Draw in a simple, cute Korean Instagram webtoon (instatoon) style
- Keep thick outlines and flat colors
- The scene should be clear and visually engaging
- The illustration MUST fill the ENTIRE image from edge to edge. There must be NO white borders, margins, or empty padding around the edges. The background color/scene must extend all the way to every edge of the image.

Scene: ${translatedBgPrompt}
${itemsInstruction}

IMPORTANT: Generate the image in 3:4 portrait aspect ratio. The image MUST be taller than wide.

Do NOT write any text or words in the image. Do NOT render any Korean, Japanese, Chinese or other non-Latin characters.`
    });
  } else if (isMulti) {
    parts.push({
      text: `Take these ${images.length} character images and place ALL characters together into a new scene with a background and optional items.

${noTextRule}

IMPORTANT RULES:
- Keep each character looking EXACTLY the same as their reference - same style, same features, same colors, same proportions
- All ${images.length} characters should appear together in the scene
- The characters should be the main focus of the image
- Draw the background in a style that matches the characters (simple, cute, instatoon style)
- The background should complement the characters, not overwhelm them
- Keep the overall style simple and cute, matching Korean Instagram webtoon (instatoon) aesthetics
- The illustration MUST fill the ENTIRE image from edge to edge. There must be NO white borders, margins, or empty padding around the edges. The background color/scene must extend all the way to every edge of the image.

Background scene: ${translatedBgPrompt}
${itemsInstruction}

IMPORTANT: Generate the image in 3:4 portrait aspect ratio. The image MUST be taller than wide.

Make the background and items in the same simple, cute drawing style as the characters. Keep thick outlines and flat colors. Do NOT write any text or words in the image. Do NOT render any Korean, Japanese, Chinese or other non-Latin characters.`
    });
  } else {
    parts.push({
      text: `Take this character image and place the character into a new scene with a background and optional items.

${noTextRule}

IMPORTANT RULES:
- Keep the character looking EXACTLY the same - same style, same features, same colors, same proportions
- The character should be the main focus of the image
- Draw the background in a style that matches the character (simple, cute, instatoon style)
- The background should complement the character, not overwhelm it
- Keep the overall style simple and cute, matching Korean Instagram webtoon (instatoon) aesthetics
- The illustration MUST fill the ENTIRE image from edge to edge. There must be NO white borders, margins, or empty padding around the edges. The background color/scene must extend all the way to every edge of the image.

Background scene: ${translatedBgPrompt}
${itemsInstruction}

IMPORTANT: Generate the image in 3:4 portrait aspect ratio. The image MUST be taller than wide.

Make the background and items in the same simple, cute drawing style as the character. Keep thick outlines and flat colors. Do NOT write any text or words in the image. Do NOT render any Korean, Japanese, Chinese or other non-Latin characters.`
    });
  }

  for (const sourceImageData of images) {
    const match = sourceImageData.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        }
      });
    }
  }

  // 최대 2회 시도 (첫 시도 실패 시 1회 재시도)
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: parts,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
          imageConfig: {
            aspectRatio: "3:4",
          },
        },
      });

      // 안전 필터 / 프롬프트 차단 확인
      const promptFeedback = (response as any).promptFeedback;
      if (promptFeedback?.blockReason) {
        throw new Error(`Prompt blocked: ${promptFeedback.blockReason}`);
      }

      const candidate = response.candidates?.[0];
      if (!candidate) {
        throw new Error("No candidates in response — model may have rejected the request");
      }

      // finishReason 확인 (IMAGE_SAFETY, SAFETY 등)
      const finishReason = candidate.finishReason;
      if (finishReason && finishReason !== "STOP" && finishReason !== "MAX_TOKENS") {
        console.warn("Background generation finishReason:", finishReason);
      }

      const bgImagePart = candidate?.content?.parts?.find(
        (part: any) => part.inlineData
      );

      if (!bgImagePart?.inlineData?.data) {
        const reason = finishReason ? ` (finishReason: ${finishReason})` : "";
        throw new Error(`Failed to generate background - no image data in response${reason}`);
      }

      const bgMimeType = bgImagePart.inlineData.mimeType || "image/png";
      return `data:${bgMimeType};base64,${bgImagePart.inlineData.data}`;
    } catch (err: any) {
      lastError = err;
      console.error(`Background generation attempt ${attempt + 1} failed:`, err?.message || err);
      if (attempt === 0) {
        // 첫 시도 실패 시 짧은 대기 후 재시도
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
  throw lastError || new Error("Failed to generate background after retries");
}

/**
 * 자동 웹툰 전용 장면 이미지 생성.
 * 기존 generateWithBackground와 달리:
 * 1) sceneDescription을 장면 묘사의 핵심으로 강조
 * 2) 스토리 주제(storyContext)를 전달하여 주제 일관성 유지
 * 3) 캐릭터 이미지가 있어도 "장면" 중심 생성
 */
export async function generateWebtoonScene(
  sceneDescription: string,
  storyContext: string,
  sourceImageDataList?: string[],
  aspectRatio?: string,
  sceneIndex?: number,
  totalScenes?: number,
  previousSceneDescription?: string,
): Promise<string> {
  const parts: any[] = [];
  const images = sourceImageDataList ?? [];
  const hasImages = images.length > 0;

  // Gemini 지원 비율: "1:1", "3:4", "4:3", "9:16", "16:9"
  // 전달된 값이 유효한지 확인, 아니면 "3:4" 기본값
  const validRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
  const geminiAspectRatio = (aspectRatio && validRatios.includes(aspectRatio)) ? aspectRatio : "3:4";
  const isLandscape = ["4:3", "16:9"].includes(geminiAspectRatio);
  const ratioLabel = isLandscape ? `${geminiAspectRatio} landscape` : `${geminiAspectRatio} portrait`;

  // sceneDescription, storyContext 모두 한국어일 수 있으므로 번역
  const translatedScene = await translateToEnglish(sceneDescription, ai);
  const translatedContext = await translateToEnglish(storyContext, ai);

  // 장면 위치 및 이전 장면 컨텍스트 블록 생성
  let scenePositionBlock = "";
  if (sceneIndex !== undefined && totalScenes !== undefined && totalScenes > 1) {
    const pos = sceneIndex + 1; // 1-based
    let arcLabel = "MIDDLE";
    if (pos === 1) arcLabel = "OPENING";
    else if (pos <= Math.ceil(totalScenes * 0.25)) arcLabel = "EARLY";
    else if (pos === totalScenes) arcLabel = "FINAL";
    else if (pos >= totalScenes - 1) arcLabel = "CLIMAX";
    scenePositionBlock += `\nSCENE POSITION: Scene ${pos} of ${totalScenes} (${arcLabel})\n`;
  }
  if (previousSceneDescription) {
    const translatedPrev = await translateToEnglish(previousSceneDescription, ai);
    scenePositionBlock += `PREVIOUS SCENE: ${translatedPrev}\nThis scene must flow naturally from the previous scene — maintain continuity in character poses, emotions, and story progression.\n`;
  }

  if (hasImages) {
    // Gemini multimodal best practice: 레퍼런스 이미지를 텍스트보다 앞에 배치
    for (const src of images) {
      const match = src.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
      }
    }

    parts.push({
      text: `You are illustrating a scene for a Korean Instagram webtoon (instatoon) comic strip.

${noTextRule}

CHARACTER REFERENCE (MOST IMPORTANT — the images above are the GROUND TRUTH):
- The reference images above show the EXACT character(s) you MUST draw.
- COPY the EXACT same character: same face shape, same hairstyle, same hair color, same outfit, same proportions, same accessories.
- Do NOT invent new character designs. ONLY draw the character(s) from the reference images.
- Ignore any text descriptions of character appearance (hair color, clothing, etc.) — use ONLY the reference images for how the character looks.
- The character must be immediately recognizable as the same person across all scenes.

STORY CONTEXT (EVERY scene must directly illustrate this story — do NOT deviate):
"${translatedContext}"
${scenePositionBlock}
SCENE TO ILLUSTRATE (draw exactly this action/pose/expression):
${translatedScene}

CRITICAL RULES:
- Draw EXACTLY the scene described above using the EXACT character from the reference images.
- The scene MUST DIRECTLY illustrate the story topic: "${translatedContext}" — every visual element must connect to this topic
- Do NOT draw any background, scenery, room, furniture, walls, floors, or environment
- The background MUST be a plain solid white color (#FFFFFF) — absolutely nothing else
- Draw ONLY the characters and essential props/items they are holding or interacting with
- Do NOT draw any speech bubbles, thought bubbles, dialogue boxes, or text containers — speech bubbles are added separately
- If the scene involves a phone/smartphone, draw the phone screen clearly visible with UI elements
- Characters should be drawn large, filling most of the image area
- ${ratioLabel} aspect ratio — the image must completely fill the canvas in this exact ratio
- Style: simple line art, thick outlines, flat colors, cute Korean instatoon style

IMPORTANT: Plain white background ONLY. NO rooms, NO walls, NO floors, NO furniture, NO scenery, NO gradients, NO patterns.
Do NOT add any text, letters, writing, speech bubbles, or dialogue boxes of any kind to the image. Speech bubbles will be overlaid separately.`
    });
  } else {
    parts.push({
      text: `You are illustrating a scene for a Korean Instagram webtoon (instatoon) comic strip.

${noTextRule}

STORY CONTEXT (the entire comic is about this topic — every scene must relate to it):
"${translatedContext}"
${scenePositionBlock}
SCENE TO ILLUSTRATE (this is the MOST important part — draw exactly this):
${translatedScene}

CRITICAL RULES:
- Draw EXACTLY the scene described above. Do NOT deviate from it.
- The scene MUST DIRECTLY illustrate the story topic: "${translatedContext}" — every visual element must connect to this topic
- Include character(s) appropriate for the scene with clear poses and expressions
- Do NOT draw any background, scenery, room, furniture, walls, floors, or environment
- The background MUST be a plain solid white color (#FFFFFF) — absolutely nothing else
- Draw ONLY the characters and essential props/items they are holding or interacting with
- Do NOT draw any speech bubbles, thought bubbles, dialogue boxes, or text containers — speech bubbles are added separately
- If the scene involves a phone/smartphone, draw the phone screen clearly visible with UI elements
- Characters should be drawn large, filling most of the image area
- ${ratioLabel} aspect ratio — the image must completely fill the canvas in this exact ratio
- Style: simple line art, thick outlines, flat colors, cute Korean instatoon style

IMPORTANT: Plain white background ONLY. NO rooms, NO walls, NO floors, NO furniture, NO scenery, NO gradients, NO patterns.
Do NOT add any text, letters, writing, speech bubbles, or dialogue boxes of any kind to the image. Speech bubbles will be overlaid separately.`
    });
  }

  // hasImages일 때는 이미 위에서 이미지를 텍스트 앞에 추가했으므로 스킵
  if (!hasImages) {
    for (const src of images) {
      const match = src.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
      }
    }
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: parts,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
          imageConfig: { aspectRatio: geminiAspectRatio as any },
        },
      });

      const promptFeedback = (response as any).promptFeedback;
      if (promptFeedback?.blockReason) {
        throw new Error(`Prompt blocked: ${promptFeedback.blockReason}`);
      }

      const candidate = response.candidates?.[0];
      if (!candidate) {
        throw new Error("No candidates in response");
      }

      const imagePart = candidate?.content?.parts?.find((part: any) => part.inlineData);
      if (!imagePart?.inlineData?.data) {
        const reason = candidate.finishReason ? ` (finishReason: ${candidate.finishReason})` : "";
        throw new Error(`Failed to generate scene image${reason}`);
      }

      const mimeType = imagePart.inlineData.mimeType || "image/png";
      return `data:${mimeType};base64,${imagePart.inlineData.data}`;
    } catch (err: any) {
      lastError = err;
      console.error(`Webtoon scene generation attempt ${attempt + 1} failed:`, err?.message || err);
      if (attempt < 2) await new Promise(r => setTimeout(r, 1500));
    }
  }
  throw lastError || new Error("Failed to generate webtoon scene after retries");
}
