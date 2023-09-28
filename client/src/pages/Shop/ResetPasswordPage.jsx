import React, { useEffect } from 'react'
import  ResetPassword from '../../components/Forgot/ResetPassword'
import { useNavigate, useParams } from 'react-router-dom'
import { server } from '../../server'
import axios from 'axios'
import { toast } from 'react-toastify'

function ResetPasswordPage() {
  const navigate  = useNavigate()
    const {reset_token} = useParams()
    useEffect(() => {
     if(reset_token) {
      handleCheckToken()
     }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reset_token])

    async function handleCheckToken() {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "X_Auth_Token":reset_token
        },
      }
      try {
        const {data} = await axios.get(`${server}/user/check-token-reset-password`,config)
    
        if(data.success === false){
          navigate("/forgot-password")
        }
      } catch (error) {
        navigate("/forgot-password")
        toast.error(error.response.data.message)
      }
    }
  
  return (
    <div>
        <ResetPassword  reset_token={reset_token}/>
    </div>
  )
}

export default ResetPasswordPage