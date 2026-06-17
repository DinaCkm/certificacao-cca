import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

function toast(options: ToastOptions) {
  const { title, description, variant, duration = 4000 } = options;
  const message = title || "";
  const descriptionText = description;

  if (variant === "destructive") {
    sonnerToast.error(message, {
      description: descriptionText,
      duration,
    });
  } else {
    sonnerToast.success(message, {
      description: descriptionText,
      duration,
    });
  }
}

export function useToast() {
  return { toast };
}
