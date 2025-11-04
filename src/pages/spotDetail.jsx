import React, { useEffect, useState } from "react";
import useSpotStore from "../store/spotStore";
const SpotDetail = () => {
    const { getSpot, loading, error } = useSpotStore();
    const [spot, setSpot] = useState([]);

    useEffect(() => {
        setSpot(getSpot(1));
    }, []);

  return (
    <div className="bg-red-100">
        {loading && <p>Loading...</p>}
        <div>
            <span>{spot.name}</span>
            <span>{spot.address}</span>
            <span>{spot.description}</span>
        </div>
        <div>
            {}
        </div>
    </div>
  );
};

export default SpotDetail;