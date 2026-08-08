import connectDB from "lib/db"
import { Package } from "models/Package"
import { NextResponse } from "next/server"

export async function GET(){
    // const body = await req.json()

    try {
        await connectDB()

        const packages = await Package.find()
            .populate({
                path : 'menus',
                
            })
        
        console.log(packages);
        return NextResponse.json({message : 'پکیج ها ارسال شدن', packages} , {status : 200})
        
    } catch (error) {
        
    }

    return NextResponse.json({message : 'Done Packages'} , {status : 200})
}