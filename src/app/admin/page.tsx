import { getSession, getUserRole, logout } from "@/lib/auth";
import styles from "./admin.module.css";
import { redirect } from "next/navigation";

export default async function Admin() {
  const session = await getSession();
  const userRole = await getUserRole(session?.user?.id || undefined)

  if (!session) {
    redirect("Signin");
  }
  console.log("Session : ", session);
  console.log("User Role : ", userRole);

  if(userRole !== 'ADMIN') {
    redirect('dashboard')
  }

  
  return (
    <main className={styles.main}>
      <h1>Admin</h1>

      <form
        action={async () => {
          "use server";
          logout();
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
    </main>
  );
}
