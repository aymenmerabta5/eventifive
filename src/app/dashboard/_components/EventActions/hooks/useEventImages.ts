import { useQuery } from "@tanstack/react-query";

export interface EventImage {
  id: string;
  fileId: string;
  isDefault: boolean;
  fileName: string;
  fileSize: number;
  contentType: string;
  url: string;
}

interface EventImagesResponse {
  status: "success" | "error";
  images: EventImage[];
  message?: string;
}

export function useEventImages(eventId: string | undefined) {
  const query = useQuery({
    queryKey: ["event-images", eventId],
    queryFn: async (): Promise<EventImage[]> => {
      if (!eventId) return [];

      const res = await fetch(
        `/api/update-event?eventId=${encodeURIComponent(eventId)}`,
      );
      const data = (await res.json()) as EventImagesResponse;

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch event images");
      }

      return data.images;
    },
    enabled: Boolean(eventId),
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    images: query.data ?? [],
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
