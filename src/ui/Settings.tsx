//import { ExportDatabase, ImportDatabase } from './database.ts';
import { Modal } from './modal.tsx';
import { useEffect, useState, type JSX } from 'react';
import { LanDatesModal } from './lan_dates_modal.tsx';
import { ExpensesModal } from './ExpensesModal.tsx';
import { UserAdmin } from './UserAdmin.tsx';
import Login from "./Login.tsx";

type SettingsProps = {
    lanDates: LanDatesType[];
    setLanDates: React.Dispatch<React.SetStateAction<LanDatesType[]>>;
};


// The Settings component which allows the user to access different settings modals such as LAN dates, expenses and user administration
// The settings page is used to change settings or other configurations for the POS system
// Previously, the database was saved in AppData folder, and therefore the settings page also had options to export and import the database
// but this has been removed since the database is now saved in the same folder as the application, which makes it easier to access and manage for the user
function Settings({lanDates, setLanDates}: SettingsProps) {
    // Changes the main-container minWidth based on the page
    useEffect(() => {
        const element = document.querySelector(".main-container");
        if (element instanceof HTMLElement) {
            element.style.minWidth = "300px";
        }
    
        return () => {
            if (element instanceof HTMLElement) {
            element.style.minWidth = ""; // clean up on unmount
            }
        };
    }, []);
    
    // State for controlling the visibility and content of the modal
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState<JSX.Element | false>(false);

    // Function to handle restricted access for certain settings, such as user administration, which requires the user to log in again to access
    function handleRestrictedAccess(modal_content: JSX.Element) {
        setModalVisible(true);
        setModalContent(
            <Login 
                setLogged_in={(loggedIn) => {
                    if (loggedIn) {
                        setModalContent(modal_content);
                    }
                }} 
            />
        );
    }

    return (
        <>
            {/*
                <div>
                    <button onClick={ExportDatabase}>Eksporter Database</button>
                </div>
                <div>
                    <button onClick={ImportDatabase}>Importer Database</button>
                </div>
            */}
            <div>
                <button onClick={() => {setModalVisible(true); setModalContent(<LanDatesModal lanDates={lanDates} setLanDates={setLanDates} setModalVisible={setModalVisible} />);}}>LAN datoer</button>
            </div>
            <div>
                <button onClick={() => {setModalVisible(true); setModalContent(<ExpensesModal lanDates={lanDates} />)}}>Udgifter</button>
            </div>
            <div>
                <button onClick={() => handleRestrictedAccess(<UserAdmin />)}>Brugeradministation til login</button>
            </div>
            {modalVisible && modalContent && (<Modal setModalVisible={setModalVisible} modal_content={modalContent} title="LAN Datoer" />)}
        </>
    );
}

export default Settings;