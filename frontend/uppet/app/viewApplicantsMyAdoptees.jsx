import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
} from "react-native";
import ViewApplicantsCard from "../component/ViewApplicantsCard";
import { useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
const api = require("../api/axios");

export default function ViewApplicantList(props) {
  console.log(`HEY THIS IS THE PAGE FOR View Applicants in My Adoptees`);
  const router = useRoute();
  console.log(props);
  console.log(router);
  console.log(router);

  const [applicants, setApplicants] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const getApplicants = async (pageNum = 1) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      console.log("THESE ARE THE APPLICANTS");
      console.log(applicantsArr);

      const res = await api.get(
        `/api/adoptionApp/${router.params.petID}/applicants`,
        {
          params: {
            page: pageNum,
          },
        }
      );
      const applicantsArr = res.data.body;
      console.log("HERE ARE THE RESULTING Applicant array", applicantsArr);
      setApplicants([...applicants, ...applicantsArr]);

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

  useEffect(() => {
    getApplicants(page);
  }, [page, getApplicants]);
  return (
    <View>
      <FlatList
        data={applicants}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          console.log(item);
          return <ViewApplicantsCard adoptionApp={item}></ViewApplicantsCard>;
        }}
        ListEmptyComponent={<Text>No Applicants found</Text>}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" />
          ) : !hasMore ? (
            <Text>No More Application</Text>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        refreshing={refresh}
        onRefresh={onRefresh}
        removeClippedSubviews={false}
      ></FlatList>
    </View>
  );
}
