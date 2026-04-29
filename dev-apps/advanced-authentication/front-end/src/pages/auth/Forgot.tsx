import type { ChangeEvent, FormEvent } from 'react'
import type { AppDispatch, RootState } from '@/redux/store'
import { useState } from 'react'
import { AiOutlineMail } from 'react-icons/ai'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Card from '@/components/card/Card'
import Loader from '@/components/loader/Loader'
import { validateEmail } from '@/redux/features/auth/authService.ts'
import { forgotPassword, RESET } from '@/redux/features/auth/authSlice.ts'

function Forgot() {
  const [email, setEmail] = useState('')
  const dispatch = useDispatch<AppDispatch>()

  const { isLoading } = useSelector((state: RootState) => state.auth)

  const forgot = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter an email')
      return
    }
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email')
      return
    }
    const userData = { email }
    await dispatch(forgotPassword(userData))
    dispatch(RESET())
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="container min-h-screen flex justify-center items-center">
        <Card>
          <div className="w-[35rem] p-6 animate-[slide-up_0.5s_ease] bg-white [&_h2]:text-[#ff4500] [&_h2]:text-center [&_form_input[type='text']]:block [&_form_input[type='email']]:block [&_form_input[type='password']]:block [&_form_input[type='text']]:text-[1.6rem] [&_form_input[type='email']]:text-[1.6rem] [&_form_input[type='password']]:text-[1.6rem] [&_form_input]:font-light [&_form_input]:p-4 [&_form_input]:my-4 [&_form_input]:mx-auto [&_form_input]:w-full [&_form_input]:border [&_form_input]:border-[#ccc] [&_form_input]:border-b-[3px] [&_form_input]:rounded [&_form_input]:outline-none [&_form_input:focus]:shadow-[0_1rem_2rem_rgba(0,0,0,0.1)] [&_form_input:focus]:border-b-[3px] [&_form_input:focus]:border-b-[#55c57a] [&_form_input:focus:invalid]:border-b-[#ff7730]">
            <div className="flex justify-center items-center">
              <AiOutlineMail size={35} color="#999" />
            </div>
            <h2 style={{ marginBottom: '4rem' }}>Forgot Password</h2>

            <form onSubmit={forgot}>
              <label htmlFor="email">
                <p>Please Enter Email Address for Resetting Password!</p>
              </label>
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="text-[1.6rem] font-medium text-white px-2 py-1.5 mx-[5px] mr-0 mb-0 border border-transparent rounded-md cursor-pointer flex justify-center items-center transition-all duration-300 shadow-lg w-full bg-[#007bff] hover:bg-[#504acc]">Get Reset Email</button>

              <div className="flex justify-between my-[5px]">
                <p><Link to="/">Home</Link></p>
                <p><Link to="/login">Login</Link></p>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </>
  )
}

export default Forgot
