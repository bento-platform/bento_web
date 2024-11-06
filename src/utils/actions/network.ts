type NetworkActionTypes = {
  REQUEST: string;
  RECEIVE: string;
  ERROR: string;
  FINISH: string;
};

export const createNetworkActionTypes = (name: string): NetworkActionTypes => ({
  REQUEST: `${name}.REQUEST`,
  RECEIVE: `${name}.RECEIVE`,
  ERROR: `${name}.ERROR`,
  FINISH: `${name}.FINISH`,
});
