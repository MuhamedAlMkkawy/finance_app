<template>
  <div 
    class="pagination" 
    v-if="props.data?.total_pages > 1"
  >
    <div class="card">
      <Paginator 
        :rows="Number(props.data.per_page)" 
        :totalRecords="props.data.total_items"
        :page="Number(props.data.current_page)"
        @page="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import Paginator from "primevue/paginator"

const emit = defineEmits(["handlePagination"])

const props = defineProps({
  data: { type: Object, required: true },
})

const onPageChange = (event) => {
  emit("handlePagination", event.page + 1)
  window.scrollTo({ top: 0, behavior: "smooth" })
}
</script>


