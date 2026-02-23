import { Metadata } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faJar } from "@fortawesome/free-solid-svg-icons";
import StarterChecklist from "@/components/StarterChecklist";

export const metadata: Metadata = { title: "Starter" };

export default function StarterPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FontAwesomeIcon icon={faJar} className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Starter Readiness</h1>
        </div>
        <p className="text-muted">
          Work through these checks before each bake to confirm your starter has hit
          peak activity and is ready to leaven your dough.
        </p>
      </div>

      <StarterChecklist />
    </div>
  );
}
