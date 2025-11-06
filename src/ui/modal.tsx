import './static/modal.css';
import { X } from 'lucide-react';
import type { JSX } from 'react';

// Modal component props type (for type checking)
type ModalProps = {
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  modal_content: JSX.Element;
  title: string;
};

// React functional component for a modal
// Used as a base setup for a modal, content is passed as a prop
export function Modal({ setModalVisible, modal_content, title }: ModalProps): JSX.Element {
  // Div "modal" is the background overlay for the "shadow" effect
  // Div "modal-content" is the actual modal box
  // Clicking outside the modal-content div closes the modal (onMouseDown on modal div)
  // Clicking inside the modal-content div does not close the modal (onMouseDown with stopPropagation on modal-content div)
  // The modal header contains a title and a close button (X icon from lucide-react)
  // The modal body contains the content passed as a prop
  return (
    <div className="modal" onMouseDown={() => setModalVisible(false) /*Closing the modal on click outside of the modal*/}>
        <div className="modal-content" onMouseDown={e => e.stopPropagation() /*Prevents closing the modal when modal is clicked*/}>
            <div className="modal-header">
                <h2>{title}</h2>
                <span onClick={() => setModalVisible(false)}><X /></span>
            </div>
            <div className="modal-body">
                {modal_content}
            </div>
        </div>
    </div>
  );
}




