import { z } from "zod";
import { publicProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

const inputGetProfileSchema = z.object({
  userId: z.string(),
});

// Public profile fields (visible to everyone)
const publicProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  imageUrl: z.string().nullable(),
  institution: z.string().nullable(),
  researchDomain: z.string().nullable(),
  biography: z.any().nullable(),
  isOwnProfile: z.literal(false),
});

// Full profile fields (visible only to the profile owner)
const fullProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  imageUrl: z.string().nullable(),
  institution: z.string().nullable(),
  researchDomain: z.string().nullable(),
  biography: z.any().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isOwnProfile: z.literal(true),
});

// Union of both schemas for the output
const outputGetProfileSchema = z.union([
  publicProfileSchema,
  fullProfileSchema,
]);

export const getProfileRouter = publicProcedure
  .route({ method: "POST", path: "/profile/get" })
  .input(inputGetProfileSchema)
  .output(outputGetProfileSchema)
  .handler(async ({ context, input }) => {
    try {
      // Fetch user profile
      const [userProfile] = await db
        .select()
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (!userProfile) {
        throw new ORPCError("NOT_FOUND", {
          message: "User not found",
        });
      }

      // Handle profile image URL
      let imageUrl: string | null = null;
      if (userProfile.image) {
        // If it's a Google image, use it directly
        if (userProfile.image.startsWith("https://lh3.googleusercontent.com")) {
          imageUrl = userProfile.image;
        } else {
          // Otherwise, generate presigned URL for R2
          try {
            const { downloadUrl } = await generatePresignedDownloadUrl(
              userProfile.image,
            );
            imageUrl = downloadUrl;
          } catch (error) {
            console.error(
              "Error generating presigned URL for profile image:",
              error,
            );
            // Continue without image URL if presigned URL generation fails
          }
        }
      }

      // Check if the requester is viewing their own profile
      const isOwnProfile = context.session?.user?.id === input.userId;

      if (isOwnProfile) {
        // Return full profile data for the profile owner
        return {
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          emailVerified: userProfile.emailVerified,
          image: userProfile.image,
          imageUrl,
          institution: userProfile.institution,
          researchDomain: userProfile.researchDomain,
          biography: userProfile.biography,
          createdAt: userProfile.createdAt,
          updatedAt: userProfile.updatedAt,
          isOwnProfile: true as const,
        };
      }

      // Return only public profile data for other users
      return {
        id: userProfile.id,
        name: userProfile.name,
        image: userProfile.image,
        imageUrl,
        institution: userProfile.institution,
        researchDomain: userProfile.researchDomain,
        biography: userProfile.biography,
        isOwnProfile: false as const,
      };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }
      console.error("Error getting user profile:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message:
          error instanceof Error ? error.message : "Failed to get user profile",
      });
    }
  });
