"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, FileUp, Image as ImageIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
};

const ROLE_CONFIG = {
    registration_document: {
        label: "Supporting document",
        accept:
            ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        multiple: true,
        uploadUrl: "/api/upload-file",
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

export function Uploader(props: UploaderProps) {
    const config = ROLE_CONFIG[props.role];
    const { data: session } = authClient.useSession();
    const user = session?.user ?? null;
    const quotaEventId = props.role === "registration_document" ? props.eventId : null;
    const isStagedEventImage = props.role === "event_image" && !props.eventId;
    const isEventImage = props.role === "event_image";

    const [files, setFiles] = useState<File[]>([]);
    const [uploadedCount, setUploadedCount] = useState(0);
    const [uploadedImages, setUploadedImages] = useState<Array<{ key: string; size: number }>>(
        [],
    );
    const resolvedMaxFiles =
        props.role === "event_image" ? (props.kind === "cover" ? 1 : config.maxFilesDefault) : config.maxFilesDefault;
    const resolvedMultiple =
        props.role === "event_image" ? props.kind === "gallery" : config.multiple;

    const [maxFiles, setMaxFiles] = useState<number>(resolvedMaxFiles);
    const [isLoadingQuota, setIsLoadingQuota] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
    const previewUrlsRef = useRef<Record<string, string>>({});

    const remainingSlots = Math.max(0, maxFiles - uploadedCount - files.length);
    const addMoreFiles = remainingSlots > 0;

    const icon = useMemo(() => {
        return props.role === "event_image" ? ImageIcon : FileUp;
    }, [props.role]);

    useEffect(() => {
        setMaxFiles(resolvedMaxFiles);
    }, [resolvedMaxFiles]);

    useEffect(() => {
        if (!isEventImage) return;

        const selectedKeys = new Set(files.map((f) => `${f.name}-${f.size}-${f.lastModified}`));
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
            for (const url of Object.values(previewUrlsRef.current)) URL.revokeObjectURL(url);
        };
    }, []);

    useEffect(() => {
        if (props.role !== "registration_document") return;
        if (!user) return;

        let cancelled = false;
        setIsLoadingQuota(true);

        fetch(`/api/upload-file?eventId=${encodeURIComponent(props.eventId)}`)
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
            const available = Math.max(0, maxFiles - uploadedCount - prev.length);
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

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
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
        setPreviewUrls((prev) => {
            for (const url of Object.values(prev)) URL.revokeObjectURL(url);
            return {};
        });
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

                const res = await fetch(config.uploadUrl, { method: "POST", body: formData });
                const json = (await res.json().catch(() => ({}))) as { message?: string };
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

    const Icon = icon;

    return (
        <div className="space-y-3">


            <p className="text-xs text-muted-foreground">
                {props.role === "registration_document" ? (
                    isLoadingQuota ? (
                        "Checking upload limit…"
                    ) : (
                        `${uploadedCount}/${maxFiles} already uploaded for this event`
                    )
                ) : (
                    isStagedEventImage
                        ? "Images will be linked to the event automatically when you finish creating it."
                        : config.hint
                )}
            </p>

            {files.length === 0 ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all",
                        isDragOver
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/30"
                    )}
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-sm font-medium">Drag and drop your file here</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        or click to browse (max {maxFiles} file(s))
                    </p>
                    <Input
                        id="file"
                        name="file"
                        type="file"
                        multiple={resolvedMultiple}
                        accept={config.accept}
                        onChange={handleFileChange}
                        disabled={!user || isUploading}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <p className="mt-4 text-xs text-muted-foreground">{config.hint}</p>
                </div>
            ) : (
				<>
					<Card className="bg-muted/30">
						<CardContent className="space-y-3 p-4">
							{isEventImage ? (
								<div className="flex w-full justify-center">
									<div className="grid w-fit grid-cols-[repeat(3,110px)] gap-8 sm:grid-cols-[repeat(4,140px)] md:grid-cols-[repeat(4,180px)]">
									{uploadedImages.map(({ key, size }) => {
										const url = previewUrls[key];
										if (!url) return null;
										return (
											<div key={`uploaded-${key}`} className="space-y-1">
												<div className="relative overflow-hidden rounded-xl border bg-muted/30">
													<img
														src={url}
														alt="Uploaded event image preview"
														className="aspect-square w-full object-cover"
														loading="lazy"
													/>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="absolute right-1.5 top-1.5 h-7 w-7 bg-background/70 text-foreground hover:bg-background"
														onClick={() => removeUploadedKey(key)}
														disabled={isUploading}
														aria-label="Remove image"
													>
														<X className="h-4 w-4" />
													</Button>
												</div>
												<div className="text-center text-[11px] text-muted-foreground">
													{(size / 1024 / 1024).toFixed(2)} MB
												</div>
											</div>
										);
									})}

									{files.map((file, index) => {
										const key = `${file.name}-${file.size}-${file.lastModified}`;
										const url = previewUrls[key];
										if (!url) return null;
										return (
											<div key={key} className="space-y-1">
												<div className="relative overflow-hidden rounded-xl border bg-muted/30">
													<img
														src={url}
														alt="Selected event image preview"
														className="aspect-square w-full object-cover"
														loading="lazy"
													/>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="absolute right-1.5 top-1.5 h-7 w-7 bg-background/70 text-foreground hover:bg-background"
														onClick={() => removeFileAt(index)}
														disabled={isUploading}
														aria-label="Remove image"
													>
														<X className="h-4 w-4" />
													</Button>
												</div>
												<div className="text-center text-[11px] text-muted-foreground">
													{(file.size / 1024 / 1024).toFixed(2)} MB
												</div>
											</div>
										);
									})}

									{addMoreFiles ? (
										<div className="relative flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
											<span>Add more (up to {maxFiles})</span>
											<Input
												id="file-more"
												name="file-more"
												type="file"
												multiple={resolvedMultiple}
												accept={config.accept}
												onChange={handleFileChange}
												disabled={!user || isUploading}
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
											<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
												<FileText className="h-6 w-6 text-primary" />
											</div>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-medium">{file.name}</p>
												<p className="text-xs text-muted-foreground">
													{(file.size / 1024 / 1024).toFixed(2)} MB
												</p>
											</div>
											<div className="flex items-center gap-2">
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-muted-foreground hover:text-destructive"
													onClick={() => removeFileAt(index)}
													disabled={isUploading}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										</div>
									))}

									{addMoreFiles ? (
										<div className="relative flex items-center justify-center rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
											<span>Add more (up to {maxFiles})</span>
											<Input
												id="file-more"
												name="file-more"
												type="file"
												multiple={resolvedMultiple}
												accept={config.accept}
												onChange={handleFileChange}
												disabled={!user || isUploading}
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
						<Button type="button" onClick={upload} disabled={!user || isUploading}>
							{isUploading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Uploading…
								</>
							) : (
								"Upload"
							)}
						</Button>
					</div>
				</>
			)}
        </div>
    );
}

export default Uploader;
