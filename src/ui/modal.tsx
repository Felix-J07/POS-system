import './static/modal.css';
import { X } from 'lucide-react';
import type { JSX } from 'react';

type ModalProps = {
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  modal_content: JSX.Element;
};

export function Modal({ setModalVisible, modal_content }: ModalProps): JSX.Element {
  return (
    <div className="modal" onMouseDown={() => setModalVisible(false) /*Closing the modal on click outside of the modal*/}>
        <div className="modal-content" onMouseDown={e => e.stopPropagation() /*Prevents closing the modal when modal is clicked*/}>
            <div className="modal-header">
                <h2>Rediger Produkt</h2>
                <span onClick={() => setModalVisible(false)}><X /></span>
            </div>
            <div className="modal-body">
                {modal_content}
            </div>
        </div>
    </div>
  );
}




