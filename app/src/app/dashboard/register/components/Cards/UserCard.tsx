"use client";
import React, { useContext, SetStateAction } from "react";
import styles from "./DriverCard.module.scss";
import { IoPersonCircle } from "react-icons/io5";
import { Accordion, AccordionItem } from "@nextui-org/react";
import EraseModal, { DeleteModalTypes } from "../EraseModal/EraseModal";
import { User } from "@/interfaces/user.type";
import AssociateUser from "../UserModal/AssociateUser";
import { Workshop } from "@/interfaces/workshop.type";
import { AuthContext } from "@/contexts/auth.context";
import { Role } from "@/types/enums/role.enum";
import { roleLabel } from "@/constants/rolesLabel";

interface Props {
  user: User;
  workshops: Workshop[];
  setUsers: React.Dispatch<SetStateAction<User[]>>;
}

export default function UserCard({ user, setUsers, workshops }: Props) {
  const { currentUser } = useContext(AuthContext);
  return (
    <div style={{ margin: "0.5em 0" }}>
      <Accordion className={styles.accordion}>
        <AccordionItem
          title={
            <span>
              <small className="border border-[#27A338] py-1 px-2 rounded-lg text-xs">{roleLabel[user.role as Role]}</small> {user.name} -{" "}
              {user.email}{" "}
              {user.role !== Role.ORGANIZATION &&
                `- ${workshops.find((workshop) => workshop.id === user.workshops)?.fantasy_name || "Nenhuma oficina"}`}
            </span>
          }
          className={styles.item}
          startContent={<IoPersonCircle className={styles.personIcon} />}
        >
          <div className={styles.contentContainer}>
            <div className={styles.contentFooter}>
              {currentUser?.role === "master" && (
                <div className={styles.deleteBtnWrap}>
                  <EraseModal type={DeleteModalTypes.user} name={user.name} id={user.id} state={setUsers} />
                </div>
              )}
              {user.role !== Role.ORGANIZATION && (
                <div className={styles.addVehicleBtnWrap}>
                  <AssociateUser setUsers={setUsers} workshops={workshops} user={user} />
                </div>
              )}
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
