import express from "express";
import upload from "../config/multer.js";
import { uploadToIPFS,getPatientFiles,getPatientRegistryStats, getDoctorsWithFileAccess } from "../controller/ipfsController.js";

const router = express.Router();

router.post("/patientfileupload", upload.single("file"), uploadToIPFS);
router.get("/getpatientfiles/:address", getPatientFiles);
router.get("/patientregistrystats", getPatientRegistryStats);
router.get("/doctorswithfileaccess/:fileHash", getDoctorsWithFileAccess);

export default router; 
