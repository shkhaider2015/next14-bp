import { validateToken } from "@/lib/auth";
import styles from "./change.module.css";
import Form from "./form";

interface PageProps {
  searchParams: {
    token?: string;
  };
}

export default async function Change({ searchParams }: PageProps) {
  const {isValid, email} = await validateToken(searchParams.token || "");
  console.log("Token ", isValid, email);
  return (
    <main className={styles.main}>
      <h1>Change Password</h1>
      {isValid ? (
        <div>
          <Form token={searchParams.token} />
        </div>
      ) : (
        <p>change password link is invalid or expired</p>
      )}
      <p></p>
    </main>
  );
}
