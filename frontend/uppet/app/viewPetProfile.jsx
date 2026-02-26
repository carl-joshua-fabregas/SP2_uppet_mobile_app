import { Text, ScrollView, Button, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import PetProfileCardViewMore from "../component/PetProfileCard";
import { useEffect, useState } from "react";
const api = require("../api/axios");

export default function ViewPetProfile () {
    const route = useRoute()
    const navigation = useNavigation()
    const [status, setStatus] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    const getstatus = async () => {
        try{
            const res = await api.get(`/api/adoptionApp/${route.params.pet._id}/applied`, {})
            setStatus(res.data.status)
            setIsOwner(res.data.isOwner)
            console.log(res.data.status, res.data.isOwner)
        } catch (err) {
            console.error(err)
        }
    }
    
    useEffect(() => {
        getstatus();
    }, [status]);

    const handleViewGallery = () => {
        console.log("HandleViewClicked")
    }
    const handleMessage = () => {
        console.log("HandleMessageClicked")
    }
    
    const handleApply = async () => {
        await api.post(`/api/adoptionApp/applied`, {
            petToAdopt: route.params.pet._id,
        })
        setStatus("Pending")
        console.log("HandleApplyClicked")
    }
    
    const handleCancel = async () => {
        await api.delete(`/api/adoptionApp/${route.params.pet._id}/cancelled`, {})
        setStatus("Cancelled")
        console.log("HandleCancelClicked")
    }
    
    const handleViewApplicants = () => {
        console.log("handleViewApplicantsClicked")
        navigation.navigate("viewApplicantsMyAdoptees", { petID: route.params.pet._id})
    }
    
    let buttonProps;
    if(isOwner){
        buttonProps = { title: "View Applicants", onPress: handleViewApplicants}
    } else {
        switch (status){
            case "Pending": 
                buttonProps = { title: "Cancel Application", onPress: handleCancel}
                break;      
            case "Rejected":
                buttonProps = { title: "Apply Again", onPress: handleApply}
                break;
            default: 
                buttonProps = { title: "Apply", onPress: handleApply}

        }
    }
    return (
        <View>
            <PetProfileCardViewMore pet={route.params.pet}></PetProfileCardViewMore>
            <Button title="View Gallery" onPress={handleViewGallery}></Button>
            <Button title="Message" onPress={handleMessage}></Button>
            <Button {...buttonProps}></Button>
        </View>
        
    )
}