"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useUploader } from "./hooks";
import {
  DropZone,
  ImageGrid,
  FileList,
  AddMoreSlot,
  UploaderActions,
} from "./components";
import type { UploaderProps } from "./types";

export function Uploader(props: UploaderProps) {
  const {
    // Config and mode
    config,
    mode,
    user,
    isEventImage,
    isStagedEventImage,
    resolvedMultiple,

    // State
    files,
    maxFiles,
    uploadedCount,
    isLoadingQuota,
    isUploading,
    isDragOver,

    // Computed
    addMoreFiles,
    hasItems,
    unifiedItems,

    // Drag/drop for file zone
    handleDragOver,
    handleDragLeave,
    handleFileDrop,

    // File handlers
    handleFileChange,
    removeFileAt,
    removeExistingImage,
    clearAll,

    // Image reorder
    draggedIndex,
    dragOverIndex,
    handleImageDragStart,
    handleImageDragOver,
    handleImageDrop,
    handleImageDragEnd,

    // Upload
    upload,
  } = useUploader(props);

  // Build hint text
  const getHintText = () => {
    if (props.hintOverride) {
      return props.hintOverride;
    }
    if (props.role === "registration_document") {
      return isLoadingQuota
        ? "Checking upload limit…"
        : `${uploadedCount}/${maxFiles} already uploaded for this event`;
    }
    if (mode === "select") {
      if (props.initialImages && props.initialImages.length > 0) {
        return "Drag images to reorder. The first image becomes the cover.";
      }
      return "Upload up to 4 images. The first image becomes the cover. Images are uploaded automatically when you click Save.";
    }
    if (isStagedEventImage) {
      return "Images will be linked to the event automatically when you finish creating it.";
    }
    return config.hint;
  };

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">{getHintText()}</p>

      {!hasItems ? (
        <DropZone
          config={config}
          maxFiles={maxFiles}
          multiple={resolvedMultiple}
          isDragOver={isDragOver}
          disabled={props.disabled || !user || isUploading}
          isEventImage={isEventImage}
          onFileChange={handleFileChange}
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        />
      ) : (
        <>
          <Card className="bg-muted/30">
            <CardContent className="space-y-3 p-4">
              {isEventImage ? (
                <ImageGrid
                  items={unifiedItems}
                  maxFiles={maxFiles}
                  addMoreFiles={addMoreFiles}
                  config={config}
                  multiple={resolvedMultiple}
                  isUploading={isUploading}
                  disabled={props.disabled || !user}
                  draggedIndex={draggedIndex}
                  dragOverIndex={dragOverIndex}
                  onRemoveExisting={removeExistingImage}
                  onRemoveNew={removeFileAt}
                  onFileChange={handleFileChange}
                  onDragStart={handleImageDragStart}
                  onDragOver={handleImageDragOver}
                  onDrop={handleImageDrop}
                  onDragEnd={handleImageDragEnd}
                  files={files}
                />
              ) : (
                <>
                  <FileList
                    files={files}
                    isUploading={isUploading}
                    onRemove={removeFileAt}
                  />
                  {addMoreFiles ? (
                    <AddMoreSlot
                      maxFiles={maxFiles}
                      config={config}
                      multiple={resolvedMultiple}
                      disabled={props.disabled || !user || isUploading}
                      onFileChange={handleFileChange}
                    />
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>

          <UploaderActions
            mode={mode}
            isUploading={isUploading}
            disabled={props.disabled || !user}
            isEventImage={isEventImage}
            onClear={clearAll}
            onUpload={upload}
          />
        </>
      )}
    </div>
  );
}

export default Uploader;
