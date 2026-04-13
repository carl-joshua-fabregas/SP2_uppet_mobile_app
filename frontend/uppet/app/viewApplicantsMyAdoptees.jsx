import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  SectionList,
} from "react-native";
import ViewApplicantsCard from "../component/ViewApplicantsListCard";
import { useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import * as Themes from "../assets/themes/themes";
const api = require("../api/axios");

export default function ViewApplicantList(props) {
  const router = useRoute();
  const [applicants, setApplicants] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const handleAccept = async (id) => {
    try {
      console.log("before accept", applicants);
      const res = await api.post(`api/adoptionApp/${id}/approve`);
      const updatedApplicant = res.data.body;
      console.log("Updated Applicant is", updatedApplicant);
      // setApplicants(updatedApplicant)
      setApplicants((currentList) => {
        const updateMap = new Map(
          updatedApplicant.map((item) => [item._id, item]),
        );

        return currentList.map((item) => {
          if (updateMap.has(item._id)) {
            return { ...item, ...updateMap.get(item._id) };
          }
          return item;
        });
      });
      console.log("after accept", applicants);
    } catch (err) {
      console.log(err);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await api.patch(`api/adoptionApp/${id}/reject`);
      const updatedApplicant = res.data.body;
      // setApplicants(updatedApplicant)
      setApplicants((currentList) => {
        const updateMap = new Map(
          updatedApplicant.map((item) => [item._id, item]),
        );

        return currentList.map((item) => {
          if (updateMap.has(item._id)) {
            return { ...item, ...updateMap.get(item._id) };
          }
          return item;
        });
      });
    } catch (err) {
      console.log(err);
    }
  };
  const getApplicants = async (pageNum = 1) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/api/adoptionApp/${router.params.petID}/applicants`,
        {
          params: {
            page: pageNum,
          },
        },
      );
      const applicantsArr = res.data.body;
      setApplicants((prev) => [...prev, ...applicantsArr]);

      if (applicantsArr.length < 10) {
        setHasMore(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      if (refresh) setRefresh(false);
    }
  };
  const onRefresh = () => {
    setRefresh(true);
    setHasMore(true);
    setApplicants([]);
    setPage(1);
  };
  const loadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      setPage((prev) => prev + 1);
    }
  };

  const getStructuredData = (rawData) => {
    const approved = rawData.filter((a) => a.status === "Approved");
    const pending = rawData.filter((a) => a.status === "Pending");
    const rejected = rawData.filter((a) => a.status === "Rejected");
    const structuredData = [
      {
        title: `Approved Applications - ${approved.length}`,
        data: approved,
      },
      {
        title: `Pending Applications - ${pending.length}`,
        data: pending,
      },
      {
        title: `Rejected Applications - ${rejected.length}`,
        data: rejected,
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
    getApplicants(page);
  }, [page, hasMore, loading, refresh]);

  return (
    <View style={styles.cardContainer}>
      <SectionList
        sections={getStructuredData(applicants)}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          return (
            <ViewApplicantsCard
              adoptionApp={item}
              handleAccept={() => handleAccept(item._id)}
              handleReject={() => handleReject(item._id)}
            ></ViewApplicantsCard>
          );
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

//  {/* <FlatList
//     data={applicants}
//     keyExtractor={(item) => item._id}
//     renderItem={({ item }) => {
//       return (
//         <ViewApplicantsCard
//           adoptionApp={item}
//           handleAccept={() => handleAccept(item._id)}
//           handleReject={() => handleReject(item._id)}
//         ></ViewApplicantsCard>
//       );
//     }}
//     ListEmptyComponent={<Text>No Applicants found</Text>}
//     ListFooterComponent={
//       loading ? (
//         <ActivityIndicator size="large" />
//       ) : !hasMore ? (
//         <Text>No More Application</Text>
//       ) : null
//     }
//     onEndReached={loadMore}
//     onEndReachedThreshold={0.1}
//     refreshing={refresh}
//     onRefresh={onRefresh}
//     removeClippedSubviews={false}
//   ></FlatList> */}
