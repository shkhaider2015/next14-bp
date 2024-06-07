import { getSession, getUserRole, changePassword } from "@/lib/auth";
import styles from "./change-password.module.css";
import { redirect } from "next/navigation";

export default async function ChangePassword() {
  const session = await getSession();

  if (!session) {
    redirect("Signin");
  }
  console.log("Session : ", session);
  
  return (
    <main className={styles.main}>
      <h1>Admin</h1>

      <form
        action={async (formData) => {
          "use server";
          const old_password = formData.get('old_password')?.toString()
          const new_password = formData.get('new_password')?.toString()
          const confirm_new_password = formData.get('confirm_new_password')?.toString();
          const userId = session.user.id;

          if(!old_password || !new_password || !confirm_new_password) {
            return {
              error : 'All fields are required'
            }
          }

          if(new_password.length < 6) {
            return {
              error : 'New Password length should be more than six characters'
            }
          }

          if(new_password !== confirm_new_password) {
            return {
              error: "Passwords not matching"
            }
          }

          await changePassword(userId, old_password, new_password)
          console.log("", old_password, new_password, confirm_new_password);
          
        }}
      >
        <input type="password" name="old_password" placeholder="Old Password" />
        <input type="password" name="new_password" placeholder="New Password" />
        <input type="password" name="confirm_new_password" placeholder="Confirm New Password" />
        <button type="submit">Update</button>
      </form>
    </main>
  );
}
