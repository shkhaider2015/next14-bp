import { getSession } from '@/lib/auth';
import styles from './Signup.module.css'
import { redirect } from 'next/navigation';

export default async function Signup() {
    const session = await getSession();
    if (session) {
      redirect("dashboard");
    }
    return <main className={styles.main} >
       <h1>Signup</h1>
    </main>
}