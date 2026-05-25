import { useState, useEffect } from "react";

function Timer({ timeout, onTimer, stop }) {
  const [seconds, setSeconds] = useState(timeout);
  useEffect(() => {
    if (stop) return;
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stop]);
  useEffect(() => {
    onTimer && onTimer(seconds);
  }, [seconds, onTimer]);
  return <>{seconds}</>;
}

export default Timer;
