"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";

interface UseProfileImageOptions {
	userId?: string;
}

export function useProfileImage(options?: UseProfileImageOptions) {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const userId = options?.userId ?? session?.user?.id;

	const { data: imageUrl, isLoading, error } = useQuery({
		queryKey: ["profile.getImage", userId],
		queryFn: () => orpc.profile.getImage.call({ userId }),
		enabled: !!userId && !!session?.user?.image,
		staleTime: 5 * 60 * 1000, // 5 minutes - won't refetch within this time
		gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
		retry: false,
		select: (data) => data.downloadUrl,
	});

	const invalidateImage = () => {
		queryClient.invalidateQueries({
			queryKey: ["profile.getImage", userId],
		});
	};

	return {
		imageUrl: imageUrl ?? null,
		isLoading,
		error,
		invalidateImage,
	};
}
