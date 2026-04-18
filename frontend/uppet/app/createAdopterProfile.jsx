import {
  View,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigation } from "@react-navigation/native";
import * as Themes from "../assets/themes/themes";
import APCProgressTracker from "../component/AdopterProfileCreationSteps/APCProgressTracker";
import APCStep1Component from "../component/AdopterProfileCreationSteps/steps/APCStep1Component";
import APCStep2Component from "../component/AdopterProfileCreationSteps/steps/APCStep2Component";
import APCStep3Component from "../component/AdopterProfileCreationSteps/steps/APCStep3Component";
import APCStep4Component from "../component/AdopterProfileCreationSteps/steps/APCStep4Component";
import APCStep5Component from "../component/AdopterProfileCreationSteps/steps/APCStep5Component";

const api = require("../api/axios");

export default function createAdopterProfile() {
  const { user, setNewUser, login } = useUser();
  // const { adopterData } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [adopterForm, setAdopterForm] = useState(user);
  const navigation = useNavigation();
  const [errors, setErrors] = useState({});

  const validators = () => {
    const newErrors = {};
    switch (currentStep) {
      case 0: {
        if (!adopterForm.firstName.trim()) {
          newErrors.firstName = "First Name Error";
        }
        if (!adopterForm.middleName.trim()) {
          newErrors.middleName = "Middle Name Error";
        }
        if (!adopterForm.lastName.trim()) {
          newErrors.lastName = "Last Name Error";
        }
        if (!adopterForm.address.trim()) {
          newErrors.address = "Address Error";
        }
        if (!adopterForm.bio.trim()) {
          newErrors.bio = "Bio Error";
        }
        const ageNum = Number(adopterForm.age, 10);
        if (isNaN(ageNum)) {
          newErrors.age = "Age Error";
        }
        if (!adopterForm.gender.trim()) {
          newErrors.gender = "Gender Error";
        }
        if (!adopterForm.contactInfo.trim()) {
          newErrors.contactInfo = "Contact Info Error";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
        } else {
          setErrors({});
          // Proceed to next step
          console.log(
            "Pet Data is valid, proceeding to next step:",
            adopterForm,
          );
        }
      }
      case 1: {
        if (!adopterForm.occupation.trim()) {
          newErrors.occupation = "Occupation Error";
        }
        const incomeNum = Number(adopterForm.income, 10);
        if (isNaN(incomeNum)) {
          newErrors.income = "Income Error";
        }
        if (!adopterForm.livingCon.trim()) {
          newErrors.livingCon = "Living Condition Error";
        }
        if (!adopterForm.lifeStyle.trim()) {
          newErrors.lifeStyle = "LifeStyle Error";
        }
        const householdMem = Number(adopterForm.householdMem, 10);
        if (isNaN(householdMem)) {
          newErrors.householdMem = "Household Members Error";
        }
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
        } else {
          setErrors({});
          // Proceed to next step

          console.log(
            "Pet Data is valid, proceeding to next step:",
            adopterForm,
          );
        }
      }
      case 2: {
        const currentOwnedPetsNum = Number(adopterForm.currentOwnedPets, 10);
        if (isNaN(currentOwnedPetsNum)) {
          newErrors.currentOwnedPets = "Current Owned Pets Error";
        }
        if (!adopterForm.hadPets.trim()) {
          newErrors.hadPets = "Pet Experience Error";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
        } else {
          setErrors({});
        }
      }
    }
  };

  const onFinish = (newUser) => {
    console.log("I AM FINISH UP, VAL OF NEW USER : ", newUser);
    if (!newUser) {
      navigation.navigate("viewProfile");
    } else {
      setNewUser(false);
      navigation.navigate("(drawer)");
    }
  };

  const STEPS = [
    { label: "Basic Information" },
    { label: "WORK & LIFESTYLE" },
    { label: "Pet Experience and Hobbies" },
    { label: "Review" },
    { label: "Done" },
  ];

  const handleBack = () => {
    console.log("HANDLE Back CALLED. CURRENT STEP:", currentStep);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const createAdopter = async () => {
    console.log("Start saving");
    console.log(adopterForm);
    try {
      setUploading(false);
      const adopterCreationRes = await api.post(`api/user/post`, {
        ...adopterForm,
      });
      login(adopterForm, adopterCreationRes.data.token);
      setUploading(false);
      return true;
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      console.log("DONE");
    }
  };

  const updateAdopter = async () => {
    console.log("Updating Adopter", adopter);
  };
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <APCStep1Component
            adopterData={adopterForm}
            setAdopterData={setAdopterForm}
            errors={errors}
          ></APCStep1Component>
        );
      case 1:
        return (
          <APCStep2Component
            adopterData={adopterForm}
            setAdopterData={setAdopterForm}
            errors={errors}
          ></APCStep2Component>
        );
      case 2:
        return (
          <APCStep3Component
            adopterData={adopterForm}
            setAdopterData={setAdopterForm}
            errors={errors}
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
          <APCStep5Component
            adopterData={adopterForm}
            onFinish={onFinish}
          ></APCStep5Component>
        );
      default:
        return null;
    }
  };

  const handleNext = () => {
    validators();
    console.log("HANDLE NEXT CALLED. CURRENT STEP:", currentStep);
    if (currentStep < STEPS.length - 1 && Object.keys(errors).length === 0) {
      setCurrentStep((prev) => prev + 1);
      if (currentStep === STEPS.length - 1) {
        createAdopter();
      }
    }
    console.log(`update ${currentStep} `, adopterForm);
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
          {/* NAVIGATION BUTTONS */}
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>
                Next: {STEPS[currentStep].label}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // 👈 Spaces them out
    marginTop: 30,
    paddingBottom: 20, // 👈 Ensures it's not hugging the bottom of the screen
  },

  backButton: {
    paddingVertical: Themes.SPACING.md,
    paddingHorizontal: 25,
    borderRadius: Themes.RADIUS.md,
    backgroundColor: "#F5F5F5", // 👈 Give it a light background to look like a button
    marginRight: 10,
    elevation: 3,
  },

  nextButton: {
    flex: 1, // 👈 Takes up the remaining width
    backgroundColor: Themes.COLORS.primary,
    paddingVertical: Themes.SPACING.md,
    borderRadius: Themes.RADIUS.md,
    alignItems: "center",
    elevation: 3,
  },

  backButtonText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.COLORS.textMuted, // A light gray
    fontSize: 16,
  },

  nextButtonText: {
    color: "#FFF",
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
  },
  scrollContet: { flexGrow: 1, padding: Themes.SPACING.lg, paddingBottom: 50 },
});
