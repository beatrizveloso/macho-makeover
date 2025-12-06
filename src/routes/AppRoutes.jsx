import { BrowserRouter, Route, Routes } from "react-router-dom";
import Homepage from "../pages/homepage/Homepage"; 
import Carrossel from "../pages/carrossel/Carrossel"; 
import Personalizar from "../pages/personalizar/Personalizar"; 

const AppRoutes = () => { 
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/carrossel" element={<Carrossel/>} />
        <Route path="/personalizar" element={<Personalizar />} />

        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
