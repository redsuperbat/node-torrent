import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "tailwindcss/tailwind.css";

import "primevue/resources/themes/vela-purple/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import RadioButton from "primevue/radiobutton";
import CheckBox from "primevue/checkbox";

createApp(App)
  .use(store)
  .use(router)
  .component("Button", Button)
  .component("InputText", InputText)
  .component("RadioButton", RadioButton)
  .component("CheckBox", CheckBox)
  .mount("#app");
