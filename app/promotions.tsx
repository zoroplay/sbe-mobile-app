import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Animated,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { useWindowDimensions } from "react-native";
import { useGetPromotionsQuery } from "@/store/services/gaming.service";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { useModal } from "@/hooks/useModal";
import { MODAL_COMPONENTS } from "@/store/features/types";
import { router } from "expo-router";

interface Promotion {
  id: number;
  title: string;
  imageUrl: string;
  content: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  targetUrl: string;
  clientId: number;
}

const PromotionCard = ({
  item,
  onReadMore,
  onPlayNow,
}: {
  item: Promotion;
  onReadMore: (item: Promotion) => void;
  onPlayNow: (item: Promotion) => void;
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.65],
  });

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {imageLoading && (
          <Animated.View
            style={[styles.skeleton, { opacity: shimmerOpacity }]}
          />
        )}
        <Image
          source={{ uri: item.imageUrl }}
          style={[styles.cardImage, imageLoading && styles.imageHidden]}
          resizeMode="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <TouchableOpacity
          style={styles.playNowBtn}
          onPress={() => onPlayNow(item)}
        >
          <Text style={styles.playNowText}>Play Now</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onReadMore(item)}>
          <Text style={styles.readMoreText}>Read More...</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const promotions = () => {
  const { width } = useWindowDimensions();
  const { data, isLoading, error } = useGetPromotionsQuery();
  const [selected, setSelected] = useState<Promotion | null>(null);
  const { user } = useAppSelector((state) => state.user);
  const { openModal } = useModal();

  const handlePlayNow = (item: Promotion) => {
    if (!user || !user.id) {
      openModal({ modal_name: MODAL_COMPONENTS.LOGIN_MODAL });
      return;
    }
    if (item.targetUrl) {
      router.push({
        pathname: "/webview",
        params: { url: item.targetUrl, title: item.title },
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C72C3B" />
      </View>
    );
  }

  if (error || !data?.data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load promotions.</Text>
      </View>
    );
  }

  const promotionList: Promotion[] = Array.isArray(data.data)
    ? data.data
    : Object.values(data.data);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1464" />

      <FlatList
        data={promotionList}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PromotionCard
            item={item}
            onReadMore={setSelected}
            onPlayNow={handlePlayNow}
          />
        )}
      />

      {/* Detail Modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            {selected?.imageUrl && (
              <Image
                source={{ uri: selected.imageUrl }}
                style={styles.modalImage}
                resizeMode="cover"
              />
            )}
            {selected?.title && (
              <Text style={styles.modalTitle}>{selected.title}</Text>
            )}
            <RenderHtml
              contentWidth={width - 32}
              source={{ html: selected?.content ?? "" }}
              tagsStyles={{
                p: { fontSize: 13, lineHeight: 20, color: "#222" },
                b: { fontWeight: "700" },
                span: { fontSize: 13, color: "#C72C3B" },
                table: { borderWidth: 1, borderColor: "#ddd" },
                td: {
                  padding: 4,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  fontSize: 12,
                },
                th: {
                  padding: 4,
                  backgroundColor: "#C72C3B",
                  color: "#fff",
                  fontSize: 12,
                },
              }}
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.playNowBtn}
              onPress={() => selected && handlePlayNow(selected)}
            >
              <Text style={styles.playNowText}>Play Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.goBackBtn}
              onPress={() => setSelected(null)}
            >
              <Text style={styles.goBackText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default promotions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#C72C3B",
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#e8e8e8",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    overflow: "hidden",
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#c8c8c8",
    borderRadius: 0,
  },
  imageHidden: {
    opacity: 0,
  },
  cardImage: {
    width: "100%",
    height: 200,
  },
  cardBody: {
    padding: 14,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#C72C3B",
  },
  playNowBtn: {
    backgroundColor: "#1a1464",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  playNowText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  readMoreText: {
    color: "#1a73e8",
    fontSize: 14,
    textAlign: "right",
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalScroll: {
    padding: 16,
    paddingBottom: 24,
  },
  modalImage: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#C72C3B",
    marginBottom: 12,
  },
  modalActions: {
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  goBackBtn: {
    borderWidth: 1.5,
    borderColor: "#1a1464",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  goBackText: {
    color: "#1a1464",
    fontWeight: "700",
    fontSize: 15,
  },
});
