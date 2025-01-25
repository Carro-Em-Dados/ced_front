import styles from "./Navbar.module.scss";
import NavbarButtonHome from "./navbarButtonHome/NavbarButtonHome";
import NavbarButtonProfile from "./navbarButtonProfile/NavbarButtonProfile";
import NavbarButtonLogout from "./navbarButtonLogout/NavbarButtonLogout";
import Image from "next/image";
import NavbarButtonRegistration from "./navbarButtonRegistration/NavbarButtonRegistration";
import NavbarButtonMonitor from "./navbarButtonMonitor/NavbarButtonMonitor";
import NavbarButtonCalendar from "./navbarButtonCalendar/NavbarButtonCalendar";
import NavbarButtonAds from "./navbarButtonAds/NavbarButtonAds";

interface NavbarProps {
  isPremium: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  selectedWorkshop?: string;
}

function Navbar({ isPremium, setIsOpen, selectedWorkshop }: NavbarProps) {
  return (
    <div className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Image
          src="/logo1.png"
          alt="Logotipo Carro em Dados"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>
      <div className={styles.buttonsContainer}>
        <NavbarButtonHome />
        {isPremium &&
          setIsOpen &&
          selectedWorkshop &&
          selectedWorkshop !== "all" && (
            <NavbarButtonAds setIsOpen={setIsOpen} />
          )}
        {isPremium && <NavbarButtonMonitor workshop={selectedWorkshop} />}
        <NavbarButtonRegistration />
        <NavbarButtonCalendar />
        <NavbarButtonProfile />
        <NavbarButtonLogout />
      </div>
    </div>
  );
}

export default Navbar;
