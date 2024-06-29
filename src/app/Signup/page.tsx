import { getSession } from '@/lib/auth';
import styles from './Signup.module.css'
import { redirect } from 'next/navigation';
import SignupForm from './Components/Form';

export default async function Signup() {
    
  
    return <main className={styles.main} >
       <SignupForm />
    </main>
}