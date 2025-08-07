import Mux from "@mux/mux-node";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
})