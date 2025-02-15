"use client";
import styles from "./DriverCard.module.scss";
import { IoPersonCircle } from "react-icons/io5";
import { Accordion, AccordionItem } from "@nextui-org/react";
import clsx from "clsx";
import EraseModal, { DeleteModalTypes } from "../EraseModal/EraseModal";
import { Workshop } from "@/interfaces/workshop.type";
import EditOrganization from "../OrganizationModal/EditOrganizationModal";
import AssociateWorkshop from "../OrganizationModal/AssociateWorkshop";
import { User } from "@/interfaces/user.type";
import AssociateUser from "../UserModal/AssociateUser";

interface Props {
  workshop: Workshop;
  setWorkshops: React.Dispatch<React.SetStateAction<Workshop[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  users: User[];
  workshopUsers: User[];
  isPremium: boolean;
  workshops: Workshop[];
}

export default function OrganizationCard({
  workshop,
  setWorkshops,
  users,
  setUsers,
  workshopUsers,
  isPremium,
  workshops
}: Props) {
  const Content = () => {

    return (
      <div className={styles.contentContainer}>
        <div className={styles.cardsContainer}>
          <div className={clsx(styles.card, styles.infoCard)}>
            <div className="flex flex-row justify-between w-full">
              <h4 className={styles.cardTitle}>Dados</h4>
              <EditOrganization
                workshop={workshop}
                setWorkshops={setWorkshops}
              />
            </div>
            <div className={styles.row}>
              <p className={styles.cardText}>Nome: {workshop.fantasy_name}</p>
            </div>
            <div className={styles.row}>
              <p className={styles.cardText}>Email: {workshop.email}</p>
            </div>
            <div className={styles.row}>
              <p className={styles.cardText}>Endereço: {workshop.address}</p>
            </div>
            <div className={styles.row}>
              <p className={styles.cardText}>CNPJ: {workshop.cnpj}</p>
            </div>
            <div className={styles.row}>
              <p className={styles.cardText}>Telefone: {workshop.phone}</p>
            </div>
            <div className={styles.row}>
              <p className={styles.cardText}>
                Razão social: {workshop.company_name}
              </p>
            </div>
            <div className={styles.row}>
              <p className={styles.cardText}>
                N° de cadastro: {workshop.registration_number}
              </p>
            </div>
          </div>
          <div className={`${clsx(styles.card, styles.vehiclesCard)} gap-2`}>
            <h4 className={styles.cardTitle}>Usuários associados</h4>
            <div className="flex flex-col space-y-4 w-full">
              <div className="grid grid-cols-3">
                <p className="font-bold">Nome</p>
                <p className="font-bold">Email</p>
              </div>
              <div className="w-full flex flex-col gap-2">
                {workshopUsers?.map((user, index) => (
                  <div
                    key={index}
                    className="flex flex-row justify-between gap-2 w-full bg-[#2D2F2D] px-6 py-3 rounded-full"
                  >
                    <p className="text-sm col-span-1 text-wrap">{user.name}</p>
                    <p className="text-sm col-span-2 text-wrap">{user.email}</p>

                    <AssociateUser
                      user={user}
                      setUsers={setUsers}
                      workshops={workshops}
                      />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.contentFooter}>
          <div className={styles.deleteBtnWrap}>
            <EraseModal
              type={DeleteModalTypes.organization}
              name={workshop.fantasy_name}
              id={workshop.id}
              state={setWorkshops}
            />
          </div>
          <div className={styles.addVehicleBtnWrap}>
            <AssociateWorkshop
              users={users}
              workshop={workshop}
              setUsers={setUsers}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ margin: "0.5em 0" }}>
      <Accordion className={styles.accordion}>
        <AccordionItem
          title={
            <>
              {workshop.fantasy_name}
              <span className={isPremium ? "ml-2 border-2 border-green-400 p-1 rounded-full" : ""}>
                {isPremium ? "Premium" : ""}
              </span>
            </>
          }
          className={styles.item}
          startContent={<IoPersonCircle className={styles.personIcon} />}
        >
          <Content />
        </AccordionItem>
      </Accordion>
    </div>
  );
}
