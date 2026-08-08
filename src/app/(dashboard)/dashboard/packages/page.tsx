import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import PackagesPageComp from "@/components/Dashboard/PackagesPage/PackagesPageComp"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"


const PackagesPage = async () => {
  const session = await getServerSession(authOptions)
  if(!session || !session.user){
    redirect('/')
  }

  return (
    <>

      <PackagesPageComp userPermissions = {session.user.permissions} />
    </>
  )
}

export default PackagesPage