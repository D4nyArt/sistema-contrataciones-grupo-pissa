// pages/api/logout.ts
import { cookies } from 'next/headers';
import { NextResponse} from 'next/server'

export async function DELETE(req: Request) {
    
    const url = req.url;
    const query = new URLSearchParams(url.split('?')[1]);
    console.log("peneenorme: ", query.get("name"));  
    console.log('Data:', url);
    
    const cookieName = query.get("name");

    const cookieStore = await cookies();
    cookieStore.delete(`${cookieName}`);

 //res.setHeader('Set-Cookie', serialized);
 return NextResponse.json({ message: 'Cookie deleted successfully'});
}
