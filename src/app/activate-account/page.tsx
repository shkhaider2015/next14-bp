import { activateAccount } from "@/lib/auth";
import styles from "./activate-account.module.css";

interface PageProps {
  searchParams: {
    token?: string;
  };
}

export default async function ActivateAccount(props: PageProps) {
  const { searchParams } = props;
  const { isValid, email } = await activateAccount(searchParams.token || "");

  return (
    <main className={styles.main}>
      {isValid ? (
        <div className={styles.activatedWrapper} >You account has been activated</div>
      ) : (
        <div>The link is invalid or expired</div>
      )}
    </main>
  );
}
