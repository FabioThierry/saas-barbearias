// "use client";

// import { useSession, signIn, signOut } from "next-auth/react";
// import { Button } from "@/components/ui/button";

// export default function LoginButton() {
//   const { data: session } = useSession();

//   if (session) {
//     return (
//       <div className="flex items-center gap-4">
//         <span>Signed in as {session.user?.email || session.user?.name}</span>
//         <Button onClick={() => signOut()}>Sign out</Button>
//       </div>
//     );
//   }
//   return <Button onClick={() => signIn()}>Sign in</Button>;
// }
