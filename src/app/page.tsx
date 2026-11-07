import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  try {
    const session = await auth();
    if (session?.user) {
      redirect("/dashboard");
    }
  } catch {
    // Fallback to login if session check encounters error
  }

  redirect("/login");
}
