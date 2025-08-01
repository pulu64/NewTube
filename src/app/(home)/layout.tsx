import React from 'react'
import Homelayout from '@/modules/home/ui/layouts/home-layout'
interface layoutProps {
  children: React.ReactNode
}
const layout = ({ children }: layoutProps) => {
  return (
    <Homelayout>
      {children}
    </Homelayout>
  )
}

export default layout