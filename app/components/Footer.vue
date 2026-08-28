<template>
  <footer id="footer">
      <section class="copyright-box">
          <div class="container">
              <nav class="legal-links" aria-label="サイトポリシー">
                  <NuxtLink to="/terms/">利用規約</NuxtLink>
                  <NuxtLink to="/privacy-policy/">プライバシーポリシー</NuxtLink>
              </nav>
              <p class="copyright">Copyright <a href="https://www.nowte.net/">デジノート</a> All rights reserved.</p>
          </div>
      </section>
  </footer>
</template>

<style scoped>
.legal-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 10px;
}

.legal-links a {
  color: inherit;
  font-size: 13px;
}
</style>
