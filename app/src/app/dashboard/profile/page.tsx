"use client";
import React, { useState, useEffect, useContext } from "react";
import styles from "./styles.module.scss";
import Navbar from "@/components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import Image from "next/image";
import { Tab, Tabs } from "@nextui-org/react";
import { User } from "@/interfaces/user.type";
import { AuthContext } from "@/contexts/auth.context";
import { Contract } from "@/interfaces/contract.type";
import EditBasicContract from "./components/EditBasicContract";
import Services from "./components/Services";
import { WorkshopContext } from "@/contexts/workshop.context";
import { Role } from "@/types/enums/role.enum";

const Profile = () => {
  const { currentUser: myUser, currentWorkshop } = useContext(AuthContext);
  const { WorkshopsByOrg, workshopInView } = useContext(WorkshopContext);

  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [workshop, setWorkshop] = useState<any | undefined>(undefined);

  useEffect(() => {
    setCurrentUser(myUser);
  }, [myUser]);

  useEffect(() => {
    setWorkshop(myUser?.role === Role.ORGANIZATION ? workshopInView : currentWorkshop);
  }, [workshopInView, currentWorkshop, myUser]);

  const getDisabledKeys = () => {
    const disabledKeys: string[] = [];
    if (myUser?.role !== "master") disabledKeys.push("contract");

    if (!currentWorkshop && myUser?.role !== Role.ORGANIZATION) {
      disabledKeys.push("services");
      disabledKeys.push("workshop");
    }

    return disabledKeys;
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.pageWrap}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <div className={styles.rectangleContainer}>
              <Image src="/rectangle.png" alt="Retângulo título" fill style={{ objectFit: "cover" }} />
            </div>
            <div className="flex flex-col gap-0">
              <h1 className={styles.mainTitle}>Perfil</h1>
              <p className={styles.subtext}>Minhas informações</p>
              <div className="pt-2">{currentUser?.role === Role.ORGANIZATION && <WorkshopsByOrg />}</div>
            </div>
          </div>
        </div>
        <Tabs
          className={`${styles.tabs} mx-20`}
          key="profile"
          disabledKeys={getDisabledKeys()}
          classNames={{
            tabContent: "group-data-[selected=true]:text-white group-data-[disabled=true]:hidden",
          }}
        >
          <Tab key="profile" title="Perfil">
            <div className={`${styles.content} flex flex-col gap-5`}>
              {currentUser ? (
                <div className="flex flex-col gap-5 text-white">
                  <p className="before:bg-[#69DF79] before:w-1 before:h-3 before:inline-block before:mr-2">{currentUser?.name}</p>
                </div>
              ) : (
                <p className="text-white">No user found</p>
              )}

              <div className="text-white w-full flex flex-col">
                {workshop ? (
                  <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-5">
                      <p className="text-lg font-bold">Informações básicas</p>
                      <div className="flex flex-col gap-2 text-sm">
                        <p>Número do Contrato: {workshop?.contract_number}</p>
                        <p>Número de Registro: {workshop?.registration_number}</p>
                        <p>Nome Fantasia: {workshop?.fantasy_name}</p>
                        <p>Razão Social: {workshop?.company_name}</p>
                        <p>CNPJ: {workshop?.cnpj}</p>
                        <p>Contato: {workshop?.contact}</p>
                        <p>Telefone: {workshop?.phone}</p>
                        <p>Website: {workshop?.website}</p>
                        <p>Email: {workshop?.email}</p>
                        <p>Código do Estado: {workshop?.state_code}</p>
                        <p>Código da Cidade: {workshop?.city_code}</p>
                        <p>CNAE: {workshop?.cnae1}</p>
                        <p>Endereço: {workshop?.address}</p>
                        <p>Ramo: {workshop?.branch}</p>
                        <p>Quantidade de Colaboradores: {workshop?.collaborators_amount}</p>
                        <p>Trabalhadores Ativos: {workshop?.active_workers}</p>
                        <p>Ticket Médio: {workshop?.average_ticket}</p>
                        <p>Meta Mensal: {workshop?.monthly_goal}</p>
                        <p>Faturamento: {workshop?.revenue}</p>
                        <p>Inscrição Estadual: {workshop?.state_registration}</p>
                        <p>Inscrição Municipal: {workshop?.municipal_registration}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-5">
                      <p className="text-lg font-bold">Redes sociais</p>
                      <div className="flex flex-col gap-2 text-sm">
                        <p>Instagram: {workshop?.social?.instagram}</p>
                        <p>Facebook: {workshop?.social?.facebook}</p>
                        <p>YouTube: {workshop?.social?.youtube}</p>
                        <p>LinkedIn: {workshop?.social?.linkedin}</p>
                        <p>Twitter: {workshop?.social?.twitter}</p>
                        <p>Outros: {workshop?.social?.others}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-white">Nenhuma oficina encontrada</p>
                )}
              </div>
            </div>
          </Tab>
          <Tab key="workshop" title="Informações do contrato">
            <div className={`${styles.content} flex flex-col gap-5`}>
              <div className="text-white w-full flex flex-col">
                {workshop ? (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-5 text-white">
                      <p className="before:bg-[#69DF79] before:w-1 before:h-3 before:inline-block before:mr-2">Informações do contrato</p>
                      <div className="flex flex-col gap-10 text-sm">
                        <p>Tipo de contrato: {workshop.contract.id === "basic" ? "Básico" : "Customizado"}</p>
                        <p>Quantidade de cadastros de clientes-motoristas: {workshop.contract.maxDrivers || 0}</p>
                        <p>Quantidade de cadastros de veículos por clientes-motoristas: {workshop.contract.maxVehiclesPerDriver || 0}</p>
                        <p>Quantidade de alarmes por KM limite/Data limite por veículo: {workshop.contract.maxAlarmsPerVehicle || 0}</p>
                        <p>
                          Quantidade de alarmes por KM limite/Data limite por veículo: {workshop.contract.maxMaintenanceAlarmsPerUser || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-white">Nenhuma oficina encontrada</p>
                )}
              </div>
            </div>
          </Tab>
          <Tab key="contract" title="Informações do contrato básico">
            <div className={`${styles.content} flex flex-col gap-5 w-full`}>
              <EditBasicContract />
            </div>
          </Tab>
          <Tab key="services" title="Serviços">
            <Services />
          </Tab>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
