'use client'

export function Greeting({ name }: { name?: string }) {
  const hour = new Date().getHours()

  let greeting = 'Good morning'
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon'
  else if (hour >= 17 && hour < 21) greeting = 'Good evening'
  else if (hour >= 21 || hour < 5) greeting = 'Good night'

  return (
    <h1 className="text-2xl font-bold text-gray-900">
      {greeting}{name ? `, ${name}` : ''}!
    </h1>
  )
}
