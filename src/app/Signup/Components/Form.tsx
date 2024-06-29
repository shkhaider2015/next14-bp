"use client";
import { FormEvent, useState } from "react";
import styles from "./Form.module.css";
import _ from "lodash";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isCodeSent, setIsCodeSent] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();

  const router = useRouter();

  const _handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    let full_name = formData.get("full_name") as string;
    let email = formData.get("email") as string;
    let password = formData.get("password") as string;
    let confirm_password = formData.get("confirm_password") as string;

    console.log("Values : ", full_name, email, password, confirm_password);
    let URL = "api/user";

    try {
      setLoading(true)
      const res = await axios.post(URL, {
        fullName: full_name,
        email,
        password,
        confirmPassword: confirm_password,
        role: "USER",
      });

      if(res.status !== 200) throw({message: 'S'})
      console.log("res : ", res);
      setIsCodeSent(true)
      // router.push('/Signin')
    } catch (error: any) {
      console.log("Error : ", error);
      setError(error?.response?.data?.message?.toString())
      setIsCodeSent(false);
    } finally {
      setLoading(false)
    }
  };

  return (
    <form onSubmit={_handleSignup}>
      <div>
        {isCodeSent && "Account activation code has been sent to your email"}
      </div>
      <div className={styles.formItem}>
        <legend>Signup</legend>
      </div>
      {!_.isEmpty(error) && <div className={styles.errorWrapper}>{error}</div>}
      <div className={styles.formItem}>
        <input
          type="full_name"
          name="full_name"
          id="full_name"
          placeholder="Full Name"
        />
      </div>
      <div className={styles.formItem}>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Email Address"
        />
      </div>
      <div className={styles.formItem}>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
        />
      </div>
      <div className={styles.formItem}>
        <input
          type="password"
          name="confirm_password"
          id="confirm_password"
          placeholder="Confirm Password"
        />
      </div>
      <div className={styles.formItem}>
        <button disabled={loading} type="submit">Signup</button>
      </div>
    </form>
  );
}
