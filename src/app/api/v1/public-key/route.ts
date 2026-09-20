import { NextResponse } from "next/server";
import { isEphemeralKey, publicKeyPem, SIG_VERSION } from "@/lib/record";

export async function GET() {
  return NextResponse.json({ algorithm: "Ed25519", sig_version: SIG_VERSION, public_key_pem: publicKeyPem(), ephemeral: isEphemeralKey() });
}
