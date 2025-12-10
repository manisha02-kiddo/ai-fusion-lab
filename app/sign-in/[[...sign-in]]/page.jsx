import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="h-screen flex items-center justify-center">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
