"use client";
import { useState } from "react";
import styles from "./reset-password.module.css";
import _ from "lodash";

export default function ResetPassword() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string|undefined>(undefined);


  return (
    <main className={styles.main}>
      <h1>Reset Password</h1>

      <form
        action={async (formData) => {
          console.log("Values : ",formData);
          
         const email = formData.get('email');
         if(!email) return
          const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+'/api/resetPassword', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({email})
          })

          if(response.ok) {
            setIsEmailSent(true)
          } else {
            let error = await response.json()
            setError(error?.message)
          }
        }}
      >
        <p>We will send reset password link to your email</p> <br />
        <input type="email" name="email" id="email" placeholder="Email" />{" "}
        <br />
        <button type="submit">Send</button>
        {
          isEmailSent && <h4>Email has been sent successfully please check your inbox</h4>
        }
        {
          !_.isEmpty(error) && <h6>{error}</h6>
        }
      </form>
    </main>
  );
}
