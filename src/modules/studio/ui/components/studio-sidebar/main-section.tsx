"use client"
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from '@/components/ui/sidebar'
import { useAuth } from '@clerk/clerk-react'
import { useClerk } from '@clerk/nextjs'
import { HomeIcon, PlaySquareIcon, FlameIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const items = [
  {
    title: "home",
    url: '/',
    icon: HomeIcon
  },
  {
    title: "Subscriptions",
    url: '/feed/subscribed',
    icon: PlaySquareIcon,
    auth: true
  },
  {
    title: "Trending",
    url: '/feed/trending',
    icon: FlameIcon
  },

]
const MainSection = () => {
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={false}
                onClick={(e) => {
                  if (!isSignedIn && item.auth) {
                    e.preventDefault();
                    return clerk.openSignIn();
                  }
                }}
              >
                <Link href={item.url} className='flex items-center gap-4'>
                  <item.icon />
                  <span className='text-sm'>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default MainSection