import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  SectionList,
  RefreshControl,
} from "react-native";
import ViewAdopteesCard from "../../../component/ViewMyAdopteesCard";
import { useState, useEffect, useCallback } from "react";
import * as Themes from "../../../assets/themes/themes";
import { api } from "../../../api/axios";
//NEED TO QUERY ALL WITHOUT PAGINATIONS
export default function MyAdoptee() {
  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [livePets, setLivePetse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPets = async (pageNum = 1, isRefreshing = false) => {
    setLoading(true);
    try {
      const res = await api.get("/api/pet/myPets", {
        params: {
          page: pageNum,
        },
      });
      const myAdoptees = res.data.body;
      if (myAdoptees.length < 10) {
        setHasMore(false);
      }
      setPets((prev) => {
        if (isRefreshing) return myAdoptees;
        else return [...prev, ...myAdoptees];
      });
    } catch (err) {
      console.error("Error fetching pets:", err);
      console.error("Status:", err.response?.status); // Is it actually 404?
      console.error("Data:", err.response?.data); // Does it say "Pet not found"?
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchPets(1, true);
  }, []);
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPets(page + 1);
      setPage(prev + prev + 1);
    }
  };
  const getStructuredData = (rawData) => {
    const adopted = rawData.filter((a) => a.adoptedStatus);
    const notadopted = rawData.filter((a) => !a.adoptedStatus);
    const structuredData = [
      {
        title: `Pending Adoptions - ${notadopted.length}`,
        data: notadopted,
      },
      {
        title: `Successfult Adoptions - ${adopted.length}`,
        data: adopted,
      },
    ];
    return structuredData.filter((s) => s.data.length > 0);
  };
  const renderSectionHeader = ({ section: { title } }) => {
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
    );
  };
  useEffect(() => {
    fetchPets(page);
  }, []);
  return (
    <View style={styles.cardContainer}>
      <SectionList
        sections={getStructuredData(pets)}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          return <ViewAdopteesCard pet={item}></ViewAdopteesCard>;
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          ></RefreshControl>
        }
        renderSectionHeader={renderSectionHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No Adoptees Found</Text>
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore ? <ActivityIndicator size="large" /> : null
        }
      ></SectionList>
    </View>
  );
}
const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
  },
  headerContainer: {
    backgroundColor: Themes.COLORS.background,
    paddingTop: Themes.SPACING.md,
    paddingBottom: Themes.SPACING.sm,
    paddingHorizontal: Themes.SPACING.md,
    zIndex: 10,
  },
  headerText: {
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    fontSize: 13,
    color: Themes.COLORS.primary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    opacity: 0.8,
  },
  listContent: {
    paddingHorizontal: Themes.SPACING.md,
    paddingBottom: Themes.SPACING.md, // Space at the bottom
  },

  emptyText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 16,
    color: Themes.COLORS.textFaded || "#888",
    textAlign: "center",
    marginTop: 100, // Pushes it down so it's not hugging the top
    paddingHorizontal: Themes.SPACING.lg,
    lineHeight: 22,
  },
});
