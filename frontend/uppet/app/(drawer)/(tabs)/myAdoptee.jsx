import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  SectionList,
} from "react-native";
import ViewAdopteesCard from "../../../component/ViewMyAdopteesCard";
import { useState, useEffect } from "react";
import * as Themes from "../../../assets/themes/themes";

const api = require("../../../api/axios");

export default function MyAdoptee() {
  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refresh, setRefresh] = useState(false);
  console.log(`HEY THIS IS THE PAGE FOR MYPETS ${page}`);

  const getPets = async (pageNum = 1, isRefreshing = false) => {
    if (loading || (!hasMore && !isRefreshing)) return;
    setLoading(true);
    console.log("ITS ME MARIO");

    try {
      const res = await api.get("/api/pet/myPets", {
        params: {
          page: pageNum,
        },
      });
      const myAdoptees = res.data.body;
      setPets((prev) => [...prev, ...myAdoptees]);
      if (myAdoptees.length < 10) {
        setHasMore(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const onRefresh = () => {
    setHasMore(true);
    setPets([]);
    setPage(1);
    getPets(1, true);
  };
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      getPets(page + 1);
    }
  };
  const getStructuredData = (rawData) => {
    const adopted = rawData.filter((a) => a.adoptedStatus === 0);
    const notadopted = rawData.filter((a) => a.adoptedStatus === 1);
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
    getPets(page);
  }, []);
  return (
    <View style={styles.cardContainer}>
      <SectionList
        sections={getStructuredData(pets)}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          return <ViewAdopteesCard pet={item}></ViewAdopteesCard>;
        }}
        renderSectionHeader={renderSectionHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No Applicants found</Text>
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
