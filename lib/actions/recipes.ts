"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

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

  const ingredients = formData.getAll("ingredients[]").map((v) => String(v)).filter(Boolean);
  const instructions = formData.getAll("instructions[]").map((v) => String(v)).filter(Boolean);

  const tagNames = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
    : [];

  const recipe = await prisma.recipe.create({
    data: {
      title,
      description: description || null,
      sourceUrl: sourceUrl || null,
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

  revalidatePath("/recipes");
  redirect(`/recipes/${recipe.id}`);
}

export async function deleteRecipe(id: string) {
  await requireSession();
  await prisma.recipe.delete({ where: { id } });
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

  const ingredients = formData.getAll("ingredients[]").map((v) => String(v)).filter(Boolean);
  const instructions = formData.getAll("instructions[]").map((v) => String(v)).filter(Boolean);

  const tagNames = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
    : [];

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

  revalidatePath("/recipes");
  revalidatePath(`/recipes/${id}`);
  redirect(`/recipes/${id}`);
}
