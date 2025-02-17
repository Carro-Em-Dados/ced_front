import { AuthContext } from "@/contexts/auth.context";
import { Service } from "@/interfaces/services.type";
import { useContext, useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { toast, Zoom } from "react-toastify";
import { Button, Input } from "@nextui-org/react";
import styles from "../../register/styles.module.scss";
import { WorkshopContext } from "@/contexts/workshop.context";
import { Role } from "@/types/enums/role.enum";

interface ServicesProps { isPremium: boolean; }

export default function Services({ isPremium }: ServicesProps) {
  const { db, currentUser, currentWorkshop } = useContext(AuthContext);
  const { workshopInView } = useContext(WorkshopContext);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const workshop = currentUser?.role === Role.ORGANIZATION ? workshopInView : currentWorkshop;

  const queryServices = async () => {
    if (!workshop?.id) return;
    setLoading(true);

    try {
      const q = query(collection(db, "services"), where("workshop", "==", workshop.id));
      const querySnapshot = await getDocs(q);
      const fetchedServices = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];
      setServices(fetchedServices);
    } catch (error) {
      toast.error("Erro ao buscar serviços", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Zoom,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (index: number, value: number) => {
    setServices((prevServices) => prevServices.map((service, i) => (i === index ? { ...service, price: value } : service)));
  };

  const saveServices = async () => {
    if (!workshop?.id) return;
    setLoading(true);
    try {
      const promises = services.map((service) => {
        if (service.id) {
          const serviceRef = doc(db, "services", service.id);
          return updateDoc(serviceRef, { price: service.price });
        }
        return null;
      });
      await Promise.all(promises);
      toast.success("Servicos atualizados com sucesso!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Zoom,
      });
    } catch (error) {
      toast.error("Erro ao salvar serviços", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Zoom,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queryServices();
  }, [workshop]);

  return (
    <div className="flex flex-col gap-5 mx-24 w-full">
      <div className="flex flex-col text-white">
        <p className="before:bg-[#69DF79] before:w-1 before:h-3 before:inline-block before:mr-2">{`Parametrização do contrato ${isPremium ? "" : " básico"}`}</p>
      </div>
      <div className="w-full flex flex-col gap-2">
        {services.map((service, index) => (
          <div key={service.id} className="grid grid-cols-2 items-center text-white w-full">
            <p className="text-sm">{service.service}</p>
            <Input
              defaultValue={service.price.toString()}
              label="Valor"
              type="number"
              onChange={(e) => handlePriceChange(index, Number(e.target.value))}
              variant="bordered"
              className="dark"
              classNames={{
                input: ["bg-transparent text-white"],
                inputWrapper: ["border border-2 !border-white focus:border-white"],
              }}
            />
          </div>
        ))}
      </div>
      <Button color="success" className={styles.modalButton} disabled={loading} onClick={saveServices}>
        Salvar
      </Button>
    </div>
  );
}
