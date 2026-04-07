import LoginForm from "@/app/(auth)/login/loginForm"

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <LoginForm />
    </div>
  )
}