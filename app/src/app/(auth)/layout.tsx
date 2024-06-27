import GuestRoutes from "@/components/GuestRoutes";

export default function Layout({ children }: { children: React.ReactNode }) {
	return <GuestRoutes>{children}</GuestRoutes>;
}
