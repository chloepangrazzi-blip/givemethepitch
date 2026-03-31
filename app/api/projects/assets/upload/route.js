import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getSupabaseServiceKey,
  getSupabaseUrl,
  hasSupabase,
  selectOne,
} from "../../../../../lib/supabase-client";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "../../../../../lib/admin-auth";

const ASSET_CONFIG = {
  teaser: {
    typeFichier: "teaser_video",
    defaultFileName: "teaser",
  },
  moodboard: {
    typeFichier: "moodboard",
    defaultFileName: "moodboard",
  },
  bible: {
    typeFichier: "bible_pdf",
    defaultFileName: "bible",
  },
  synopsis_pilote: {
    typeFichier: "synopsis_pilote_pdf",
    defaultFileName: "synopsis-pilote",
  },
  metadata: {
    typeFichier: "metadata_json",
    defaultFileName: "metadata",
  },
  autre: {
    typeFichier: "autre",
    defaultFileName: "document",
  },
};

function sanitizeFileName(fileName) {
  return String(fileName || "file")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getExtension(fileName) {
  const safeName = sanitizeFileName(fileName);
  const parts = safeName.split(".");
  return parts.length > 1 ? parts.pop() : "";
}

function buildStorageFileName(assetKey, originalName) {
  const config = ASSET_CONFIG[assetKey];
  const extension = getExtension(originalName);
  const base = config?.defaultFileName || "file";
  return extension ? `${base}.${extension}` : base;
}

async function rpcRequest(schema, fn, body) {
  const response = await fetch(`${getSupabaseUrl()}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: getSupabaseServiceKey(),
      Authorization: `Bearer ${getSupabaseServiceKey()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Profile": schema,
      "Content-Profile": schema,
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase RPC ${schema}.${fn} failed (${response.status}): ${detail}`);
  }

  return response.status === 204 ? null : response.json();
}

async function uploadToStorage({ bucket, path, file, contentType }) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const response = await fetch(`${getSupabaseUrl()}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      apikey: getSupabaseServiceKey(),
      Authorization: `Bearer ${getSupabaseServiceKey()}`,
      "Content-Type": contentType || "application/octet-stream",
      "x-upsert": "true",
    },
    body: buffer,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase storage upload failed (${response.status}): ${detail}`);
  }

  return response.json();
}

async function getProject(projectId) {
  const project = await selectOne("catalog", "projects", `?id=eq.${projectId}&limit=1`);
  if (!project) {
    throw new Error("project_not_found");
  }
  return project;
}

export async function POST(request) {
  try {
    if (!hasSupabase()) {
      return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value || "";
    if (!isValidAdminSession(token)) {
      return NextResponse.json({ error: "admin_unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const projectId = String(formData.get("projectId") || "").trim();
    const assetKey = String(formData.get("assetType") || "").trim();
    const file = formData.get("file");

    if (!projectId) {
      return NextResponse.json({ error: "missing_project_id" }, { status: 400 });
    }

    if (!ASSET_CONFIG[assetKey]) {
      return NextResponse.json({ error: "invalid_asset_type" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "missing_file" }, { status: 400 });
    }

    const project = await getProject(projectId);
    const bucket = project.origine_projet === "externe" ? "project-assets" : "project-assets";
    const baseFolder = project.origine_projet === "externe" ? "externes" : "stories";
    const fileName = buildStorageFileName(assetKey, file.name);
    const storagePath = `${baseFolder}/${project.projet_code}/${fileName}`;

    await uploadToStorage({
      bucket,
      path: storagePath,
      file,
      contentType: file.type,
    });

    await rpcRequest("ops", "sync_project_asset", {
      p_project_id: project.id,
      p_type_fichier: ASSET_CONFIG[assetKey].typeFichier,
      p_bucket_name: bucket,
      p_storage_path: storagePath,
      p_file_name: fileName,
      p_mime_type: file.type || null,
      p_size: Number.isFinite(file.size) ? file.size : null,
      p_uploaded_by: null,
    });

    return NextResponse.json({
      ok: true,
      projectId: project.id,
      projectCode: project.projet_code,
      assetType: assetKey,
      bucket,
      storagePath,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "project_asset_upload_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
