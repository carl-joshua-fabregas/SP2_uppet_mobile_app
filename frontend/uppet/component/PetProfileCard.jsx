import { View, Text, ScrollView, TextInput, Button } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

export default function PetProfileCardViewMore (props) {
    const { pet } = props;
    const form = {
        name: pet.name,
      age: pet.age,
      bio: pet.bio,
      sex: pet.sex,
      species: pet.species,
      breed: pet.breed,
      size: pet.size,
      weight: pet.weight,
      vaccination: pet.vaccination,
      sn: pet.sn,
      healthCond: pet.healthCond,
      behavior: pet.behavior,
      specialNeeds: pet.specialNeeds,
      otherInfo: pet.otherInfo,
      photos: pet.photos
    }
    return (
<View>
      <ScrollView>
        <Text>Name:</Text>
        <Text>{form.name}</Text>
        <Text>Age</Text>
        <Text>{form.age}</Text>
        <Text>Bio</Text>
        <Text>{form.bio}</Text>
        <Text>Sex</Text>
        <Text>{form.sex}</Text>
        <Text>Species</Text>
        <Text>{form.species}</Text>
        <Text>Breed</Text>
        <Text>{form.breed}</Text>
        <Text>Size</Text>
        <Text>{form.size}</Text>
        <Text>Weight</Text>
        <Text>{form.weight}</Text>
        <Text>Vaccination</Text>
        <Text>{form.vaccination}</Text>
        <Text>Spayed or Neutered</Text>
        <Text>{form.sn}</Text>
        <Text>Health Condition</Text>
        <Text>{form.healthCond}</Text>
        <Text>Behavior</Text>
        <Text>{form.behavior}</Text>
        <Text>Special Needs</Text>
        <Text>{form.specialNeeds}</Text>
        <Text>Other Info</Text>
        <Text>{form.otherInfo}</Text>
      </ScrollView>
    </View>
    )
}