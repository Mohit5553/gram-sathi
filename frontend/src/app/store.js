import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/authSlice';
import labourReducer from '../redux/labourSlice';
import electricianReducer from '../redux/electricianSlice';
import plumberReducer from '../redux/plumberSlice';
import schemeReducer from '../redux/schemeSlice';
import emergencyReducer from '../redux/emergencySlice';
import tractorReducer from '../redux/tractorSlice';
import jcbReducer from '../redux/jcbSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    labour: labourReducer,
    electrician: electricianReducer,
    plumber: plumberReducer,
    schemes: schemeReducer,
    emergency: emergencyReducer,
    tractor: tractorReducer,
    jcb: jcbReducer
  },
});
