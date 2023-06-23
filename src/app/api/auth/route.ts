import { NextResponse } from 'next/server'
const verify = (user?: string, pass?: string) => {
    // replace this with actual authentication middleware
    if (user == 'admin' && pass == 'admin') {
        return true;
    }
    return false;
}
export async function POST(req: Request) {
    const data = await req.json();
    const success = verify(data.username, data.password);
    if (success) {
        return NextResponse.json(
            {
                headers: {
                    "Content-Type": "application/json"
                },
                body: {
                    data:"some data"
                }
            },
            {
                status: 200
            }
        )
    }
    return NextResponse.json(
        {
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                data:"some data"
            }
        },
        {
            status: 401
        }
    )
}