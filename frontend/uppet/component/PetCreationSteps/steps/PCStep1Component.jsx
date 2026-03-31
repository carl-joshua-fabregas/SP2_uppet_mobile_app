import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";

export default function PCStep1Component({ petData, setPetData, onNext }) {
  const [errors, setErrors] = useState({});
  const update = (key, value) =>
    setPetData((prev) => ({ ...prev, [key]: value }));

  const handleNext = async () => {
    let newErrors = {};
    // Validate required fields
    if (!petData.name) {
      newErrors.name = "Name is required";
    }
    if (!petData.age) {
      newErrors.age = "Age is required";
    }
    if (isNaN(Number(petData.age))) {
      newErrors.age = "Please enter a valid number for Age";
    }
    if (!petData.sex) {
      newErrors.sex = "Sex is required";
    }
    if (!petData.species) {
      newErrors.species = "Species is required";
    }
    if (!petData.breed) {
      newErrors.breed = "Breed is required";
    }
    if (!petData.bio) {
      newErrors.bio = "Bio is required";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      // Proceed to next step
      console.log("Pet Data is valid, proceeding to next step:", petData);
      onNext();
    }
  };

  return (
    <ScrollView style={styles.PCStep1ComponentContainer}>
      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          placeholder="Enter Name"
          value={petData.name}
          onChangeText={(text) => update("name", text)}
          style={[styles.input, errors.name && styles.inputError]}
        ></TextInput>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          placeholder="Enter Age"
          value={petData.age}
          onChangeText={(text) => update("age", text)}
          style={[styles.input, errors.age && styles.inputError]}
        ></TextInput>
        {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Sex</Text>
        <TextInput
          placeholder="Enter male or female"
          value={petData.sex}
          onChangeText={(text) => update("sex", text)}
          style={[styles.input, errors.sex && styles.inputError]}
        ></TextInput>
        {errors.sex && <Text style={styles.errorText}>{errors.sex}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Species</Text>
        <TextInput
          placeholder="Enter Species"
          value={petData.species}
          onChangeText={(text) => update("species", text)}
          style={[styles.input, errors.species && styles.inputError]}
        ></TextInput>
        {errors.species && (
          <Text style={styles.errorText}>{errors.species}</Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Breed</Text>
        <TextInput
          placeholder="Enter Breed"
          value={petData.breed}
          onChangeText={(text) => update("breed", text)}
          style={[styles.input, errors.breed && styles.inputError]}
        ></TextInput>
        {errors.breed && <Text style={styles.errorText}>{errors.breed}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          placeholder="Enter Bio"
          value={petData.bio}
          onChangeText={(text) => update("bio", text)}
          style={[
            styles.input,
            styles.bioTextArea,
            errors.bio && styles.inputError,
          ]}
        ></TextInput>
        {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
      </View>
      <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  PCStep1ComponentContainer: {
    flex: 1,
    backgroundColor: "#FFF9F5",
    padding: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "300",
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderRadius: 16,
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: "#FDF2E9",
  },
  bioTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
    multiline: true,
  },
  errorText: {
    color: "red",
    marginBottom: 8,
    fontSize: 11,
    letterSpacing: 0.1,
    marginTop: -8,
  },
  inputError: {
    borderColor: "red",
  },
  field: {
    marginBottom: 10,
  },
  nextButton: {
    backgroundColor: "#efb07d",
    paddingVertical: 12,
    borderRadius: 16,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
