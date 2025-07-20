import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useMap } from "react-leaflet";
import api from "../../services/api";
import "./RouteMachineLoader.css";
import { split_data_per_24_hours } from "../../utils/DataSpliter";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LeafletRoutingMachine = ({ type, setData, setResult, compute, plannedStartDate, currentCycleUsed }) => {
  const map = useMap();
  const [current, setCurrent] = useState([null, null]);
  const [pickup, setPickup] = useState([null, null]);
  const [dropoff, setDropoff] = useState([null, null]);
  const [currentMarker, setCurrentMarker] = useState(null)
  const [pickupMarker, setPickupMarker] = useState(null);
  const [dropoffMarker, setDropoffMarker] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);
  const [computed, setComputed] = useState(false);

  const [loading, setLoading] = useState(false);

  
  const initMarker = () => {
    if (currentMarker && map) map.removeLayer(currentMarker);
    if (pickupMarker && map) map.removeLayer(pickupMarker);
    if (dropoffMarker && map) map.removeLayer(dropoffMarker);
  };

  useEffect(() => {
    const markerTypes = {
      current: {
        stateSetter: setCurrent,
        markerSetter: setCurrentMarker,
        marker: currentMarker,
        label: "Current",
      },
      pickup: {
        stateSetter: setPickup,
        markerSetter: setPickupMarker,
        marker: pickupMarker,
        label: "Pickup",
      },
      dropoff: {
        stateSetter: setDropoff,
        markerSetter: setDropoffMarker,
        marker: dropoffMarker,
        label: "Dropoff",
      },
    };

    if(!compute) {
      const onMapClick = (e) => {
        if (!markerTypes[type]) return;
    
        const { stateSetter, markerSetter, marker, label } = markerTypes[type];
    
        if (marker) {
          map.removeLayer(marker);
        }
    
        const newMarker = L.marker([e.latlng.lat, e.latlng.lng])
          .addTo(map)
          .bindTooltip(label, { permanent: true, direction: "top" });
    
        stateSetter([e.latlng.lat, e.latlng.lng]);
        markerSetter(newMarker);
      };
    
      map.on("click", onMapClick);
    
      return () => {
        map.off("click", onMapClick);
      };
    }
  }, [type, map, currentMarker, pickupMarker, dropoffMarker, compute]);
  
  useEffect(() => {
    if(compute) {
        if (current[0] == null || pickup[0] == null || dropoff[0] == null || !plannedStartDate) {
          toast.error("All data must be loaded");
        }  
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compute])

  useEffect(() => {
    if(computed) {
      return;
    }
    if (current[0] !== null && pickup[0] !== null && dropoff[0] !== null && plannedStartDate && compute) {
      initMarker();

      if (routingControl) {
        try {
          map.removeControl(routingControl);
          setRoutingControl(null);
        } catch (ignored) {}
      }
      setLoading(true);
      
      api.get("api/trip/addpoint", {
        params: {
          current_lat: current[0], 
          current_lng: current[1],
          pickup_lat: pickup[0],
          pickup_lng: pickup[1],
          dropoff_lat: dropoff[0],
          dropoff_lng: dropoff[1],
          plannedStartDate: plannedStartDate.replace("T", " ") +":00"
        }
      }).then ((response) => {
        setLoading(false);
        const data = response.data;
        console.log(data);
        setResult(data)
        setData(split_data_per_24_hours(data.waypoints, plannedStartDate));
        
        const waypoints = response.data.waypoints.map(point => L.latLng(point.lat, point.lng));
        response.data.waypoints.map((point) => {
          L.marker([point.lat, point.lng])
          .addTo(map)
          .bindTooltip(point.label, { permanent: true, direction: "top" });
        });
        
        const newRoutingControl = L.Routing.control({
          waypoints: waypoints,
          lineOptions: {
            styles: [{ color: "blue", weight: 5, opacity: 0.7 }],
          },
          router: L.Routing.osrmv1({
            serviceUrl: "https://router.project-osrm.org/route/v1",
            profile: "car",
            alternatives: false,
          }),
          routeWhileDragging: false,
          geocoder: L.Control.Geocoder.nominatim(),
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
          showAlternatives: false,
        }).addTo(map);

        setRoutingControl(newRoutingControl);
        setComputed(true);
      }).catch((error) => {
        setLoading(false);
        alert(error)
        console.log(error);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, pickup, dropoff, plannedStartDate, compute]);

  return (
    <>
    <ToastContainer position="top-right" autoClose={3000} />
    {loading && (
      <div className="overlay">
        <div className="spin"> </div>
      </div>
    )}
  </>
  );
  
};

let DefaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconSize: [20, 20],
  iconAnchor: [0, 0],
  popupAnchor: [2, -40],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default LeafletRoutingMachine;
