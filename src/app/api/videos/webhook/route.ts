import { eq } from "drizzle-orm";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { headers } from "next/headers";
import { mux } from "@/lib/mux";
import { db } from "@/db";
import { videos } from "@/db/schema";
import dotenv from "dotenv";

type webhookEvent =
  VideoAssetCreatedWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetErroredWebhookEvent;

dotenv.config({ path: '.env.local' });


const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

export const POST = async (request: Request) => {
  if (!SIGNING_SECRET) {
    throw new Error("SIGNING_SECRET is not set");
  }
  const headersPayload = await headers();
  const muxSignature = headersPayload.get("mux-signature");
  if (!muxSignature) {
    return new Response("No signature found", { status: 401 });
  }
  const payload = await request.json();
  const body = JSON.stringify(payload);

  mux.webhooks.verifySignature(
    body,
    {
      "mux-signature": muxSignature,
    },
    SIGNING_SECRET
  );

  switch (payload.type as webhookEvent["type"]) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

      if (!data.upload_id) {
        return new Response("No upload ID found", { status: 400 });
      }

      await db
        .update(videos)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }
  }
  return new Response("Webhook received", { status: 200 });
}









