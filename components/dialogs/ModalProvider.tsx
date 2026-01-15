import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { closeModal } from "@/store/features/slice/modal.slice";
import { MODAL_COMPONENTS } from "@/store/features/types";
import LoginBottomModal from "./components/LoginBottomModal";
import RegisterBottomModal from "./components/RegisterBottomModal";
import BetslipModal from "./components/BetslipModal";
import GameOptions from "./components/GameOptions";
import SuccessModal from "./components/Success";
import ChangePasswordModal from "./components/ChangePassword";

const ModalProvider: React.FC = () => {
  const dispatch = useAppDispatch();
  const { is_open, component_name, dismissible } = useAppSelector(
    (state) => state.modal
  );
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (is_open) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [is_open]);

  // Only render if there's an active modal and it's visible
  if (!shouldRender || !component_name) {
    return null;
  }

  const handleClose = () => {
    if (dismissible !== false) {
      dispatch(closeModal());
    }
  };

  const renderModal = () => {
    switch (component_name) {
      case MODAL_COMPONENTS.LOGIN_MODAL:
        return <LoginBottomModal onClose={handleClose} />;
      case MODAL_COMPONENTS.REGISTER_MODAL:
        return <RegisterBottomModal onClose={handleClose} />;
      case MODAL_COMPONENTS.BETSLIP_MODAL:
        return <BetslipModal onClose={handleClose} />;
      case MODAL_COMPONENTS.GAME_OPTIONS_MODAL:
        return <GameOptions onClose={handleClose} />;
      case MODAL_COMPONENTS.SUCCESS_MODAL:
        return <SuccessModal onClose={handleClose} />;
      case MODAL_COMPONENTS.CHANGE_PASSWORD_MODAL:
        return <ChangePasswordModal onClose={handleClose} />;
      default:
        return null;
    }
  };

  return <>{renderModal()}</>;
};

export default ModalProvider;
