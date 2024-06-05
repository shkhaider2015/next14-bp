import { getSession, login } from "@/lib/auth";
import styles from "./Signin.module.css";
import { redirect } from "next/navigation";

export default async function Login() {
  const session = await getSession();
  console.log("Session : ", session)
  if (session) {
    redirect("dashboard");
  }
  return (
    <main className={styles.main}>
      <div className={styles.signinCard}>
        <h1>SignIn</h1>
        <form
          action={async (formData) => {
            "use server";
            const email = formData.get("email")?.toString();
            const password = formData.get("password")?.toString();
            await login({ email: email || "", password: password || "" });
          }}
          // method="post"
        >
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email Address"
          />
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
          />
          <button type="submit">SignIn</button>
        </form>
      </div>
    </main>
  );
}
