import { createStore } from "vuex";
import { io } from "socket.io-client";

const store = createStore({
  state: {
    io: null,
  },
  mutations: {},
  actions: {
    INIT_SOCKET: ({ state }) => {
      state.io = io({ transports: ["websocket"] });
    },
  },
  getters: {
    io: (state) => state.io,
  },
});

export default store;
