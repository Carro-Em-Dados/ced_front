import { AuthContext } from "@/contexts/auth.context";
import { Service } from "@/interfaces/services.type";
import styles from "../../register/styles.module.scss";
import { useContext, useState, useEffect } from "react";
import clsx from "clsx";
import {
	collection,
	query,
	where,
	getDocs,
	updateDoc,
	doc,
} from "firebase/firestore";

export default function Services() {
	const { db, currentWorkshop } = useContext(AuthContext);
	const [services, setServices] = useState<Service[]>([]);

	const queryServices = async () => {
		if (!currentWorkshop?.id) return;

		try {
			const q = query(
				collection(db, "services"),
				where("workshop", "==", currentWorkshop.id)
			);
			const querySnapshot = await getDocs(q);
			const fetchedServices = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Service[];
			setServices(fetchedServices);
		} catch (error) {
			console.error("Erro ao buscar serviços:", error);
		}
	};

	console.log(services);
	console.log(currentWorkshop?.id);

	const handlePriceChange = (index: number, value: number) => {
		setServices((prevServices) =>
			prevServices.map((service, i) =>
				i === index ? { ...service, price: value } : service
			)
		);
	};

	const saveServices = async () => {
		try {
			const promises = services.map((service) => {
				if (service.id) {
					const serviceRef = doc(db, "services", service.id);
					return updateDoc(serviceRef, { price: service.price });
				}
				return null;
			});
			await Promise.all(promises);
			alert("Serviços atualizados com sucesso!");
		} catch (error) {
			console.error("Erro ao salvar serviços:", error);
			alert("Erro ao salvar serviços. Verifique o console para mais detalhes.");
		}
	};

	useEffect(() => {
		queryServices();
	}, [currentWorkshop]);

	return (
		<div className="flex flex-col gap-5 mx-24 w-full">
			<div className="flex flex-col text-white">
				<p className="before:bg-[#69DF79] before:w-1 before:h-3 before:inline-block before:mr-2">
					Parametrização do contrato básico
				</p>
			</div>
			<div className="w-full flex flex-col gap-2">
				{services.map((service, index) => (
					<div
						key={service.id}
						className="grid grid-cols-2 items-center text-white w-full"
					>
						<p className="text-sm">{service.service}</p>
						<input
							className={clsx(styles.modalInput, "self-end")}
							defaultValue={service.price}
							placeholder="Valor"
							type="number"
							aria-label="Valor"
							onChange={(e) => handlePriceChange(index, Number(e.target.value))}
						/>
					</div>
				))}
			</div>
			<button
				onClick={saveServices}
				className="mt-4 p-2 bg-green-500 text-white"
			>
				Salvar Serviços
			</button>
		</div>
	);
}
