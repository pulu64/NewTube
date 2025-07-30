"use client"
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from '@/components/ui/sidebar'
import { ThumbsUpIcon, ListVideoIcon, HistoryIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const items = [
  {
    title: "history",
    url: '/playlists/history',
    icon: HistoryIcon,
    auth: true
  },
  {
    title: "Liked videos",
    url: '/playlists/liked',
    icon: ThumbsUpIcon,
    auth: true
  },
  {
    title: "All playlists",
    url: '/playlists',
    icon: ListVideoIcon,
    auth: true
  },

]
const PersonalSection = () => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Personal</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={false}
                onClick={() => {

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

export default PersonalSection