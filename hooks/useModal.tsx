import { useAppDispatch } from "./useAppDispatch";
import {
  showModal,
  closeModal as closeModalAction,
} from "../store/features/slice/modal.slice";

export const useModal = () => {
  const dispatch = useAppDispatch();

  const openModal = ({
    ref,
    level,
    title,
    description,
    modal_name,
    modal_function,
    props,
  }: {
    ref?: string;
    level?: number;
    title?: string;
    description?: string;
    modal_name: string;
    modal_function?: string;
    props?: Record<string, string | number>;
    onConfirm?: () => void;
  }) => {
    // Update URL

    // Dispatch Redux action to sync state
    dispatch(
      showModal({
        component_name: modal_name,
        title,
        description: description || "",
        modal_function: modal_function || "",
        props,
        ref,
      })
    );
  };

  const closeModal = () => {
    dispatch(closeModalAction());
  };

  return {
    openModal,
    closeModal,
  };
};
