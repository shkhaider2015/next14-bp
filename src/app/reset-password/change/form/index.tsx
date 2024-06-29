"use client"
import _ from "lodash";
import { useState } from "react";

export default function Form({token}:{token:string|undefined}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined);

  const _handleSubmit = async (e:any) => {
    e.preventDefault()
    let values = e.target
    // return
    const new_password = values.new_password.value;  
    const confirm_new_password = values.confirm_new_password.value; 
    console.log(new_password, confirm_new_password);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BASE_URL + "/api/changePassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            new_password, 
            confirm_new_password,
            token
          }),
        }
      );

      if (!response.ok) {
          let error = await response.json();
          throw(error?.message)

      }
      
    } catch (error:any) {
      console.log("Error : ", error);
      setError(error)
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={_handleSubmit}>
      <div>
        <legend>Change Password</legend>
      </div>
      {!_.isEmpty(error) && <div className="error">{error}</div>}

      <div>
        <input
          type="password"
          name="new_password"
          id="new_password"
          placeholder="new_password"
        />
      </div>
      <div>
        <input
          type="password"
          name="confirm_new_password"
          id="confirm_new_password"
          placeholder="confirm_new_password"
        />
      </div>

      <button type="submit" disabled={loading}>
        Update
      </button>
    </form>
  );
}
