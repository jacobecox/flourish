"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DEV_USER_ID } from "@/lib/dev-user";
import { uploadFile } from "@/lib/storage";

export async function createJournalEntry(formData: FormData) {
  const dateRaw = formData.get("date") as string;
  const notes = formData.get("notes") as string | null;
  const ratingRaw = formData.get("rating") as string | null;
  const recipeId = formData.get("recipeId") as string | null;

  const date = dateRaw ? new Date(dateRaw) : new Date();
  const rating = ratingRaw ? parseInt(ratingRaw) : null;

  const entry = await prisma.journalEntry.create({
    data: {
      date,
      notes: notes || null,
      rating: rating && rating >= 1 && rating <= 5 ? rating : null,
      userId: DEV_USER_ID,
      recipeId: recipeId || null,
    },
  });

  // Upload any attached photos
  const photoFiles = formData.getAll("photos[]") as File[];
  const validPhotos = photoFiles.filter((f) => f && f.size > 0);

  if (validPhotos.length > 0) {
    const urls = await Promise.all(validPhotos.map(uploadFile));
    await prisma.journalPhoto.createMany({
      data: urls.map((url) => ({ url, journalEntryId: entry.id })),
    });
  }

  revalidatePath("/journal");
  redirect(`/journal/${entry.id}`);
}

export async function updateJournalEntry(id: string, formData: FormData) {
  const dateRaw = formData.get("date") as string;
  const notes = formData.get("notes") as string | null;
  const ratingRaw = formData.get("rating") as string | null;
  const recipeId = formData.get("recipeId") as string | null;

  const date = dateRaw ? new Date(dateRaw) : new Date();
  const rating = ratingRaw ? parseInt(ratingRaw) : null;

  await prisma.journalEntry.update({
    where: { id, userId: DEV_USER_ID },
    data: {
      date,
      notes: notes || null,
      rating: rating && rating >= 1 && rating <= 5 ? rating : null,
      recipeId: recipeId || null,
    },
  });

  // Upload any newly attached photos
  const photoFiles = formData.getAll("photos[]") as File[];
  const validPhotos = photoFiles.filter((f) => f && f.size > 0);

  if (validPhotos.length > 0) {
    const urls = await Promise.all(validPhotos.map(uploadFile));
    await prisma.journalPhoto.createMany({
      data: urls.map((url) => ({ url, journalEntryId: id })),
    });
  }

  revalidatePath("/journal");
  revalidatePath(`/journal/${id}`);
  redirect(`/journal/${id}`);
}

export async function deleteJournalEntry(id: string) {
  await prisma.journalEntry.delete({ where: { id, userId: DEV_USER_ID } });
  revalidatePath("/journal");
  redirect("/journal");
}

export async function deleteJournalPhoto(photoId: string) {
  // Verify the photo belongs to an entry owned by this user before deleting
  const photo = await prisma.journalPhoto.findFirst({
    where: {
      id: photoId,
      journalEntry: { userId: DEV_USER_ID },
    },
  });

  if (!photo) return;

  await prisma.journalPhoto.delete({ where: { id: photoId } });
  revalidatePath("/journal");
}
