import { SidebarTrigger } from '@/components/ui/sidebar'
import Link from 'next/link'
import React from 'react'
import { SearchInput } from './search-input'
import AuthButton from '@/modules/auth/ui/components/auth-button'

const Homenavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center px-2 pr-5 z-50">
      <div className="flex items-center gap-4 w-full">
        <div className="flex items-center flex-shrink-0">
          <SidebarTrigger />
          <Link href="/">
            <div className='p-4 flex items-center gap-1'>
              <svg className="font-bold text-red-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 24 18.196 24 12c0-6.185-.488-8.549-4.385-8.816zM9 16V8l8 4-8 4z" />
              </svg>
              <p className='text-xl font-semibold tracking-tight'>NewTube</p>
            </div>

          </Link>
        </div>
        {/* search bar */}
        <div className='flex-1 flex justify-center max-w-[720px] mx-auto'>
          <SearchInput></SearchInput>
        </div>
        <div className="flex-shrink-0 items-center flex gap-4">
          <AuthButton />
        </div>
      </div>

    </nav>
  )
}

export default Homenavbar