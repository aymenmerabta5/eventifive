---
name: file-uploads
description: Handle file uploads with Cloudflare R2 - presigned URLs, upload confirmation, file management. Use when working with image uploads, document storage, or file operations.
---

# File Uploads (Cloudflare R2 via Bun S3Client)

## Methodology - ALWAYS FOLLOW

Before implementing any file upload changes:

### Step 1: Ask Clarifying Questions
- What type of files (images, documents, etc.)?
- What are the size limits?
- Who can upload/download (auth requirements)?
- How should files be organized (folder structure)?
- Are there cleanup/deletion requirements?

### Step 2: Enter Plan Mode
Use `EnterPlanMode` to create a detailed implementation plan:
- Review existing upload patterns
- Check presigned URL generation
- Plan file organization strategy
- Consider CDN/caching needs
- Document error handling

### Step 3: Deep Analysis (Extended Thinking)
Think deeply about:
- File size limits and validation
- MIME type restrictions
- Storage path structure
- Upload confirmation flow
- Orphan file cleanup

### Step 4: Get User Approval
Present the plan and wait for explicit approval before any implementation.

---

## Key Files

| Component | Location |
|-----------|----------|
| S3 Client | `src/server/bucket/s3Client.ts` |
| Presigned URLs | `src/server/bucket/presignedUrls.ts` |
| Files Router | `src/server/orpc/routers/files/` |
| Event Images API | `src/app/api/upload-event-image/` |
| General Upload API | `src/app/api/upload-file/` |
| Profile Image API | `src/app/api/upload-image/` |

---

## Storage Structure

```
{userId}/
├── events/
│   └── {eventId}/
│       ├── cover.jpg
│       └── gallery/
│           ├── 1.jpg
│           ├── 2.jpg
│           └── 3.jpg
├── submissions/
│   └── {submissionId}/
│       └── {fileId}.pdf
└── profile/
    └── avatar.jpg
```

---

## Upload Flow (3-Step Pattern)

### 1. Request Presigned URL
```typescript
const { uploadUrl, fileId } = await client.files.requestUpload({
  filename: "document.pdf",
  contentType: "application/pdf",
  size: 1024000, // bytes
});
```

### 2. Client Uploads Directly to R2
```typescript
await fetch(uploadUrl, {
  method: "PUT",
  body: file,
  headers: {
    "Content-Type": file.type,
  },
});
```

### 3. Confirm Upload
```typescript
await client.files.confirmUpload({
  fileId: fileId,
});
```

---

## Upload Endpoints

### Event Images
- **Path**: `/api/upload-event-image`
- **Limit**: 10MB per image
- **Types**: JPEG, PNG, WebP, GIF
- **Max**: 1 cover + 3 gallery images

### Submission Files
- **Path**: `/api/upload-file`
- **Limit**: Configurable per event
- **Types**: PDF, DOC, DOCX, etc.

### Profile Images
- **Path**: `/api/upload-image`
- **Limit**: 5MB
- **Types**: JPEG, PNG, WebP

---

## File Router Endpoints

```typescript
// Request upload URL
files.requestUpload({ filename, contentType, size })

// Confirm upload complete
files.confirmUpload({ fileId })

// Get download URL
files.getDownloadUrl({ fileId })

// Delete file
files.delete({ fileId })

// List user's files
files.list({ page, limit })
```

---

## Validation Patterns

### MIME Type Validation
```typescript
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

if (!allowedTypes.includes(contentType)) {
  throw new ORPCError("BAD_REQUEST", "Invalid file type");
}
```

### Size Validation
```typescript
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

if (size > MAX_SIZE) {
  throw new ORPCError("BAD_REQUEST", "File too large (max 10MB)");
}
```

---

## Bun S3Client

The project uses Bun's native S3 client which is ~5x faster than AWS SDK.

### S3 Client Setup
```typescript
import { S3Client } from "bun";

export const s3Client = new S3Client({
  bucket: env.S3_BUCKET_NAME,
  region: "auto",
  endpoint: env.NEXT_PUBLIC_S3_ENDPOINT,
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
});
```

### File Operations
```typescript
// Write file
await s3Client.write(s3Key, buffer, { type: contentType });

// Delete file
await s3Client.delete(s3Key);

// Check if exists
const exists = await s3Client.exists(s3Key);
```

### Presigned URLs
```typescript
// Upload URL (PUT)
const uploadUrl = s3Client.presign(s3Key, {
  method: "PUT",
  expiresIn: 900, // 15 minutes
  type: contentType,
});

// Download URL (GET)
const downloadUrl = s3Client.presign(s3Key, {
  expiresIn: 3600, // 1 hour
});
```

### Security
- URLs expire after set time
- Scoped to specific key/path
- Content-Type enforced

---

## Database Table

### `file` Table
```typescript
{
  id: string,
  userId: string,
  filename: string,
  contentType: string,
  size: number,
  key: string,        // S3 key
  status: "pending" | "confirmed" | "deleted",
  createdAt: Date,
  confirmedAt: Date | null,
}
```

---

## Environment Variables

```bash
S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com
S3_BUCKET_NAME=eventifive
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

---

## UI Components

### Uploader Component
```typescript
import { Uploader } from "@/components/uploader";

<Uploader
  accept="image/*"
  maxSize={10 * 1024 * 1024}
  onUpload={(file) => handleUpload(file)}
/>
```

---

## Error Handling

| Error | Response |
|-------|----------|
| File too large | 400 BAD_REQUEST |
| Invalid type | 400 BAD_REQUEST |
| Upload failed | 500 INTERNAL_ERROR |
| Not found | 404 NOT_FOUND |
| Not authorized | 403 FORBIDDEN |

---

## Cleanup Considerations

- Pending uploads older than 24h can be cleaned
- Delete file records when parent entity deleted
- Consider orphan file detection job
