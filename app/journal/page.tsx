export default function JournalPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Baker's Journal</h1>
          <p className="text-muted">
            Document your baking journey
          </p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold transition-colors">
          New Entry
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-card border-2 border-dashed border-[var(--border)] rounded-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No journal entries yet
          </h3>
          <p className="text-muted mb-6">
            Start documenting your bakes! Add photos, notes, and track your progress to become a better baker
          </p>
          <button className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-semibold transition-colors">
            Create Your First Entry
          </button>
        </div>
      </div>

      {/* Preview of what it will look like with entries */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-foreground mb-4">Preview (Coming Soon)</h2>
        <div className="space-y-4 opacity-50 pointer-events-none">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card border border-[var(--border)] rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-orange-400 to-amber-600 rounded-lg w-24 h-24 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Bake Entry Title
                    </h3>
                    <span className="text-sm text-muted">2 days ago</span>
                  </div>
                  <p className="text-muted mb-3 text-sm">
                    Notes about this bake will appear here. What worked well, what could be improved, and any observations about the process.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">Recipe:</span>
                      <span className="bg-secondary text-foreground text-xs px-2 py-1 rounded font-medium border border-[var(--border)]">
                        Classic Sourdough
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-accent text-white text-xs px-2 py-1 rounded font-medium">
                        success
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
