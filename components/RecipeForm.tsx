"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

type RecipeFormProps = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    title?: string;
    description?: string;
    sourceUrl?: string;
    servings?: number | null;
    prepTime?: number | null;
    cookTime?: number | null;
    ingredients?: string[];
    instructions?: string[];
    tags?: string[];
  };
  submitLabel?: string;
};

export default function RecipeForm({
  action,
  defaultValues = {},
  submitLabel = "Save Recipe",
}: RecipeFormProps) {
  const [ingredients, setIngredients] = useState<string[]>(
    defaultValues.ingredients?.length ? defaultValues.ingredients : [""]
  );
  const [instructions, setInstructions] = useState<string[]>(
    defaultValues.instructions?.length ? defaultValues.instructions : [""]
  );
  const [pending, setPending] = useState(false);

  function addIngredient() {
    setIngredients((prev) => [...prev, ""]);
  }

  function removeIngredient(i: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateIngredient(i: number, value: string) {
    setIngredients((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  function addInstruction() {
    setInstructions((prev) => [...prev, ""]);
  }

  function removeInstruction(i: number) {
    setInstructions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateInstruction(i: number, value: string) {
    setInstructions((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    // Inject dynamic ingredient/instruction arrays
    formData.delete("ingredients[]");
    formData.delete("instructions[]");
    ingredients.filter(Boolean).forEach((v) => formData.append("ingredients[]", v));
    instructions.filter(Boolean).forEach((v) => formData.append("instructions[]", v));
    await action(formData);
    setPending(false);
  }

  const inputClass =
    "w-full bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className={labelClass}>
          Title <span className="text-primary">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={defaultValues.title}
          placeholder="e.g. Classic Country Sourdough"
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues.description}
          placeholder="Brief description of this recipe"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Source URL */}
      <div>
        <label htmlFor="sourceUrl" className={labelClass}>
          Source URL
        </label>
        <input
          id="sourceUrl"
          name="sourceUrl"
          type="url"
          defaultValue={defaultValues.sourceUrl}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      {/* Time & Servings */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="prepTime" className={labelClass}>
            Prep time (min)
          </label>
          <input
            id="prepTime"
            name="prepTime"
            type="number"
            min={0}
            defaultValue={defaultValues.prepTime ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="cookTime" className={labelClass}>
            Bake time (min)
          </label>
          <input
            id="cookTime"
            name="cookTime"
            type="number"
            min={0}
            defaultValue={defaultValues.cookTime ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="servings" className={labelClass}>
            Servings
          </label>
          <input
            id="servings"
            name="servings"
            type="number"
            min={1}
            defaultValue={defaultValues.servings ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className={labelClass}>
          Tags
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          defaultValue={defaultValues.tags?.join(", ")}
          placeholder="sourdough, beginner, whole wheat"
          className={inputClass}
        />
        <p className="text-xs text-muted mt-1">Comma-separated</p>
      </div>

      {/* Ingredients */}
      <div>
        <label className={labelClass}>
          Ingredients <span className="text-primary">*</span>
        </label>
        <div className="space-y-2">
          {ingredients.map((val, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-muted text-sm w-5 text-right shrink-0">{i + 1}.</span>
              <input
                type="text"
                value={val}
                onChange={(e) => updateIngredient(i, e.target.value)}
                placeholder="e.g. 500g bread flour"
                className={inputClass}
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  className="text-muted hover:text-foreground transition-colors shrink-0"
                  aria-label="Remove ingredient"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-2 text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1.5 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
          Add ingredient
        </button>
      </div>

      {/* Instructions */}
      <div>
        <label className={labelClass}>
          Instructions <span className="text-primary">*</span>
        </label>
        <div className="space-y-2">
          {instructions.map((val, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-muted text-sm w-5 text-right shrink-0 mt-2.5">{i + 1}.</span>
              <textarea
                value={val}
                onChange={(e) => updateInstruction(i, e.target.value)}
                rows={2}
                placeholder={`Step ${i + 1}`}
                className={`${inputClass} resize-none`}
              />
              {instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(i)}
                  className="text-muted hover:text-foreground transition-colors shrink-0 mt-2.5"
                  aria-label="Remove step"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addInstruction}
          className="mt-2 text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1.5 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
          Add step
        </button>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <a
          href="/recipes"
          className="bg-secondary hover:bg-secondary-hover text-foreground px-6 py-2.5 rounded-lg font-semibold border border-[var(--border)] transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
