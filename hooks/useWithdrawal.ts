import {
  useVerifyWithdrawMutation,
  useCreateWithdrawMutation,
  useCancelWithdrawMutation,
  useGetBanksQuery,
  useVerifyBankAccountMutation,
  useBankWithdrawalMutation,
} from "../store/services/wallet.service";
import {
  setVerifyLoading,
  setVerifyRequest,
  setVerifyError,
  setWithdrawLoading,
  setApproval,
  setWithdrawError,
  clearError,
  reset,
} from "../store/features/slice/withdrawal.slice";
import environmentConfig, {
  getEnvironmentVariable,
  ENVIRONMENT_VARIABLES,
} from "../store/services/configs/environment.config";
import { showToast, TOAST_TYPE_ENUM } from "@/utils/toast";
import { useAppDispatch } from "./useAppDispatch";

export const useWithdrawal = () => {
  const dispatch = useAppDispatch();
  const clientId = environmentConfig.CLIENT_ID;

  const [verifyWithdrawMutation] = useVerifyWithdrawMutation();
  const [createWithdrawMutation] = useCreateWithdrawMutation();
  const [cancelWithdrawMutation] = useCancelWithdrawMutation();

  // Bank withdrawal hooks
  const { data: banks = [], isLoading: banksLoading } = useGetBanksQuery();
  const [
    verifyBankAccountMutation,
    { isLoading: verifyLoading, data: verificationData },
  ] = useVerifyBankAccountMutation();
  const [bankWithdrawalMutation, { isLoading: withdrawalLoading }] =
    useBankWithdrawalMutation();

  const verifyWithdraw = async (withdrawCode: string) => {
    try {
      dispatch(setVerifyLoading(true));
      const result = await verifyWithdrawMutation({
        clientId,
        withdraw_code: withdrawCode,
      }).unwrap();

      if (result.message !== "Token Does Not Exist or Invalid") {
        showToast({
          type: TOAST_TYPE_ENUM.SUCCESS,
          title: "Success",
          description: result.message || "Verification successful",
        });
      }

      dispatch(setVerifyRequest(result));
      return result;
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Error occurred during verification";
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "Error",
        description: errorMessage,
      });
      dispatch(setVerifyError(errorMessage));
      throw error;
    }
  };

  const createWithdraw = async (withdrawCode: string) => {
    try {
      dispatch(setWithdrawLoading(true));
      const result = await createWithdrawMutation({
        clientId,
        withdraw_code: withdrawCode,
      }).unwrap();

      showToast({
        type: TOAST_TYPE_ENUM.SUCCESS,
        title: "Success",
        description: result.message || "Withdrawal approved successfully",
      });

      dispatch(setApproval(result.balance));
      return result;
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Error occurred during approval";
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "Error",
        description: errorMessage,
      });
      dispatch(setWithdrawError(errorMessage));
      throw error;
    }
  };

  const cancelWithdraw = async () => {
    try {
      dispatch(setWithdrawLoading(true));
      const result = await cancelWithdrawMutation({ clientId }).unwrap();

      showToast({
        type: TOAST_TYPE_ENUM.SUCCESS,
        title: "Success",
        description: result.message || "Withdrawal cancelled successfully",
      });

      dispatch(setApproval(result.balance));
      return result;
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Error occurred during cancellation";
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "Error",
        description: errorMessage,
      });
      dispatch(setWithdrawError(errorMessage));
      throw error;
    }
  };

  const clearWithdrawalError = () => {
    dispatch(clearError());
  };

  const resetWithdrawal = () => {
    dispatch(reset());
  };

  const verifyBankAccount = async (accountNumber: string, bankCode: string) => {
    try {
      const result = await verifyBankAccountMutation({
        accountNumber,
        bankCode,
      }).unwrap();

      if (result.success) {
        showToast({
          type: TOAST_TYPE_ENUM.SUCCESS,
          title: "Success",
          description: "Account verified successfully",
        });
        return result;
      } else {
        showToast({
          type: TOAST_TYPE_ENUM.ERROR,
          title: "Error",
          description: result.message || "Failed to verify account",
        });
        throw new Error(result.message || "Failed to verify account");
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to verify account";
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "Error",
        description: errorMessage,
      });
      throw error;
    }
  };

  const submitBankWithdrawal = async (data: {
    amount: number;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    type: string;
    source: string;
  }) => {
    try {
      dispatch(setWithdrawLoading(true));
      const result = await bankWithdrawalMutation({
        ...data,
        clientId,
      }).unwrap();

      if (result.success) {
        showToast({
          type: TOAST_TYPE_ENUM.SUCCESS,
          title: "Success",
          description:
            result.message || "Withdrawal request submitted successfully",
        });
        return result;
      } else {
        showToast({
          type: TOAST_TYPE_ENUM.ERROR,
          title: "Error",
          description: result.message || "Withdrawal failed",
        });
        throw new Error(result.message || "Withdrawal failed");
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Error occurred during withdrawal";
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "Error",
        description: errorMessage,
      });
      throw error;
    } finally {
      dispatch(setWithdrawLoading(false));
    }
  };

  return {
    verifyWithdraw,
    createWithdraw,
    cancelWithdraw,
    clearWithdrawalError,
    resetWithdrawal,
    // Bank withdrawal methods
    banks,
    banksLoading,
    verifyLoading,
    withdrawalLoading,
    verifyBankAccount,
    submitBankWithdrawal,
    verificationData,
  };
};

export default useWithdrawal;
