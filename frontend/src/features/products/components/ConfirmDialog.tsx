import { ModalOverlay, ModalContent, ModalTitle, ModalText, ModalActions } from '../../../components/Modal';
import { Button } from '../../../components/Button';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <ModalOverlay onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{title}</ModalTitle>
        <ModalText>{message}</ModalText>
        <ModalActions>
          <Button $variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button $variant="danger" onClick={onConfirm}>
            Confirmar
          </Button>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
}
