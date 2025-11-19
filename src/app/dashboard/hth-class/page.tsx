import React from 'react';
import { getSession } from "@/app/login/actions";
import { redirect } from 'next/navigation';

export default async function HTHClassPage() {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">HTH Class - Student View</h1>
      <p>This is where users can view and take classes.</p>
      {/* TODO: Implement class listing and viewing */}
    </div>
  );
}