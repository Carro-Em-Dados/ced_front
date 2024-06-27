import UserRoutes from "@/components/UserRoutes";

export default function Layout({ children }: { children: React.ReactNode }) {
	return <UserRoutes>{children}</UserRoutes>;
}
