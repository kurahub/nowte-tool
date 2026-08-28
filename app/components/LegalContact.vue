<template>
  <p v-if="legalInformation.contactUrl">
    <a :href="legalInformation.contactUrl" target="_blank" rel="noopener noreferrer">お問い合わせフォーム</a>
  </p>
  <p v-else-if="legalInformation.contactEmail">
    メール：<a :href="`mailto:${legalInformation.contactEmail}`">{{ legalInformation.contactEmail }}</a>
  </p>
  <p v-else>お問い合わせ窓口は準備中です。</p>
</template>

<script setup>
import { legalInformation } from '~/data/legal'
</script>
