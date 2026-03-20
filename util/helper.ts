import fs from "node:fs";
import path from "node:path";
import { ENV } from "../config/env";

type Params = {
  request: any; // Playwright's request context passed in by caller
  siteId: number;
  uploadedBy: number; // user ID
  filePaths: string[]; // one or many local paths
  note?: string; // visible on BOL details page
  contentType?: string; // optional - defaults to "image/png"
  apiBase?: string; // optional - defaults to process.env.DOCUMENT_PROCESSING_API (changed to ENV.documentProcessingAPI)
};

export async function uploadDocumentImages({
  request,
  siteId,
  uploadedBy,
  filePaths,
  note = "Automated upload",
  contentType,
  apiBase = ENV.documentProcessingAPI,
}: Params) {
  if (!apiBase) throw new Error("DOCUMENT_PROCESSING_API env var not set");
  if (!filePaths?.length)
    throw new Error("filePaths must contain at least one path.");

  const resolvedCT = contentType?.trim() || "image/png";

  // Generate presigned URLs for each file
  const filesForGen = filePaths.map((fp) => ({
    fileName: path.basename(fp),
    contentType: resolvedCT,
  }));

  const res = await request.post(`${apiBase}/documents/upload/generate-urls`, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    data: { siteId, files: filesForGen },
  });
  if (!res.ok())
    throw new Error(
      `Failed to generate URLs: ${res.status()} ${await res.text()}`,
    );

  const { documentUuid, files: presigned } = await res.json();

  // Upload each file to its presigned S3 URL
  await Promise.all(
    presigned.map(async (f: { fileName: string; url: string }) => {
      const filePath = filePaths.find((p) => path.basename(p) === f.fileName)!;
      const bytes = await fs.promises.readFile(filePath);

      const put = await request.put(f.url, {
        headers: { "Content-Type": resolvedCT },
        data: bytes,
      });

      if (!put.ok()) {
        throw new Error(
          `S3 PUT failed for ${f.fileName}: ${put.status()} ${await put.text()}`,
        );
      }
    }),
  );

  // Register the uploaded files with the backend
  const filesForRegister = presigned.map(
    (f: { fileName: string; objectKey: string }) => ({
      fileName: f.fileName,
      fingerprint: "dummy-fingerprint",
      objectKey: f.objectKey,
      contentType: resolvedCT,
    }),
  );

  const register = await request.post(`${apiBase}/documents/${documentUuid}`, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    data: {
      siteId,
      uploadedBy,
      note,
      files: filesForRegister,
    },
  });

  const registerBody = await register
    .json()
    .catch(async () => await register.text());

  return { documentUuid, registerStatus: register.status(), registerBody };
}

/**
 * Soft deletes a BOL document from the system
 * Endpoint: DELETE {apiBase}/sites/{siteId}/bol-documents/{bolId}
 */
export async function deleteBolDocument(
  request: any,
  siteId: number,
  bolId: any,
  deletedBy: number,
  apiBase: any = ENV.documentProcessingAPI,
) {
  if (!apiBase) throw new Error("DOCUMENT_PROCESSING_API env var not set");
  if (!siteId) throw new Error("siteId is required");
  if (!bolId) throw new Error("bolId is required");
  if (!deletedBy) throw new Error("deletedBy is required");

  const endpoint = `${apiBase}/sites/${siteId}/bol-documents/${bolId}`;

  const res = await request.delete(endpoint, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    data: {
      deletedBy,
    },
  });

  const body = await res.json().catch(async () => await res.text());

  if (!res.ok()) {
    throw new Error(
      `Failed to delete BOL document ${bolId} for site ${siteId}: ${res.status()} ${body}`,
    );
  }

  return { status: res.status(), body };
}
