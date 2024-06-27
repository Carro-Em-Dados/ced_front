import Link from "next/link";
import styles from "../main.module.scss";
import { Inter } from "next/font/google";
import clsx from "clsx";
import Login from "../dashboard/login/page";

const inter = Inter({ subsets: ["latin"] });

export default function App() {
	return (
		<main className={clsx(styles.mainWrap, inter.className)}>
			<Login />
		</main>
	);
}
