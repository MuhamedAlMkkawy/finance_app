<template>
  <div class="flex flex-col gap-[2px] w-full">
    <label :for="name" v-if="label">{{ label }}</label>
    <div class="input">
      <!-- DATE PICKER -->
      <VeeField
        v-if="type === 'date'"
        :name="name"
        v-slot="{ value, handleChange }"
      >
        <DatePicker
          :model-value="value"
          :selectionMode="selectionMode"
          :placeholder="placeholder"
          dateFormat="d/m/yy"
          @update:modelValue="
            (value) => {
              handleChange(value);
              emit('updateInputField', value);
            }
          "
        />
      </VeeField>

      <!-- SELECT -->
      <VeeField v-else-if="as === 'select'" :name="name" v-slot="{ field }">
        <select v-bind="field" required :value="field.value || ''">
          <option value="" disabled selected>
            {{ placeholder }}
          </option>

          <option v-for="opt in options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </VeeField>

      <!-- MULTI SELECT (PrimeVue) -->
      <VeeField
        v-else-if="as === 'multiselect'"
        :name="name"
        v-slot="{ value, handleChange }"
      >
        <MultiSelect
          :model-value="value"
          :options="options"
          optionLabel="label"
          optionValue="value"
          :placeholder="placeholder"
          @update:modelValue="
            (val) => {
              handleChange(val);
              emit('updateInputField', val);
            }
          "
        />
      </VeeField>

      <!-- INPUT / TEXTAREA -->
      <VeeField
        v-else
        :name="name"
        v-slot="{ value, handleChange }"
      >
        <component
          :is="as"
          :value="value"
          :type="type"
          :placeholder="placeholder"
          :autofocus="autofocus"
          @input="handleChange"
        />
      </VeeField>
    </div>
    <VeeErrorMessage :name="name" />
  </div>
</template>

<script setup>
  defineProps({
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: false,
      default: "",
    },
    as: {
      type: String,
      default: "input",
      validator: (value) =>
        ["input", "select", "multiselect", "textarea"].includes(value),
    },
    type: {
      type: String,
      default: "text",
    },
    placeholder: {
      type: String,
      default: "",
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      default: () => [],
    },
    selectionMode: {
      type: String,
      default: "single",
      validator: (value) => ["single", "multiple", "range"].includes(value),
    },
  });

  const emit = defineEmits(["updateInputField"]);
</script>

<!-- HOW TO USE THE COMPONENT -->
<!-- 
  <VeeForm 
    :validation-schema="YOUR TARGET SCHEMA FUNCTION ex=>> SCHEMA()" 
    class="form" 
    @submit="handleSubmit"
    v-slot="{ meta }"
  >
  [ #1 ] FOR THE SNGLE DATE
  <FormCustomField
  name="birthDate"
  type="date"
  placeholder="Select Date"
  />

  [ #2 ] FOR THE MULTIPLE DATES
  <FormCustomField
    name="holidays"
    type="date"
    selectionMode="multiple"
    placeholder="Select Dates"
  />

  [ #3 ] FOR THE RANGE DATES
  <FormCustomField
    name="period"
    type="date"
    selectionMode="range"
    placeholder="Select Period"
  />


  [ #4 ] FOR THE INPUT LIKE TEXT , EMAIL , URL
  <FormCustomField 
  name="inputName"
  type="inputType"
  placeholder="inputPlaceholder"
  @updateInputField="console.log($event)"
  />
  
  [ #5 ] FOR THE SiNGLE SELECT
  <FormCustomField
    name="country"
    type="select"
    placeholder="Select Country"
    :options="[
      { label: 'Egypt', value: 'eg' },
      { label: 'Saudi Arabia', value: 'sa' },
      { label: 'UAE', value: 'ae' }
    ]"
  />

  [ #6 ] FOR THE MULTI SELECT
  <FormCustomField
    name="countries"
    as="multiselect"
    placeholder="Select Countries"
    :options="[
      { label: 'Egypt', value: 'eg' },
      { label: 'Saudi Arabia', value: 'sa' },
      { label: 'UAE', value: 'ae' },
    ]"
  />

  [ #7 ] FOR THE TEXTAREA
  <FormCustomField
    name="message"
    as="textarea"
    placeholder="Write your message here..."
    @updateInputField="console.log($event)"
  />
</VeeForm>
-->
