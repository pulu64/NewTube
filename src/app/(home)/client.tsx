"use client"
import { trpc } from "@/trpc/client"

const PageClient = () => {
  const [data] = trpc.hello.useSuspenseQuery({ text: "client" })

  return (
    <div>
      Client client says: {data.greeting}
    </div>
  )
}

export default PageClient