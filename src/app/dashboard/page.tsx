import { getSession, logout } from "@/lib/auth";
import styles from "./dashboard.module.css";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getSession();
  if (!session) {
    redirect("Signin");
  }

  return (
    <main className={styles.main}>
      <h1>Protected</h1>

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
