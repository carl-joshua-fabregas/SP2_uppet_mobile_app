import {
  View,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import * as Themes from "../assets/themes/themes";
import AdopterProfileInput from "../component/CreateAdopterProfileCard";
import APCProgressTracker from "../component/AdopterProfileCreationSteps/APCProgressTracker";
import APCStep1Component from "../component/AdopterProfileCreationSteps/steps/APCStep1Component";
import APCStep2Component from "../component/AdopterProfileCreationSteps/steps/APCStep2Component";
import APCStep3Component from "../component/AdopterProfileCreationSteps/steps/APCStep3Component";
import APCStep4Component from "../component/AdopterProfileCreationSteps/steps/APCStep4Component";
import APCStep5Component from "../component/AdopterProfileCreationSteps/steps/APCStep5Component";

const api = require("../api/axios");

export default function createAdopterProfile() {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [adopterForm, setAdopterForm] = useState({
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

  const STEPS = [
    { label: "Basic Information" },
    { label: "WORK & LIFESTYLE" },
    { label: "Pet Experience and Hobbies" },
    { label: "Review" },
    { label: "Done" },
  ];

  const handleNext = () => {
    console.log("HANDLE NEXT CALLED. CURRENT STEP:", currentStep);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
    console.log(`update ${currentStep} `, adopterForm);
  };
  const handleBack = () => {
    console.log("HANDLE Back CALLED. CURRENT STEP:", currentStep);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const createAdopter = async () => {
    console.log("Start saving");
    try {
      setUploading(false);
      const adopterCreationRes = await api.post(`api/user/post`, {
        adopterForm,
      });
      const adopterCreated = adopterCreationRes.data.body;
      console.log("Created Adopter Profile", adopterCreated);
      setUploading(false);
      return true;
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
      console.log("DONE");
    }
  };
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <APCStep1Component
            adopterData={adopterForm}
            setAdopterData={setAdopterForm}
            onNext={handleNext}
            onBack={handleBack}
          ></APCStep1Component>
        );
      case 1:
        return (
          <APCStep2Component
            adopterData={adopterForm}
            setAdopterData={setAdopterForm}
            onNext={handleNext}
            onBack={handleBack}
          ></APCStep2Component>
        );
      case 2:
        return (
          <APCStep3Component
            adopterData={adopterForm}
            setAdopterData={setAdopterForm}
            onNext={handleNext}
            onBack={handleBack}
          ></APCStep3Component>
        );
      case 3:
        return (
          <APCStep4Component
            adopterData={adopterForm}
            onNext={handleNext}
            onBack={handleBack}
            onCreate={createAdopter}
            uploading={uploading}
          ></APCStep4Component>
        );
      case 4:
        return (
          <APCStep5Component adopterData={adopterForm}></APCStep5Component>
        );
      default:
        return null;
    }
  };

  // const { type } = props.route.params || {}; // safe access
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.createProfileContainer}>
        <APCProgressTracker currentStep={currentStep} STEPS={STEPS} />
        <View style={styles.headerContainer}>
          <Text style={styles.stepHeaderCount}>
            Step{currentStep + 1} of {STEPS.length}
          </Text>
          <Text style={styles.stepHeaderTitle}>
            {" "}
            {STEPS[currentStep].label}
          </Text>
        </View>
        {renderStep()}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  createProfileContainer: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 15,
  },
  stepHeaderCount: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 12,
    color: Themes.COLORS.textFaded,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stepHeaderTitle: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: 24,
    color: Themes.COLORS.primary, // Forest Green
    marginTop: 4,
  },
});
