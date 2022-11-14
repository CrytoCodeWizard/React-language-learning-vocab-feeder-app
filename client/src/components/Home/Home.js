import React from "react";
import "./../../App.css";
import WindmillSVG from "./../../windmill.svg";

const Home = (props) => {
    return (
        <div className="Windmill-Icon">
            <img src={WindmillSVG} alt="Windmill SVG" />
        </div>
    );
}

export default Home;