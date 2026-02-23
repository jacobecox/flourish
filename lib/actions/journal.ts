"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { uploadFile } from "@/lib/storage";

const PAGE_SIZE = 12;

async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function fetchJournalEntries(
  filters: { q?: string; rating?: string; recipe?: string },
  cursor?: string | null
) {
  const session = await getSession();
  if (!session) return { entries: [], hasMore: false, nextCursor: null };

  const { q, rating, recipe } = filters;
  const minRating = rating ? parseInt(rating) : undefined;

  const where = {
    userId: session.userId,
    ...(q ? { notes: { contains: q, mode: "insensitive" as const } } : {}),
    ...(minRating ? { rating: { gte: minRating } } : {}),
    ...(recipe ? { recipeId: recipe } : {}),
  };

  const raw = await prisma.journalEntry.findMany({
    where,
    include: { recipe: { select: { id: true, title: true } } },
    orderBy: { date: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = raw.length > PAGE_SIZE;
  const entries = (hasMore ? raw.slice(0, PAGE_SIZE) : raw).map((e) => ({
    ...e,
    date: e.date.toISOString(),
  }));

  return {
    entries,
    hasMore,
    nextCursor: entries[entries.length - 1]?.id ?? null,
  };
}

function parseMetrics(formData: FormData) {
  const hydrationRaw = formData.get("hydration") as string | null;
  const flourType = formData.get("flourType") as string | null;
  const bulkHr = Number(formData.get("bulkTimeHr") ?? 0);
  const bulkMin = Number(formData.get("bulkTimeMin") ?? 0);
  const proofHr = Number(formData.get("proofTimeHr") ?? 0);
  const proofMin = Number(formData.get("proofTimeMin") ?? 0);
  const bakeTempRaw = formData.get("bakeTemp") as string | null;

  const bulkTotal = bulkHr * 60 + bulkMin;
  const proofTotal = proofHr * 60 + proofMin;

  const hydration = hydrationRaw ? parseFloat(hydrationRaw) : null;
  const bakeTemp = bakeTempRaw ? parseInt(bakeTempRaw) : null;

  return {
    hydration: hydration !== null && !isNaN(hydration) ? hydration : null,
    flourType: flourType || null,
    bulkTime: bulkTotal > 0 && !isNaN(bulkTotal) ? bulkTotal : null,
    proofTime: proofTotal > 0 && !isNaN(proofTotal) ? proofTotal : null,
    bakeTemp: bakeTemp !== null && !isNaN(bakeTemp) ? bakeTemp : null,
  };
}

export async function createJournalEntry(formData: FormData) {
  const session = await requireSession();

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
      userId: session.userId,
      recipeId: recipeId || null,
      ...parseMetrics(formData),
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
  await requireSession();

  const dateRaw = formData.get("date") as string;
  const notes = formData.get("notes") as string | null;
  const ratingRaw = formData.get("rating") as string | null;
  const recipeId = formData.get("recipeId") as string | null;

  const date = dateRaw ? new Date(dateRaw) : new Date();
  const rating = ratingRaw ? parseInt(ratingRaw) : null;

  await prisma.journalEntry.update({
    where: { id },
    data: {
      date,
      notes: notes || null,
      rating: rating && rating >= 1 && rating <= 5 ? rating : null,
      recipe: recipeId
        ? { connect: { id: recipeId } }
        : { disconnect: true },
      ...parseMetrics(formData),
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
  await requireSession();
  await prisma.journalEntry.delete({ where: { id } });
  revalidatePath("/journal");
  redirect("/journal");
}

export async function deleteJournalPhoto(photoId: string) {
  const session = await requireSession();

  // Verify the photo belongs to an entry owned by this user before deleting
  const photo = await prisma.journalPhoto.findFirst({
    where: {
      id: photoId,
      journalEntry: { userId: session.userId },
    },
  });

  if (!photo) return;

  await prisma.journalPhoto.delete({ where: { id: photoId } });
  revalidatePath("/journal");
}
