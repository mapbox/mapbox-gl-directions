import { createStore } from "zustand/vanilla";
import utils, { type Point, type Coordinates } from "../utils/index.js";

export interface MapDirectionsState {
  origin: Point | "";
}

export const store = createStore<MapDirectionsState>()((set) => ({
  origin: "",
  createOrigin: (coords: Coordinates) => {
    const validCoords = utils.validCoords(coords)
      ? coords
      : coords.map(utils.wrap);

    if (isNaN(validCoords[0]) && isNaN(validCoords[1])) {
      // return dispatch(setError(new Error('Coordinates are not valid')));
      return;
    }

    set((state) => {
      state.origin = utils.createPoint(coords, {
        id: "origin",
        "marker-symbol": "A",
      });
      return state;
    });
  },
}));
