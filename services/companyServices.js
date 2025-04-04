import CompanyModel from "../models/company.js";

async function createCompany({ companyName, email, password, location }) {
  try {
    if (!companyName || !email || !password || !location) {
      throw new Error("Missing input parameters");
    }

    const existing = await CompanyModel.findOne({ email });
    if (existing) {
      throw new Error("Company with this email already exists");
    }

    const newCompany = new CompanyModel({
      companyName,
      email,
      password,
      location,
    });

    await newCompany.save();
    return newCompany;
  } catch (err) {
    throw new Error(err.message);
  }
}

export default createCompany;
