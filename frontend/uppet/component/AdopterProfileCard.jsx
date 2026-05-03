import {
  Text,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Themes from "../assets/themes/themes";
import ViewRatingModal from "./viewRatingModal";
import RatingCard from "./ratingCard";

export default function ProfileCard({
  adopter,
  isOwner,
  adopterRating = [],
  handleEditing,
  myRating = null,
  reviews = [],
  reviewsExpanded = false,
  hasMoreReviews = false,
  onReviewPress,
  onViewMoreReviews,
  onCreateRatingPress,
  // onReviewListEndReached = () => {},
  // onEditReviewPress = () => {},
  showRatingsAndReviews = true,
  handleRatingLayout = { handleRatingLayout },
}) {
  const InfoSection = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={Themes.COLORS.primary}
        />
      </View>
      <View style={styles.textData}>
        <Text style={styles.labelText}>{label}</Text>
        <Text style={styles.valueText}>{value || "Not specified"}</Text>
      </View>
    </View>
  );

  // Rendering this for the your review Part
  const renderStars = (ratingValue) =>
    [1, 2, 3, 4, 5].map((star) => (
      <MaterialCommunityIcons
        key={star}
        name={star <= ratingValue ? "star" : "star-outline"}
        size={16}
        color={Themes.COLORS.primary}
        style={styles.reviewStar}
      />
    ));

  //Showing the initial load of review bieng displated
  const displayedReviews = adopterRating
    ? adopterRating.length > 3
      ? reviewsExpanded
        ? adopterRating
        : adopterRating.slice(0, 3)
      : adopterRating
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={
            adopter.profilePhoto
              ? { uri: adopter.profilePhoto.url }
              : require("../assets/images/doggoe.jpg")
          }
          style={styles.profileImage}
        />
        <Text style={styles.fullName}>
          {adopter.firstName}{" "}
          {adopter.middleName ? adopter.middleName + " " : ""}
          {adopter.lastName}
        </Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}> {adopter.avarageRating}</Text>
          <MaterialCommunityIcons
            name="star"
            size={14}
            color={Themes.COLORS.primaryDark}
          ></MaterialCommunityIcons>
          <Text style={styles.badgeText}> Rating</Text>
        </View>
        <Text style={styles.bioText}>{adopter.bio || "No bio added yet."}</Text>

        {isOwner && (
          <TouchableOpacity style={styles.editButton} onPress={handleEditing}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color="#FFF"
            />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.card}>
          <InfoSection
            icon="calendar-account"
            label="Age"
            value={`${adopter.age} years old`}
          />
          <InfoSection
            icon="gender-male-female"
            label="Gender"
            value={adopter.gender}
          />
          <InfoSection
            icon="map-marker-outline"
            label="Address"
            value={adopter.address}
          />
          <InfoSection
            icon="phone-outline"
            label="Contact Info"
            value={adopter.contactInfo}
          />
        </View>

        <Text style={styles.sectionTitle}>Work & Lifestyle</Text>
        <View style={styles.card}>
          <InfoSection
            icon="briefcase-outline"
            label="Occupation"
            value={adopter.occupation}
          />
          <InfoSection
            icon="cash"
            label="Income Bracket"
            value={adopter.income}
          />
          <InfoSection
            icon="home-city-outline"
            label="Living Condition"
            value={adopter.livingCon}
          />
          <InfoSection icon="run" label="Lifestyle" value={adopter.lifeStyle} />
          <InfoSection
            icon="human-male-female-child"
            label="Household Members"
            value={adopter.householdMem}
          />
        </View>

        <Text style={styles.sectionTitle}>Pet Experience</Text>
        <View style={styles.card}>
          <InfoSection
            icon="history"
            label="Has had pets before?"
            value={adopter.hadPets ? "Yes, I have" : "First-time owner"}
          />
          <InfoSection
            icon="paw"
            label="Currently Owned Pets"
            value={adopter.currentOwnedPets}
          />
          <InfoSection
            icon="heart-outline"
            label="Hobbies"
            value={adopter.hobbies}
          />
        </View>

        {showRatingsAndReviews && (
          <>
            {!isOwner && (
              <>
                <Text style={styles.sectionTitle}>Your Review</Text>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => onCreateRatingPress(myRating)}
                >
                  <View style={[styles.card, styles.topReviewCard]}>
                    <View style={styles.reviewHeaderRow}>
                      <Text style={styles.reviewLabel}>Your latest review</Text>
                      <View style={styles.ratingDetailRow}>
                        {renderStars(myRating?.score || 0)}
                        <Text style={styles.reviewScoreText}>
                          {myRating?.score
                            ? `${myRating.score}.0`
                            : "No rating yet"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.reviewBodyText} numberOfLines={4}>
                      {myRating?.body ||
                        "Tap here to write a review for this adopter."}
                    </Text>
                    <Text style={styles.reviewActionText}>
                      {myRating ? "Tap to view or edit" : "Write a review"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            <Text style={styles.sectionTitle}>Other Adopters’ Reviews</Text>
            <View
              style={[styles.card, styles.reviewsSectionCard]}
              onLayout={(e) => handleRatingLayout(e)}
            >
              {/* --- UPDATED HEADER ROW --- */}
              <View style={styles.reviewHeaderRow}>
                {adopter.totalRating > 0 && (
                  <Text style={styles.reviewCountText}>
                    {`${adopter.totalRating} ${adopter.totalRating > 1 ? "reviews" : "review"}`}
                  </Text>
                )}

                {adopterRating.length > 3 && (
                  <TouchableOpacity onPress={onViewMoreReviews}>
                    <Text style={styles.toggleText}>
                      {reviewsExpanded ? "View Less" : "See More"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {/* --------------------------- */}

              {adopterRating.length === 0 ? (
                <Text style={styles.emptyText}>
                  No reviews yet for this adopter.
                </Text>
              ) : (
                <View style={styles.reviewList}>
                  {displayedReviews.map((review, index) => (
                    <RatingCard
                      key={review._id || index}
                      review={review}
                      onPress={() => onReviewPress(review)}
                    />
                  ))}
                </View>
              )}
              {reviewsExpanded && hasMoreReviews && (
                <Text style={styles.loadMoreHint}>
                  Scroll to load more reviews
                </Text>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
  },
  header: {
    alignItems: "center",
    padding: Themes.SPACING.lg,
    backgroundColor: Themes.COLORS.card,
    borderBottomLeftRadius: Themes.RADIUS.lg,
    borderBottomRightRadius: Themes.RADIUS.lg,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Themes.COLORS.primary,
    marginBottom: Themes.SPACING.sm,
  },
  fullName: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
    color: Themes.COLORS.textDark,
    textAlign: "center",
  },
  bioText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.textMuted,
    textAlign: "center",
    marginTop: Themes.SPACING.sm,
    paddingHorizontal: Themes.SPACING.md,
  },
  editButton: {
    flexDirection: "row",
    backgroundColor: Themes.COLORS.primary,
    paddingHorizontal: Themes.SPACING.md,
    paddingVertical: Themes.SPACING.sm,
    borderRadius: Themes.RADIUS.md,
    marginTop: Themes.SPACING.md,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: Themes.SPACING.sm,
  },
  content: {
    padding: Themes.SPACING.md,
  },
  sectionTitle: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
    color: Themes.COLORS.primary,
    marginBottom: Themes.SPACING.sm,
    marginTop: Themes.SPACING.md,
    marginLeft: Themes.SPACING.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.md,
    padding: Themes.SPACING.md,
    marginBottom: Themes.SPACING.sm,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Themes.SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Themes.RADIUS.md,
    backgroundColor: Themes.COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  textData: {
    marginLeft: Themes.SPACING.md,
    flex: 1,
  },
  labelText: {
    fontSize: Themes.TYPOGRAPHY.label.fontSize,
    color: Themes.COLORS.textMuted,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
  },
  valueText: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.textDark,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    marginTop: 2,
  },
  topReviewCard: {
    borderWidth: 1,
    borderColor: Themes.COLORS.soft,
    backgroundColor: Themes.COLORS.background,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Themes.SPACING.sm,
  },
  ratingDetailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewStar: {
    marginRight: 2,
  },
  reviewLabel: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.textMuted,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
  },
  reviewScoreText: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.textDark,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    marginLeft: Themes.SPACING.xs,
  },
  reviewBodyText: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.textDark,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    lineHeight: 20,
    marginBottom: Themes.SPACING.sm,
  },
  reviewActionText: {
    fontSize: Themes.TYPOGRAPHY.label.fontSize,
    color: Themes.COLORS.primaryDark,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
  },
  reviewsSectionCard: {
    paddingBottom: Themes.SPACING.sm,
  },
  reviewSectionTitle: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
    color: Themes.COLORS.textDark,
  },
  reviewCountText: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.textMuted,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
  },
  toggleText: {
    // <-- NEW STYLE ADDED
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.primary,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
  },
  reviewList: {
    maxHeight: 260,
  },
  reviewListContent: {
    paddingBottom: Themes.SPACING.sm,
  },
  reviewRow: {
    borderBottomWidth: 1,
    borderBottomColor: Themes.COLORS.soft,
    paddingVertical: Themes.SPACING.sm,
  },
  reviewRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Themes.SPACING.xs,
  },
  reviewAuthorText: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.textDark,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    flex: 1,
    marginRight: Themes.SPACING.sm,
  },
  viewMoreButton: {
    marginTop: Themes.SPACING.sm,
    alignSelf: "center",
    paddingHorizontal: Themes.SPACING.md,
    paddingVertical: Themes.SPACING.sm,
    borderRadius: Themes.RADIUS.md,
    backgroundColor: Themes.COLORS.primary,
  },
  viewMoreButtonText: {
    color: "#FFF",
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
  },
  loadMoreHint: {
    marginTop: Themes.SPACING.sm,
    color: Themes.COLORS.textMuted,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    textAlign: "center",
  },
  emptyText: {
    color: Themes.COLORS.textMuted,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    paddingVertical: Themes.SPACING.sm,
  },
  badgeContainer: {
    marginTop: Themes.SPACING.xs,
    backgroundColor: Themes.COLORS.badge,
    borderRadius: Themes.RADIUS.pill,
    flexDirection: "row",
    padding: Themes.SPACING.xs,
  },
  badgeText: {
    ...Themes.TYPOGRAPHY.badgeText,
  },
  moreButton: {
    alignItems: "flex-end",
    marginLeft: Themes.SPACING.md,
  },
});
