import React, { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react';

type LogoutButtonProps = {
  children: ReactNode
}

const LogoutButton = ({children}: LogoutButtonProps) => {
    const router = useRouter();
    const onLogout = async()=>{
        await signOut()
        router.refresh()
    }
  return (
    <span className='cursor-pointer' onClick={onLogout}>
        {children}
    </span>
  )
}

export default LogoutButton