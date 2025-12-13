import { View, Text, ScrollView, TextInput, Button } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
const api = require("../api/axios");
export default function CreatePetCard(props) {
  const router = useNavigation();
  //   const [submittable, setSubmittable] = useState(false);
  const [error, setError] = useState({});
  const [form, setForm] = useState({
    name: "",
    age: "",
    bio: "",
    sex: "",
    species: "",
    breed: "",
    size: "",
    weight: "",
    vaccination: "",
    sn: "",
    healthCond: "",
    behavior: "",
    specialNeeds: "",
    otherInfo: "",
    photos: [
      {
        uri: "https://lh3.googleusercontent.com/a/ACg8ocL0iPaGNeyu9wgGzyUvGbyEh-ooGF5FzvbNG9xnUwUd4TuB=s96-c",
        isProfile: 0,
      },
    ],
  });

  const handleOnChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name Error";
    }
    const ageInt = parseInt(form.age, 10);
    if (isNaN(ageInt)) {
      newErrors.age = "Age Error";
    }
    if (!form.sex.trim()) {
      newErrors.sex = "Sex Error";
    }
    if (!form.species.trim()) {
      newErrors.species = "Species Error";
    }
    if (!form.breed.trim()) {
      newErrors.breed = "Breed Error";
    }
    const weightNum = parseInt(form.weight, 10);
    if (isNaN(weightNum)) {
      newErrors.weightNum = "Weight Error";
    }
    if (!form.vaccination.trim()) {
      newErrors.vaccination = "Vaccination Error";
    }
    if (!form.sn.trim()) {
      newErrors.sn = "Sn error";
    }
    if (!form.specialNeeds.trim()) {
      newErrors.specialNeeds = "Special Needs Error";
    }

    setError(newErrors);
    console.log(newErrors);
    if (Object.keys(newErrors).length === 0) {
      console.log("Create Pet Profile Valid");
      //   setSubmittable(true);
    }
  };
  return (
    <View>
      <ScrollView>
        <Text>Name</Text>
        <TextInput
          placeholder="Enter Name"
          value={form.name}
          onChangeText={(text) => handleOnChange("name", text)}
        ></TextInput>
        <Text>Age</Text>
        <TextInput
          placeholder="Enter Age"
          value={form.age}
          onChangeText={(text) => handleOnChange("age", text)}
        ></TextInput>
        <Text>Bio</Text>
        <TextInput
          placeholder="Enter Bio"
          value={form.bio}
          onChangeText={(text) => handleOnChange("bio", text)}
        ></TextInput>
        <Text>Sex</Text>
        <TextInput
          placeholder="Enter male or female"
          value={form.sex}
          onChangeText={(text) => handleOnChange("sex", text)}
        ></TextInput>
        <Text>Species</Text>
        <TextInput
          placeholder="Enter Species"
          value={form.species}
          onChangeText={(text) => handleOnChange("species", text)}
        ></TextInput>
        <Text>Breed</Text>
        <TextInput
          placeholder="Enter Breed"
          value={form.breed}
          onChangeText={(text) => handleOnChange("breed", text)}
        ></TextInput>
        <Text>Size</Text>
        <TextInput
          placeholder="Enter Size"
          value={form.size}
          onChangeText={(text) => handleOnChange("size", text)}
        ></TextInput>
        <Text>Weight</Text>
        <TextInput
          placeholder="Enter Weight"
          value={form.weight}
          onChangeText={(text) => handleOnChange("weight", text)}
        ></TextInput>
        <Text>Vaccination</Text>
        <TextInput
          placeholder="Enter Vaccination"
          value={form.vaccination}
          onChangeText={(text) => handleOnChange("vaccination", text)}
        ></TextInput>
        <Text>Spayed or Neutered</Text>
        <TextInput
          placeholder="Yes or No"
          value={form.sn}
          onChangeText={(text) => handleOnChange("sn", text)}
        ></TextInput>
        <Text>Health Condition</Text>
        <TextInput
          placeholder="Up-to-date"
          value={form.healthCond}
          onChangeText={(text) => handleOnChange("healthCond", text)}
        ></TextInput>
        <Text>Behavior</Text>
        <TextInput
          placeholder="Yes or No"
          value={form.behavior}
          onChangeText={(text) => handleOnChange("behavior", text)}
        ></TextInput>
        <Text>Special Needs</Text>
        <TextInput
          placeholder="Yes or No"
          value={form.specialNeeds}
          onChangeText={(text) => handleOnChange("specialNeeds", text)}
        ></TextInput>
        <Text>Other Info</Text>
        <TextInput
          placeholder="Enter Other Info"
          value={form.otherInfo}
          onChangeText={(text) => handleOnChange("otherInfo", text)}
        ></TextInput>
        <Button title="Submit" onPress={handleSubmit}></Button>
      </ScrollView>
    </View>
  );
}
