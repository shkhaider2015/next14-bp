import { activateAccount } from "@/lib/auth";
import styles from "./activate.module.css";

interface PageProps {
  searchParams: {
    token?: string;
  };
}

export default async function Activate({ searchParams }: PageProps) {
  const isValid = await activateAccount(searchParams.token || "");
  console.log("Token ", isValid);
  return (
    <main className={styles.main}>
      <h1>Activation</h1>
      {isValid ? (
        <div>
          <p>Your account has activated successfully, Please login</p>
          <button>Login</button>
        </div>
      ) : (
        <p>activation link is invalid or expired</p>
      )}
      <p></p>
    </main>
  );
}
