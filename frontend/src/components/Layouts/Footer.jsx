export default function Footer() {
  return (
    <footer className="bg-white border-t border-blue-100 text-center py-4 text-gray-500 text-sm">
      © {new Date().getFullYear()} MediVault. All rights reserved.
    </footer>
  );
}
