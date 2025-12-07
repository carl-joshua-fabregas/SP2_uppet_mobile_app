const AdoptionApplication = require("../models/AdoptionApplication");

const createAdoptApp = async (req, res) => {
	try {
		const { petToAdopt, applicant, status, timestamp } = req.body;

		const adoptionApplication = new AdoptionApplication({
			petToAdopt: petToAdopt,
			applicant: applicant,
			status: status,
			timeStamp: timestamp,
		});

		const adoptStat = adoptionApplication.save();

		return res.status(200).json({
			message: "Successfully created Adoption Application",
			body: adoptStat,
		});
	} catch (err) {
		return res.status(500).json({
			message: "Server Error",
			body: err.message,
		});
	}
};

const findAllAdoptApp = async (req, res) => {
	try {
		const allApp = AdoptionApplication.find({});
		if (!allApp) {
			res.status(404).json({
				message: "Nothing Found",
			});
		}
		return res.status(200).json({
			message: "Successfully Obtained all Application",
			body: allApp,
		});
	} catch (err) {
		return res.status(500).json({
			message: "Server Error",
		});
	}
};

const findAdoptAppByID = async (req, res) => {
	try {
		const adoptApp = AdoptionApplication.find(req.params.id);
		if (!adoptApp) {
			return res.status(404).json({
				message: "Nothing Found",
			});
		}
		return res.status(200).json({
			messsage: "Succesfully found Adoption Application",
			body: adoptApp,
		});
	} catch (err) {
		return res.status(500).json({
			message: "Server Erro",
			body: err.message,
		});
	}
};

module.exports = {};
