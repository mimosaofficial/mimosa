// ============================================
// 🧹 자가 제거 Service Worker
// ============================================
// 이전에 설치되었던 Service Worker를 깨끗하게 제거하고
// 모든 캐시를 비운 뒤, 페이지를 강제로 새로고침합니다.
// 한 번 실행되면 다시는 SW가 동작하지 않습니다.

self.addEventListener('install', function(event) {
  // 즉시 활성화로 전환
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil((async function() {
    try {
      // 1) 모든 캐시 삭제
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map(function(key) {
        return caches.delete(key);
      }));
      console.log('[SW-CLEANUP] 모든 캐시 삭제 완료');

      // 2) 자기 자신(Service Worker) 등록 해제
      await self.registration.unregister();
      console.log('[SW-CLEANUP] Service Worker 등록 해제 완료');

      // 3) 열려있는 모든 탭/창을 강제 새로고침
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });
      allClients.forEach(function(client) {
        client.navigate(client.url);
      });
      console.log('[SW-CLEANUP] 모든 탭 새로고침 완료');
    } catch (err) {
      console.error('[SW-CLEANUP] 정리 중 오류:', err);
    }
  })());
});

// fetch 이벤트는 처리하지 않음 (네트워크 그대로 통과)
