import { Outlet } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import QuickViewModal from "../components/QuickViewModal";
import Toasts from "../components/Toasts";

export default function MainLayout() {
  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-[60vh]">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <QuickViewModal />
      <Toasts />
    </div>
  );
}
