import Landing from "./components/Landing.tsx";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import Dashboard from "./components/Dashboard.tsx";
import Songs from "./components/Songs.tsx";
import Ragas from "./components/Ragas.tsx";
import Talas from "./components/Talas.tsx";
import ForgotPassword from "./components/ForgotPassword.tsx";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const clientId = "229558906483-n6m3e5p674mrfb4nes68nvu1faeli1gq.apps.googleusercontent.com";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>

        <Route path="/dashboard/:id" element={<Dashboard />}></Route>
        <Route path="/songs/:id" element={<Songs />}></Route>
        <Route path="/ragas/:id" element={<Ragas />}></Route>
        <Route path="/talas/:id" element={<Talas />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
