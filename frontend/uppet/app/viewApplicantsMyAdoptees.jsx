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
  const router = useRoute();
  const [applicants, setApplicants] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const handleAccept = async (id) => { 
    try{
      console.log("before accept", applicants)
      const res = await api.post(`api/adoptionApp/${id}/approve`)
      const updatedApplicant = res.data.body
      console.log("Updated Applicant is", updatedApplicant)
      // setApplicants(updatedApplicant)
      setApplicants((currentList) => {
      const updateMap = new Map(updatedApplicant.map(item => [item._id, item]));

      return currentList.map((item) => {
        if (updateMap.has(item._id)) {
          return { ...item, ...updateMap.get(item._id) };
        }
        return item;
      });
    });
      console.log("after accept", applicants)

    } catch (err) {
      console.log(err)
    }
  }

  const handleReject = async (id) => {
    try{
      const res = await api.patch(`api/adoptionApp/${id}/reject`)
      const updatedApplicant = res.data.body
      // setApplicants(updatedApplicant)
      setApplicants((currentList) => {
      const updateMap = new Map(updatedApplicant.map(item => [item._id, item]));

      return currentList.map((item) => {
        if (updateMap.has(item._id)) {
          return { ...item, ...updateMap.get(item._id) };
        }
        return item;
      });
    });
    } catch (err) {
      console.log(err)
    }
    
  }
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
        }
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

  useEffect(() => {
    getApplicants(page);
  }, [page, hasMore, loading, refresh]);
  return (
    <View>
      <FlatList
        data={applicants}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          return <ViewApplicantsCard adoptionApp={item} handleAccept={ () => handleAccept(item._id) } handleReject={ () => handleReject(item._id) }></ViewApplicantsCard>;
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
