export default function RecipesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Recipe Manager</h1>
          <p className="text-muted">
            Import and manage your sourdough recipes
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold transition-colors">
            Add Recipe
          </button>
          <button className="bg-secondary hover:bg-secondary-hover text-foreground px-4 py-2 rounded-lg border border-[var(--border)] font-semibold transition-colors">
            Import from URL
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-card border-2 border-dashed border-[var(--border)] rounded-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No recipes yet
          </h3>
          <p className="text-muted mb-6">
            Get started by adding your first sourdough recipe or importing one from your favorite baking blog
          </p>
          <div className="flex gap-3 justify-center">
            <button className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              Add Your First Recipe
            </button>
          </div>
        </div>
      </div>

      {/* Preview of what it will look like with recipes */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-foreground mb-4">Preview (Coming Soon)</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50 pointer-events-none">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-[var(--border)] rounded-lg p-4">
              <div className="bg-secondary rounded-lg h-32 mb-3"></div>
              <h3 className="font-semibold text-foreground mb-2">
                Recipe Title
              </h3>
              <p className="text-sm text-muted mb-3">
                Recipe description will appear here
              </p>
              <div className="flex gap-2">
                <span className="bg-accent text-white text-xs px-2 py-1 rounded font-medium">
                  sourdough
                </span>
                <span className="bg-accent text-white text-xs px-2 py-1 rounded font-medium">
                  beginner
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
