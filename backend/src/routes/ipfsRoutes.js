import express from "express";
import upload from "../config/multer.js";
import { uploadToIPFS,getPatientFiles } from "../controller/ipfsController.js";

const router = express.Router();

router.post("/patientfileupload", upload.single("file"), uploadToIPFS);
router.get("/getpatientfiles/:address", getPatientFiles);

export default router;
