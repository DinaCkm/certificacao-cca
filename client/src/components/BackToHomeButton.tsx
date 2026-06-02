import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function BackToHomeButton() {
  return (
    <Link href="/">
      <Button variant="outline" className="mb-4">
        ← Retornar ao Menu Inicial
      </Button>
    </Link>
  );
}
