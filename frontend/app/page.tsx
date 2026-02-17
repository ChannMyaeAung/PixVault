import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (token) {
    redirect('/dashboard');
  }

  redirect('/login');
  
}
