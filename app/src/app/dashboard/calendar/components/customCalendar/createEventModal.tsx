import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import styles from "../../../register/styles.module.scss";
import DropdownComponent from "@/custom/dropdown/Dropdown";
import { useContext, useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { toast, Zoom } from "react-toastify";
import { createGoogleEvent } from "@/services/google-calendar";
import { Maintenance } from "@/interfaces/maintenances.type";
import { MaintenanceWithName } from "./customCalendar";
import type { Vehicle } from "@/interfaces/vehicle.type";
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from "next/navigation";
import { Workshop } from "@/interfaces/workshop.type";
import { Contract } from "@/interfaces/contract.type";

interface Props {
  events: any;
  setEvents: React.Dispatch<React.SetStateAction<any[]>>;
  services: any[];
  drivers: any[];
  workshop: Workshop & {
    contract: Contract;
  };
}

export default function CreateEventModal({ events, workshop, setEvents, drivers, services }: Props) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [maintenanceDate, setMaintenanceDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  });
  const [start, setStart] = useState(new Date().toTimeString().split(" ")[0].substring(0, 5));

  const [end, setEnd] = useState(() => {
    const [hours, minutes] = start.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours);
    startDate.setMinutes(minutes);
    startDate.setHours(startDate.getHours() + 2);
    return startDate.toTimeString().split(" ")[0].substring(0, 5);
  });
  const [note, setNote] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<any>();
  const [selectedService, setSelectedService] = useState<any>();
  const [selectedVehicle, setSelectedVehicle] = useState<any>();
  const [driverName, setDriverName] = useState<string>("");
  const [maintenanceTitle, setMaintenanceTitle] = useState<string>("");
  const [loading, setLoading] = useState(false);
  let searchParams = new URLSearchParams(window.location.search);
  let vehicle = searchParams.get("v");
  let driver = searchParams.get("d");
  let maintenance = searchParams.get("m");

  const remainingSchedules =
    (workshop.contract.workshopScheduleLimit ?? 0) - (events.length ?? 0) < 0
      ? 0
      : (workshop.contract.workshopScheduleLimit ?? 0) - (events.length ?? 0);

  const { db } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const [hours, minutes] = start.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours);
    startDate.setMinutes(minutes);
    startDate.setHours(startDate.getHours() + 2);
    setEnd(startDate.toTimeString().split(" ")[0].substring(0, 5));
  }, [start]);

  useEffect(() => {
    setSelectedDriver(driver);
    setSelectedVehicle(vehicle);
    if (driver || vehicle || maintenance) {
      onOpen();
      if (maintenance) {
        getMaintenanceName(maintenance);
      }
    }
  }, [driver, vehicle, maintenance]);

  const handleClose = () => {
    setMaintenanceDate(new Date().toISOString().split("T")[0]);
    setStart(new Date().toTimeString().split(" ")[0].substring(0, 5));
    setEnd(() => {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      return oneHourLater.toTimeString().split(" ")[0].substring(0, 5);
    });
    setNote("");
    setSelectedDriver(undefined);
    setSelectedService(undefined);
    setSelectedVehicle(undefined);
    setDriverName("");
    setMaintenanceTitle("");
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("v");
    newUrl.searchParams.delete("d");
    newUrl.searchParams.delete("m");
    newUrl.searchParams.delete("w");
    window.history.pushState({}, "", newUrl.toString());
    searchParams = new URLSearchParams("");
    // router.push("/dashboard/calendar");
    onClose();
  };
  const getMaintenanceName = async (main: string) => {
    if (!workshop) return;
    const docRef = doc(db, "maintenances", main);
    await getDoc(docRef).then((doc) => {
      if (doc.exists()) {
        setMaintenanceTitle(doc.data().service);
      }
    });
  };

  const createEvent = async () => {
    setLoading(true);
    if (!workshop) return;

    if (!selectedDriver || (!selectedService && !maintenanceTitle) || !selectedVehicle) {
      toast.error("Por favor preencha os campos", {
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
      return setLoading(false);
    }

    const newEventStart = new Date(`${maintenanceDate}T${start}`);
    const newEventEnd = new Date(`${maintenanceDate}T${end}`);

    if (newEventStart.getTime() > newEventEnd.getTime()) {
      toast.error("A data final deve ser superior a data inicial", {
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
      return setLoading(false);
    }

    try {
      const q = query(
        collection(db, "schedules"),
        where("workshop", "==", workshop.id),
        where("start", "<", newEventEnd),
        where("end", ">", newEventStart),
        where("driver", "==", selectedDriver)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast.error("Conflito de horário com outro agendamento", {
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
        return setLoading(false);
      }

      let newEvent: Schedules;

      newEvent = {
        allDay: false,
        driver: selectedDriver,
        vehicle: selectedVehicle,
        service: selectedService,
        note,
        start: newEventStart,
        end: newEventEnd,
        workshop: workshop.id,
      };

      if (maintenance) {
        newEvent = {
          allDay: false,
          driver: selectedDriver,
          vehicle: selectedVehicle,
          maintenance: maintenance,
          note,
          start: newEventStart,
          end: newEventEnd,
          workshop: workshop.id,
        };
      }

      if (workshop.google_calendar_id) {
        const driverEmail = drivers.find((d) => d.id === selectedDriver)?.email ?? "";
        newEvent.google_event_id =
          (await createGoogleEvent(workshop.google_calendar_id, {
            attendees: driverEmail ? [{ email: driverEmail }] : undefined,
            end: newEventEnd.toISOString(),
            start: newEventStart.toISOString(),
            summary: `[${workshop.fantasy_name}] ${driverName}`,
            description: `Manutenção: ${driverName}.\nObservações: ${note}.`,
            location: `${workshop?.address ?? ""} - ${workshop?.city_code ?? ""}, ${workshop?.state_code ?? ""}`,
          })) ?? undefined;
      }

      const eventRef = await addDoc(collection(db, "schedules"), {
        ...newEvent,
      });

      setEvents((prevEvents) => [...prevEvents, { id: eventRef.id, title: "Manutenção", ...newEvent }]);

      handleClose();
    } catch (error) {
      toast.error("Erro ao criar agendamento", {
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

  return (
    <>
      <Button color="success" className={clsx(styles.addVehicleBtn, "w-fit")} onClick={onOpen}>
        Adicionar manutenção
      </Button>
      <Modal isOpen={isOpen} className={styles.modal} onClose={handleClose} size="2xl" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className={clsx("flex flex-col gap-1", styles.modalTitle)}>Adicionar manutenção</ModalHeader>
              <ModalBody className="text-white">
                <div className={clsx(styles.form, "flex flex-col gap-4")}>
                  <div className="flex flex-col gap-2">
                    <Input
                      label="Data de manutenção"
                      type="date"
                      value={maintenanceDate}
                      onChange={(e) => setMaintenanceDate(e.target.value)}
                      variant="bordered"
                      className="dark"
                      classNames={{
                        input: ["bg-transparent text-white"],
                        inputWrapper: ["border border-2 !border-white focus:border-white"],
                      }}
                    />
                  </div>
                  <div className="flex flex-row gap-4">
                    <div className="flex flex-col gap-2 w-full">
                      <Input
                        label="Horário de início"
                        type="time"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        variant="bordered"
                        className="dark"
                        classNames={{
                          input: ["bg-transparent text-white"],
                          inputWrapper: ["border border-2 !border-white focus:border-white"],
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <Input
                        disabled
                        label="Horário de término"
                        type="time"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        variant="bordered"
                        className="dark"
                        classNames={{
                          input: ["bg-transparent text-white"],
                          inputWrapper: ["border border-2 !border-white focus:border-white"],
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-row gap-5">
                    <Autocomplete
                      label="Motorista"
                      variant="bordered"
                      className="dark"
                      defaultItems={drivers.map((driver) => ({
                        value: driver.id,
                        label: driver.name,
                      }))}
                      onKeyDown={(e: any) => e.continuePropagation()}
                      onSelectionChange={(key) => {
                        const keyString = key ? key.toString() : "";
                        setSelectedDriver(keyString);
                        setDriverName(drivers.find((driver) => driver.id === keyString)?.name || "");
                      }}
                      selectedKey={selectedDriver}
                    >
                      {(item) => (
                        <AutocompleteItem key={item.value} value={item.value}>
                          {item.label}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                    <Autocomplete
                      label="Veículos"
                      variant="bordered"
                      className="dark"
                      defaultItems={
                        drivers
                          .find((driver) => driver.id === selectedDriver)
                          ?.vehicles?.map((vehicle: Vehicle) => ({
                            value: vehicle.id,
                            label: `${vehicle.manufacturer} ${vehicle.car_model}`,
                          })) || []
                      }
                      onKeyDown={(e: any) => e.continuePropagation()}
                      onSelectionChange={(key) => {
                        const keyString = key ? key.toString() : "";
                        setSelectedVehicle(keyString);
                      }}
                      selectedKey={selectedVehicle}
                    >
                      {(item: { value: string; label: string }) => (
                        <AutocompleteItem key={item.value} value={item.value}>
                          {item.label}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  </div>

                  {maintenance ? (
                    <Input
                      disabled
                      label="Manutenção"
                      type="text"
                      value={maintenanceTitle}
                      variant="bordered"
                      className="dark"
                      classNames={{
                        input: ["bg-transparent text-white"],
                        inputWrapper: ["border border-2 !border-white focus:border-white"],
                      }}
                    />
                  ) : (
                    <Autocomplete
                      label="Serviço"
                      variant="bordered"
                      className="dark"
                      defaultItems={services.map((service) => ({
                        value: service.id,
                        label: service.service,
                      }))}
                      onKeyDown={(e: any) => e.continuePropagation()}
                      onSelectionChange={(key) => {
                        const keyString = key ? key.toString() : "";
                        setSelectedService(keyString);
                      }}
                      selectedKey={selectedService}
                    >
                      {(item) => (
                        <AutocompleteItem key={item.value} value={item.value}>
                          {item.label}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  )}
                  <div className="flex flex-col gap-2 w-full">
                    <Textarea
                      placeholder="Observação"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      variant="bordered"
                      className="dark"
                      classNames={{
                        input: ["bg-transparent text-white"],
                        inputWrapper: ["border border-2 !border-white focus:border-white"],
                      }}
                    />
                  </div>
                  <p>Agendamentos restantes: {remainingSchedules}</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" className="rounded-full px-5 text-white" onClick={onClose}>
                  Cancelar
                </Button>
                <Button color="success" disabled={loading || !remainingSchedules} className={styles.modalButton} onClick={createEvent}>
                  Salvar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
