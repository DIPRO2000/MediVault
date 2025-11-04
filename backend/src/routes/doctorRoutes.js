import express from "express";
import { uploadDoctorMetadataToIPFS, getDoctorMetadataFromIPFS,getAllDoctorsMetadataFromIPFS, getDoctorAccessibleFiles } from "../controller/doctorController.js";

const router = express.Router();

router.post("/doctormetadataupload", uploadDoctorMetadataToIPFS);   
router.get("/doctordetails/:docAddress", getDoctorMetadataFromIPFS);
router.get("/alldoctors", getAllDoctorsMetadataFromIPFS); 
router.get('/accessible-files/:doctorAddress', getDoctorAccessibleFiles);

export default router;