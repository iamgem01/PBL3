import PropTypes from "prop-types";
import React from "react";
import { useReducer } from "react";
import "./style.css";

export const Component = ({ property1, className }) => {
    const [state, dispatch] = useReducer(reducer, {
        property1: property1 || "frame-86",
    });

    return (
        <div
            className={`component ${state.property1} ${className}`}
            onClick={() => {
                dispatch("click");
            }}
        >
            <div className="ellipse" />

            <div className="div" />

            <div className="ellipse-2" />
        </div>
    );
};

function reducer(state, action) {
    switch (action) {
        case "click":
            return {
                ...state,
                property1: "frame-91",
            };
    }

    return state;
}

Component.propTypes = {
    property1: PropTypes.oneOf([
        "variant-5",
        "frame-86",
        "frame-93",
        "frame-91",
        "frame-92",
    ]),
};
