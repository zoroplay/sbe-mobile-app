import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { closeModal } from "@/store/features/slice/modal.slice";
import { MODAL_COMPONENTS } from "@/store/features/types";
import LoginBottomModal from "./components/LoginBottomModal";
import { View } from "react-native";
import RegisterBottomModal from "./components/RegisterBottomModal";
import BetslipModal from "./components/BetslipModal";
import GameOptions from "./components/GameOptions";
import SuccessModal from "./components/Success";
import ChangePasswordModal from "./components/ChangePassword";

const ModalProvider: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
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

  if (!shouldRender) return null;

  const commonProps = {
    visible: is_open,
    onClose: () => dispatch(closeModal()),
    dismissible,
  };

  const renderModal = () => {
    switch (component_name) {
      case MODAL_COMPONENTS.LOGIN_MODAL:
        return <LoginBottomModal onClose={commonProps.onClose} />;
      case MODAL_COMPONENTS.REGISTER_MODAL:
        return <RegisterBottomModal onClose={commonProps.onClose} />;
      case MODAL_COMPONENTS.BETSLIP_MODAL:
        return <BetslipModal onClose={commonProps.onClose} />;
      case MODAL_COMPONENTS.GAME_OPTIONS_MODAL:
        return <GameOptions onClose={commonProps.onClose} />;
      case MODAL_COMPONENTS.SUCCESS_MODAL:
        return <SuccessModal onClose={commonProps.onClose} />;
      case MODAL_COMPONENTS.CHANGE_PASSWORD_MODAL:
        return <ChangePasswordModal onClose={commonProps.onClose} />;
      default:
        return null;
    }
  };
  // Only render if there's an active modal
  if (!component_name) {
    return null;
  }
  return (
    <View
    // className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
    // onClick={handleBackdropClick}
    >
      {renderModal()}
    </View>
  );
};

export default ModalProvider;
