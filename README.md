## 🛡️ MedVault: Decentralized Healthcare Records

**MedVault** is a next-generation **Electronic Healthcare Record (EHR) platform** designed to return data sovereignty to patients. By combining Ethereum Blockchain for access control and IPFS for decentralized storage, MedVault ensures that medical records are immutable, secure, and accessible only by authorized personnel.

---

## 🚀 Key Features

* **Patient-Centric Permissions**: Built using Solidity smart contracts to manage on-chain access, allowing patients to selectively grant or revoke report access to doctors.

* **Immutable Records**: Utilizes blockchain to store document hashes (IPFS CIDs), ensuring that medical history remains tamper-proof and verifiable.

* **Decentralized Storage**: Designed off-chain storage workflows using Pinata (IPFS) to facilitate the private and secure sharing of large medical files.

* **Cross-Environment Compatibility**: Integrated logic to automatically detect and switch between Local (Ganache) and Production (Sepolia) networks.

* **Role-Based Dashboards**: Specialized portals for Patients, Doctors, and Admins to streamline medical data orchestration.

---

## 🛠️ Technical Stack
* **Frontend**: React.js, Tailwind CSS, Lucide Icons, Shadcn/UI

* **Backend**: Node.js, Express.js, MongoDB

* **Blockchain**: Solidity, Truffle, Ethers.js

* **Network**: Sepolia Testnet (Production), Ganache (Local)

* **Storage**: IPFS (via Pinata)

* **Deployment**: Vercel (Frontend), Render (Backend)

---

## 🏗️ System Architecture

1. **Encryption & Upload**: Documents are uploaded through the React frontend and sent to IPFS.

2. **On-Chain Mapping**: The resulting IPFS Hash (CID) is stored on the Ethereum blockchain via a Smart Contract.

3. **Access Logic**: When a doctor requests a record, the Smart Contract verifies if the patient has granted permission to that specific wallet address.

4. **Verification**: If authorized, the backend fetches the file from IPFS and serves it to the verified doctor.

---

## 💻 Getting Started

**Prerequisites**

* Node.js (v18+)
* MetaMask Extension
* Truffle Suite

**Installation**
1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/MedVault.git
cd MedVault
```

2. **Setup Smart Contracts**
```bash
cd blockchain
npm install
# For local deployment
truffle migrate --network development
# For Sepolia deployment
npx truffle migrate --network sepolia
```

3. **Setup Backend**
```bash
cd ../backend
npm install
# Create a .env file and add your MONGO_URI, INFURA_ID, and CONTRACT_ADDRESS
npm start
```

4. **Setup Frontend**
```bash
cd ../frontend
npm install
# Create a .env.production or .env.development
npm run dev
```

---

## 🔒 Environment Variables
To run this project, you will need to add the following environment variables to your .env files:

**Frontend (.env):**
```
VITE_PATIENT_REGISTRY_ADDRESS=contract address
VITE_ACCESS_CONTROL_ADDRESS=contract address
VITE_DOCTOR_REGISTRY_ADDRESS=contract address
VITE_MEDICAL_RECORD_ADDRESS=contract address

VITE_BACKEND_URL=http://localhost:3000 (for local development)

#For Ganache / Localhost
VITE_REACT_APP_CHAIN_ID="0x539" # 1337 in hexadecimal
VITE_REACT_APP_CHAIN_NAME="Ganache / Localhost"

#For Sepolia Testnet
VITE_REACT_APP_CHAIN_ID="0xaa36a7" # 11155111 in hexadecimal
VITE_REACT_APP_CHAIN_NAME="Sepolia Testnet"
```

**Blockchain (.env):**
```
MNEMONIC="your secret phrase"
INFURA_PROJECT_ID="your_infura_key"
```

**Backend(.env):**
```
PORT=3000

PINATA_API_KEY=pinata_api_key
PINATA_SECRET_API_KEY=pinata_secret

PATIENT_REGISTRY_ADDRESS=contract address
ACCESS_CONTROL_ADDRESS=contract address
DOCTOR_REGISTRY_ADDRESS=contract address
MEDICAL_RECORD_ADDRESS=contract address

RPC_URL=HTTP://127.0.0.1:7545 (for production use Infura RPC link)
```

---

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Developed with ❤️ by Diprajit Chakraborty
