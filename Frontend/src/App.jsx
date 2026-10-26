import { BrowserRouter } from "react-router-dom";
import { ShopProvider } from "./context/ShopContext";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ShopProvider>
            <AppRoutes />
          </ShopProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
