import { BET_TYPES_ENUM } from "@/data/enums/enum";
import {
  addBet,
  clearBets,
  getBetsForGame,
  isBetSelected,
  removeBet,
  setError,
  setLoading,
  toggleActiveSelection,
  updateOdds,
  updateStake,
  updateComboStake,
  toggleComboChecked,
  updateBetType,
} from "../store/features/slice/betting.slice";
import {
  AddBetPayload,
  RemoveBetPayload,
  UpdateStakePayload,
  UpdateComboStakePayload,
} from "../store/features/types/betting.types";
import { useAppDispatch, useAppSelector } from "./useAppDispatch";
// import {
//   addBet,
//   removeBet,
//   updateStake,
//   clearBets,
//   setLoading,
//   setError,
//   isBetSelected,
//   getBetsForGame,
//   updateOdds,
// } from "@/store/features/slice/betting.slice";
// import {
//   AddBetPayload,
//   RemoveBetPayload,
//   UpdateStakePayload,
// } from "@/store/features/types/betting.types";

export const useBetting = () => {
  const dispatch = useAppDispatch();
  const bettingState = useAppSelector((state) => state.betting);

  const handleAddBet = (payload: AddBetPayload) => {
    dispatch(addBet(payload));
  };

  const handleRemoveBet = (payload: RemoveBetPayload) => {
    console.log("Removing bet with payload:", payload);
    dispatch(removeBet(payload));
  };

  const handleUpdateStake = (payload: UpdateStakePayload) => {
    dispatch(updateStake(payload));
  };

  const handleUpdateComboStake = (payload: UpdateComboStakePayload) => {
    dispatch(updateComboStake(payload));
  };

  const handleToggleComboChecked = (combo_index: number) => {
    dispatch(toggleComboChecked({ combo_index }));
  };

  const handleClearBets = () => {
    dispatch(clearBets());
  };

  const handleSetLoading = (loading: boolean) => {
    dispatch(setLoading(loading));
  };

  const handleSetError = (error: string | null) => {
    dispatch(setError(error));
  };

  const handleUpdateBetOdds = (payload: {
    event_id: number;
    outcome_id: string;
    new_odds: number;
    status?: number;
    active?: number;
  }) => {
    dispatch(
      updateOdds({
        match_id: payload.event_id,
        outcome_id: payload.outcome_id,
        new_odds: payload.new_odds,
      })
    );
  };
  const toggleActive = (payload: {
    event_id: number;
    display_name: string;
  }) => {
    dispatch(
      toggleActiveSelection({
        event_id: payload.event_id,
        display_name: payload.display_name,
      })
    );
  };
  const handleBetTypeChange = (newBetType: BET_TYPES_ENUM) => {
    dispatch(
      updateBetType({
        bet_type: newBetType,
      })
    );
  };
  // Helper function to check if a specific bet is selected
  const checkBetSelected = ({
    game_id,
    odds_type,
    market_id,
    specifier,
    outcome_id,
  }: {
    game_id: number;
    odds_type: string;
    market_id: number;
    specifier: string;
    outcome_id: string;
  }): boolean => {
    // console.log("Checking if bet is selected with params:", {
    //   game_id,
    //   odds_type,
    //   market_id,
    //   specifier,
    //   outcome_id,
    // });
    return isBetSelected({
      selected_bets: bettingState.selected_bets,
      game_id: game_id,
      odds_type: odds_type,
      market_id,
      specifier: specifier,
      outcome_id: outcome_id,
    });
  };

  // Helper function to get all bets for a specific game
  const getGameBets = (gameId: string) => {
    return getBetsForGame(bettingState.selected_bets, gameId);
  };

  // Helper function to toggle a bet (add if not selected, remove if selected)
  const toggleBet = (payload: AddBetPayload) => {
    const isSelected = checkBetSelected({
      game_id: payload.fixture_data.gameID as unknown as number,
      odds_type: payload.outcome_data.displayName,
      market_id: payload.outcome_data.marketID ?? payload.outcome_data.marketId,
      specifier: payload.outcome_data.specifier,
      outcome_id: payload.outcome_data.outcomeID,
    });

    if (isSelected) {
      dispatch(
        removeBet({
          event_id: Number(payload.fixture_data.gameID),
          display_name: payload.outcome_data.displayName,
        })
      );
    } else {
      dispatch(
        addBet({ ...payload, bet_type: payload.fixture_data.event_type })
      ); // The addBet action now handles toggling
    }
  };

  // Helper function to get the count of bets for a specific game
  const getGameBetCount = (gameId: string): number => {
    return getGameBets(gameId).length;
  };

  // Helper function to check if any bet is selected for a game
  const hasGameBets = (gameId: string): boolean => {
    return getGameBetCount(gameId) > 0;
  };

  return {
    // State
    ...bettingState,

    // Actions
    addBet: handleAddBet,
    removeBet: handleRemoveBet,
    updateStake: handleUpdateStake,
    updateComboStake: handleUpdateComboStake,
    toggleComboChecked: handleToggleComboChecked,
    clearBets: handleClearBets,
    setLoading: handleSetLoading,
    setError: handleSetError,
    updateBetOdds: handleUpdateBetOdds,
    handleBetTypeChange,
    // Helper functions
    checkBetSelected,
    getGameBets,
    toggleBet,
    getGameBetCount,
    hasGameBets,
    toggleActive,
  };
};
