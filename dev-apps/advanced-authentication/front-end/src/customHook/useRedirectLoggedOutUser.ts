import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import authService from '../redux/features/auth/authService'

function useRedirectLoggedOutUser(path: string) {
  const navigate = useNavigate()

  useEffect(() => {
    const redirectLoggedOut = async () => {
      try {
        const isLoggedIn = await authService.getLoginStatus()
        if (!isLoggedIn) {
          toast.info('Session expired, please login to continue.')
          navigate(path)
        }
      }
      catch (error) {
        console.error(error)
        navigate(path)
      }
    }
    redirectLoggedOut()
  }, [path, navigate])
}

export default useRedirectLoggedOutUser
