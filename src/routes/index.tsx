import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome to Bapenda Dashboard</h1>
      <Link to='/login'>Go to Login</Link>

    </div>
  )
}
