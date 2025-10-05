'use server';

import { cookies } from 'next/headers';

export async function setViewModeCookie(viewMode: 'internal' | 'admin') {
  (await cookies()).set('viewMode', viewMode, { path: '/', maxAge: 60 * 60 * 24 * 7 }); // 7 days
}
