import { useState } from "react";

import { setUserRerender } from "../store/features/slice/user.slice";
import environmentConfig, {
  getEnvironmentVariable,
  ENVIRONMENT_VARIABLES,
} from "../store/services/configs/environment.config";
import { PlaceBetDto } from "../store/services/data/betting.types";
import { CommissionRequest } from "../store/services/types/requests";
import { useCommissionPayoutMutation } from "../store/services/user.service";
import { useBetting } from "./useBetting";
import { useAppDispatch, useAppSelector } from "./useAppDispatch";
import {
  useBookBetMutation,
  usePlaceBetMutation,
} from "../store/services/bets.service";
import { MODAL_COMPONENTS } from "../store/features/types";
import { AppHelper } from "@/utils/helper";
import { showToast, TOAST_TYPE_ENUM } from "@/utils/toast";
import { useModal } from "./useModal";

// import { errorToast, successToast } from "@/utils/toast";

interface UsePlaceBetOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const usePlaceBet = (options?: UsePlaceBetOptions) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { global_variables } = useAppSelector((state) => state.app);
  const { openModal } = useModal();
  const [placeBetMutation] = usePlaceBetMutation();
  const [bookBetMutation, { isLoading }] = useBookBetMutation();

  const {
    selected_bets,
    total_odds,
    potential_winnings,
    stake,
    bet_type,
    coupon_data,
    updateStake,
    clearBets,
  } = useBetting();

  const validateBet = () => {
    // Check if user has any balance first
    if (!user?.availableBalance || user.availableBalance <= 0) {
      // openModal({
      //   modal_name: MODAL_COMPONENTS.INSUFFICIENT_BALANCE,
      //   title: "Insufficient Balance",
      //   description:
      //     "Insufficient funds. Please deposit funds into your account.",
      //   props: {
      //     currency: user?.currency || "",
      //     required_amount: String(stake),
      //     current_balance: String(user?.availableBalance || 0),
      //   },
      // });
      return false;
    }

    if (!stake || stake <= 0) {
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "Invalid Stake",
        description: "Please enter a valid stake amount",
      });
      return false;
    }

    if (selected_bets.length === 0) {
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "No Selections",
        description: "Please select at least one bet",
      });
      return false;
    }

    // Validate minimum stake based on bet type
    const minBetStake = Number(global_variables?.min_bet_stake || 0);
    const singleMinStake = Number(global_variables?.single_min_stake || 0);
    const comboMinStake = Number(global_variables?.combo_min_stake || 0);
    const currency = user?.currency || global_variables?.currency || "GMD";

    let minStakeRequired = minBetStake;
    let betTypeLabel = "bet";

    // Determine minimum stake based on bet type
    if (selected_bets.length === 1) {
      // Single bet
      minStakeRequired = Math.max(singleMinStake, minBetStake);
      betTypeLabel = "single bet";
    } else if (bet_type === "combined" || coupon_data?.bet_type === "Combo") {
      // Combined/Combo bet
      minStakeRequired = Math.max(comboMinStake, minBetStake);
      betTypeLabel = "combo bet";

      // For combo bets, validate stake per combination
      if (coupon_data?.combos && coupon_data.combos.length > 0) {
        const checkedCombos = coupon_data.combos.filter(
          (combo: any) => combo.checked
        );

        if (checkedCombos.length > 0) {
          // Check if any combo has stake below minimum
          const totalCombinations = checkedCombos.reduce(
            (sum: number, combo: any) => sum + (combo.combinations || 0),
            0
          );

          if (totalCombinations > 0) {
            const stakePerCombination = stake / totalCombinations;

            if (stakePerCombination < minStakeRequired) {
              showToast({
                type: TOAST_TYPE_ENUM.ERROR,
                title: "Minimum Stake Not Met",
                description: `Minimum stake per combination for ${betTypeLabel} is ${currency} ${minStakeRequired.toFixed(
                  2
                )}. Your stake per combination is ${currency} ${stakePerCombination.toFixed(
                  2
                )}. Total minimum stake required: ${currency} ${(
                  minStakeRequired * totalCombinations
                ).toFixed(2)}`,
              });
              return false;
            }
          }
        }
      }
    } else {
      // Multiple bet
      minStakeRequired = minBetStake;
      betTypeLabel = "multiple bet";
    }

    // Validate total stake against minimum
    if (stake < minStakeRequired) {
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "Minimum Stake Not Met",
        description: `Minimum stake for ${betTypeLabel} is ${currency} ${minStakeRequired.toFixed(
          2
        )}. Please increase your stake amount.`,
      });
      return false;
    }

    // Check if user has sufficient balance
    if (stake > (user?.availableBalance ?? 0)) {
      // openModal({
      //   modal_name: MODAL_COMPONENTS.INSUFFICIENT_BALANCE,
      //   title: "Insufficient Balance",
      //   description:
      //     "You don't have enough funds to place this bet. Please deposit funds into your account.",
      //   props: {
      //     currency: user?.currency || "",
      //     required_amount: String(stake),
      //     current_balance: String(user?.availableBalance || 0),
      //   },
      // });
      return false;
    }

    return true;
  };
  const bookBet = async () => {
    if (!validateBet()) {
      return;
    }

    try {
      setIsPlacingBet(true);
      const placeBetPayload = buildPlaceBetPayload();

      const result = await bookBetMutation(placeBetPayload).unwrap();

      if (result?.success) {
        // Show success modal after printing
        openModal({
          modal_name: MODAL_COMPONENTS.SUCCESS_MODAL,
          title: "Bet Booked Successfully",
          props: {
            potential_winnings,
            stake,
            betslip_id:
              (result as any)?.data?.betslipId ||
              (result as any)?.betslipId ||
              "",
          },
          description: `Your bet has been booked`,
        });

        clearBets();
        updateStake({ stake: 0 });
        setIsConfirming(false);

        options?.onSuccess?.();
      } else {
        showToast({
          type: TOAST_TYPE_ENUM.ERROR,
          title: "Failed to Book bet",
          description:
            (result as any)?.message || "Failed to book bet. Please try again.",
        });
      }
    } catch (error: any) {
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "Failed to Book bet",
        description: error?.message || "Failed to book bet. Please try again.",
      });

      options?.onError?.(error);
    } finally {
      setIsPlacingBet(false);
      dispatch(setUserRerender());
    }
  };
  const buildPlaceBetPayload = (): PlaceBetDto => {
    return {
      clientId: environmentConfig.CLIENT_ID,
      bet_type: "multiple",
      betslip_type: "multiple",
      channel: "mobile",
      combos: [],
      event_type: "pre",
      exciseDuty: 0,
      fixtures: selected_bets.map((bet) => ({
        eventName: bet.game.event_name,
        eventId: Number(bet.game.event_id),
        type: bet.game.event_type,
        started: bet.game.event_date,
        homeTeam: bet.game.home_team,
        awayTeam: bet.game.away_team,
        producerId: bet.game.producer_id,
        selections: [
          {
            matchId: Number(bet.game?.matchID ?? bet.game?.match_id),
            eventId: Number(bet.game.event_id),
            gameId: Number(bet.game.gameID ?? bet.game?.game_id),
            eventName: bet.game.event_name,
            marketId: bet.game.market_id,
            marketName: bet.game.market_name,
            specifier: bet.game.specifier || "",
            outcomeName: bet.game.outcome_name,
            displayName: bet.game.display_name,
            outcomeId: bet.game.outcome_id,
            odds: bet.game.odds,
            eventDate: bet.game.event_date,
            tournament: bet.game.tournament,
            category: bet.game.category,
            sport: bet.game.sport,
            sportId: bet.game.sport_id,
            type: bet.game.event_type,
            fixed: true,
            combinability: 1,
            selectionId: bet.game.selection_id,
            element_id: String(bet.game.event_id),
            stake: stake,
            homeTeam: bet.game.home_team || "",
            awayTeam: bet.game.away_team || "",
            producerId: bet.game.producer_id || 1,
          },
        ],
      })),
      grossWin: potential_winnings,
      isBooking: 0,
      maxBonus: 0,
      maxOdds: total_odds,
      maxWin: String(potential_winnings),
      minBonus: 0,
      minOdds: total_odds,
      minWin: potential_winnings,
      selections: selected_bets.map((bet) => ({
        matchId: Number(bet.game?.matchID ?? bet.game?.match_id) || 0,
        eventId: Number(bet.game.event_id) || 0,
        gameId: Number(bet.game.gameID ?? bet.game?.game_id) || 0,
        eventName: bet.game.event_name || "",
        marketId: bet.game.market_id || 0,
        marketName: bet.game.market_name || "",
        specifier: bet.game.specifier || "",
        outcomeName: bet.game.outcome_name,
        displayName: bet.game.display_name,
        outcomeId: bet.game.outcome_id,
        odds: bet.game.odds,
        eventDate: bet.game.event_date,
        tournament: bet.game.tournament,
        category: bet.game.category,
        sport: bet.game.sport,
        sportId: bet.game.sport_id,
        type: bet.game.event_type,
        fixed: true,
        combinability: 1,
        selectionId: bet.game.selection_id,
        element_id: String(bet.game.event_id),
        stake: stake,
        homeTeam: bet.game.home_team || "",
        awayTeam: bet.game.away_team || "",
        producerId: bet.game.producer_id || 1,
      })),
      source: "mobile",
      stake: String(stake),
      totalOdds: total_odds,
      totalOdd: String(total_odds.toFixed(2)),
      totalStake: stake,
      tournaments: [],
      userId: user?.id || 0,
      userRole: user?.role || "",
      username: user?.username || "",
      wthTax: 0,
    };
  };

  // const buildCommissionRequest = (): CommissionRequest => {
  //   return {
  //     userId: user?.id || 0,
  //     noOfSelections: selected_bets.length,
  //     provider: "sports",
  //     stake: stake,
  //     clientId: getEnvironmentVariable(
  //       ENVIRONMENT_VARIABLES.CLIENT_ID
  //     ) as unknown as number,
  //     totalOdds: Number(total_odds.toFixed(2)),
  //     commissionId: commissionData?.data?.data?.profile?.id || 0,
  //     individualOdds: selected_bets.map((bet) => parseFloat(bet.game.odds)),
  //     individualEventTypes: selected_bets.map((bet) =>
  //       bet.game.event_type === "pre" ? "prematch" : "live"
  //     ),
  //   };
  // };

  const placeBet = async () => {
    if (!validateBet()) {
      return;
    }

    try {
      setIsPlacingBet(true);
      const placeBetPayload = buildPlaceBetPayload();

      const result = await placeBetMutation(placeBetPayload).unwrap();

      if (result?.success) {
        // Store betslip ID for printing
        const betslipId =
          (result as any)?.data?.betslipId || (result as any)?.betslipId;

        if (betslipId) {
          // Print ticket after successful bet placement
          try {
            // Generate betting slip data for printing
            const ticketData = {
              betslipId: String(betslipId),
              terminal: user?.code || "",
              cashier: user?.username || "",
              time: AppHelper.formatReceiptTimestamp(),
              stake: stake.toFixed(2),
              totalOdds: total_odds.toFixed(2),
              possibleWin: potential_winnings.toFixed(2),
              currency: user?.currency || "",
              selections: selected_bets.map((bet) => ({
                eventName: bet.game.event_name || "",
                marketName: bet.game.market_name || "",
                outcomeName: bet.game.outcome_name || "",
                odds: bet.game.odds || "",
              })),
            };

            AppHelper.printTicket({ ticket_data: ticketData, type: "bet" });
          } catch (printError) {
            console.log("PRINT ERROR", printError);

            showToast({
              type: TOAST_TYPE_ENUM.ERROR,
              title: "Print Error",
              description: "Print initiation failed",
            });
          }
        }

        // Show success modal after printing
        // openModal({
        //   modal_name: MODAL_COMPONENTS.SUCCESS,
        //   title: "Bet Placed Successfully",
        //   description: `Your bet has been placed successfully! Stake: ${
        //     user?.currency || "GMD"
        //   } ${stake.toFixed(2)}, Potential Winnings: ${
        //     user?.currency || "GMD"
        //   } ${potential_winnings.toFixed(2)}`,
        // });

        clearBets();
        updateStake({ stake: 0 });
        setIsConfirming(false);

        options?.onSuccess?.();
      } else {
        showToast({
          type: TOAST_TYPE_ENUM.ERROR,
          title: "Failed to place bet",
          description:
            (result as any)?.message ||
            "Failed to place bet. Please try again.",
        });
      }
    } catch (error: any) {
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "Failed to place bet",
        description: error?.message || "Failed to place bet. Please try again.",
      });

      options?.onError?.(error);
    } finally {
      setIsPlacingBet(false);
      dispatch(setUserRerender());
    }
  };

  const confirmBet = () => {
    setIsConfirming(true);
  };

  const cancelBet = () => {
    setIsConfirming(false);
  };

  return {
    // State
    isConfirming,
    isPlacingBet,
    is_booking: isLoading,

    // Actions
    placeBet,
    confirmBet,
    cancelBet,
    bookBet,

    // Validation
    validateBet,

    // Computed values
    canPlaceBet: selected_bets.length > 0 && stake > 0,
    hasSelections: selected_bets.length > 0,
    hasValidStake: stake > 0,
  };
};
