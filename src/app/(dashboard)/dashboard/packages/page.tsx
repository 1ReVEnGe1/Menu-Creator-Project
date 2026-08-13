
import { auth } from "@/auth"
import PackagesPageComp from "@/components/Dashboard/PackagesPage/PackagesPageComp"

import { redirect } from "next/navigation"


const PackagesPage = async () => {
  const session = await auth()
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