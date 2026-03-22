"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { upsertEmbedding, deleteEmbedding, recipeToText } from "@/lib/embeddings";
import { uploadFile } from "@/lib/storage";

async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function createRecipe(formData: FormData) {
  const session = await requireSession();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const sourceUrl = formData.get("sourceUrl") as string | null;
  const servings = formData.get("servings") ? Number(formData.get("servings")) : null;
  const prepTime = formData.get("prepTime") ? Number(formData.get("prepTime")) : null;
  const cookTime = formData.get("cookTime") ? Number(formData.get("cookTime")) : null;
  const tagsRaw = formData.get("tags") as string | null;
  const imageFile = formData.get("imageFile") as File | null;
  const imageUrlField = formData.get("imageUrl") as string | null;

  const ingredients = formData.getAll("ingredients[]").map((v) => String(v)).filter(Boolean);
  const instructions = formData.getAll("instructions[]").map((v) => String(v)).filter(Boolean);

  const tagNames = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
    : [];

  let imageUrl: string | null = imageUrlField || null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadFile(imageFile);
  }

  const recipe = await prisma.recipe.create({
    data: {
      title,
      description: description || null,
      sourceUrl: sourceUrl || null,
      imageUrl,
      servings,
      prepTime,
      cookTime,
      ingredients,
      instructions,
      userId: session.userId,
      tags: {
        create: await Promise.all(
          tagNames.map(async (name) => {
            const tag = await prisma.tag.upsert({
              where: { name },
              update: {},
              create: { name },
            });
            return { tagId: tag.id };
          })
        ),
      },
    },
  });

  await upsertEmbedding({
    sourceType: "recipe",
    sourceId: recipe.id,
    userId: session.userId,
    content: recipeToText(recipe),
    metadata: { title: recipe.title },
  }).catch(console.error);

  revalidatePath("/recipes");
  redirect(`/recipes/${recipe.id}`);
}

export async function toggleFavorite(id: string) {
  const session = await requireSession();
  const recipe = await prisma.recipe.findUnique({
    where: { id, userId: session.userId },
    select: { isFavorited: true },
  });
  if (!recipe) return;
  await prisma.recipe.update({
    where: { id },
    data: { isFavorited: !recipe.isFavorited },
  });
  revalidatePath("/recipes");
}

export async function deleteRecipe(id: string) {
  await requireSession();
  await prisma.recipe.delete({ where: { id } });
  deleteEmbedding("recipe", id).catch(console.error);
  revalidatePath("/recipes");
  redirect("/recipes");
}

export async function updateRecipe(id: string, formData: FormData) {
  await requireSession();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const sourceUrl = formData.get("sourceUrl") as string | null;
  const servings = formData.get("servings") ? Number(formData.get("servings")) : null;
  const prepTime = formData.get("prepTime") ? Number(formData.get("prepTime")) : null;
  const cookTime = formData.get("cookTime") ? Number(formData.get("cookTime")) : null;
  const tagsRaw = formData.get("tags") as string | null;
  const imageFile = formData.get("imageFile") as File | null;
  const imageUrlField = formData.get("imageUrl") as string | null;

  const ingredients = formData.getAll("ingredients[]").map((v) => String(v)).filter(Boolean);
  const instructions = formData.getAll("instructions[]").map((v) => String(v)).filter(Boolean);

  const tagNames = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
    : [];

  let imageUrl: string | null = imageUrlField || null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadFile(imageFile);
  }

  // Replace all tags: delete existing, recreate
  await prisma.recipeTag.deleteMany({ where: { recipeId: id } });

  const newTags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  await prisma.recipe.update({
    where: { id },
    data: {
      title,
      description: description || null,
      sourceUrl: sourceUrl || null,
      imageUrl,
      servings,
      prepTime,
      cookTime,
      ingredients,
      instructions,
      tags: {
        create: newTags.map((tag) => ({ tagId: tag.id })),
      },
    },
  });

  const updated = await prisma.recipe.findUnique({ where: { id } });
  if (updated) {
    await upsertEmbedding({
      sourceType: "recipe",
      sourceId: id,
      userId: updated.userId,
      content: recipeToText(updated),
      metadata: { title: updated.title },
    }).catch(console.error);
  }

  revalidatePath("/recipes");
  revalidatePath(`/recipes/${id}`);
  redirect(`/recipes/${id}`);
}
