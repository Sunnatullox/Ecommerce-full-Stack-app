import axios from "axios";
import React, { useState } from "react";
import { server } from "../../server";
import { useNavigate } from "react-router-dom";

function ResetPassword({reset_token}) {
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const navigate = useNavigate()

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const config = {
      headers: {
        "Content-Type": "application/json",
        "X_Auth_Token":reset_token
      },
    }
    try {
      const { data } = await axios.post(`${server}/user/reset-user-password`, {
        password,
      },config);
      if(data.success === true) {
        navigate("/login")
      } 
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
          <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Reset your Password
          </h2>
          <form
            onSubmit={handleResetPassword}
            className="mt-4 space-y-4 lg:mt-5 md:space-y-5"
          >
            <div>
              <label
                for="password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                New Password
              </label>
              <input
                type="password"
                name="password"
                autoComplete="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div>
              <label
                for="confirm-password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Confirm password
              </label>
              <input
                type="password"
                name="confirm-password"
                autoComplete="confirm-password"
                required
                placeholder="••••••••"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              <div className="text-[12px] mt-[6px] text-[#ff4a4a]">
                {confirmPass.length > 0 && confirmPass !== password && (
                  <span>
                    Recheck your password. There is an error in the password
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="border border-blue-600 hover:text-white outline-none hover:bg-blue-500 w-full text-black bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Reset passwod
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ResetPassword;
