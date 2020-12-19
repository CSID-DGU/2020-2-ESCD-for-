## 설치

0. 개발자 도구 업데이트하기

- Weixin Devtools의 상단 메뉴에서 Weixin Devtools -> Check for Updates 메뉴 클릭하여 개발자 툴 업데이트 확인하기

1. 모듈 설치
Terminal에서 다음 명령어 입력

```
npm install
```

- Node.js를 설치한 상태여야 함.
- Terminal에서 해당 폴더로 들어가서 `npm install`을 쳐야 함.
- `npm install`을 통해 package.json 파일에 있는 `dependencies`가 설치되면 `node_modules` 폴더에 vant-weapp 라이브러리가 설치된다.

2. 모듈 빌드하기

- Weixin Devtools의 상단 메뉴에서 Tools -> Build npm 메뉴 클릭하여 `npm install`로 설치한 모듈들을 빌드한다.
- 빌드가 끝나면 miniprogram_npm 폴더 내에 설치한 모듈들이 있는지 확인한다.

3. API 서버 연동하기
- app.js 파일에서 globalData 속성의 requestUrl에 API 서버의 포트번호 명시(API 서버의 포트번호가 8005라면 건들 필요 없음)

4. 수령 알림 기능은 WeChat 개발자 등록이 되어 있어야만 가능