import { buttonVariants } from "@/components/ui/Button";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export const useCustomToast = () => {
  const loginToast = () => {
    const {} = toast({
      title: "Login required.",
      description: "You need to be logged in to do that.",
      variant: "destructive",
      action: (
        <Link
          href="/sign-in"
          className={buttonVariants({ variant: "outline" })}
        >
          Login
        </Link>
      ),
    });
  };

  return { loginToast };
};
