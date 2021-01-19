<template>
  <div class="p-3 flex flex-col rounded shadow-xl" v-if="show">
    <div class="flex justify-between p-1">
      <h1 class="text-xl font-bold">{{ title }}</h1>
      <Button
        icon="pi pi-times"
        class="p-button-rounded p-button-danger"
        @click="$emit('update:modelValue', false)"
      />
    </div>
    <slot />
  </div>
</template>

<script>
import { computed } from "vue";
import Button from "primevue/button";
export default {
  setup(props, { emit }) {
    const show = computed({
      get() {
        return props.modelValue;
      },
      set(value) {
        emit("update:modelValue", value);
      },
    });

    return { show };
  },
  props: {
    modelValue: {
      type: Boolean,
    },
    title: String,
  },
  components: {
    Button,
  },
};
</script>
