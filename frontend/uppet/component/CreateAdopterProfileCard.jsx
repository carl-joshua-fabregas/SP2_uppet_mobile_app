import { View, Text, ScrollView, TextInput, Button } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

const api = require("../api/axios");

export default function AdopterProfileInput(props) {
  const type = props.cardType;
  const router = useNavigation();
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    bio: "",
    age: "",
    occupation: "",
    income: "",
    address: "",
    contactInfo: "",
    livingCon: "",
    lifeStyle: "",
    householdMem: "",
    currentOwnedPets: "",
    hobies: "",
    gender: "",
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };
  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.firstName.trim()) {
      newErrors.firstName = "First Name Error";
    }
    if (!form.middleName.trim()) {
      newErrors.middleName = "Middle Name Error";
    }
    if (!form.lastName.trim()) {
      newErrors.lastName = "Last Name Error";
    }
    const ageNum = Number(form.age, 10);
    if (isNaN(ageNum)) {
      newErrors.age = "Age Error";
    }
    if (!form.occupation.trim()) {
      newErrors.occupation = "Occupation Error";
    }
    const incomeNum = Number(form.income, 10);
    if (isNaN(incomeNum)) {
      newErrors.income = "Income Error";
    }
    if (!form.contactInfo.trim()) {
      newErrors.contactInfo = "Contact Info Error";
    }
    if (!form.livingCon.trim()) {
      newErrors.livingCon = "Living Condition Error";
    }
    if (!form.lifeStyle.trim()) {
      newErrors.lifeStyle = "LifeStyle Error";
    }
    const currentOwnedPetsNum = Number(form.currentOwnedPets, 10);
    if (isNaN(currentOwnedPetsNum)) {
      newErrors.income = "Current Owned Pets Error";
    }
    if (!form.gender.trim()) {
      newErrors.gender = "Gender Error";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      console.log("Create Profile is valid");

      try {
        const res = await api.patch("/api/user", form);
      } catch (err) {
        console.log(err);
      }

      router.replace("(drawer)");
    } else {
      console.log(newErrors);
    }
  };

  return (
    <ScrollView>
      <View>
        <Text>First Name</Text>
        <TextInput
          placeholder="Enter First Name"
          value={form.firstName}
          onChangeText={(text) => handleChange("firstName", text)}
        ></TextInput>
      </View>
      <View>
        <Text>Middle Name</Text>
        <TextInput
          placeholder="Enter Middle Name"
          value={form.middleName}
          onChangeText={(text) => handleChange("middleName", text)}
        ></TextInput>
      </View>
      <View>
        <Text>Last Name</Text>
        <TextInput
          placeholder="Enter Last Name"
          value={form.lastName}
          onChangeText={(text) => handleChange("lastName", text)}
        ></TextInput>
      </View>
      <View>
        <Text>Bio</Text>
        <TextInput
          placeholder="Enter Bio"
          value={form.bio}
          onChangeText={(text) => handleChange("bio", text)}
        ></TextInput>
      </View>
      <View>
        <Text>Age</Text>
        <TextInput
          placeholder="Enter Age"
          value={form.age}
          onChangeText={(text) => handleChange("age", text)}
        ></TextInput>
      </View>
      <View>
        <Text>Occupation</Text>
        <TextInput
          placeholder="Enter Occupation"
          value={form.occupation}
          onChangeText={(text) => handleChange("occupation", text)}
        ></TextInput>
      </View>
      <View>
        <Text>Income</Text>
        <TextInput
          placeholder="Enter Income"
          value={form.income}
          onChangeText={(text) => handleChange("income", text)}
        ></TextInput>
      </View>
      <View>
        <Text>Address</Text>
        <TextInput
          placeholder="Enter Address"
          value={form.address}
          onChangeText={(text) => handleChange("address", text)}
        ></TextInput>
      </View>
      <View>
        <Text>Contact Info</Text>
        <TextInput
          placeholder="Enter Contact Info"
          value={form.contactInfo}
          onChangeText={(text) => handleChange("contactInfo", text)}
        ></TextInput>
      </View>
      <View>
        <Text>Living Condition</Text>
        <TextInput
          placeholder="Enter Living Condition"
          value={form.livingCon}
          onChangeText={(text) => handleChange("livingCon", text)}
        ></TextInput>
      </View>
      <View>
        <Text>LifeStyle</Text>
        <TextInput
          placeholder="Enter Active or Sedentary"
          value={form.lifeStyle}
          onChangeText={(text) => handleChange("lifeStyle", text)}
        ></TextInput>
      </View>
      <View>
        <Text>House Hold Members</Text>
        <TextInput
          placeholder="Enter Number of Household members"
          value={form.householdMem}
          onChangeText={(text) => handleChange("householdMem", text)}
        ></TextInput>
      </View>
      <View>
        <Text>Current Owned Pets</Text>
        <TextInput
          placeholder="Enter Number of currently owned pets"
          value={form.currentOwnedPets}
          onChangeText={(text) => handleChange("currentOwnedPets", text)}
        ></TextInput>
      </View>
      <View>
        <Text>Hobies</Text>
        <TextInput
          placeholder="Enter Hobies"
          value={form.hobies}
          onChangeText={(text) => handleChange("hobies", text)}
        ></TextInput>
      </View>
      <View>
        <Text>Gender</Text>
        <TextInput
          placeholder="Enter Gender"
          value={form.gender}
          onChangeText={(text) => handleChange("gender", text)}
        ></TextInput>
      </View>
      <Button
        title={
          type.toString() === "new_user" ? "Create Profile" : "Edit Profile"
        }
        onPress={handleSubmit}
      ></Button>
    </ScrollView>
  );
}
