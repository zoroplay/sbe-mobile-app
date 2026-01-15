import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import SlipItem from "../../bets/betslip/SlipItem";
import BottomModal from "../modals/BottomModal";
import Input from "@/components/inputs/Input";
import { useModal } from "@/hooks/useModal";
import { Ionicons } from "@expo/vector-icons";
import { useBetting } from "@/hooks/useBetting";
import { useFindBetMutation } from "@/store/services/bets.service";
import environmentConfig from "@/store/services/configs/environment.config";
import { FindBetResponse } from "@/store/services/data/betting.types";
import { showToast, TOAST_TYPE_ENUM } from "@/utils/toast";
import { usePlaceBet } from "@/hooks/usePlaceBet";
import { useAppSelector } from "@/hooks/useAppDispatch";
import CurrencyFormatter from "@/components/inputs/CurrencyFormatter";
import { Text } from "@/components/Themed";
import SingleSearchInput from "@/components/inputs/SingleSearchInput";

interface LoginBottomModalProps {
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const BetslipModal = ({ onClose }: LoginBottomModalProps) => {
  const [bookingNumber, setBookingNumber] = useState("");
  const [betType, setBetType] = useState<"single" | "multiple">("multiple");
  const { global_variables } = useAppSelector((state) => state.app);
  const { openModal } = useModal();
  const { is_authenticated, user } = useAppSelector((state) => state.user);

  const {
    selected_bets,
    total_odds,
    clearBets,
    addBet,
    stake,
    updateStake,
    updateComboStake,
    potential_winnings,
  } = useBetting();
  const {
    isConfirming,
    isPlacingBet,
    is_booking,
    bookBet,
    placeBet,
    confirmBet,
    cancelBet,
    validateBet,
  } = usePlaceBet();
  // --- Tax and winnings calculations (mimic Vue logic) ---
  const taxEnabled = global_variables?.tax_enabled === "1";
  const exciseTax = parseFloat(global_variables?.excise_tax || "0");
  const wthTax = parseFloat(global_variables?.wth_tax || "0");
  const maxBonus = parseFloat("0");

  // For multiple bets, use stake and total_odds
  const stakeAfterTax = taxEnabled ? stake - stake * (exciseTax / 100) : stake;

  const wthTaxAmount = taxEnabled
    ? (stakeAfterTax * total_odds - stake) * (wthTax / 100)
    : 0;

  const potentialWinValue = (() => {
    if (taxEnabled) {
      let finalPayout = stake * total_odds;
      if (exciseTax > 0) {
        finalPayout = stakeAfterTax * total_odds;
      }
      if (wthTax > 0) {
        finalPayout = finalPayout - wthTaxAmount;
      }
      return (finalPayout + maxBonus).toFixed(2);
    }
    return potential_winnings?.toFixed
      ? potential_winnings.toFixed(2)
      : potential_winnings;
  })();

  const DEFAULT_HEIGHT =
    SCREEN_HEIGHT * (selected_bets.length > 0 ? 0.9 : 0.35);
  const [findBet, { isLoading: isFindingBet, isError }] = useFindBetMutation();

  const handleBookingNumberChange = useCallback(
    async (text: string) => {
      setBookingNumber(text);

      if (text.length === 7) {
        try {
          const result = (await findBet({
            betslipId: text,
            clientId: String(environmentConfig.CLIENT_ID),
          })) as unknown as { data: FindBetResponse };

          if (result.data && result.data.success) {
            clearBets();

            result.data.data.selections.forEach((selection) => {
              addBet({
                fixture_data: {
                  gameID: selection.eventId,
                  matchID: selection.matchId,
                  name: selection.eventName,
                  date: selection.eventDate,
                  tournament: selection.tournament,
                  categoryID: selection.category,
                  categoryName: selection.category,
                  sportID: selection.sportId,
                  sportName: selection.sport,
                  tournamentID: 0,
                  eventTime: selection.eventDate,
                  homeScore: "",
                  matchStatus: "",
                  awayScore: "",
                  homeTeam: "",
                  awayTeam: "",
                  outcomes: [],
                  event_type: "pre",
                  status: 0,
                  competitor1: "",
                  competitor2: "",
                  activeMarkets: 0,
                },
                outcome_data: {
                  displayName: selection.outcomeName,
                  marketName: selection.marketName,
                  odds: parseFloat(selection.odds),
                  outcomeID: selection.outcomeId,
                  outcomeName: selection.outcomeName,
                  specifier: selection.specifier,
                  oddID: 0,
                  status: 0,
                  active: 1,
                  producerID: selection.producerId,
                  marketID: selection.marketId,
                  producerStatus: 0,
                  marketId: selection.marketId,
                },
                element_id: selection.eventId,
                bet_type: "pre",
                global_vars: {},
                bonus_list: [],
              });
            });

            showToast({
              type: TOAST_TYPE_ENUM.SUCCESS,
              title: "Booking Found!",
              description: `${result.data.data.selections.length} bets loaded successfully`,
            });
          }
        } catch (error) {
          console.error("Error loading booking:", error);
          showToast({
            type: TOAST_TYPE_ENUM.ERROR,
            title: "Error",
            description: "Failed to load booking number",
          });
        }
      }
    },
    [findBet, clearBets, addBet]
  );

  useEffect(() => {
    if (isError) {
      console.error("Error loading booking");
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "Error",
        description: "Failed to load booking number",
      });
    }
  }, [isError]);

  const handleRemoveAll = () => {
    clearBets();
  };

  const handleBetSettings = () => {
    // Open bet settings modal
    console.log("Open bet settings");
  };

  return (
    <BottomModal
      visible={true}
      onClose={onClose}
      dismissible={true}
      height={DEFAULT_HEIGHT}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Betslip</Text>
        <Text style={styles.title}>
          {selected_bets && selected_bets.length > 0 && betType === "multiple"
            ? total_odds.toFixed(2)
            : ""}
        </Text>
      </View>

      {selected_bets && selected_bets.length > 0 ? (
        <>
          {/* Actions Row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRemoveAll}
            >
              <Ionicons name="trash-outline" size={16} color="#C72C3B" />
              <Text style={styles.actionText}>Remove all</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleBetSettings}
            >
              <Ionicons name="settings-outline" size={16} color="#6b7280" />
              <Text style={styles.actionText}>Bet Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Bet Type Tabs */}
          {selected_bets.length > 1 && (
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, betType === "single" && styles.activeTab]}
                onPress={() => setBetType("single")}
              >
                <Text
                  style={[
                    styles.tabText,
                    betType === "single" && styles.activeTabText,
                  ]}
                >
                  Single
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, betType === "multiple" && styles.activeTab]}
                onPress={() => setBetType("multiple")}
              >
                <Text
                  style={[
                    styles.tabText,
                    betType === "multiple" && styles.activeTabText,
                  ]}
                >
                  Multiple
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.mainContainer}>
            {/* Scrollable Bets Section */}
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {selected_bets.map((sel, idx) => (
                <SlipItem
                  key={idx}
                  selection={sel}
                  showStakeInput={betType === "single"}
                  onStakeChange={(stake) => {
                    updateComboStake({
                      combo_index: idx,
                      stake: Number(stake),
                    });
                  }}
                />
              ))}
              {/* Add padding at bottom to prevent content hiding under fixed footer */}
              <View style={{ height: betType === "single" ? 400 : 400 }} />
            </ScrollView>

            {/* Fixed Bottom Section - Only show for Multiple bets */}
            <View style={styles.fixedBottomContainer}>
              {/* Bet Details Card */}
              <View style={styles.detailsCard}>
                {/* Stake Input */}
                <View style={styles.stakeInputContainer}>
                  <Text style={styles.stakeLabel}>Total Stake</Text>
                  <Input
                    value={String(stake)}
                    placeholder="0.00"
                    onChangeText={(text) => {
                      updateStake({
                        stake: Number(text.replace(/[^\d.]/g, "")),
                      });
                    }}
                    keyboardType="numeric"
                    num_select_placeholder={global_variables?.currency_code}
                    type="num_select"
                    wrapperStyle={styles.stakeInputWrapper}
                    inputStyle={styles.stakeInputText}
                    suffixStyle={styles.stakeSuffix}
                    placeholderTextColor="#6b7280"
                  />
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Bet Summary */}
                <View style={styles.summaryContainer}>
                  <DetailRow
                    label="Stake After Tax"
                    value={stakeAfterTax.toFixed(2)}
                  />
                  <DetailRow label="Total Odds" value={total_odds.toFixed(2)} />
                  <DetailRow label="Max Bonus" value={maxBonus.toFixed(2)} />
                  <DetailRow
                    label="Excise Tax"
                    value={(stake * (exciseTax / 100)).toFixed(2)}
                  />
                  <DetailRow
                    label="Withholding Tax"
                    value={wthTaxAmount.toFixed(2)}
                  />
                </View>

                {/* Potential Win - Highlighted */}
                <View style={styles.potentialWinContainer}>
                  <Text style={styles.potentialWinLabel}>Potential Win</Text>
                  <CurrencyFormatter
                    amount={potentialWinValue}
                    textStyle={styles.potentialWinValue}
                    decimalStyle={styles.potentialWinDecimal}
                    allowToggle={false}
                  />
                </View>
              </View>

              {/* If not authenticated, show login button */}
              {!is_authenticated ? (
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.placeBtn,
                      {
                        width: "100%",
                        backgroundColor: "#062663",
                        borderColor: "#062663",
                        borderRadius: 8,
                      },
                    ]}
                    onPress={() => {
                      openModal({
                        modal_name: "LOGIN_MODAL",
                      });
                    }}
                  >
                    <Ionicons
                      name="log-in-outline"
                      size={20}
                      color="#fff"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.placeBtnText}>LOGIN TO PLACE BET</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionButtonsContainer}>
                  {isConfirming ? (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.bookBtn,
                          {
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                            borderRightWidth: 1,
                            borderRightColor: "#C72C3B",
                            backgroundColor: "#C72C3B",
                            borderColor: "#C72C3B",
                          },
                        ]}
                        onPress={cancelBet}
                        disabled={isPlacingBet}
                      >
                        <Ionicons
                          name="close"
                          size={18}
                          color="#fff"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.bookBtnText}>CANCEL</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.placeBtn,
                          {
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            borderRightWidth: 1,
                            borderRightColor: "#1A5904",
                            backgroundColor: "#1A5904",
                            borderColor: "#1A5904",
                          },
                        ]}
                        onPress={placeBet}
                        disabled={isPlacingBet}
                      >
                        {isPlacingBet ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color="#fff"
                              style={{ marginRight: 4 }}
                            />
                            <Text style={styles.placeBtnText}>CONFIRM BET</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.bookBtn,
                          {
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                            borderRightWidth: 1,
                          },
                        ]}
                        onPress={bookBet}
                        disabled={is_booking}
                      >
                        {is_booking ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <Ionicons
                              name="book"
                              size={14}
                              color="#fff"
                              style={{ marginRight: 4 }}
                            />
                            <Text style={styles.bookBtnText}>BOOK BET</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.placeBtn,
                          {
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            borderRightColor: "#062663",
                            backgroundColor: "#062663",
                            borderColor: "#062663",
                          },
                        ]}
                        onPress={confirmBet}
                        disabled={is_booking || isPlacingBet}
                      >
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color="#fff"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.placeBtnText}>PLACE BET</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          {/* Booking Code Section */}
          <View style={styles.bookingHeader}>
            <Text style={styles.bookingTitle}>Enter a Booking Code</Text>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#666"
            />
          </View>

          <SingleSearchInput
            value={bookingNumber}
            placeholder="Booking Code"
            onSearch={handleBookingNumberChange}
            // style={styles.bookingInput}
            searchState={{
              isValid: false,
              isNotFound: false,
              isLoading: isFindingBet,
              message: "",
            }}
          />

          <TouchableOpacity
            style={[styles.loadBtn, isFindingBet && styles.loadBtnDisabled]}
            disabled={isFindingBet}
            onPress={async () => {
              try {
                if (bookingNumber.length !== 7) return;
                const result = (await findBet({
                  betslipId: bookingNumber,
                  clientId: String(environmentConfig.CLIENT_ID),
                })) as unknown as { data: FindBetResponse };

                if (result.data && result.data.success) {
                  clearBets();

                  result.data.data.selections.forEach((selection) => {
                    addBet({
                      fixture_data: {
                        gameID: selection.eventId,
                        matchID: selection.matchId,
                        name: selection.eventName,
                        date: selection.eventDate,
                        tournament: selection.tournament,
                        categoryID: selection.category,
                        categoryName: selection.category,
                        sportID: selection.sportId,
                        sportName: selection.sport,
                        tournamentID: 0,
                        eventTime: selection.eventDate,
                        homeScore: "",
                        matchStatus: "",
                        awayScore: "",
                        homeTeam: "",
                        awayTeam: "",
                        outcomes: [],
                        event_type: "pre",
                        status: 0,
                        competitor1: "",
                        competitor2: "",
                        activeMarkets: 0,
                      },
                      outcome_data: {
                        displayName: selection.outcomeName,
                        marketName: selection.marketName,
                        odds: parseFloat(selection.odds),
                        outcomeID: selection.outcomeId,
                        outcomeName: selection.outcomeName,
                        specifier: selection.specifier,
                        oddID: 0,
                        status: 0,
                        active: 1,
                        producerID: selection.producerId,
                        marketID: selection.marketId,
                        producerStatus: 0,
                        marketId: selection.marketId,
                      },
                      element_id: selection.eventId,
                      bet_type: "pre",
                      global_vars: {},
                      bonus_list: [],
                    });
                  });

                  showToast({
                    type: TOAST_TYPE_ENUM.SUCCESS,
                    title: "Booking Found!",
                    description: `${result.data.data.selections.length} bets loaded successfully`,
                  });
                }
              } catch (error) {
                console.error("Error loading booking:", error);
                showToast({
                  type: TOAST_TYPE_ENUM.ERROR,
                  title: "Error",
                  description: "Failed to load booking number",
                });
              }
            }}
          >
            {isFindingBet ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loadBtnText}>Load Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </BottomModal>
  );
};

// Helper component for detail rows
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

export default BetslipModal;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: "relative",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 8,
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    paddingBottom: 6,
    backgroundColor: "#F5F5F5",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    color: "#000",
    fontSize: 17,
    // fontWeight: "bold",
    fontFamily: "PoppinsSemibold",
  },

  // Actions Row
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: "#374151",
    fontFamily: "PoppinsSemibold",
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingBottom: 8,
    paddingTop: 4,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 1,
  },
  activeTab: {
    backgroundColor: "#393C44",
    borderColor: "#393C44",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#505359",
  },
  activeTabText: {
    color: "#fff",
  },

  // Fixed Bottom Section
  fixedBottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Details Card
  detailsCard: {
    backgroundColor: "#1A1D26",
    marginTop: 12,
    margin: 8,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
  },
  stakeInputContainer: {
    // marginBottom: 12,
  },
  stakeLabel: {
    color: "#A0A0A0",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stakeInputWrapper: {
    backgroundColor: "#0D0F15",
    borderColor: "#2A2D36",
    borderWidth: 1,
    height: 48,
  },
  stakeInputText: {
    color: "#ddd",
    fontSize: 18,
    fontWeight: "600",
    height: 48,
    backgroundColor: "#0D0F15",
  },
  stakeSuffix: {
    color: "#989898",
    fontSize: 16,
    // fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#2A2D36",
    marginVertical: 12,
    marginTop: 1,
  },
  summaryContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    color: "#A0A0A0",
    fontSize: 13,
    fontWeight: "500",
  },
  detailValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  potentialWinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#C72C3B",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  potentialWinLabel: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  potentialWinValue: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  potentialWinDecimal: {
    color: "#ddd",
    fontSize: 14,
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingBottom: 12,
    gap: 8,
  },
  bookBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#2A2D36",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 8,
  },
  bookBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  placeBtn: {
    flex: 2,
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#C72C3B",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 8,
  },
  placeBtnText: {
    color: "#fff",
    fontFamily: "PoppinsSemibold",
    fontSize: 14,
  },

  // Single Bet Footer
  singleBetFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    padding: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Empty State
  emptyContainer: {
    padding: 16,
    gap: 12,
  },
  bookingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bookingTitle: {
    fontFamily: "PoppinsSemibold",
    fontSize: 15,
    color: "#000",
  },
  bookingInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loadBtn: {
    backgroundColor: "#2A2D36",
    borderRadius: 8,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  loadBtnDisabled: {
    opacity: 0.6,
  },
  loadBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
