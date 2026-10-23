import { placeholder } from "./placeholder";

// Company details required for a UK limited company: shown in the footer and,
// from Phase 2, on the legal page. Replace every placeholder before deploying.
export const company = {
  name: placeholder("registered company name"),
  number: placeholder("company number"),
  registeredIn: placeholder("England and Wales / Scotland / Northern Ireland"),
  registeredOffice: placeholder("registered office address"),
  contact: placeholder("contact method"),
};
