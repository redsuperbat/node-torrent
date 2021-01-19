<template>
  <div>
    <ProgressSpinner v-if="loading" style="width:25px;height:25px" />
    <Tree
      v-else
      :value="treeStruct"
      selectionMode="single"
      @node-select="nodeSelect"
    >
      <template #default="slotProps">
        <div class="truncate w-48 sm:w-80">
          <b>{{ slotProps.node.label }}</b>
        </div>
      </template>
    </Tree>
  </div>
</template>

<script>
import Tree from "primevue/tree";
import ProgressSpinner from "primevue/progressspinner";

import client from "../api/home-client";
import { computed, ref } from "vue";
import { v4 } from "uuid";

export default {
  setup(props, { emit }) {
    const treeStruct = ref();

    const selectedDir = computed({
      get() {
        return props.modelValue;
      },
      set(dir) {
        emit("update:modelValue", dir);
      },
    });

    // recursivly traverses the json-structure
    // and modifies it for the Tree component
    const formatStruct = (struct) => {
      if (Array.isArray(struct)) {
        return struct.map((s) => formatStruct(s));
      }
      if (struct.type === "file") {
        const file = {
          label: struct.name,
          key: v4(),
          icon: "pi pi-file",
          type: struct.type,
          path: struct.path,
        };
        return file;
      }
      // This is the folder case
      // Folders have children that can also be folders
      return {
        label: struct.name,
        key: v4(),
        type: struct.type,
        icon: "pi pi-folder",
        path: struct.path,
        children: struct.children.map((s) => formatStruct(s)),
      };
    };

    const loading = ref(true);
    client
      .get("/fileTree")
      .then(({ data }) => {
        const nodes = formatStruct(data.children);
        treeStruct.value = nodes;
      })
      .finally(() => (loading.value = false));

    const nodeSelect = (node) => {
      selectedDir.value = node;
    };

    return { treeStruct, nodeSelect, loading };
  },
  components: {
    Tree,
    ProgressSpinner,
  },
  props: {
    modelValue: Object,
  },
};
</script>
