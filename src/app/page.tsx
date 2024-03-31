import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Home Page</h1> 
      <Link href={'Signin'} className={styles.btn} >Signin</Link> 
      <Link href={'Signup'} className={styles.btn} >Signup</Link>
    </main>
  );
}
