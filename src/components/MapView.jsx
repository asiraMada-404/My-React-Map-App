import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { GeoJSON as ReactGeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function GeoJSONLayer({ data }) {
  const map = useMap();

  React.useEffect(() => {
    if (data) {
      // Create a Leaflet layer to get bounds
      const leafletLayer = L.geoJSON(data);
      map.fitBounds(leafletLayer.getBounds());
    }
  }, [data, map]);

  return (
    <ReactGeoJSON
      data={data}
      style={{ color: "blue", weight: 2 }}
      onEachFeature={(feature, layer) => {
        // Try to find a property key that looks like a name
        const nameKey = Object.keys(feature.properties || {}).find(
          k => k.toLowerCase().includes("name")
        );
        if (nameKey) {
          layer.bindPopup(`<b>${feature.properties[nameKey]}</b>`);
        }
        }
    }  
    />
  );
}

export default function MapView() {
    const [geoData, setGeoData] = useState(null);
    const [key, setKey] = useState(0); // Add a key to force remount

    useEffect(() => {
        fetch("/data")
            .then((res) => res.json())
            .then((data) => {
                setGeoData(data);
                setKey(prev => prev + 1); // Increment key to remount MapContainer
            });
    }, []);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // If the file is a URL (text file with a URL), fetch from URL
        if (file.type === "text/plain" || file.name.endsWith(".txt")) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const url = e.target.result.trim();
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error("Network response was not ok");
                    const json = await res.json();
                    setGeoData(json);
                    setKey(prev => prev + 1); // Remount map
                } catch {
                    alert("Failed to fetch GeoJSON from URL");
                }
            };
            reader.readAsText(file);
            return;
        }

        // Otherwise, treat as local GeoJSON file
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                setGeoData(json);
                setKey(prev => prev + 1); // Remount map
            } catch {
                alert("Invalid GeoJSON file");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div style={{ height: "100vh", width: "100%" }}>
            {/* Create the upload geojson input*/}
            <div
                style={{
                    position: "absolute",
                    right: "5%",
                    zIndex: 1000,
                    background: "white",
                    padding: "8px",
                    borderRadius: "8px",
                    margin: "10px",
                    color:"GrayText"
                }}
            >
                <input
                    type="file"
                    accept=".geojson,.json,.txt"
                    onChange={handleFileUpload}
                    title="Upload GeoJSON file or a .txt file containing a GeoJSON URL"
                />
                <div style={{ fontSize: 12, marginTop: 4 }}>
                    Upload your GeoJSON file 🌎
                </div>
            </div>

            <MapContainer
                key={key}
                center={[37, 22]}
                zoom={2}
                style={{ height: "100%", width: "100%"}}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />
                {geoData && <GeoJSONLayer data={geoData} />}
            </MapContainer>
        </div>
    );
}
