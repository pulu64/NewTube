import { OpenAI } from "openai";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { serve } from "@upstash/workflow/nextjs"

import { db } from "@/db";
import { videos } from "@/db/schema";

interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
};

const openai = new OpenAI({
  // 从环境变量中获取您的 API Key。此为默认方式，您可根据需要进行修改
  apiKey: process.env['ARK_API_KEY'],
  // 此为默认路径，您可根据业务所在地域进行配置
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

export const { POST } = serve(
  async (context) => {
    const utapi = new UTApi();
    const input = context.requestPayload as InputType;
    const { videoId, userId, prompt } = input;

    const video = await context.run("get-video", async () => {
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(
          eq(videos.id, videoId),
          eq(videos.userId, userId),
        ));

      if (!existingVideo) {
        throw new Error("Not found");
      }

      return existingVideo;
    });

    const response = await openai.images.generate({
      // 指定您创建的方舟推理接入点 ID，此处已帮您修改为您的推理接入点 ID
      model: "doubao-seedream-3-0-t2i-250415",
      prompt: prompt,
      size: "1792x1024",
      response_format: "url"
    });

    if (!response.data) {
      throw new Error("Image generation failed or no URL returned");
    }

    const tempThumbnailUrl = response.data[0].url;

    if (!tempThumbnailUrl) {
      throw new Error("Bad request");
    }

    await context.run("cleanup-thumbnail", async () => {
      if (video.thumbnailKey) {
        await utapi.deleteFiles(video.thumbnailKey);
        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null })
          .where(and(
            eq(videos.id, videoId),
            eq(videos.userId, userId),
          ));
      }
    });

    const uploadedThumbnail = await context.run("upload-thumbnail", async () => {
      const { data } = await utapi.uploadFilesFromUrl(tempThumbnailUrl);

      if (!data) {
        throw new Error("Bad request");
      }

      return data;
    });

    await context.run("update-video", async () => {
      await db
        .update(videos)
        .set({
          thumbnailKey: uploadedThumbnail.key,
          thumbnailUrl: uploadedThumbnail.url,
        })
        .where(and(
          eq(videos.id, video.id),
          eq(videos.userId, video.userId),
        ))
    })
  }
);
