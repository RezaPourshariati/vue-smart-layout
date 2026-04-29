import type { PasswordInputProps } from '@/types'
import { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'

function PasswordInput({ placeholder, value, onChange, name, onPaste }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <>
      <div className="relative text-gray-500">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          onPaste={onPaste}
          required
        />
        <div className="absolute top-4 right-4 cursor-pointer" onClick={togglePassword}>
          {showPassword ? (<AiOutlineEye size={22} />) : (<AiOutlineEyeInvisible size={22} />)}
        </div>
      </div>
    </>
  )
}

export default PasswordInput
