import type { AppDispatch, RootState } from '@/redux/store'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Loader from '@/components/loader/Loader'
import { RESET, verifyUser } from '@/redux/features/auth/authSlice.ts'

function Verify() {
  const dispatch = useDispatch<AppDispatch>()
  const { verificationToken } = useParams<{ verificationToken: string }>()
  const { isLoading } = useSelector((state: RootState) => state.auth)

  const verifyAccount = async () => {
    await dispatch(verifyUser(verificationToken || ''))
    dispatch(RESET())
  }

  return (
    <>
      {isLoading && <Loader />}
      <section className="--my2">
        <div className="--center-all">
          <h2>Account Verification</h2>
          <p>To verify your account, click the button below...</p>
          <br />
          <button className="--btn --btn-primary" onClick={verifyAccount}>Verify Account</button>
        </div>
      </section>
    </>
  )
}

export default Verify
