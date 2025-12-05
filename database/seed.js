const mongoose = require("mongoose");
const express = require("express");
const Adopter = require("../backend/models/Adopter");
const Pet = require("../backend/models/Pet");
const AdoptionApplication = require("../backend/models/AdoptionApplication");
const ChatThread = require("../backend/models/ChatThread");
const Messages = require("../backend/models/Messages");
const Notification = require("../backend/models/Notification");
const Rating = require("../backend/models/Rating");

require("dotenv").config();

const seed = async () => {
	mongoose
		.connect(process.env.MONGODB_URI)
		.then(async () => {
			const adopter1 = new Adopter({
				firstName: "First1",
				middleName: "Middle1",
				lastName: "Last1",
				bio: "This is a sample bio for user 1.",
				age: 21,
				occupation: "Occupation1",
				income: 31000,
				address: "1 Sample Street, City 1",
				contactInfo: "555-01001",
				livingCon: "Rural",
				lifeStyle: "Calm",
				householdMem: 2,
				currentOwnedPets: 3,
				hobies: "Reading, Sports",
				userType: "admin",
				googleId: "google_id_1",
				gender: "Female",
			});

			const sadopter1 = await adopter1.save();

			const adopter2 = new Adopter({
				firstName: "First2",
				middleName: "Middle2",
				lastName: "Last2",
				bio: "This is a sample bio for user 2.",
				age: 22,
				occupation: "Occupation2",
				income: 32000,
				address: "2 Sample Street, City 1",
				contactInfo: "555-01002",
				livingCon: "Urban",
				lifeStyle: "Active",
				householdMem: 3,
				currentOwnedPets: 1,
				hobies: "Reading, Sports",
				userType: "user",
				googleId: "google_id_2",
				gender: "Male",
			});

			const sadopter2 = await adopter2.save();

			const adopter3 = new Adopter({
				firstName: "First3",
				middleName: "Middle3",
				lastName: "Last3",
				bio: "This is a sample bio for user 3.",
				age: 23,
				occupation: "Occupation3",
				income: 33000,
				address: "3 Sample Street, City 3",
				contactInfo: "555-01003",
				livingCon: "Rural",
				lifeStyle: "Calm",
				householdMem: 3,
				currentOwnedPets: 0,
				hobies: "Reading, Sports",
				userType: "user",
				googleId: "google_id_3",
				gender: "Female",
			});

			const sadopter3 = await adopter3.save();

			const adopter4 = new Adopter({
				firstName: "First4",
				middleName: "Middle4",
				lastName: "Last4",
				bio: "This is a sample bio for user 4.",
				age: 24,
				occupation: "Occupation4",
				income: 34000,
				address: "4 Sample Street, City 4",
				contactInfo: "555-01004",
				livingCon: "Urban",
				lifeStyle: "Active",
				householdMem: 4,
				currentOwnedPets: 0,
				hobies: "Reading, Sports",
				userType: "user",
				googleId: "google_id_4",
				gender: "Male",
			});

			const sadopter4 = await adopter4.save();

			const adopter5 = new Adopter({
				firstName: "First5",
				middleName: "Middle5",
				lastName: "Last5",
				bio: "This is a sample bio for user 5.",
				age: 25,
				occupation: "Occupation5",
				income: 35000,
				address: "5 Sample Street, City 5",
				contactInfo: "555-01005",
				livingCon: "Urban",
				lifeStyle: "Calm",
				householdMem: 5,
				currentOwnedPets: 2,
				hobies: "Reading, Sports",
				userType: "user",
				googleId: "google_id_5",
				gender: "Female",
			});

			const sadopter5 = await adopter5.save();

			const adopter6 = new Adopter({
				firstName: "First6",
				middleName: "Middle6",
				lastName: "Last6",
				bio: "This is a sample bio for user 6.",
				age: 26,
				occupation: "Occupation6",
				income: 36000,
				address: "6 Sample Street, City 6",
				contactInfo: "555-01006",
				livingCon: "Urban",
				lifeStyle: "Active",
				householdMem: 1,
				currentOwnedPets: 1,
				hobies: "Reading, Sports",
				userType: "user",
				googleId: "google_id_6",
				gender: "Male",
			});

			const sadopter6 = await adopter6.save();

			const pet1 = new Pet({
				ownerId: sadopter1,
				name: "PetName1",
				age: 2,
				bio: "This is a bio for pet 1.",
				sex: "Female",
				species: "Cat",
				breed: "Breed1",
				size: "Medium",
				weight: "6",
				vaccination: "Up to date",
				sn: "Yes",
				healthCond: "Healthy",
				behavior: "Friendly",
				specialNeeds: "None",
				adoptedStatus: 0,
				otherInfo: "Additional info for pet 1.",
				photos: [
					{
						url: "https://example.com/photo_1_1.jpg",
						caption: "Photo 1 of pet 1",
						timestamp: "2025-12-04T06:26:42.339802",
						isProfile: 1,
					},
					{
						url: "https://example.com/photo_1_2.jpg",
						caption: "Photo 2 of pet 1",
						timestamp: "2025-12-04T06:26:42.339813",
						isProfile: 0,
					},
				],
			});

			const spet1 = await pet1.save();

			const pet2 = new Pet({
				ownerId: sadopter1,
				name: "PetName2",
				age: 3,
				bio: "This is a bio for pet 2.",
				sex: "Male",
				species: "Cat",
				breed: "Breed2",
				size: "Medium",
				weight: "7",
				vaccination: "Up to date",
				sn: "No",
				healthCond: "Healthy",
				behavior: "Calm",
				specialNeeds: "None",
				adoptedStatus: 1,
				otherInfo: "Additional info for pet 2.",
				photos: [
					{
						url: "https://example.com/photo_2_1.jpg",
						caption: "Photo 1 of pet 2",
						timestamp: "2025-12-04T06:26:42.339802",
						isProfile: 1,
					},
					{
						url: "https://example.com/photo_2_2.jpg",
						caption: "Photo 2 of pet 2",
						timestamp: "2025-12-04T06:26:42.339813",
						isProfile: 0,
					},
				],
			});

			const spet2 = await pet2.save();

			const pet3 = new Pet({
				ownerId: sadopter1,
				name: "PetName3",
				age: 4,
				bio: "This is a bio for pet 3.",
				sex: "Female",
				species: "Dog",
				breed: "Breed3",
				size: "Small",
				weight: "8",
				vaccination: "Up to date",
				sn: "Yes",
				healthCond: "Healthy",
				behavior: "Friendly",
				specialNeeds: "None",
				adoptedStatus: 0,
				otherInfo: "Additional info for pet 3.",
				photos: [
					{
						url: "https://example.com/photo_3_1.jpg",
						caption: "Photo 1 of pet 3",
						timestamp: "2025-12-04T06:26:42.339802",
						isProfile: 1,
					},
					{
						url: "https://example.com/photo_3_2.jpg",
						caption: "Photo 2 of pet 3",
						timestamp: "2025-12-04T06:26:42.339813",
						isProfile: 0,
					},
				],
			});

			const spet3 = await pet3.save();

			const pet4 = new Pet({
				ownerId: sadopter3,
				name: "PetName4",
				age: 5,
				bio: "This is a bio for pet 4.",
				sex: "Male",
				species: "Cat",
				breed: "Breed4",
				size: "Medium",
				weight: "9",
				vaccination: "Up to date",
				sn: "No",
				healthCond: "Minor issues",
				behavior: "Calm",
				specialNeeds: "None",
				adoptedStatus: 1,
				otherInfo: "Additional info for pet 4.",
				photos: [
					{
						url: "https://example.com/photo_4_1.jpg",
						caption: "Photo 1 of pet 4",
						timestamp: "2025-12-04T06:26:42.339802",
						isProfile: 1,
					},
					{
						url: "https://example.com/photo_4_2.jpg",
						caption: "Photo 2 of pet 4",
						timestamp: "2025-12-04T06:26:42.339813",
						isProfile: 0,
					},
				],
			});

			const spet4 = await pet4.save();

			const pet5 = new Pet({
				ownerId: sadopter6,
				name: "PetName5",
				age: 6,
				bio: "This is a bio for pet 5.",
				sex: "Female",
				species: "Cat",
				breed: "Breed5",
				size: "Medium",
				weight: "10",
				vaccination: "Up to date",
				sn: "Yes",
				healthCond: "Healthy",
				behavior: "Friendly",
				specialNeeds: "Requires medication",
				adoptedStatus: 1,
				otherInfo: "Additional info for pet 5.",
				photos: [
					{
						url: "https://example.com/photo_5_1.jpg",
						caption: "Photo 1 of pet 5",
						timestamp: "2025-12-04T06:26:42.339802",
						isProfile: 1,
					},
					{
						url: "https://example.com/photo_5_2.jpg",
						caption: "Photo 2 of pet 5",
						timestamp: "2025-12-04T06:26:42.339813",
						isProfile: 0,
					},
				],
			});

			const spet5 = await pet5.save();

			const pet6 = new Pet({
				ownerId: sadopter5,
				name: "PetName6",
				age: 7,
				bio: "This is a bio for pet 6.",
				sex: "Female",
				species: "Dog",
				breed: "Breed6",
				size: "Small",
				weight: "11",
				vaccination: "Not up to date",
				sn: "No",
				healthCond: "Healthy",
				behavior: "Calm",
				specialNeeds: "None",
				adoptedStatus: 1,
				otherInfo: "Additional info for pet 6.",
				photos: [
					{
						url: "https://example.com/photo_6_1.jpg",
						caption: "Photo 1 of pet 6",
						timestamp: "2025-12-04T06:26:42.339802",
						isProfile: 1,
					},
					{
						url: "https://example.com/photo_6_2.jpg",
						caption: "Photo 2 of pet 6",
						timestamp: "2025-12-04T06:26:42.339813",
						isProfile: 0,
					},
				],
			});

			const spet6 = await pet6.save();

			const pet7 = new Pet({
				ownerId: sadopter5,
				name: "PetName7",
				age: 8,
				bio: "This is a bio for pet 7.",
				sex: "Male",
				species: "Cat",
				breed: "Breed7",
				size: "Medium",
				weight: "12",
				vaccination: "Up to date",
				sn: "No",
				healthCond: "Healthy",
				behavior: "Friendly",
				specialNeeds: "None",
				adoptedStatus: 1,
				otherInfo: "Additional info for pet 7.",
				photos: [
					{
						url: "https://example.com/photo_7_1.jpg",
						caption: "Photo 1 of pet 7",
						timestamp: "2025-12-04T06:26:42.339802",
						isProfile: 1,
					},
					{
						url: "https://example.com/photo_7_2.jpg",
						caption: "Photo 2 of pet 7",
						timestamp: "2025-12-04T06:26:42.339813",
						isProfile: 0,
					},
				],
			});

			const spet7 = await pet7.save();

			const adoptionApp1 = new AdoptionApplication({
				petToAdopt: spet1,
				applicant: sadopter2,
				status: "Approved",
				timeStamp: "12/05/2025 9:10:00 AM",
			});

			const sadoptionApp1 = await adoptionApp1.save();

			const adoptionApp2 = new AdoptionApplication({
				petToAdopt: spet2,
				applicant: sadopter3,
				status: "Rejected",
				timeStamp: "12/05/2025 9:15:30 AM",
			});

			const sadoptionApp2 = await adoptionApp2.save();

			const adoptionApp3 = new AdoptionApplication({
				petToAdopt: spet2,
				applicant: sadopter4,
				status: "Pending",
				timeStamp: "12/05/2025 9:20:00 AM",
			});

			const sadoptionApp3 = await adoptionApp3.save();

			const adoptionApp4 = new AdoptionApplication({
				petToAdopt: spet1,
				applicant: sadopter5,
				status: "Rejected",
				timeStamp: "12/05/2025 8:25:45 AM",
			});

			const sadoptionApp4 = await adoptionApp4.save();

			const adoptionApp5 = new AdoptionApplication({
				petToAdopt: spet3,
				applicant: sadopter6,
				status: "Approved",
				timeStamp: "12/05/2025 9:25:00 AM",
			});

			const sadoptionApp5 = await adoptionApp5.save();

			const adoptionApp6 = new AdoptionApplication({
				petToAdopt: spet7,
				applicant: sadopter3,
				status: "Pending",
				timeStamp: "12/05/2025 9:30:30 AM",
			});

			const sadoptionApp6 = await adoptionApp6.save();

			const adoptionApp7 = new AdoptionApplication({
				petToAdopt: spet6,
				applicant: sadopter1,
				status: "Cancelled",
				timeStamp: "12/05/2025 10:00:00 AM",
			});

			const sadoptionApp7 = await adoptionApp7.save();

			const chatThread1 = new ChatThread({
				members: [sadopter1, sadopter2],
				lastMessage: sadopter2,
				timeStamp: "12/05/2025 9:00:15 AM",
			});

			const schatThread1 = await chatThread1.save();

			const chatThread2 = new ChatThread({
				members: [sadopter1, sadopter5],
				lastMessage: sadopter1,
				timeStamp: "12/05/2025 9:02:40 AM",
			});

			const schatThread2 = await chatThread2.save();

			const chatThread3 = new ChatThread({
				members: [sadopter3, sadopter1],
				lastMessage: sadopter3,
				timeStamp: "12/05/2025 9:05:05 AM",
			});

			const schatThread3 = await chatThread3.save();

			const chatThread4 = new ChatThread({
				members: [sadopter6, sadopter2],
				lastMessage: sadopter6,
				timeStamp: "12/05/2025 9:07:30 AM",
			});

			const schatThread4 = await chatThread4.save();

			const message1 = new Messages({
				chatThreadOrigin: schatThread1,
				sender: sadopter2,
				body: "Sending the final proposal draft.",
				timeStamp: "12/05/2025 9:30:00 AM",
			});

			const smessage1 = await message1.save();

			const message2 = new Messages({
				chatThreadOrigin: schatThread1,
				sender: sadopter1,
				body: "Got it. Here is the contract video summary.",
				media: { url: "https://drive.com/proposal_v5.pdf", type: "image" },
				timeStamp: "12/05/2025 9:30:00 AM",
			});

			const smessage2 = await message2.save();

			const message3 = new Messages({
				chatThreadOrigin: schatThread1,
				sender: sadopter2,
				body: "Look at this screenshot of the error log.",
				timeStamp: "12/05/2025 9:30:00 AM",
			});

			const smessage3 = await message3.save();

			const message4 = new Messages({
				chatThreadOrigin: schatThread2,
				sender: sadopter1,
				body: "Here's a photo of the design mockup.",
				media: { url: "https://drive.com/design_mockup.png", type: "image" },
				timeStamp: "12/05/2025 9:30:00 AM",
			});

			const smessage4 = await message4.save();

			const message5 = new Messages({
				chatThreadOrigin: schatThread2,
				sender: sadopter5,
				body: "Thanks for the update!",
				timeStamp: "12/05/2025 9:30:00 AM",
			});

			const smessage5 = await message5.save();

			const message6 = new Messages({
				chatThreadOrigin: schatThread3,
				sender: sadopter2,
				body: "Please review the attached video walkthrough.",
				timeStamp: "12/05/2025 9:30:00 AM",
			});

			const smessage6 = await message6.save();

			const message7 = new Messages({
				chatThreadOrigin: schatThread3,
				sender: sadopter3,
				body: "Will do. Thanks for sharing!",
				media: {
					url: "https://drive.com/walkthrough_video.mp4",
					type: "video",
				},
				timeStamp: "12/05/2025 9:30:00 AM",
			});

			const smessage7 = await message7.save();

			const message8 = new Messages({
				chatThreadOrigin: schatThread4,
				sender: sadopter2,
				body: "Here's the screenshot of the issue.",
				timeStamp: "12/05/2025 9:30:00 AM",
			});

			const smessage8 = await message8.save();

			const message9 = new Messages({
				chatThreadOrigin: schatThread4,
				sender: sadopter6,
				body: "Thanks! I'll check it out.",
				timeStamp: "12/05/2025 9:30:00 AM",
			});

			const smessage9 = await message9.save();

			const notification1 = new Notification({
				notifRecipient: sadopter2,
				body: "Your application has been approved.",
				isRead: true,
				timeStamp: "12/05/2025 9:10:00 AM",
				notifType: "Approved",
			});

			const snotification1 = await notification1.save();

			const notification2 = new Notification({
				notifRecipient: sadopter3,
				body: "Your application has been rejected.",
				isRead: false,
				timeStamp: "12/05/2025 9:15:30 AM",
				notifType: "Rejected",
			});

			const snotification2 = await notification2.save();

			const notification3 = new Notification({
				notifRecipient: sadopter4,
				body: "Your application is pending.",
				isRead: false,
				timeStamp: "12/05/2025 9:20:00 AM",
				notifType: "New Notification",
			});

			const snotification3 = await notification3.save();

			const notification4 = new Notification({
				notifRecipient: sadopter5,
				body: "Your application has been rejected.",
				isRead: true,
				timeStamp: "12/05/2025 8:25:45 AM",
				notifType: "Rejected",
			});

			const snotification4 = await notification4.save();

			const notification5 = new Notification({
				notifRecipient: sadopter6,
				body: "Your application has been approved.",
				isRead: true,
				timeStamp: "12/05/2025 9:25:00 AM",
				notifType: "Approved",
			});
			const snotification5 = await notification5.save();

			const notification6 = new Notification({
				notifRecipient: sadopter3,
				body: "Your application is pending.",
				isRead: false,
				timeStamp: "12/05/2025 9:30:30 AM",
				notifType: "New Notification",
			});

			const snotification6 = await notification6.save();

			const notification7 = new Notification({
				notifRecipient: sadopter1,
				body: "You have cancelled your application.",
				isRead: false,
				timeStamp: "12/05/2025 10:00:00 AM",
				notifType: "Cancelled",
			});

			const snotification7 = await notification7.save();

			const rating1 = new Rating({
				ratedUser: sadopter1,
				score: 5,
				reviewer: sadopter2,
				body: "They provided excellent follow-up photos and updates.",
				timestamp: "12/05/2025 9:00:00 AM",
			});

			const srating1 = await rating1.save();

			const rating2 = new Rating({
				ratedUser: sadopter1,
				score: 4,
				reviewer: sadopter5,
				body: "Great communication throughout the adoption process.",
				timestamp: "12/05/2025 9:05:00 AM",
			});

			const srating2 = await rating2.save();

			const rating3 = new Rating({
				ratedUser: sadopter1,
				score: 1,
				reviewer: sadopter3,
				body: "Did not respond to my messages after the adoption.",
				timestamp: "12/05/2025 9:10:00 AM",
			});
			const srating3 = await rating3.save();

			const rating4 = new Rating({
				ratedUser: sadopter6,
				score: 5,
				reviewer: sadopter1,
				body: "Provided regular updates and photos of the pet.",
				timestamp: "12/05/2025 9:15:00 AM",
			});

			const srating4 = await rating4.save();

			const rating5 = new Rating({
				ratedUser: sadopter1,
				score: 1,
				reviewer: sadopter6,
				body: "Was unresponsive and did not follow through with the adoption.",
				timestamp: "12/05/2025 9:20:00 AM",
			});

			const srating5 = await rating5.save();

			const rating6 = new Rating({
				ratedUser: sadopter5,
				score: 4,
				reviewer: sadopter3,
				body: "Good experience overall, but could improve on communication.",
				timestamp: "12/05/2025 9:25:00 AM",
			});

			const srating6 = await rating6.save();
			console.log("Database seeding completed.");
			mongoose.connection.close();
		})
		.catch((err) => {
			console.error("Error connecting to MongoDB:", err);
		});
};

module.exports = seed;
