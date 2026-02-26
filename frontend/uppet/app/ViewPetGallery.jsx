import { Text, ScrollView, Button, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import PetProfileCardViewMore from "../component/PetProfileCard";
import { useEffect, useState } from "react";
const api = require("../api/axios");

export default function ViewPetProfile () {
    const route = useRoute()
    const navigation = useNavigation()
    const [hasApplied, setHasApplied] = useState(false);

    const getHasApplied = async () => {
        try{
            const res = await api.get(`/api/adoptionApp/${route.params.pet._id}/applied`, {})
            setHasApplied(res.data.hasApplied)
        } catch (err) {
            console.error(err)
        }
    }
    
    useEffect(() => {
        getHasApplied();
    }, [hasApplied]);
    const handleViewGallery = () => {
        console.log("HandleViewClicked")
    }
    const handleMessage = () => {
        console.log("HandleMessageClicked")
    }
    
    const handleApply = () => {
        console.log("HandleApplyClicked")
    }
    return (
        <View>
            <PetProfileCardViewMore pet={route.params.pet}></PetProfileCardViewMore>
            <Button title="View Gallery" onPress={handleViewGallery}></Button>
            <Button title="Message" onPress={handleMessage}></Button>
            <Button title="Apply" onPress={handleApply}></Button>
        </View>
        
    )
}