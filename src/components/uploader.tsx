"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText,
  FileUp,
  GripVertical,
  Image as ImageIcon,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExistingImage {
  fileId: string;
  url: string;
  fileName: string;
  fileSize: number;
  isDefault: boolean;
}

type RegistrationDocumentRole = {
  role: "registration_document";
  eventId: string;
  metadata?: {
    name?: string;
    researchDomain?: string;
  };
  sendMetadataOnFirstFileOnly?: boolean;
};

type EventImageRole = {
  role: "event_image";
  eventId?: string;
  kind: "cover" | "gallery";
};

export type UploaderProps = (RegistrationDocumentRole | EventImageRole) & {
  onComplete?: (results: unknown[]) => void;
  mode?: "upload" | "select";
  onFilesChange?: (files: File[]) => void;
  hintOverride?: string;
  disabled?: boolean;
  // New props for update mode with existing images
  initialImages?: ExistingImage[];
  onRemoveExistingImage?: (fileId: string) => void;
  onReorder?: (order: Array<{ type: "existing" | "new"; id: string }>) => void;
};

const ROLE_CONFIG = {
  registration_document: {
    label: "Supporting document",
    accept:
      ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    multiple: true,
    uploadUrl: "/api/submit-documents",
    maxFilesDefault: 3,
    hint: "PDF, DOC, DOCX up to 10MB each",
  },
  event_image: {
    label: "Event image",
    accept: "image/jpeg,image/jpg,image/png,image/webp,image/gif",
    multiple: true,
    uploadUrl: "/api/upload-image",
    maxFilesDefault: 4,
    hint: "JPEG, PNG, WebP, GIF up to 10MB each",
  },
} as const;

// Unified item type for combined existing + new images
type UnifiedImageItem =
  | {
      type: "existing";
      fileId: string;
      url: string;
      fileName: string;
      fileSize: number;
    }
  | { type: "new"; key: string; file: File; url: string };

export function Uploader(props: UploaderProps) {
  const config = ROLE_CONFIG[props.role];
  const mode = props.mode ?? "upload";
  const { data: session } = authClient.useSession();
  const user = session?.user ?? null;
  const quotaEventId =
    props.role === "registration_document" ? props.eventId : null;
  const isStagedEventImage = props.role === "event_image" && !props.eventId;
  const isEventImage = props.role === "event_image";

  const [files, setFiles] = useState<File[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ key: string; size: number }>
  >([]);

  const [removedExistingIds, setRemovedExistingIds] = useState<Set<string>>(
    new Set(),
  );

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [imageOrder, setImageOrder] = useState<
    Array<{ type: "existing" | "new"; id: string }>
  >([]);

  const resolvedMaxFiles =
    props.role === "event_image"
      ? props.kind === "cover"
        ? 1
        : config.maxFilesDefault
      : config.maxFilesDefault;
  const resolvedMultiple =
    props.role === "event_image" ? props.kind === "gallery" : config.multiple;

  const [maxFiles, setMaxFiles] = useState<number>(resolvedMaxFiles);
  const [isLoadingQuota, setIsLoadingQuota] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const previewUrlsRef = useRef<Record<string, string>>({});

  const activeExistingImages = useMemo(() => {
    return (props.initialImages ?? []).filter(
      (img) => !removedExistingIds.has(img.fileId),
    );
  }, [props.initialImages, removedExistingIds]);

  const remainingSlots = Math.max(
    0,
    maxFiles - activeExistingImages.length - uploadedCount - files.length,
  );
  const addMoreFiles = remainingSlots > 0;

  const icon = useMemo(() => {
    return props.role === "event_image" ? ImageIcon : FileUp;
  }, [props.role]);

  useEffect(() => {
    if (!props.initialImages) return;

    const existingOrder = props.initialImages
      .filter((img) => !removedExistingIds.has(img.fileId))
      .map((img) => ({ type: "existing" as const, id: img.fileId }));

    const newOrder = files.map((f) => ({
      type: "new" as const,
      id: `${f.name}-${f.size}-${f.lastModified}`,
    }));

    setImageOrder([...existingOrder, ...newOrder]);
  }, [props.initialImages, removedExistingIds, files]);

  useEffect(() => {
    setMaxFiles(resolvedMaxFiles);
  }, [resolvedMaxFiles]);

  useEffect(() => {
    if (mode !== "select") return;
    props.onFilesChange?.(files);
  }, [files, mode, props]);

  useEffect(() => {
    if (!isEventImage) return;

    const selectedKeys = new Set(
      files.map((f) => `${f.name}-${f.size}-${f.lastModified}`),
    );
    const uploadedKeys = new Set(uploadedImages.map((i) => i.key));

    setPreviewUrls((prev) => {
      const next: Record<string, string> = { ...prev };

      for (const file of files) {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        next[key] = next[key] ?? URL.createObjectURL(file);
      }

      for (const [key, url] of Object.entries(prev)) {
        if (!selectedKeys.has(key) && !uploadedKeys.has(key)) {
          URL.revokeObjectURL(url);
          delete next[key];
        }
      }

      return next;
    });
  }, [files, isEventImage, uploadedImages]);

  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    return () => {
      for (const url of Object.values(previewUrlsRef.current))
        URL.revokeObjectURL(url);
    };
  }, []);

  useEffect(() => {
    if (props.role !== "registration_document") return;
    if (!user) return;

    let cancelled = false;
    setIsLoadingQuota(true);

    fetch(`/api/submit-documents?eventId=${encodeURIComponent(props.eventId)}`)
      .then(async (res) => {
        const json = (await res.json()) as {
          uploadedCount?: number;
          maxFiles?: number;
          message?: string;
        };
        if (!res.ok) {
          throw new Error(json.message || "Failed to load upload quota");
        }
        return json;
      })
      .then((json) => {
        if (cancelled) return;
        setUploadedCount(Number(json.uploadedCount ?? 0));
        setMaxFiles(Number(json.maxFiles ?? config.maxFilesDefault));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error fetching upload quota:", err);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoadingQuota(false);
      });

    return () => {
      cancelled = true;
    };
  }, [config.maxFilesDefault, props.role, quotaEventId, user]);

  const addFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;

    setFiles((prev) => {
      const available = Math.max(
        0,
        maxFiles - activeExistingImages.length - uploadedCount - prev.length,
      );
      if (available <= 0) return prev;

      const next = [...prev, ...incoming.slice(0, available)];
      if (incoming.length > available) {
        toast.error(`You can upload a maximum of ${maxFiles} file(s).`);
      }
      return next;
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!addMoreFiles) {
      toast.error(`You can upload a maximum of ${maxFiles} file(s).`);
      event.target.value = "";
      return;
    }

    const selected = Array.from(event.target.files ?? []);
    addFiles(selected);
    event.target.value = "";
  };

  const handleFileDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    if (!addMoreFiles) {
      toast.error(`You can upload a maximum of ${maxFiles} file(s).`);
      return;
    }

    const dropped = Array.from(event.dataTransfer.files ?? []);
    addFiles(dropped);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeFileAt = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = useCallback(
    (fileId: string) => {
      setRemovedExistingIds((prev) => new Set([...prev, fileId]));
      props.onRemoveExistingImage?.(fileId);
    },
    [props],
  );

  const removeUploadedKey = (key: string) => {
    setUploadedImages((prev) => prev.filter((k) => k.key !== key));
    setPreviewUrls((prev) => {
      const url = prev[key];
      if (!url) return prev;
      URL.revokeObjectURL(url);
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const clearAll = () => {
    setFiles([]);
    setUploadedImages([]);
    setRemovedExistingIds(new Set());
    setPreviewUrls((prev) => {
      for (const url of Object.values(prev)) URL.revokeObjectURL(url);
      return {};
    });
  };

  // Drag and drop reordering handlers
  const handleImageDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleImageDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleImageDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setImageOrder((prev) => {
      const newOrder = [...prev];
      const draggedItem = newOrder[draggedIndex];
      if (!draggedItem) return prev;
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(dropIndex, 0, draggedItem);
      props.onReorder?.(newOrder);
      return newOrder;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const upload = async () => {
    if (!user) {
      toast.error("You must be logged in to upload.");
      return;
    }
    if (files.length === 0) {
      toast.error("Please select at least 1 file.");
      return;
    }
    if (props.role === "registration_document" && !props.eventId) {
      toast.error("Missing eventId for document upload.");
      return;
    }
    if (uploadedCount + files.length > maxFiles) {
      toast.error(`You can upload a maximum of ${maxFiles} file(s).`);
      return;
    }

    setIsUploading(true);
    try {
      const results: unknown[] = [];
      const sendMetaOnlyOnce =
        props.role === "registration_document"
          ? (props.sendMetadataOnFirstFileOnly ?? true)
          : false;

      for (const [index, file] of files.entries()) {
        const formData = new FormData();
        formData.set("file", file);

        if (props.role === "registration_document") {
          formData.set("eventId", props.eventId);
          if (!sendMetaOnlyOnce || index === 0) {
            if (props.metadata?.name) formData.set("name", props.metadata.name);
            if (props.metadata?.researchDomain) {
              formData.set("researchDomain", props.metadata.researchDomain);
            }
          }
        }
        if (props.role === "event_image") {
          if (props.eventId) {
            formData.set("target", "event");
            formData.set("eventId", props.eventId);
          } else {
            formData.set("target", "event_staged");
          }
          formData.set("kind", props.kind);
        }

        const res = await fetch(config.uploadUrl, {
          method: "POST",
          body: formData,
        });
        const json = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        if (!res.ok) {
          throw new Error(json.message || "Upload failed.");
        }
        results.push(json);
      }

      toast.success("Upload completed.");
      if (props.role === "event_image") {
        const next = files.map((file) => ({
          key: `${file.name}-${file.size}-${file.lastModified}`,
          size: file.size,
        }));
        setUploadedImages((prev) => {
          const byKey = new Map(prev.map((p) => [p.key, p]));
          for (const item of next) byKey.set(item.key, item);
          return Array.from(byKey.values());
        });
        setFiles([]);
      } else {
        setFiles([]);
      }
      if (props.role === "registration_document") {
        setUploadedCount((prev) => Math.min(maxFiles, prev + files.length));
      }
      props.onComplete?.(results);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const unifiedItems = useMemo((): UnifiedImageItem[] => {
    const items: UnifiedImageItem[] = [];

    if (imageOrder.length > 0) {
      for (const orderItem of imageOrder) {
        if (orderItem.type === "existing") {
          const existing = activeExistingImages.find(
            (img) => img.fileId === orderItem.id,
          );
          if (existing) {
            items.push({
              type: "existing",
              fileId: existing.fileId,
              url: existing.url,
              fileName: existing.fileName,
              fileSize: existing.fileSize,
            });
          }
        } else {
          const file = files.find(
            (f) => `${f.name}-${f.size}-${f.lastModified}` === orderItem.id,
          );
          if (file) {
            const key = `${file.name}-${file.size}-${file.lastModified}`;
            const url = previewUrls[key];
            if (url) {
              items.push({ type: "new", key, file, url });
            }
          }
        }
      }
      return items;
    }

    for (const img of activeExistingImages) {
      items.push({
        type: "existing",
        fileId: img.fileId,
        url: img.url,
        fileName: img.fileName,
        fileSize: img.fileSize,
      });
    }

    for (const img of uploadedImages) {
      const url = previewUrls[img.key];
      if (url) {
        const file = files.find(
          (f) => `${f.name}-${f.size}-${f.lastModified}` === img.key,
        );
        if (file) {
          items.push({ type: "new", key: img.key, file, url });
        }
      }
    }

    for (const file of files) {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      const url = previewUrls[key];
      if (url && !uploadedImages.some((u) => u.key === key)) {
        items.push({ type: "new", key, file, url });
      }
    }

    return items;
  }, [imageOrder, activeExistingImages, uploadedImages, files, previewUrls]);

  const hasItems = unifiedItems.length > 0 || files.length > 0;
  const Icon = icon;

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        {props.hintOverride
          ? props.hintOverride
          : props.role === "registration_document"
            ? isLoadingQuota
              ? "Checking upload limit…"
              : `${uploadedCount}/${maxFiles} already uploaded for this event`
            : mode === "select"
              ? props.initialImages && props.initialImages.length > 0
                ? "Drag images to reorder. The first image becomes the cover."
                : "Upload up to 4 images. The first image becomes the cover. Images are uploaded automatically when you click Save."
              : isStagedEventImage
                ? "Images will be linked to the event automatically when you finish creating it."
                : config.hint}
      </p>

      {!hasItems ? (
        <div
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 transition-all",
            isDragOver
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/50 hover:bg-muted/30",
          )}
        >
          <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
            <Icon className="text-muted-foreground h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-medium">
            Drag and drop your file here
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            or click to browse (max {maxFiles} file(s))
          </p>
          <Input
            id="file"
            name="file"
            type="file"
            multiple={resolvedMultiple}
            accept={config.accept}
            onChange={handleFileChange}
            disabled={props.disabled || !user || isUploading}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <p className="text-muted-foreground mt-4 text-xs">{config.hint}</p>
        </div>
      ) : (
        <>
          <Card className="bg-muted/30">
            <CardContent className="space-y-3 p-4">
              {isEventImage ? (
                <div className="flex w-full justify-center">
                  <div className="grid w-fit grid-cols-[repeat(3,110px)] gap-6 sm:grid-cols-[repeat(4,140px)] md:grid-cols-[repeat(4,180px)]">
                    {unifiedItems.map((item, displayIndex) => {
                      const isCover = displayIndex === 0;
                      const itemKey =
                        item.type === "existing" ? item.fileId : item.key;

                      return (
                        <div
                          key={`${item.type}-${itemKey}`}
                          className={cn(
                            "space-y-1 transition-transform",
                            draggedIndex === displayIndex && "opacity-50",
                            dragOverIndex === displayIndex && "scale-105",
                          )}
                          draggable={!isUploading}
                          onDragStart={() => handleImageDragStart(displayIndex)}
                          onDragOver={(e) =>
                            handleImageDragOver(e, displayIndex)
                          }
                          onDrop={(e) => handleImageDrop(e, displayIndex)}
                          onDragEnd={handleImageDragEnd}
                        >
                          <div
                            className={cn(
                              "bg-muted/30 relative cursor-grab overflow-hidden rounded-2xl border shadow-sm active:cursor-grabbing",
                              isCover
                                ? "ring-primary/60 ring-2"
                                : "ring-border/40 ring-1",
                            )}
                          >
                            <img
                              src={item.url}
                              alt={
                                isCover
                                  ? "Cover image preview"
                                  : "Event image preview"
                              }
                              className="aspect-square w-full object-cover"
                              loading="lazy"
                              draggable={false}
                            />

                            <div className="bg-background/85 text-foreground absolute top-2 left-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm">
                              <GripVertical className="text-muted-foreground h-3 w-3" />
                              <span className="bg-primary/10 text-primary inline-flex h-5 w-5 items-center justify-center rounded-full">
                                {displayIndex + 1}
                              </span>
                              {isCover ? (
                                <span className="text-primary">Cover</span>
                              ) : null}
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="bg-background/70 text-foreground hover:bg-background hover:text-destructive absolute top-2 right-2 h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.type === "existing") {
                                  removeExistingImage(item.fileId);
                                } else {
                                  const originalIndex = files.findIndex((f) => {
                                    const k = `${f.name}-${f.size}-${f.lastModified}`;
                                    return k === item.key;
                                  });
                                  if (originalIndex >= 0)
                                    removeFileAt(originalIndex);
                                }
                              }}
                              disabled={isUploading}
                              aria-label="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-muted-foreground text-center text-[11px]">
                            {item.type === "existing"
                              ? `${(item.fileSize / 1024 / 1024).toFixed(2)} MB`
                              : `${(item.file.size / 1024 / 1024).toFixed(2)} MB`}
                            {item.type === "existing" && (
                              <span className="text-primary/70 ml-1">
                                (saved)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {addMoreFiles ? (
                      <div className="border-border bg-background/40 text-muted-foreground hover:bg-muted/20 relative flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed text-xs transition-colors">
                        <span>Add more (up to {maxFiles})</span>
                        <Input
                          id="file-more"
                          name="file-more"
                          type="file"
                          multiple={resolvedMultiple}
                          accept={config.accept}
                          onChange={handleFileChange}
                          disabled={props.disabled || !user || isUploading}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <>
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${file.size}-${index}`}
                      className="flex items-center gap-4"
                    >
                      <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                        <FileText className="text-primary h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {file.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive h-8 w-8"
                          onClick={() => removeFileAt(index)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {addMoreFiles ? (
                    <div className="border-border text-muted-foreground relative flex items-center justify-center rounded-lg border border-dashed p-3 text-xs">
                      <span>Add more (up to {maxFiles})</span>
                      <Input
                        id="file-more"
                        name="file-more"
                        type="file"
                        multiple={resolvedMultiple}
                        accept={config.accept}
                        onChange={handleFileChange}
                        disabled={props.disabled || !user || isUploading}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={isEventImage ? clearAll : () => setFiles([])}
              disabled={isUploading}
            >
              Clear
            </Button>
            {mode === "upload" ? (
              <Button
                type="button"
                onClick={upload}
                disabled={props.disabled || !user || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

export default Uploader;
