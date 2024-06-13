import { Route, Routes } from "react-router-dom";
import React from "react";
import HomePage from './pages/HomePage';
import TrainingGamePage from './pages/gamePages/TrainingGamePage';
import SinglePlayerGamePage from './pages/gamePages/SinglePlayerGamePage';
import WorkInProgPage from "./pages/WorkInProgPage";
import LoginPage from "./pages/LoginPage";
import NoLoginPage from "./pages/NoLoginPage";
import MultiPlayerGamePage from "./pages/gamePages/MultiPlayerGamePage.jsx"
import LocalGamePage from "./pages/gamePages/LocalGamePage";
import PeriodicalGamePage from "./pages/gamePages/PeriodicalGamePage.jsx";
import RandomMultiGamePage from "./pages/gamePages/RandomMultiGamePage.jsx";

export default function App() {
    return (
        <Routes>
            <Route path={"/"}>
                <Route index element={<LoginPage/>}/>
                <Route path={"home"}>
                    <Route index element={<HomePage/>}/>
                    <Route path={"trainingGame"} element={<TrainingGamePage/>}/>
                    <Route path={"singlePlayerGame"} element={<SinglePlayerGamePage/>}/>
                    <Route path={"dailyGame"} element={<PeriodicalGamePage/>}/>
                    <Route path={"localGame"} element={<LocalGamePage/>}/>
                    <Route path={"multiPlayerGame/*"} element={<MultiPlayerGamePage/>}/>
                    <Route path={"randomMultiPlayer/*"} element={<RandomMultiGamePage/>}/>
                </Route>
                <Route path={"home_no"}>
                    <Route index element={<NoLoginPage/>}/>
                    <Route path={"trainingGame"} element={<TrainingGamePage/>}/>
                    <Route path={"singlePlayerGame"} element={<SinglePlayerGamePage/>}/>
                    <Route path={"localGame"} element={<LocalGamePage/>}/>
                </Route>
                <Route path={"/work_in_progress"} element={<WorkInProgPage/>}/>
            </Route>
        </Routes>
    );
}