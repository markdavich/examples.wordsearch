/**
 * Image MIME types we support for vision-based parsing
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
] as const;

/**
 * Document MIME types we support for text-based parsing
 */
export const SUPPORTED_DOCUMENT_TYPES = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
] as const;

/**
 * Check if a MIME type is a supported image type
 */
export function isImageType(mimeType: string): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(mimeType as typeof SUPPORTED_IMAGE_TYPES[number]);
}

/**
 * Check if a MIME type is a supported document type
 */
export function isDocumentType(mimeType: string): boolean {
  return SUPPORTED_DOCUMENT_TYPES.includes(mimeType as typeof SUPPORTED_DOCUMENT_TYPES[number]);
}
