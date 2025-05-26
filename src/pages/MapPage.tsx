import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import { useStores } from "../stores/useStores";
import { SpotRead } from "../stores/SpotsStore";
import "leaflet/dist/leaflet.css";
import { observer } from "mobx-react-lite";
import { FloatingBottomBar } from "../components/BottomBar/FloatingBottomBar";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const SetViewOnChange = ({
  center,
  zoom,
}: {
  center: LatLngExpression;
  zoom: number;
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapPage = observer(() => {
  const defaultPosition: LatLngExpression = [55.751244, 37.618423]; // Москва
  const { authStore, spotsStore } = useStores();

  const [position, setPosition] = useState<LatLngExpression>(defaultPosition);
  const [activeUserMarkerPopup, setActiveUserMarkerPopup] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Для новых запросов:
  const [radiusKm, setRadiusKm] = useState(5);
  const [spotsInRadius, setSpotsInRadius] = useState<SpotRead[]>([]);
  const [nearestSpot, setNearestSpot] = useState<SpotRead | null>(null);
  const [loadingRadius, setLoadingRadius] = useState(false);
  const [loadingNearest, setLoadingNearest] = useState(false);

  const baseURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!navigator.geolocation) return;

    // Отслеживаем позицию пользователя
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos: LatLngExpression = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition(newPos);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setPosition(defaultPosition);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      },
    );

    // Загружаем все споты
    spotsStore.fetchSpots();

    return () => navigator.geolocation.clearWatch(watchId);
  }, [spotsStore]);

  // Функция запроса спотов в радиусе
  const fetchSpotsWithinRadius = async () => {
    setLoadingRadius(true);
    setSpotsInRadius([]);
    setNearestSpot(null); // сброс ближайшего

    try {
      const response = await fetch(
        `${baseURL}/points_within_radius?lat=${
          (position as [number, number])[0]
        }&lon=${(position as [number, number])[1]}&radius=${radiusKm}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authStore.access_token}`,
          },
        },
      );
      if (!response.ok) throw new Error("Ошибка запроса спотов в радиусе");
      const data: SpotRead[] = await response.json();
      setSpotsInRadius(data);
    } catch (error) {
      console.error(error);
      alert("Не удалось загрузить споты в радиусе");
    } finally {
      setLoadingRadius(false);
    }
  };

  // Функция запроса ближайшего спота
  const fetchNearestSpot = async () => {
    setLoadingNearest(true);
    setNearestSpot(null);
    setSpotsInRadius([]); // сброс списка спотов в радиусе

    try {
      const response = await fetch(
        `${baseURL}/nearest?lat=${(position as [number, number])[0]}&lon=${
          (position as [number, number])[1]
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authStore.access_token}`,
          },
        },
      );
      if (!response.ok) throw new Error("Ошибка запроса ближайшего спота");
      const data: SpotRead = await response.json();
      setNearestSpot(data);
    } catch (error) {
      console.error(error);
      alert("Не удалось загрузить ближайший спот");
    } finally {
      setLoadingNearest(false);
    }
  };

  return (
    <div className="relative h-screen w-screen bg-gradient-to-br bg-gray-900/95 p-2">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className="relative z-10 h-[97vh] rounded-xl overflow-hidden shadow-xl border border-gray-300 flex flex-col">
        {/* <div className="p-2 bg-white flex items-center space-x-2 border-b border-gray-300">
          <label>
            Радиус (км):
            <input
              type="number"
              min={1}
              max={100}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="ml-2 w-20 px-1 border rounded"
              disabled={loadingRadius || loadingNearest}
            />
          </label>
          <button
            onClick={fetchSpotsWithinRadius}
            disabled={loadingRadius || loadingNearest}
            className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loadingRadius ? "Загрузка..." : "Загрузить споты в радиусе"}
          </button>

          <button
            onClick={fetchNearestSpot}
            disabled={loadingNearest || loadingRadius}
            className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
          >
            {loadingNearest ? "Загрузка..." : "Найти ближайший спот"}
          </button>
        </div> */}

        <MapContainer center={position} zoom={15} className="flex-grow">
          <SetViewOnChange center={position} zoom={15} />
          <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
          <div className="absolute top-2 right-2 z-[1000]">
            <span className="text-xl font-barlow  text-white px-3 py-1  watermark">
              Spottier
            </span>
          </div>
          {/* Маркер пользователя */}
          <Marker position={position}>
            {activeUserMarkerPopup && (
              <Popup onClose={() => setActiveUserMarkerPopup(false)}>
                <div className="text-sm text-gray-700">
                  📍 Ваше местоположение <br />
                  <strong>Lat:</strong>{" "}
                  {(position as [number, number])[0].toFixed(5)} <br />
                  <strong>Lng:</strong>{" "}
                  {(position as [number, number])[1].toFixed(5)}
                </div>
              </Popup>
            )}
          </Marker>

          {/* Все споты из spotsStore */}
          {spotsStore.spots.map((spot) => (
            <Marker key={spot.id} position={[spot.lat, spot.lon]}>
              <Popup>
                <div>
                  <strong>{spot.name}</strong>
                  <br />
                  {spot.desc}
                  <br />
                  <em>{spot.country}</em>
                  {spot.sport_type && <div>Тип спорта: {spot.sport_type}</div>}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Споты в радиусе */}
          {spotsInRadius.map((spot) => (
            <Marker
              key={"radius_" + spot.id}
              position={[spot.lat, spot.lon]}
              icon={
                new L.Icon({
                  iconUrl:
                    "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowUrl:
                    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                  shadowSize: [41, 41],
                })
              }
            >
              <Popup>
                <div>
                  <strong>{spot.name}</strong>
                  <br />
                  {spot.desc}
                  <br />
                  <em>{spot.country}</em>
                  {spot.sport_type && <div>Тип спорта: {spot.sport_type}</div>}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Ближайший спот */}
          {nearestSpot && (
            <Marker
              position={[nearestSpot.lat, nearestSpot.lon]}
              icon={
                new L.Icon({
                  iconUrl:
                    "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  iconSize: [30, 50],
                  iconAnchor: [15, 50],
                  popupAnchor: [1, -34],
                  shadowUrl:
                    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                  shadowSize: [41, 41],
                })
              }
            >
              <Popup>
                <div>
                  <strong>{nearestSpot.name}</strong> (Ближайший спот)
                  <br />
                  {nearestSpot.desc}
                  <br />
                  <em>{nearestSpot.country}</em>
                  {nearestSpot.sport_type && (
                    <div>Тип спорта: {nearestSpot.sport_type}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      <FloatingBottomBar />
    </div>
  );
});
