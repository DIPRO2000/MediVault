import express from "express";
import { uploadDoctorMetadataToIPFS, getDoctorMetadataFromIPFS,getAllDoctorsMetadataFromIPFS } from "../controller/doctorController.js";

const router = express.Router();

router.post("/doctormetadataupload", uploadDoctorMetadataToIPFS);   
router.get("/doctordetails/:docAddress", getDoctorMetadataFromIPFS);
router.get("/alldoctors", getAllDoctorsMetadataFromIPFS); 

export default router;