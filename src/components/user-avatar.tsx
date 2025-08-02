import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl: string;
  name: string;
  className?: string;
  onClick?: () => void;
}

const avatarVariants = cva("", {
  variants: {
    size: {
      default: "h-9 w-9",
      xs: "h-4 w-4",
      sn: "h-6 w-6",
      lg: "h-10 w-12",
      xl: "h-[600px] w-[600px]",
    },
  },
  defaultVariants: {
    size: "default"
  },
})

const UserAvatar = ({ imageUrl, name, className, size, onClick }: UserAvatarProps) => {
  return (
    <Avatar className={cn(avatarVariants({ size }), className)} onClick={onClick}>
      <AvatarImage src={imageUrl} />
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar