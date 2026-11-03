<template>
  <div class="empty">
    <NotFoundEyes />
    <h3 class="mt-5">{{ $t('empty_component.text') }}</h3>
  </div>
</template>

<style lang="scss" scoped>
.empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 40px 0;
  min-height: 50vh;
  i {
    font-size: 150px;
    margin-bottom: 20px;
    color: $mainColor;
    animation-name: rotate;
    animation-duration: 3s;
    animation-iteration-count: infinite;
    animation-direction: linear;
  }
  h3 {
    font-size: 18px;
    font-weight: 500;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
