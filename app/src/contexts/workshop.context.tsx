"use client";
import { Workshop } from "@/interfaces/workshop.type";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "./auth.context";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Contract } from "@/interfaces/contract.type";
import { Role } from "@/types/enums/role.enum";
import GeneralObjectOptionAutocomplete from "@/components/GeneralObjectOptionAutocomplete";

interface WorkshopContextData {
  workshopInView: (Workshop & { contract: Contract }) | undefined;
  workshopOptions: (Workshop & { contract: Contract })[];
  setWorkshopInView: (workshop: Workshop & { contract: Contract }) => void;
  setWorkshopOptions: (
    workshops: (Workshop & { contract: Contract })[]
  ) => void;
  WorkshopsByOrg: (props: {
    options?: (Workshop & { contract: Contract })[];
    selected?: string;
    onSelectionChange?: (key: any) => void;
  }) => JSX.Element;
  refecth: () => Promise<void>;
  getAllWorkshops: () => Promise<
    (Workshop & { contract: Contract })[] | undefined
  >;
  isLoading: boolean;
}

interface WorkshopProviderProps {
  children: ReactNode;
}

export const WorkshopContext = createContext<WorkshopContextData>(
  {} as WorkshopContextData
);

export function WorkshopProvider({ children }: WorkshopProviderProps) {
  const { db, currentUser } = useContext(AuthContext);

  const [workshopInView, setWorkshopInView] = useState<
    (Workshop & { contract: Contract }) | undefined
  >(undefined);
  const [workshopOptions, setWorkshopOptions] = useState<
    (Workshop & { contract: Contract })[]
  >([]);
  const [basicContract, setBasicContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const workshopIdFromQueryParams = searchParams.get("w");

  const getContract = async (id: string) => {
    if (id === "basic" && basicContract) return basicContract;
    const contractRef = doc(db, "contracts", id);
    const contractSnap = await getDoc(contractRef);
    if (!contractSnap.exists()) return null;
    if (id === "basic" && !basicContract)
      setBasicContract({ ...contractSnap.data(), id } as Contract);
    return {
      ...(contractSnap.data() as Contract),
      id: contractRef.id,
    };
  };

  const getWorkshopByOrganization = async () => {
    try {
      if (!currentUser?.id) return;
      setIsLoading(true);

      if (currentUser.role !== Role.MASTER) {
        const workshopQuery = query(
          collection(db, "workshops"),
          where("owner", "==", currentUser.id)
        );
        const workshopsSnapshot = await getDocs(workshopQuery);

        const workshopsPromises = workshopsSnapshot!.docs.map(async (doc) => {
          const workshop = doc.data() as Workshop;

          let contract = await getContract(
            (workshop.contract ?? "basic") as string
          );
          if (!contract) await getContract("basic");

          return { ...workshop, contract, id: doc.id } as Workshop & {
            contract: Contract;
          };
        });
        const workshops = await Promise.all(workshopsPromises);

        setWorkshopOptions(workshops);
        setWorkshopInView(workshops[0]);
      } else {
        if (workshopIdFromQueryParams) {
          const workshopDocRef = doc(
            db,
            "workshops",
            workshopIdFromQueryParams
          );
          const workshopsSnapshot = await getDoc(workshopDocRef);

          if (workshopsSnapshot.exists()) {
            const workshop = workshopsSnapshot.data() as Workshop;
            let contract = await getContract(
              (workshop.contract ?? "basic") as string
            );
            if (!contract) await getContract("basic");
            const data = {
              ...workshop,
              contract,
              id: workshopDocRef.id,
            } as Workshop & { contract: Contract };

            setWorkshopInView(data);
            setWorkshopOptions([data]);
          } else {
            throw new Error("Workshop does not exist");
          }
        } else {
          const workshopQuery = query(
            collection(db, "workshops"),
            where("owner", "==", currentUser.id)
          );
          const workshopsSnapshot = await getDocs(workshopQuery);

          const workshopsPromises = workshopsSnapshot!.docs.map(async (doc) => {
            const workshop = doc.data() as Workshop;

            let contract = await getContract(
              (workshop.contract ?? "basic") as string
            );
            if (!contract) await getContract("basic");

            return { ...workshop, contract, id: doc.id } as Workshop & {
              contract: Contract;
            };
          });
          const workshops = await Promise.all(workshopsPromises);

          setWorkshopOptions(workshops);
          setWorkshopInView(workshops[0]);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllWorkshops = async () => {
    try {
      if (!currentUser?.id) return;
      const workshopQuery = query(collection(db, "workshops"));
      const workshopsSnapshot = await getDocs(workshopQuery);
      const workshopsPromises = workshopsSnapshot.docs.map(async (doc) => {
        const workshop = doc.data() as Workshop;

        let contract = await getContract(
          (workshop.contract ?? "basic") as string
        );
        if (!contract) await getContract("basic");

        return { ...workshop, contract, id: doc.id } as Workshop & {
          contract: Contract;
        };
      });

      const workshops = await Promise.all(workshopsPromises);

      return workshops;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (workshopInView && workshopOptions.length > 0) return;
    getWorkshopByOrganization();
  }, [currentUser]);

  const WorkshopsByOrg = ({
    options,
    selected,
    onSelectionChange,
  }: {
    options?: (Workshop & { contract: Contract })[];
    selected?: string;
    onSelectionChange?: (key: any) => void;
  }) => {
    return (
      <GeneralObjectOptionAutocomplete
        options={(options || workshopOptions).map((w) => ({
          value: w.id,
          label: w.company_name,
        }))}
        initialValue={selected || workshopInView?.id!}
        onSelectionChange={
          onSelectionChange ||
          ((key) => {
            if (!key) return;
            setWorkshopInView((options || workshopOptions).find((w) => w.id === key?.value));
          })
        }
      />
    );
  };

  return (
    <WorkshopContext.Provider
      value={{
        setWorkshopInView,
        workshopInView,
        workshopOptions,
        getAllWorkshops,
        setWorkshopOptions,
        refecth: getWorkshopByOrganization,
        WorkshopsByOrg,
        isLoading,
      }}
    >
      {children}
    </WorkshopContext.Provider>
  );
}

export default WorkshopProvider;
