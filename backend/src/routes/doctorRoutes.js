import express from "express";
import { uploadDoctorMetadataToIPFS, getDoctorMetadataFromIPFS,getAllDoctorsMetadataFromIPFS, getDoctorAccessibleFiles, getDoctorAccessibleFilesWithPatientInfo } from "../controller/doctorController.js";

const router = express.Router();

router.post("/doctormetadataupload", uploadDoctorMetadataToIPFS);   
router.get("/doctordetails/:docAddress", getDoctorMetadataFromIPFS);
router.get("/alldoctors", getAllDoctorsMetadataFromIPFS); 
router.get('/accessible-files/:doctorAddress', getDoctorAccessibleFiles);
router.get('/accessible-files-with-patient-info/:doctorAddress', getDoctorAccessibleFilesWithPatientInfo);

export default router;