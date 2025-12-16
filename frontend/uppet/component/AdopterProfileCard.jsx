import { Text, ScrollView, Image, View } from "react-native";

export default function ProfileCard(props) {
  const { adopter } = props;
  console.log("THIS IS ADOPTER PROFILE CARD");
  console.log(adopter);
  const form = {
    firstName: adopter.firstName,
    middleName: adopter.middleName,
    lastName: adopter.lastName,
    bio: adopter.bio,
    age: adopter.age,
    occupation: adopter.occupation,
    income: adopter.income,
    address: adopter.address,
    contactInfo: adopter.contactInfo,
    livingCon: adopter.livingCon,
    lifeStyle: adopter.lifeStyle,
    householdMem: adopter.householdMem,
    currentOwnedPets: adopter.currentOwnedPets,
    hobies: adopter.hobies,
    gender: adopter.gender,
  };

  return (
    <ScrollView>
      <View>
        <Text>First Name</Text>
        <Text>{form.firstName}</Text>
      </View>
      <View>
        <Text>Middle Name</Text>
        <Text>{form.middleName}</Text>
      </View>
      <View>
        <Text>Last Name</Text>
        <Text>{form.lastName}</Text>
      </View>
      <View>
        <Text>Bio</Text>
        <Text>{form.bio}</Text>
      </View>
      <View>
        <Text>Age</Text>
        <Text>{form.age}</Text>
      </View>
      <View>
        <Text>Occupation</Text>
        <Text>{form.occupation}</Text>
      </View>
      <View>
        <Text>Income</Text>
        <Text>{form.income}</Text>
      </View>
      <View>
        <Text>Address</Text>
        <Text>{form.address}</Text>
      </View>
      <View>
        <Text>Contact Info</Text>
        <Text>{form.contactInfo}</Text>
      </View>
      <View>
        <Text>Living Condition</Text>
        <Text>{form.livingCon}</Text>
      </View>
      <View>
        <Text>LifeStyle</Text>
        <Text>{form.lifeStyle}</Text>
      </View>
      <View>
        <Text>House Hold Members</Text>
        <Text>{form.householdMem}</Text>
      </View>
      <View>
        <Text>Current Owned Pets</Text>
        <Text>{form.currentOwnedPets}</Text>
      </View>
      <View>
        <Text>Hobies</Text>
        <Text>{form.hobies}</Text>
      </View>
      <View>
        <Text>Gender</Text>
        <Text>{form.gender}</Text>
      </View>
    </ScrollView>
  );
}
