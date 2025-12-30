import { FileItem } from "./FileItem";
import type { FileListProps } from "../types";

export function FileList({ files, isUploading, onRemove }: FileListProps) {
  return (
    <>
      {files.map((file, index) => (
        <FileItem
          key={`${file.name}-${file.size}-${index}`}
          file={file}
          index={index}
          isUploading={isUploading}
          onRemove={() => onRemove(index)}
        />
      ))}
    </>
  );
}
