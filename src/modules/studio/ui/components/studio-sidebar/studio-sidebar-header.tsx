

import { useUser } from "@clerk/nextjs";
import { SidebarHeader, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import Link from "next/link";
import UserAvatar from "@/components/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/components/ui/sidebar";

const StudioSidebarHeader = () => {
  const { user } = useUser();
  const { state } = useSidebar();
  if (!user) return (
    <SidebarHeader
      className="flex items-center justify-center pb-4"
    >
      <Skeleton className="size-[112px] rounded-full" />
      <div className="flex flex-col items-center mt-2 gap-y-2">
        <Skeleton className="w-[80px] h-4" />
        <Skeleton className="w-[100px] h-4" />
      </div>
    </SidebarHeader>
  );

  if (state === "collapsed") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Your Profile"
          asChild
        >
          <Link href="/users/current">
            <UserAvatar
              imageUrl={user?.imageUrl}
              name={user?.fullName ?? "User"}
              size="xs"
              className="hover:opacity-80" />
            <span className="text-sm">Your profile</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarHeader
      className="flex items-center justify-center pb-4"
    >
      <Link href="user/current">
        <UserAvatar
          imageUrl={user?.imageUrl}
          name={user?.fullName ?? "User"}
          className="size-[112px] hover:opacity-80" />
      </Link>
      <div className="flex flex-col items-center mt-2 gap-y-1">
        <p className="text-sm font-medium">{user?.fullName}</p>
        <p className="text-xs text-muted-foreground">{user?.emailAddresses[0].emailAddress}</p>
      </div>
    </SidebarHeader>
  )
}

export default StudioSidebarHeader