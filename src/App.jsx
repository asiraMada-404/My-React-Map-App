import React from "react";
import MapView from "./components/MapView";
import "./App.css";
import Footer from "./components/Footer"
import Header from "./components/Header"

export default function App() {
  return (
  <div> 
  <Header/>
  <MapView />
  <Footer />
  </div>
  );
}
