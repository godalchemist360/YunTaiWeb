// app/api/login-success/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { account, callbackUrl } = await req.json()

    if (!account) {
      return NextResponse.json({ error: '缺少參數' }, { status: 400 })
    }

    // 創建一個簡單的 session 或設置必要的 cookie
    // 這裡我們設置一個自定義的認證 cookie
    const response = NextResponse.json({
      ok: true,
      redirectUrl: callbackUrl || '/settings/profile'
    })

    // 設置一個認證 cookie，讓中間件知道用戶已登入
    response.cookies.set('custom-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // 設置用戶信息 cookie
    response.cookies.set('user-account', account, {
      httpOnly: false, // 讓客戶端可以讀取
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
