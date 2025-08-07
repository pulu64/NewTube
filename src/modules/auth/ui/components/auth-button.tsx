'use client'

import { Button } from '@/components/ui/button'
import { ClapperboardIcon, UserCircleIcon } from 'lucide-react'
import React, { Suspense } from 'react'
import { SignInButton, SignedIn, SignedOut, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

// 加载占位符组件
const AuthButtonSkeleton = () => (
  <div className="flex-shrink-0 items-center flex gap-4">
    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
  </div>
);

// 主要的认证按钮组件
const AuthButtonContent = () => {
  return (
    <>
      <SignedIn>
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link
              href="/studio"
              label="Studio"
              labelIcon={<ClapperboardIcon className='size-4' />} />
            <UserButton.Action label="manageAccount" />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn >
      <SignedOut>
        <SignInButton>
          <Button
            variant="outline"
            className='px-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-500 border-blue-500/20
    rounded-full shadow-none [&_svg]:size-5'
          ><UserCircleIcon />Sign in</Button>
        </SignInButton >
      </SignedOut>
    </>
  )
}

// 包装组件，使用 Suspense 处理水合
const AuthButton = () => {
  return (
    <Suspense fallback={<AuthButtonSkeleton />}>
      <AuthButtonContent />
    </Suspense>
  )
}

export default AuthButton