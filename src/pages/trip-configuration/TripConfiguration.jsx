import { useState, useEffect } from "react";
import Nav from "../../components/nav/Nav";
import Log from "../../components/log/Log";
import { MapPin, Save, DraftingCompass, RotateCcw } from "lucide-react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import LeafletRoutingMachine from "../../components/leaflet-routing-machine/LeafletRoutingMachine";
import Tracking from "../../components/tracking/Tracking";
import api from "../../services/api";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import "./TripConfiguration.scss";

const TripConfiguration = () => {
    const [type, setType] = useState("current");
    const [dataLogs, setDataLogs] = useState([]);
    const [plannedStartDate, setPlannedStartDate] = useState('');
    const [currentCycleUsed, setCurrentCycleUsed] = useState(0)
    const [result, setResult] = useState({});
    const [compute, setCompute] = useState(false);

    const saveAll = () => {
        const bodyData = {
            data: result,
            date: plannedStartDate
        };
        
        api.post('api/trip', bodyData)
        .then((response) => {
            console.log(response.data);
            
        })
        .catch((err)=> {
            alert(err)
        })
    }

    const handleClick = (type) => {
        setType(type);
    }

    useEffect(()=> {
        if (Object.keys(result).length > 0 && compute) {
            setCompute(true);
        }else {
            setCompute(false);
        }
    }, [result, compute]);

    useEffect(()=> {
        if (Object.keys(result).length > 0) {
            setCompute(true);
        }else {
            setCompute(false);
        }    
    }, [result]);

    useEffect(() => {
        if(!sessionStorage.getItem('accessToken')) {
            window.location.replace("/login");
        }
    }, [])
    
    return (
        <>
        <div className="trip-configuration-container">
            <Nav />
            <div className="trip-configuration-content">
                <div className="title">Trip Configuration and <span>ELD Log Visualization App</span></div>
                <div className="action-container">
                    <div className="map-point-marker">
                        <Button
                            className={`action ${type === "current" ? "fill" : ""}`}
                            onClick={() => handleClick("current")}
                            startIcon={<MapPin />}
                            variant="contained"
                            color=""
                            >
                            Current
                        </Button>
                        <Button
                            className={`action ${type === "pickup" ? "fill" : ""}`}
                            onClick={() => handleClick("pickup")}
                            startIcon={<MapPin />}
                            variant="contained"
                            color=""
                            >
                            Pick-up
                        </Button>
                        <Button
                            className={`action ${type === "dropoff" ? "fill" : ""}`}
                            onClick={() => handleClick("dropoff")}
                            startIcon={<MapPin />}
                            variant="contained"
                            color=""
                            >
                            Dropoff
                        </Button>
                    </div>
                    <div className="planned-start-date">
                        <TextField
                            label="Current Cycle Used (70h/8d)"
                            type="number"
                            value={currentCycleUsed}
                            onChange={(e) => setCurrentCycleUsed(e.target.value)}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                        />
                        <TextField
                            label="Planned Start Date"
                            type="datetime-local"
                            value={plannedStartDate}
                            onChange={(e) => setPlannedStartDate(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                        />
                    </div>
                    <div className="computes-btn">
                        {!compute ? (
                        <Button
                            className="compute"
                            onClick={() => setCompute(true)}
                            startIcon={<DraftingCompass />}
                            variant="contained"
                            sx={{
                                backgroundColor: '#12A594',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#0f8c82',
                                },
                            }}
                        >
                            Compute
                        </Button>
                        ) : (
                        <Button
                            className="compute"
                            onClick={() => window.location.reload()}
                            startIcon={<RotateCcw />}
                            sx={{
                                backgroundColor: '#12A594',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#0f8c82',
                                },
                            }}
                        >
                            Reset
                        </Button>
                        // <Button
                        //     className="compute"
                        //     onClick={saveAll}
                        //     startIcon={<Save />}
                        //     variant="contained"
                        //     sx={{
                        //     backgroundColor: '#12A594',
                        //     color: 'white',
                        //     '&:hover': {
                        //         backgroundColor: '#0f8c82',
                        //     },
                        //     }}
                        // >
                        //     Save
                        // </Button>
                        )}
                    </div>
                </div>
                <div className="map">
                    <MapContainer
                        center={[48.8566, 2.3522]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LeafletRoutingMachine 
                            type={type} 
                            setData={setDataLogs} 
                            setResult={setResult} 
                            compute={compute}
                            plannedStartDate={plannedStartDate}
                            currentCycleUsed={currentCycleUsed}/>
                    </MapContainer>
                </div>
            </div>
            <div className="log-trip-container">
                <div className="log-trip-config">
                    <Tracking size={dataLogs.length}>
                        {dataLogs.length > 0 && dataLogs.map((data, index) => (
                            <Log 
                                key={index} 
                                dataLogs={data} 
                                startDate={plannedStartDate} 
                                addDay={index}
                            />
                        ))}
                    </Tracking>
                </div>
            </div>
        </div>
        </>
    );
};

export default TripConfiguration;
