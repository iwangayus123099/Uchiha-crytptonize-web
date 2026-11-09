import { Outlet, createFileRoute } from '@tanstack/react-router'

// Induk untuk /materi (daftar) dan /materi/$id (modul).
export const Route = createFileRoute('/materi')({
  component: () => <Outlet />,
})
