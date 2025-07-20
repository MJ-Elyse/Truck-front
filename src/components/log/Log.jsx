import { useState, useEffect } from "react";
import axios from 'axios';

import "./Log.scss";

const Eld = ({dataLogs, startDate, addDay}) => {
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYears] = useState("");
    const [name] = useState(() => sessionStorage.getItem("userName"));
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (startDate) {
            let parts = new Date(startDate);
            parts.setDate(parts.getDate() + Number(addDay))
            if (parts) {
                setYears(parts.getFullYear());
                setMonth((parts.getMonth() + 1));
                setDay(parts.getDate());
            }
        }
    }, [addDay, startDate]);
     
    const getData = () => {
        const data = dataLogs;
        let onduty = [];
        let offDuty = [];
        let sleeper = [];
        let driving = [];

        let accumulated_duration = 0;
        let begin_drive = null;
        let end_drive = null;
        for(let i=0; i < data.length; i++) {
            const type = data[i].type.includes("/") ? data[i].type.split("/")[0] : data[i].type;

            accumulated_duration += (data[i].duration_from_last_point) + (data[i-1]?.duration[0] ?? 0);

            const left = ((accumulated_duration * 2.7) / 3600);
            const end = ((accumulated_duration + data[i].duration[0]) * 2.7) / 3600;
            const width = (((data[i].duration[0]) * 2.7) / 3600);
            
            if(type === "on-duty") {
                onduty.push({left: `${left}rem`, width: `3px`, height: '2.7rem', bottom: '46%'});
                onduty.push({left: `${left}rem`, width: `3px`, height: '9rem'});
                onduty.push({text: `${data[i].label}`, left: `${(left - 2.6)}rem`, width: `7rem`, height: '1.5rem', top: '9rem', background: 'none', transform: 'rotate(90deg)'});
                onduty.push({bottom: '46%', left: `${left}rem`, height:"4.5px", width: `${width + 0.15}rem`});
                onduty.push({left: `${end}rem`, width: `3px`, height: '2.7rem', bottom: '46%'});
            }
            if(type === "off-duty") {
                offDuty.push({left: `${left}rem`, width: `3px`, height: '5.6rem'});
                offDuty.push({left: `${left}rem`, width: `3px`, height: '17rem'});
                offDuty.push({text: `${data[i].label}`, left: `${(left - 2.6)}rem`, width: `7rem`, height: '1.5rem', top: '17rem', background: 'none', transform: 'rotate(90deg)'});
                offDuty.push({left: `${left}rem`, width: `${width + 0.15}rem` , height: "4.5px"});
                offDuty.push({left: `${end}rem`, width: `3px`, height: '5.6rem'});
            }
            if(type === "sleeper") {
                sleeper.push({left: `${left}rem`, width: `3px`, height: '2.9rem'});
                sleeper.push({left: `${left}rem`, width: `3px`, height: '14rem'});
                sleeper.push({text: `${data[i].label}`, left: `${(left - 2.6)}rem`, width: `7rem`, height: '1.5rem', top: '14rem', background: 'none', transform: 'rotate(90deg)'});
                sleeper.push({left: `${left}rem`, width: `${width + 0.15}rem`, height: "4.5px"});
                sleeper.push({left: `${end}rem`, width: `3px`, height: '2.9rem'});
            }

            let left_d, widht_d = null;
            if(begin_drive === null) {
                begin_drive = accumulated_duration + data[i].duration[0];

            } else {
                end_drive = accumulated_duration;
                left_d = ((begin_drive * 2.7) / 3600);
                widht_d = (((end_drive - begin_drive) * 2.7) / 3600);

                driving.push({left: `${left_d}rem`, width: `${widht_d + 0.16}rem`, height: '4.5px'});
                begin_drive = end_drive + data[i].duration[0];
                end_drive = null;
            }
        }
        
        return {on: onduty, off: offDuty, s: sleeper, d: driving};
    }

    const getTotalHours = () => {
        const data = dataLogs;
        let accumulated_duration = 0;
        let begin_drive = null;
        let end_drive = null;

        let offDuty = 0;
        let onDuty = 0;
        let sleeper = 0;
        let driving = 0;

        for(let i=0; i < data.length; i++) {
            const type = data[i].type.includes("/") ? data[i].type.split("/")[0] : data[i].type;
            accumulated_duration += (data[i].duration_from_last_point) + (data[i-1]?.duration[0] ?? 0);
            
            if(type === "on-duty") {
                onDuty += data[i].duration[0];
            }
            if(type === "off-duty") {
                offDuty += data[i].duration[0];
            }
            if(type === "sleeper") {
                sleeper += data[i].duration[0];
            }

            if(begin_drive === null) {
                begin_drive = accumulated_duration + data[i].duration[0];

            } else {
                end_drive = accumulated_duration;
                driving += (end_drive - begin_drive);
                begin_drive = end_drive + data[i].duration[0];
                end_drive = null;
            }
        }

        return {on: onDuty, off: offDuty, s: sleeper, d: driving};
    }

    const getLocationName = async (lat, lon) => {
        try {
          const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
              lat,
              lon,
              format: 'json',
            },
            headers: {
              'Accept-Language': 'en'
            }
          });
          const address = response.data.address;
          return `${address.city || ""}, ${address.suburb || ""}, ${address.road || ""}`;
        } catch (error) {
          console.error("Erreur lors de la géolocalisation inversée :", error);
          return "Unknown location";
        }
    };

    useEffect(() => {
        const getLocationNameData = async () => {
            const pickupData = dataLogs.find(data => data.label === "pickup") || dataLogs[0];
            const dropoffData = dataLogs.find(data => data.label === "dropoff") || dataLogs[dataLogs.length - 1];
    
            const [pickupName, dropoffName] = await Promise.all([
                pickupData ? getLocationName(pickupData.lat, pickupData.lng) : null,
                dropoffData ? getLocationName(dropoffData.lat, dropoffData.lng) : null,
            ]);
    
            setLocations([pickupName, dropoffName]);
            setLoading(false);
        };
    
        getLocationNameData();
    }, [dataLogs]);
    

    return (
        <div className="log-container">
            <div className="header">
                <div className="title-container">
                    <div className="title">Drivers Daily Log</div>
                    <div className="cycle">(24 Hours)</div>
                </div>
                <div className="date-container">
                    <div className="date-part-container">
                        <div className="input"><input type="text" defaultValue={month}/></div>
                        <div className="label">(month)</div>
                    </div>
                    <div className="date-part-container">
                        <div className="input"><input type="text" defaultValue={day}/></div>
                        <div className="label">(day)</div>
                    </div>
                    <div className="date-part-container">
                        <div className="input"><input type="text" defaultValue={year}/></div>
                        <div className="label">(years)</div>
                    </div>
                </div>
                <div className="wording-container">
                    <div className="mention">Original - File home terminal.</div>
                    <div className="duplicate">Driver retains in his/her possession for 8 days</div>
                </div>
            </div>
            <div className="pickup-dropoff-container">
                <div className="location-container">
                    <div className="label">From:</div>
                    <div className="input">
                    {loading ? (
                                <div className="loader"></div>
                    ): (
                        <input type="text" defaultValue={locations[0]}/>
                    )}
                    </div>
                </div>
                <div className="location-container">
                    <div className="label">To:</div>
                    <div className="input">
                    {loading ? (
                                <div className="loader"></div>
                    ): (
                        <input type="text" defaultValue={locations[1]}/>
                    )}
                    </div>
                </div>
            </div>
            <div className="about-container">
                <div className="truck-milleage-container">
                    <div className="info-container">
                        <div className="input"><input type="text" /></div>
                        <div className="label">Total miles Driving Today</div>
                    </div>
                    <div className="info-container">
                        <div className="input"><input type="text" /></div>
                        <div className="label">Total mileage Today</div>
                    </div>
                    <div className="info-container">
                        <div className="input"><input type="text" /></div>
                        <div className="label">
                            Truck/Tractor and Trailer Number or <br />
                            License Plate(s)/States(show each unit)
                        </div>
                    </div>
                </div>
                <div className="personal-info-container">
                    <div className="personnal-info-content">
                        <div className="input"><input type="text" defaultValue={name}/></div>
                        <div className="label">Name of carrier or carriers</div>
                    </div>
                    <div className="personnal-info-content">
                        <div className="input"><input type="text" /></div>
                        <div className="label">Main Office Address</div>
                    </div>
                    <div className="personnal-info-content">
                        <div className="input"><input type="text" /></div>
                        <div className="label">Home Terminal Address</div>
                    </div>
                </div>
            </div>
            <div className="graph-container">
                <div className="graph-content">
                    <div className="graph-header">
                        <div className="label-none"></div>
                        <div className="line-header">
                        {Array.from({ length: 25 }, (_, i) => {
                            let text = i;
                            if(i > 12) {
                                text = i - 12;
                            }
                            
                            if (i === 0 || i === 24) {
                                text = 'Mid-night'
                            }
                            if(i===12) {
                                text='Noon';
                            }  
                            return (
                                <div key={i}>
                                    {text}
                                </div>
                            );  
                        })}
                            <div className="total">Total hours</div>    
                        </div>
                    </div>
                    <div className="line-content">
                        <div className="label">1. Off Duty</div>
                        <div className="body">
                        <div className="line">
                        {getData().off.map((data, i) => (
                            <div 
                                key={i}
                                className="line-part-data label"
                                style={data}
                            >
                                  {data.text}
                            </div>
                        ))}
                        </div>
                        {Array.from({ length: 24 }, (_, i) => (
                            <div className="hour" key={i}>
                                <div className="quarter1"></div>
                                <div className="mid"></div>
                                <div className="quarter2"></div>
                            </div>
                        ))}
                            <div className="total"><input type="text" value={(getTotalHours().off / 3600)}/></div>
                        </div>
                    </div>
                    <div className="line-content">
                        <div className="label">2. Sleeper Berth</div>
                        <div className="body">
                        <div className="line">
                        {getData().s.map((data, i) => (
                            <div 
                                key={i}
                                className="line-part-data label"
                                style={data}
                            >
                                {data.text}
                            </div>
                        ))}
                        </div>
                        {Array.from({ length: 24 }, (_, i) => (
                            <div className="hour" key={i}>
                                <div className="quarter1"></div>
                                <div className="mid"></div>
                                <div className="quarter2"></div>
                            </div>
                        ))}
                            <div className="total"><input type="text" value={(getTotalHours().s / 3600)}/></div>
                        </div>
                    </div>
                    <div className="line-content">
                        <div className="label">3. Driving</div>
                        <div className="body">
                        <div className="line">
                        {getData().d.map((data, i) => (
                            <div 
                                key={i}
                                className="line-part-data"
                                style={data}
                            ></div>
                        ))}
                        </div>
                        {Array.from({ length: 24 }, (_, i) => (
                            <div className="hour" key={i}>
                                <div className="quarter1"></div>
                                <div className="mid"></div>
                                <div className="quarter2"></div>
                            </div>
                        ))}
                            <div className="total"><input type="text" value={(getTotalHours().d / 3600)}/></div>
                        </div>
                    </div>
                    <div className="line-content">
                        <div className="label">4. On Duty</div>
                        <div className="body">
                        <div className="line">
                        {getData().on.map((data, i) => (
                            <div 
                                key={i}
                                className="line-part-data label"
                                style={data}
                            >
                                {data.text}
                            </div>
                        ))}
                        </div>
                        {Array.from({ length: 24 }, (_, i) => (
                            <div className="hour" key={i}>
                                <div className="quarter1"></div>
                                <div className="mid"></div>
                                <div className="quarter2"></div>
                            </div>
                        ))}
                            <div className="total"><input type="text" value={(getTotalHours().on / 3600)}/></div>
                        </div>
                    </div>
                    <div className="total-hours">
                        <input type="text" value={((getTotalHours().off + getTotalHours().on + getTotalHours().s + getTotalHours().d) / 3600)}/>
                    </div>
                </div>
            </div>
            <div className="remarks-container">
                <div className="remakrs-content">
                    <div className="names title">Remarks</div>
                    <div className="names docs">Shipping Documents:</div>
                    <div className="names manifest">DVL or Manifest No. or:</div>
                    <div className="names shipper">Shipper & Commodity:</div>
                    <div className="description">
                        Enter name of place you reported and where released from work and when and where each change og duty occured <br/>
                        Use Time standart of home terminal    
                    </div>
                </div>
            </div>
            <div className="infos-container">
                <div className="infos-content">
                    <div className="col recap">
                        <div className="top">
                            Recap:
                            Complete at <br/>
                            end of duty
                        </div>
                        <div className="info bottom"></div>
                    </div>
                    <div className="col infos">
                        <div className="line top"></div>
                        <div className="info bottom">
                            On duty hours. Total times 3 & 4
                        </div>
                    </div>
                    <div className="col cycle">
                        <div className="top">
                            70 Hour/ 8 Day Drivers
                        </div>
                        <div className="info bottom"></div>
                    </div>
                    <div className="col infos">
                        <div className="line top">
                            A.
                        </div>
                        <div className="info bottom">
                            A. Total hours on duty last 7 days including today
                        </div>
                    </div>
                    <div className="col infos">
                        <div className="line top">
                            B.
                        </div>
                        <div className="info bottom">
                            B. Total hours avalaible tomorrow 70hr minus A*
                        </div>
                    </div>
                    <div className="col infos">
                        <div className="line top">
                            C.
                        </div>
                        <div className="info bottom">
                            C. Total hours on duty last 5 days including today
                        </div>
                    </div>
                    <div className="col cycle">
                        <div className="top">
                            60 Hour / 7 Day Drivers
                        </div>
                        <div className="info bottom"></div>
                    </div>
                    <div className="col infos">
                        <div className="line top">
                            A.
                        </div>
                        <div className="info bottom">
                            A. Total hours on duty last 7 days including today
                        </div>
                    </div>
                    <div className="col infos">
                        <div className="line top">
                            B.
                        </div>
                        <div className="info bottom">
                            B. Total hours avalaible tomorrow 60hr minus A*
                        </div>
                    </div>
                    <div className="col infos">
                        <div className="line top">
                            C.
                        </div>
                        <div className="info bottom">
                            C. Total hours on duty last 5 days including today
                        </div>
                    </div>
                    <div className="reset">
                        <p>
                            * If you took 34 consecutive hours off duty have 60/70 hours avalaible
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Eld;