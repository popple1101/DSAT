# JWT 인증 실패
- 증상: 로그인 후 API 403
- 원인: Security Filter에서 ROLE prefix 누락
- 해결: GrantedAuthority에 ROLE_ADMIN 적용
- 재발 방지: 테스트 코드 추가