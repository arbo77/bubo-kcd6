import React from "react";
import { useStore } from "./utils/store";

export const Other = () => {
  const [store] = useStore("second");
  return (
    <div>
      {"ErNanana"}
      {Object.entries(store).map((el, idx) => (
        <div key={idx}>
          {el[0]}: {JSON.stringify(el[1])}
        </div>
      ))}
    </div>
  );
};
