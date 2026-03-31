import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";

export default function PCStep2Component({ petData, setPetData, onNext }) {
  const [errors, setErrors] = useState({});
  const update = (key, value) =>
    setPetData((prev) => ({ ...prev, [key]: value }));

  const handleNext = async () => {
    let newErrors = {};
    // Validate required fields
    if (!petData.weight) {
      newErrors.weight = "Weight is required";
    }
    if (!petData.vaccination) {
      newErrors.vaccination = "Vaccination status is required";
    }
    if (isNaN(Number(petData.weight))) {
      newErrors.weight = "Please enter a valid number for Weight";
    }
    if (!petData.sn) {
      newErrors.sex = "Please specify if your pet is spayed/neutered";
    }
    if (!petData.healthCond) {
      newErrors.healthCond = "Health condition is required";
    }
    if (!petData.behavior) {
      newErrors.behavior = "Behavior is required";
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
        <Text style={styles.label}>Weight</Text>
        <TextInput
          placeholder="Enter Weight in kg"
          value={petData.weight}
          onChangeText={(text) => update("weight", text)}
          style={[styles.input, errors.weight && styles.inputError]}
        ></TextInput>
        {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>vaccination</Text>
        <TextInput
          placeholder="Enter vaccination status"
          value={petData.vaccination}
          onChangeText={(text) => update("vaccination", text)}
          style={[styles.input, errors.vaccination && styles.inputError]}
        ></TextInput>
        {errors.vaccination && (
          <Text style={styles.errorText}>{errors.vaccination}</Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Health Condition</Text>
        <TextInput
          placeholder="Enter health condition"
          value={petData.healthCond}
          onChangeText={(text) => update("healthCond", text)}
          style={[styles.input, errors.healthCond && styles.inputError]}
        ></TextInput>
        {errors.healthCond && (
          <Text style={styles.errorText}>{errors.healthCond}</Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Behavior</Text>
        <TextInput
          placeholder="Enter behavior information"
          value={petData.behavior}
          onChangeText={(text) => update("behavior", text)}
          style={[styles.input, errors.behavior && styles.inputError]}
        ></TextInput>
        {errors.behavior && (
          <Text style={styles.errorText}>{errors.behavior}</Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Spayed/Neutered</Text>
        <TextInput
          placeholder="Enter spayed/neutered status"
          value={petData.sn}
          onChangeText={(text) => update("sn", text)}
          style={[styles.input, errors.sn && styles.inputError]}
        ></TextInput>
        {errors.sn && <Text style={styles.errorText}>{errors.sn}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Special Needs</Text>
        <TextInput
          placeholder="Enter special needs if there are any"
          value={petData.specialNeeds}
          onChangeText={(text) => update("specialNeeds", text)}
          style={[styles.input, errors.specialNeeds && styles.inputError]}
        ></TextInput>
        {errors.specialNeeds && (
          <Text style={styles.errorText}>{errors.specialNeeds}</Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Other Information</Text>
        <TextInput
          placeholder="If there is any other information you'd like to share, enter it here"
          value={petData.otherInfo}
          onChangeText={(text) => update("otherInfo", text)}
          style={[styles.input, errors.otherInfo && styles.inputError]}
        ></TextInput>
        {errors.otherInfo && (
          <Text style={styles.errorText}>{errors.otherInfo}</Text>
        )}
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
  },
  label: {
    fontSize: 12,
    fontWeight: 300,
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
