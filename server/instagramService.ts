import crypto from "crypto";
import axios from "axios";
import { config } from "./config";
import { supabase } from "./supabaseClient";

const GRAPH_API = "https://graph.facebook.com/v21.0";

// ── Token encryption (AES-256-GCM) ──

export function encryptToken(plain: string): string {
  const key = Buffer.from(config.tokenEncryptionKey, "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), encrypted.toString("hex"), tag.toString("hex")].join(":");
}

export function decryptToken(encrypted: string): string {
  const key = Buffer.from(config.tokenEncryptionKey, "hex");
  const [ivHex, dataHex, tagHex] = encrypted.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return decipher.update(dataHex, "hex", "utf8") + decipher.final("utf8");
}

// ── OAuth ──

export function getOAuthUrl(userId: string): string {
  const state = Buffer.from(JSON.stringify({ userId })).toString("base64url");
  const params = new URLSearchParams({
    client_id: config.metaAppId,
    redirect_uri: config.metaRedirectUri,
    scope: "pages_show_list,instagram_basic,instagram_content_publish,pages_read_engagement",
    response_type: "code",
    state,
  });
  return `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  // Short-lived token
  const { data: shortData } = await axios.get(`${GRAPH_API}/oauth/access_token`, {
    params: {
      client_id: config.metaAppId,
      client_secret: config.metaAppSecret,
      redirect_uri: config.metaRedirectUri,
      code,
    },
  });

  // Exchange for long-lived token (60 days)
  const { data: longData } = await axios.get(`${GRAPH_API}/oauth/access_token`, {
    params: {
      grant_type: "fb_exchange_token",
      client_id: config.metaAppId,
      client_secret: config.metaAppSecret,
      fb_exchange_token: shortData.access_token,
    },
  });

  const expiresInSeconds = longData.expires_in || 5184000; // default 60 days
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  return { accessToken: longData.access_token, expiresAt };
}

export async function refreshLongLivedToken(token: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  const { data } = await axios.get(`${GRAPH_API}/oauth/access_token`, {
    params: {
      grant_type: "fb_exchange_token",
      client_id: config.metaAppId,
      client_secret: config.metaAppSecret,
      fb_exchange_token: token,
    },
  });
  const expiresInSeconds = data.expires_in || 5184000;
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  return { accessToken: data.access_token, expiresAt };
}

// ── Instagram Business Account discovery ──

export async function getInstagramBusinessAccount(token: string): Promise<{
  igUserId: string;
  igUsername: string;
  fbPageId: string;
}> {
  // Get pages the user manages
  const { data: pagesData } = await axios.get(`${GRAPH_API}/me/accounts`, {
    params: { access_token: token, fields: "id,name,instagram_business_account" },
  });

  const page = pagesData.data?.find((p: any) => p.instagram_business_account);
  if (!page) {
    throw new Error("연결된 Instagram Business/Creator 계정을 찾을 수 없습니다. Facebook 페이지에 Instagram 비즈니스 계정이 연결되어 있는지 확인해주세요.");
  }

  const fbPageId = page.id;
  const igUserId = page.instagram_business_account.id;

  // Get IG username
  const { data: igData } = await axios.get(`${GRAPH_API}/${igUserId}`, {
    params: { access_token: token, fields: "username" },
  });

  return { igUserId, igUsername: igData.username || "", fbPageId };
}

// ── Supabase Storage upload ──

export async function uploadImageToStorage(
  userId: string,
  base64DataUrl: string,
  filename: string,
): Promise<string> {
  const matches = base64DataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!matches) throw new Error("Invalid base64 image data");

  const mimeType = `image/${matches[1]}`;
  const buffer = Buffer.from(matches[2], "base64");
  const path = `${userId}/${Date.now()}-${filename}`;

  const { error } = await supabase.storage
    .from("instagram-images")
    .upload(path, buffer, { contentType: mimeType, upsert: true });

  if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from("instagram-images")
    .getPublicUrl(path);

  return urlData.publicUrl;
}

// ── Instagram Publishing ──

async function waitForMediaContainer(igUserId: string, containerId: string, token: string, maxWait = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const { data } = await axios.get(`${GRAPH_API}/${containerId}`, {
      params: { access_token: token, fields: "status_code" },
    });
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") throw new Error("Instagram 미디어 처리 중 오류가 발생했습니다.");
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Instagram 미디어 처리 시간이 초과되었습니다.");
}

export async function publishSingleImage(
  igUserId: string,
  token: string,
  imageUrl: string,
  caption?: string,
): Promise<string> {
  // Create media container
  const { data: container } = await axios.post(`${GRAPH_API}/${igUserId}/media`, null, {
    params: {
      access_token: token,
      image_url: imageUrl,
      caption: caption || "",
    },
  });

  await waitForMediaContainer(igUserId, container.id, token);

  // Publish
  const { data: published } = await axios.post(`${GRAPH_API}/${igUserId}/media_publish`, null, {
    params: {
      access_token: token,
      creation_id: container.id,
    },
  });

  return published.id;
}

export async function publishCarousel(
  igUserId: string,
  token: string,
  imageUrls: string[],
  caption?: string,
): Promise<string> {
  if (imageUrls.length < 2 || imageUrls.length > 10) {
    throw new Error("캐러셀은 2~10장의 이미지가 필요합니다.");
  }

  // Create individual item containers
  const childIds: string[] = [];
  for (const url of imageUrls) {
    const { data } = await axios.post(`${GRAPH_API}/${igUserId}/media`, null, {
      params: {
        access_token: token,
        image_url: url,
        is_carousel_item: true,
      },
    });
    childIds.push(data.id);
  }

  // Wait for all children
  for (const cid of childIds) {
    await waitForMediaContainer(igUserId, cid, token);
  }

  // Create carousel container
  const { data: carousel } = await axios.post(`${GRAPH_API}/${igUserId}/media`, null, {
    params: {
      access_token: token,
      media_type: "CAROUSEL",
      children: childIds.join(","),
      caption: caption || "",
    },
  });

  await waitForMediaContainer(igUserId, carousel.id, token);

  // Publish
  const { data: published } = await axios.post(`${GRAPH_API}/${igUserId}/media_publish`, null, {
    params: {
      access_token: token,
      creation_id: carousel.id,
    },
  });

  return published.id;
}

export async function publishStory(
  igUserId: string,
  token: string,
  imageUrl: string,
): Promise<string> {
  const { data: container } = await axios.post(`${GRAPH_API}/${igUserId}/media`, null, {
    params: {
      access_token: token,
      image_url: imageUrl,
      media_type: "STORIES",
    },
  });

  await waitForMediaContainer(igUserId, container.id, token);

  const { data: published } = await axios.post(`${GRAPH_API}/${igUserId}/media_publish`, null, {
    params: {
      access_token: token,
      creation_id: container.id,
    },
  });

  return published.id;
}
