function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const ENV = {
  baseUrl: required("BASE_URL"),
  username: required("APP_USERNAME"),
  password: required("APP_PASSWORD"),
  documentProcessingAPI: required("DOCUMENT_PROCESSING_API"),
  siteName: required("SITE_NAME"),
  siteId: Number(required("SITE_ID")),
  uploadedBy: Number(required("UPLOADED_BY")),
  pendingBolId: Number(required("PENDING_BOL_ID")),
  validBolId: Number(required("VALID_BOL_ID")),
  illegibleBolId: Number(required("ILLEGIBLE_BOL_ID")),
  emptyBolId: Number(required("EMPTY_BOL_ID")),
  extractionFailedBolId: Number(required("EXTRACTION_FAILED_BOL_ID")),
  nonexistingBolId: Number(required("NONEXISTING_BOL_ID"))
};