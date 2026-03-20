import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
      console.log('🔥 MIDDLEWARE EJECUTADO:', req.nextUrl.pathname);

    const cookie = req.cookies.get('token');

    if (!cookie) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
            cookie: `token=${cookie.value}`,
        },
    });

    if (res.status !== 200) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    const user = await res.json();
    const path = req.nextUrl.pathname;

    if (path.startsWith('/admin') && user.rol !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (path.startsWith('/profesional') && user.rol !== 'PROF') {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/client/:path*', '/profesional/:path*'],
};
