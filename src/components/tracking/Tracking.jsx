import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Tracking.scss";

const Tracking = ({ children, size }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="tracking-container">
            <div className="header-sub">
            {Array.from({ length: size }, (_, i) => (
                <div className={`log-title-sub ${i === activeTab ? 'active' : ''}`} key={i} onClick={() => setActiveTab(i)}>
                    Log ({i+1}/{size})
                </div>
            ))}
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="tracking-content"
                >
                    {children[activeTab]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Tracking;