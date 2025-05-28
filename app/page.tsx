import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to products page instead of login
  redirect('/dashboard/products');
}