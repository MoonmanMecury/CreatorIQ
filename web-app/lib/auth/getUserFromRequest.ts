import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function getUserFromRequest(request: NextRequest): Promise<{ userId: string, email: string } | null> {
    const token = request.cookies.get('auth-token')?.value
        ?? request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) return null

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)
        return {
            userId: payload.sub as string,
            email: payload.email as string
        }
    } catch {
        return null
    }
}
