// app/api/recordings/cleanup/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { minio } from "@/infra/minio/config";

// Lista todas as chaves com o prefixo
async function listPrefix(bucket: string, prefix: string) {
  return new Promise<string[]>((resolve, reject) => {
    const keys: string[] = [];
    const stream = minio.listObjectsV2(bucket, prefix, true);
    stream.on("data", (obj) => obj?.name && keys.push(obj.name));
    stream.on("error", reject);
    stream.on("end", () => resolve(keys));
  });
}

// Encode RFC 3986 (copyObject precisa do src escapado)
function encodeRFC3986(str: string) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

// Deleta em lotes, 1 a 1, coletando erros
async function hardDeleteKeys(bucket: string, keys: string[], batchSize = 64) {
  const failures: Array<{ key: string; error: string }> = [];
  let deleted = 0;

  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (k) => {
        await minio.removeObject(bucket, k);
      })
    );
    results.forEach((r, idx) => {
      const key = batch[idx];
      if (r.status === "fulfilled") deleted += 1;
      else failures.push({ key, error: r.reason?.message ?? String(r.reason) });
    });
  }
  return { deleted, failures };
}

// Soft delete: copia para trash/<sessionId>/ e remove original
async function softDeleteKeys(bucket: string, srcPrefix: string, keys: string[], batchSize = 32) {
  const dstPrefix = `trash/${srcPrefix.replace(/^sessions\//, "").replace(/\/$/, "")}/`;
  const failures: Array<{ key: string; step: "copy" | "delete"; error: string }> = [];
  let moved = 0;

  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);

    // 1) copia em paralelo
    const copyResults = await Promise.allSettled(
      batch.map(async (name) => {
        const dst = name.replace(srcPrefix, dstPrefix);
        const src = `/${bucket}/${encodeRFC3986(name)}`;
        await minio.copyObject(bucket, dst, src);
        return { name, dst };
      })
    );

    // 2) para as que copiaram, remove original
    const toDelete: string[] = [];
    copyResults.forEach((r, idx) => {
      const name = batch[idx];
      if (r.status === "fulfilled") {
        toDelete.push(name);
      } else {
        failures.push({ key: name, step: "copy", error: r.reason?.message ?? String(r.reason) });
      }
    });

    const delResults = await Promise.allSettled(
      toDelete.map(async (name) => {
        await minio.removeObject(bucket, name);
      })
    );

    delResults.forEach((r, idx) => {
      const name = toDelete[idx];
      if (r.status === "fulfilled") moved += 1;
      else failures.push({ key: name, step: "delete", error: r.reason?.message ?? String(r.reason) });
    });
  }
  return { moved, dstPrefix, failures };
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, hardDelete = true } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const bucket = "recordings";
    const srcPrefix = `sessions/${sessionId}/`;
    const keys = await listPrefix(bucket, srcPrefix);

    if (!keys.length) {
      return NextResponse.json({ deleted: 0, message: "No objects under session prefix" });
    }

    if (hardDelete) {
      const { deleted, failures } = await hardDeleteKeys(bucket, keys);
      const ok = failures.length === 0;
      return NextResponse.json(
        {
          hardDelete: true,
          deleted,
          failed: failures.length,
          failures, // listei por chave p/ debug
        },
        { status: ok ? 200 : 207 } // 207 = Multi-Status (alguns falharam)
      );
    }

    const result = await softDeleteKeys(bucket, srcPrefix, keys);
    const ok = result.failures.length === 0;
    return NextResponse.json(
      {
        hardDelete: false,
        moved: result.moved,
        dstPrefix: result.dstPrefix,
        failed: result.failures.length,
        failures: result.failures,
      },
      { status: ok ? 200 : 207 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "cleanup failed", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
